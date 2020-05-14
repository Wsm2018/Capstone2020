import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Button, Modal } from "react-native";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import * as ImagePicker from "expo-image-picker";

import db from "../../db";
import { Avatar, Icon, ButtonGroup, Input } from "react-native-elements";
import { createMaterialTopTabNavigator } from "react-navigation-tabs";
import { createStackNavigator } from "react-navigation-stack";
import BalanceScreen from "./Cards/BalanceScreen";
import ReferralScreen from "./ReferralScreen";
import GiftScreen from "./GiftScreen";
import DetailsScreen from "./DetailsScreen";
export default function ProfileScreen(props) {
  const [user, setUser] = useState(null);
  const [hasCameraRollPermission, setHasCameraRollPermission] = useState(false);
  const [photoURL, setPhotoURL] = useState("");
  const [edit, setEdit] = useState(false);
  const [displayName, setDisplayName] = useState();
  const buttons = ["Details", "Send Gift", "Referral Code"];
  const [view, setView] = useState(0);

  const getUser = async () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((doc) => {
        const user = doc.data();
        setPhotoURL(user.photoURL);
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
    setPhotoURL(url);
    // const updatePhoto = firebase.functions().httpsCallable("updatePhoto");
    // const response2 = await updatePhoto({
    //   uid: firebase.auth().currentUser.uid,
    //   photoURL: url,
    // });
    // getUser();
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

  const handleSaveEdit = async () => {
    const updateUserInfo = firebase.functions().httpsCallable("updateUserInfo");
    const result = await updateUserInfo({
      uid: firebase.auth().currentUser.uid,
      displayName: displayName,
      photoURL: photoURL,
    });
    console.log(10, result);
    getUser();
    setEdit(false);
  };

  return (
    user && (
      <View>
        <View>
          <Avatar rounded source={{ uri: photoURL }} size="xlarge" />
          <Text>{displayName}</Text>
          <TouchableOpacity onPress={() => setEdit(true)}>
            <Icon name="edit" type="material" size={20} />
          </TouchableOpacity>

          <Modal visible={edit} animationType="fade">
            <Avatar
              rounded
              source={{ uri: photoURL }}
              showAccessory
              onAccessoryPress={handlePickImage}
              size="xlarge"
            />
            <Input
              label="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              onSubmitEditing={handleSaveEdit}
            />
            <TouchableOpacity onPress={handleSaveEdit}>
              <Text>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEdit(false)}>
              <Text>Cancel</Text>
            </TouchableOpacity>
          </Modal>
        </View>

        <ButtonGroup
          onPress={(index) => setView(index)}
          selectedIndex={view}
          buttons={buttons}
          // containerStyle={{ height: 100 }}
          containerStyle={{}}
          selectedButtonStyle={{}}
        />
        {view === 0 ? (
          <DetailsScreen user={user} navigation={props.navigation} />
        ) : view === 1 ? (
          <GiftScreen user={user} navigation={props.navigation} />
        ) : (
          <ReferralScreen user={user} navigation={props.navigation} />
        )}
      </View>
    )
  );
}
