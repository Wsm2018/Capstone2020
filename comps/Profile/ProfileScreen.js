import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
} from "react-native";
const LottieView = require("lottie-react-native");
import { Card } from "react-native-shadow-cards";

import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import * as ImagePicker from "expo-image-picker";
import {
  Feather,
  AntDesign,
  Fontisto,
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
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
import CarsScreen from "./Cars/CarsScreen";
import Favorites from "./Favorites";

const { width, height } = Dimensions.get("screen");

export default function ProfileScreen(props) {
  const [user, setUser] = useState(null);
  const [hasCameraRollPermission, setHasCameraRollPermission] = useState(false);
  const [photoURL, setPhotoURL] = useState("");
  const [edit, setEdit] = useState(false);
  const [profileBackground, setProfileBackground] = useState("");
  const [displayName, setDisplayName] = useState();
  const buttons = ["Balance", "Send Gift", "Referral Code"];
  const [view, setView] = useState(0);
  const [carsModal, setCarsModal] = useState(false);
  const [favoritesModal, setFavoritesModal] = useState(false);

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
  };

  const handlePickImage = async () => {
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
              // avatarStyle={{ maxHeight: "100%", maxWidth: "100%" }}
              // overlayContainerStyle={{ backgroundColor: "red",  }}
              source={{ uri: photoURL }}
              size="xlarge"
              style={styles.profileImage}
            />
          </View>
        </View>
        {/* <View style={{ flexDirection: "row", flexWrap: "wrap" }}> */}
        <View style={styles.tabRowLeft}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              // alignItems: "center",
              // width: "100%",
              marginTop: "-13%",
              // backgroundColor: "red",
              flex: 2,
            }}
          >
            <View
              style={{
                // backgroundColor: "red",
                width: "35%",
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "black", fontSize: 15, fontWeight: "bold" }}
              >
                Reputation
              </Text>
              <Text style={styles.tabLabelNumber}>{user.reputation}</Text>
            </View>
            <View
              style={{
                // backgroundColor: "red",
                width: "35%",
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "black", fontSize: 16, fontWeight: "bold" }}
              >
                Points
              </Text>
              <Text style={styles.tabLabelNumber}>{user.points}</Text>
            </View>
          </View>
        </View>
        {/* </View> */}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18, paddingRight: 5 }}>{displayName}</Text>
          <TouchableOpacity onPress={() => setEdit(true)}>
            <FontAwesome5 name="edit" size={20} style={{ color: "#224229" }} />
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
                    onAccessoryPress={handlePickImage}
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
                    onSubmitEditing={handleSaveEdit}
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
                    <TouchableOpacity onPress={handleSaveEdit}>
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
                backgroundColor: "#D2D4DA",
                borderWidth: 1,
                // borderBottomColor: "red",
                // borderBottomWidth: 0,
                // borderTopLeftRadius: 6,
                // borderTopRightRadius: 6,
                // borderBottomLeftRadius: 40,

                borderColor: "darkgrey",
                // borderRightColor: "black",
              }}
              selectedButtonStyle={{
                backgroundColor: "white",
                borderBottomWidth: 0,
                // borderBottomColor: "red",
              }}
              selectedTextStyle={{
                color: "black",
                fontWeight: "bold",
              }}
              textStyle={{ color: "#535150", fontWeight: "bold" }}
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
          <View
            style={{
              // marginTop: "5%",
              // width: "90%",
              // borderWidth: 1,
              // borderColor: "darkgray",
              alignItems: "center",
              flex: 0.8,
            }}
          >
            <Card
              elevation={2}
              style={{
                // marginTop: "5%",
                width: "95%",
                borderWidth: 1,
                borderColor: "darkgray",
                flex: 0.95,
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity onPress={() => setFavoritesModal(true)}>
                  <LottieView
                    source={require("../../assets/lf30_editor_6YHFU0.json")}
                    autoPlay
                    // loop
                    style={{
                      width: "22%",
                      height: "100%",
                      // backgroundColor: "red",
                      justifyContent: "space-evenly",
                      alignItems: "center",
                    }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setCarsModal(true)}
                  style={{
                    // position: "relative",
                    width: "50%",
                    height: "100%",
                    // backgroundColor: "blue",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={require("../../assets/car5.gif")}
                    autoPlay
                    // onPress={() => setCarsModal(true)}
                    // loop
                    style={{
                      // position: "relative",
                      width: "35%",
                      height: "65%",
                      // backgroundColor: "blue",
                      justifyContent: "center",
                      alignItems: "center",
                      // paddingTop: "5%",
                    }}
                  />
                </TouchableOpacity>

                <Image
                  source={require("../../assets/booking.gif")}
                  autoPlay
                  loop
                  style={{
                    // position: "relative",
                    width: "22%",
                    height: "70%",
                    // backgroundColor: "red",
                    justifyContent: "center",
                    alignItems: "center",
                    // paddingTop: "5%",
                  }}
                />
              </View>
            </Card>
          </View>

          <CarsScreen
            carsModal={carsModal}
            setCarsModal={setCarsModal}
            navigation={props.navigation}
          />
          <Favorites
            favoritesModal={favoritesModal}
            setFavoritesModal={setFavoritesModal}
            navigation={props.navigation}
            user={user}
          />
        </View>
      </View>
    )
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    //"#f5f0f0"
    backgroundColor: "#f5f0f0",
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
    flex: 1,
    alignItems: "flex-end",
  },
  headerContainer: {
    alignItems: "center",
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
    height: 140,
    width: 140,
  },
  profileImageContainer: {
    bottom: 0,
    position: "absolute",
  },
  modalView: {
    margin: 20,
    height: height / 1.8,
    width: width / 1.4,
    backgroundColor: "#fff",
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
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
  tabRowLeft: {
    // position: "relative",
    // flexDirection: "row",
    // backgroundColor: "blue",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    // alignItems: "flex-start",
    flex: 0.07,
  },
  tabRowRight: {
    // backgroundColor: "red",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  tabLabelNumber: {
    fontWeight: "bold",
    color: "#229277",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 2,
  },
  tabLabelText: {
    color: "black",
    fontSize: 14,
    textAlign: "left",
  },
  containerLogin: {
    flex: 1.5,
    marginLeft: 10.5,
    // backgroundColor: "#E8ECF4",
    width: "95%",
    marginTop: -5,
    marginBottom: "4%",
  },
});

ProfileScreen.navigationOptions = {
  headerStyle: { backgroundColor: "#20365F" },
  headerTintColor: "white",
};
