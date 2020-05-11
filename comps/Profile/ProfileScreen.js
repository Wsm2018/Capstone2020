import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Button } from "react-native";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import * as ImagePicker from "expo-image-picker";

import db from "../../db";
import { Avatar, Icon } from "react-native-elements";
import { createMaterialTopTabNavigator } from "react-navigation-tabs";
import { createStackNavigator } from "react-navigation-stack";
import BalanceScreen from "./BalanceScreen";
import ReferralScreen from "./ReferralScreen";
import GiftScreen from "./GiftScreen";
export default function ProfileScreen(props) {
  const [user, setUser] = useState(null);
  const [hasCameraRollPermission, setHasCameraRollPermission] = useState(false);
  const [edit, setEdit] = useState(false);
  const [displayName, setDisplayName] = useState();
  const [view, setView] = useState("balance");
  const getUser = async () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((doc) => {
        const user = doc.data();
        setDisplayName(user.displayName);
        setUser(user);
      });
  };

  const askPermission = async () => {
    const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
    setHasCameraRollPermission(status === "granted");
  };

  useEffect(() => {
    getUser();
    askPermission();
  }, []);

  const handleSave = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const putResult = await firebase
      .storage()
      .ref()
      .child(`users/${firebase.auth().currentUser.uid}`)
      .put(blob);
    const url = await firebase
      .storage()
      .ref()
      .child(`users/${firebase.auth().currentUser.uid}`)
      .getDownloadURL();
    const updatePhoto = firebase.functions().httpsCallable("updatePhoto");
    const response2 = await updatePhoto({
      uid: firebase.auth().currentUser.uid,
      photoURL: url,
    });
    getUser();
  };

  const handlePickImage = async () => {
    // show camera roll, allow user to select
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      console.log("not cancelled", result.uri);
      handleSave(result.uri);
      //setPhotoURL(result.uri);
    }
  };

  const handleEditName = async () => {
    const updateDisplayName = firebase
      .functions()
      .httpsCallable("updateDisplayName");
    const result = await updateDisplayName({
      uid: firebase.auth().currentUser.uid,
      displayName: displayName,
    });
    getUser();
    setEdit(false);
  };

  return (
    user && (
      <View>
        <View>
          <Avatar
            rounded
            source={{ uri: user.photoURL }}
            showAccessory
            onAccessoryPress={handlePickImage}
            size="xlarge"
          />

          {edit ? (
            <View>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                onSubmitEditing={handleEditName}
              />
              <TouchableOpacity onPress={handleEditName}>
                <Text>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEdit(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text>{displayName}</Text>
              <TouchableOpacity onPress={() => setEdit(true)}>
                <Icon name="edit" type="material" size={20} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <TouchableOpacity
            onPress={() => setView("balance")}
            style={
              view === "balance"
                ? { borderBottomWidth: 1, borderBottomColor: "blue" }
                : null
            }
          >
            <Text>Balance</Text>
          </TouchableOpacity>

          <Text>|</Text>
          <TouchableOpacity
            onPress={() => setView("gift")}
            style={
              view === "gift"
                ? { borderBottomWidth: 1, borderBottomColor: "blue" }
                : null
            }
          >
            <Text>Send Gift</Text>
          </TouchableOpacity>

          <Text>|</Text>
          <TouchableOpacity
            onPress={() => setView("referral")}
            style={
              view === "referral"
                ? { borderBottomWidth: 1, borderBottomColor: "blue" }
                : null
            }
          >
            <Text>Referral Code</Text>
          </TouchableOpacity>
        </View>

        {view === "balance" ? (
          <BalanceScreen user={user} navigation={props.navigation} />
        ) : view === "gift" ? (
          <GiftScreen user={user} navigation={props.navigation} />
        ) : (
          <ReferralScreen user={user} navigation={props.navigation} />
        )}
      </View>
    )
  );
}
