import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Button,
  Modal,
  StyleSheet,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
} from "react-native";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import * as ImagePicker from "expo-image-picker";
import { Feather, AntDesign, FontAwesome5, Ionicons } from "@expo/vector-icons";
import db from "../../db";
import {
  Avatar,
  Icon,
  ButtonGroup,
  Input,
  Divider,
} from "react-native-elements";
import { createMaterialTopTabNavigator } from "react-navigation-tabs";
import { createStackNavigator } from "react-navigation-stack";
import BalanceScreen from "./Cards/BalanceScreen";
import ReferralScreen from "./ReferralScreen";
import GiftScreen from "./GiftScreen";
import DetailsScreen from "./DetailsScreen";
const { width, height } = Dimensions.get("screen");

export default function ProfileScreen(props) {
  const [user, setUser] = useState(null);
  const [hasCameraRollPermission, setHasCameraRollPermission] = useState(false);
  const [photoURL, setPhotoURL] = useState("");
  const [profileBackground, setProfileBackground] = useState("");
  const [edit, setEdit] = useState(false);
  const [displayName, setDisplayName] = useState();
  const buttons = ["Balance", "Send Gift", "Referral Code"];
  const [view, setView] = useState(0);

  const getUser = async () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((doc) => {
        const user = doc.data();
        setPhotoURL(user.photoURL);
        setDisplayName(user.displayName);
        setProfileBackground(user.profileBackground);
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

  const handleSave = async (uri, type) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    if (type === "profile") {
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
    } else {
      const putResult = await firebase
        .storage()
        .ref()
        .child(`background/${firebase.auth().currentUser.uid}`)
        .put(blob);
      const url = await firebase
        .storage()
        .ref()
        .child(`background/${firebase.auth().currentUser.uid}`)
        .getDownloadURL();
      const updatePhoto = firebase.functions().httpsCallable("updatePhoto");
      const response2 = await updatePhoto({
        uid: firebase.auth().currentUser.uid,
        profileBackground: url,
      });
      getUser();
      // setPhotoURL(url);
    }

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
      handleSave(result.uri, "profile");
      //setPhotoURL(result.uri);
    }
  };

  const handlePickBackgroundImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.cancelled) {
      console.log("not cancelled", result.uri);
      handleSave(result.uri, "background");
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
    getUser();
    setEdit(false);
  };

  return (
    user && (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.coverContainer}>
            <ImageBackground
              source={{
                uri: profileBackground,
              }}
              style={styles.coverImage}
            >
              <View style={styles.coverTitleContainer}>
                <Ionicons
                  name="md-images"
                  size={40}
                  color="white"
                  onPress={handlePickBackgroundImage}
                />
              </View>
            </ImageBackground>
          </View>
          <View style={styles.profileImageContainer}>
            <Avatar
              rounded
              source={{ uri: user.photoURL }}
              size="xlarge"
              style={styles.profileImage}
            />
          </View>
        </View>
        {/* <View style={{ alignItems: "center" }}>
              <Avatar rounded source={{ uri: photoURL }} size="xlarge" />
            </View> */}
        {/* <View style={{ backgroundColor: "blue", height: 80 }}></View> */}
        {/* <Divider
              style={{
                backgroundColor: "black",
                //marginTop: -60,
                // height: 5,
                position: "relative",
                height: Dimensions.get("window").width * (3 / 4),
                width: Dimensions.get("window").width,
              }}
            /> */}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18, paddingRight: 5 }}>{displayName}</Text>
          <TouchableOpacity onPress={() => setEdit(true)}>
            <FontAwesome5 name="edit" size={20} style={{ color: "#20365F" }} />
          </TouchableOpacity>
        </View>

        <Modal visible={edit} animationType="fade" transparent={true}>
          <View style={styles.centeredView}>
            <View elevation={5} style={styles.modalView}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "height" : "padding"}
                style={{ flex: 1 }}
              >
                <View
                  style={{
                    justifyContent: "space-around",
                    flex: 1,
                    alignItems: "center",
                  }}
                >
                  <Avatar
                    rounded
                    source={{ uri: photoURL }}
                    showAccessory
                    onAccessoryPress={() => handlePickImage()}
                    size="xlarge"
                  />

                  <Input
                    inputContainerStyle={{
                      width: "100%",
                      borderColor: "black",
                    }}
                    label="Display Name"
                    value={displayName}
                    onChangeText={setDisplayName}
                    onSubmitEditing={() => handleSaveEdit()}
                  />
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    // backgroundColor: "red",
                    marginTop: 20,
                    width: "100%",
                    // marginEnd: 50,
                    // flex: 1,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#20365F",
                      height: 40,
                      width: "40%",
                      // alignSelf: "center",
                      justifyContent: "center",
                      alignItems: "center",
                      //marginStart: "2%",
                      //marginEnd: "2%",
                      borderRadius: 30,
                      //marginBottom: 10,
                    }}
                  >
                    <TouchableOpacity onPress={() => handleSaveEdit()}>
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: 16,
                          color: "white",
                        }}
                      >
                        Save
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      backgroundColor: "#20365F",
                      height: 40,
                      width: "40%",
                      // alignSelf: "center",
                      justifyContent: "center",
                      alignItems: "center",
                      // marginStart: "2%",
                      // marginEnd: "2%",
                      borderRadius: 30,
                      //marginBottom: 10,
                    }}
                  >
                    <TouchableOpacity onPress={() => setEdit(false)}>
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: 16,
                          color: "white",
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </View>
        </Modal>
        <View style={{ flex: 1 }}>
          <View>
            <ButtonGroup
              onPress={(index) => setView(index)}
              selectedIndex={view}
              buttons={buttons}
              // containerStyle={{ height: 100 }}
              containerStyle={{
                backgroundColor: "#0D2C6A",
                // borderWidth: 1,
                // borderBottomColor: "red",
                // borderBottomWidth: 1,
                // borderTopLeftRadius: 15,
                // borderTopRightRadius: 15,
                // borderBottomLeftRadius: 40,

                //borderColor: "grey",
                // borderRightColor: "black",
              }}
              selectedButtonStyle={{
                backgroundColor: "white",
                borderBottomWidth: 0,
                // borderBottomColor: "red",
              }}
              selectedTextStyle={{
                color: "#0D2C6A",
                fontWeight: "bold",
              }}
              textStyle={{ color: "white", fontWeight: "bold" }}
            />
          </View>
          <View style={styles.containerLogin}>
            {view === 0 ? (
              <DetailsScreen user={user} navigation={props.navigation} />
            ) : view === 1 ? (
              <GiftScreen user={user} navigation={props.navigation} />
            ) : (
              <ReferralScreen user={user} navigation={props.navigation} />
            )}
          </View>
        </View>
      </View>
    )
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    //"#f5f0f0"
    backgroundColor: "#e3e3e3",
    // alignItems: "center",
    // width: Math.round(Dimensions.get("window").width),
    // height: Math.round(Dimensions.get("window").height),
  },
  coverBio: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  coverContainer: {
    marginBottom: 55,
    position: "relative",
  },
  coverImage: {
    height: Dimensions.get("window").width * (3 / 7),
    width: Dimensions.get("window").width,
  },
  coverMetaContainer: {
    backgroundColor: "transparent",
    paddingBottom: 80,
    paddingLeft: 135,
  },
  coverName: {
    color: "#FFF",
    fontSize: 30,
    fontWeight: "bold",
    // paddingStart: "90%",
    flex: 1,
    alignItems: "center",
  },
  coverTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  coverTitleContainer: {
    // backgroundColor: "transparent",
    flex: 1,
    alignItems: "flex-end",
  },
  headerContainer: {
    alignItems: "center",
    //backgroundColor: "#DDDDEC",
  },
  indicatorTab: {
    backgroundColor: "transparent",
  },
  mansonryContainer: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginLeft: 0,
    marginRight: 0,
  },
  profileImage: {
    borderColor: "#FFF",
    borderRadius: 70,
    borderWidth: 4,
    height: 130,
    width: 130,
  },
  profileImageContainer: {
    bottom: 0,
    //left: 10,

    position: "absolute",
  },
  modalView: {
    margin: 20,
    height: height / 1.8,
    width: width / 1.4,
    backgroundColor: "#fff",
    // borderWidth: 2,
    // borderColor: "gray",
    //padding: 20,
    //backgroundColor: "white",
    //shadowColor: "red",
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    //opacity: 0.8,
    borderRadius: 20,
    padding: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  sceneContainer: {
    marginTop: 10,
  },
  scroll: {
    backgroundColor: "#FFF",
  },
  tabBar: {
    backgroundColor: "transparent",
    marginBottom: -10,
    marginLeft: 130,
    marginRight: 15,
  },
  tabContainer: {
    flex: 1,
    marginBottom: 12,
    marginTop: -55,
    position: "relative",
    zIndex: 10,
  },
  tabRow: {
    flexWrap: "wrap",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flex: 1,
  },
  tabLabelNumber: {
    color: "black",
    fontSize: 22,
    textAlign: "center",
    marginBottom: 2,
  },
  tabLabelText: {
    color: "black",
    fontSize: 14,
    textAlign: "left",
  },
  containerLogin: {
    flex: 1,
    marginLeft: 10.5,
    // backgroundColor: "#E8ECF4",
    width: "95%",
    marginTop: -5,
    marginBottom: "5%",
    // borderWidth: 1,
    // borderTopWidth: 0,
    // borderColor: "gray",
    // borderBottomRightRadius: 40,
    // borderBottomLeftRadius: 40,
  },
});

ProfileScreen.navigationOptions = {
  headerStyle: { backgroundColor: "#20365F" },
  headerTintColor: "white",
};
