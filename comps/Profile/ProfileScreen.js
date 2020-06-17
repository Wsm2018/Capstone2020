//@refresh restart
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  PixelRatio,
  Platform,
  AsyncStorage,
} from "react-native";
import * as Device from "expo-device";

// import ResponsiveImageView from "react-native-responsive-image-view";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
} from "react-native-responsive-dimensions";
// import { Dimensions } from "react-native";
import Image from "react-native-scalable-image";
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
import PointsExchage from "./PointsExchange";
const { width, height } = Dimensions.get("screen");

export default function ProfileScreen(props) {
  // ------------------------------------- STATES ----------------------------------------
  const [user, setUser] = useState(null);
  const [hasCameraRollPermission, setHasCameraRollPermission] = useState(false);
  const [photoURL, setPhotoURL] = useState("");
  const [edit, setEdit] = useState(false);
  const [profileBackground, setProfileBackground] = useState("");
  const [displayName, setDisplayName] = useState();
  const buttons = ["Balance", "Send Gift", "Referral"];
  const [view, setView] = useState(0);
  const [carsModal, setCarsModal] = useState(false);
  const [favoritesModal, setFavoritesModal] = useState(false);
  const [flag, setFlag] = useState(false);
  const [editPic, setEditPic] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [displayNameErr, setDisplayNameErr] = useState("");
  const [showDisplayErr, setShowDisplayErr] = useState(false);
  const [backgroundEdit, setBackgroundEdit] = useState(false);
  const [deviceType, setDeviceType] = useState(0);
  const [pointsModal, setPointsModal] = useState(false);
  const size = PixelRatio.getPixelSizeForLayoutSize(140);

  console.log("------------------------------------------", Device.DeviceType);
  // ------------------------------------------- FUNCTIONS --------------------------------------
  const getUser = async () => {
    const userRef = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    const user = userRef.data();
    setPhotoURL(user.photoURL);
    setDisplayName(user.displayName);
    setProfileBackground(user.profileBackground);
    setEditDisplayName(user.displayName);
    setEditPic(user.photoURL);
    setUser(user);
  };

  const askPermission = async () => {
    const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
    setHasCameraRollPermission(status === "granted");
  };

  const handleSave = async (uri, type) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    if (type === "profile") {
      console.log("hey ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,");
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
      console.log("url ", url);
      await handleSaveEdit(url, editDisplayName);
      setPhotoURL(url);
      getUser();
      // setFlag(false);
    } else {
      setBackgroundEdit(false);
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
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.cancelled) {
      // console.log("not cancelled", result.uri);
      // setFlag(true);
      setEditPic(result.uri);
      // setFlag(false);
      // setPhotoURL(result.uri);
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

      // handleSave(result.uri);
      //setPhotoURL(result.uri);
    }
  };

  const handleSaveEdit = async (url, displayName) => {
    const updateUserInfo = firebase.functions().httpsCallable("updateUserInfo");
    const result = await updateUserInfo({
      uid: firebase.auth().currentUser.uid,
      displayName: displayName,
      photoURL: url,
    });
    console.log(10, result);
    getUser();
    setEdit(false);
  };

  const saveImage = async () => {
    console.log(editDisplayName);
    console.log(displayName);
    if (editDisplayName) {
      handleSave(editPic, "profile");
    } else {
      setDisplayNameErr("Enter Display Name");
      setShowDisplayErr(true);
    }
  };

  const removeBackground = () => {
    setBackgroundEdit(false);
    db.collection("users").doc(firebase.auth().currentUser.uid).update({
      profileBackground:
        "https://c4.wallpaperflare.com/wallpaper/843/694/407/palm-trees-sky-sea-horizon-wallpaper-preview.jpg",
    });
  };

  const getDeviceType = async () => {
    const type = await Device.getDeviceTypeAsync();
    setDeviceType(type);
  };

  // ------------------------------------------------------ USE EFFECTS -------------------------------------------------
  useEffect(() => {
    getDeviceType();
  }, []);

  // useEffect(() => {
  //   console.log("flag", flag);
  // }, [flag]);

  useEffect(() => {
    getUser();
    askPermission();
  }, []);

  // useEffect(() => {
  //   console.log("user got changed ");
  // }, [user]);

  ///////////////////////////////Font-End////////////////////////////////

  useEffect(() => {
    Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
      Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
    };
  }, []);

  const _keyboardDidShow = () => {
    // console.log("keyyyyyyyyyyyyyyyShow");

    setMargin(-200);
  };

  const _keyboardDidHide = () => {
    // console.log("keyyyyyyyyyyyyyyyHide");
    setMargin(0);
  };

  const removeProfile = () => {
    handleSave(
      "https://toppng.com/uploads/preview/user-account-management-logo-user-icon-11562867145a56rus2zwu.png",
      "profile"
    );
  };

  const [marginVal, setMargin] = useState(0);
  /////////////////////////////////////////////////////////////////////////////////////
  const [theme, setTheme] = useState();
  const getTheme = async () => {
    const theme = await AsyncStorage.getItem("theme");
    setTheme(theme);
  };

  useEffect(() => {
    getTheme();
  }, []);

  // ----------------------------------------------- RETURN --------------------------------------

  return (
    user && (
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss;
          setBackgroundEdit(false);
        }}
      >
        <View
          style={[
            theme === "light" ? styles.container : styles.container2,
            { marginTop: !Platform.isPad && marginVal },
          ]}
        >
          <View style={styles.headerContainer}>
            {deviceType === 1 || deviceType === 0 ? (
              <View style={styles.coverContainer}>
                <ImageBackground
                  source={{
                    uri: profileBackground,
                  }}
                  style={styles.coverImage}
                >
                  <View style={styles.coverTitleContainer}>
                    <MaterialCommunityIcons
                      name="dots-horizontal"
                      size={40}
                      color="white"
                      onPress={() => setBackgroundEdit(true)}
                    />
                  </View>
                </ImageBackground>
              </View>
            ) : (
              <View style={styles.coverContainerTab}>
                <ImageBackground
                  source={{
                    uri: profileBackground,
                  }}
                  style={styles.coverImage}
                >
                  <View style={styles.coverTitleContainer}>
                    <MaterialCommunityIcons
                      name="dots-horizontal"
                      size={40}
                      color="white"
                      onPress={() => setBackgroundEdit(true)}
                    />
                  </View>
                </ImageBackground>
              </View>
            )}

            <View style={styles.profileImageContainer}>
              <Avatar
                rounded
                source={{ uri: photoURL }}
                size="xlarge"
                style={
                  deviceType === 1
                    ? {
                        ...styles.profileImage,
                        width: 140,
                        height: 140,
                      }
                    : deviceType === 2
                    ? {
                        ...styles.profileImageTab,
                        width: 120 * 2,
                        height: 120 * 2,
                        overflow: "hidden",
                      }
                    : {
                        ...styles.profileImage,
                        width: 140,
                        height: 140,
                      }
                }
              />

              {/* <View {...getViewProps()}>
                <Image {...getImageProps()} />
              </View> */}
            </View>
          </View>
          {/* <View style={{ flexDirection: "row", flexWrap: "wrap" }}> */}
          <View style={styles.tabRowLeft}>
            {/* ========================================================================== ======================== */}
            <View
              style={{
                flexDirection: "row",
                // justifyContent: "space-between",
                // alignItems: "center",
                // width: "100%",
                marginTop: -50,
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
                  style={
                    deviceType === 1 || deviceType === 0
                      ? {
                          color: "black",
                          fontSize: responsiveScreenFontSize(2),
                          fontWeight: "bold",
                        }
                      : {
                          color: "black",
                          fontSize: responsiveScreenFontSize(1.5),
                          fontWeight: "bold",
                        }
                  }
                >
                  Reputation
                </Text>
                <Text
                  style={
                    deviceType === 1 || deviceType === 0
                      ? {
                          ...styles.tabLabelNumber,
                          fontSize: responsiveScreenFontSize(2),
                        }
                      : {
                          ...styles.tabLabelNumber,
                          fontSize: responsiveScreenFontSize(1.2),
                        }
                  }
                >
                  {user.reputation}
                </Text>
              </View>
              <View style={{ width: "30%" }}></View>
              <View
                style={{
                  // backgroundColor: "red",
                  width: "35%",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity onPress={() => setPointsModal(true)}>
                  <Text
                    style={
                      deviceType === 1 || deviceType === 0
                        ? {
                            color: "black",
                            fontSize: responsiveScreenFontSize(2),
                            fontWeight: "bold",
                          }
                        : {
                            color: "black",
                            fontSize: responsiveScreenFontSize(1.5),
                            fontWeight: "bold",
                          }
                    }
                  >
                    Points
                  </Text>
                </TouchableOpacity>
                <Text
                  style={
                    deviceType === 1 || deviceType === 0
                      ? {
                          ...styles.tabLabelNumber,
                          fontSize: responsiveScreenFontSize(2),
                        }
                      : {
                          ...styles.tabLabelNumber,
                          fontSize: responsiveScreenFontSize(1.2),
                        }
                  }
                >
                  {user.points}
                </Text>
              </View>
            </View>
            {/* ================================================= */}
          </View>
          {/* </View> */}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={
                deviceType === 1 || deviceType === 0
                  ? { fontSize: responsiveScreenFontSize(2.5), paddingRight: 5 }
                  : {
                      fontSize: responsiveScreenFontSize(1.8),
                      paddingRight: 5,
                    }
              }
            >
              {displayName}
            </Text>
            <TouchableOpacity onPress={() => setEdit(true)}>
              {deviceType === 1 || deviceType === 0 ? (
                <FontAwesome5
                  name="edit"
                  size={20}
                  style={{ color: "#185a9d" }}
                  //#60c4c4
                />
              ) : (
                <FontAwesome5
                  name="edit"
                  size={28}
                  style={{ color: "#185a9d" }}
                  //#60c4c4
                />
              )}
            </TouchableOpacity>
          </View>

          <Modal
            visible={backgroundEdit}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setBackgroundEdit(false)}
          >
            <View
              style={{
                flex: 1,
                alignItems: "flex-end",
                // justifyContent: "",
              }}
            >
              <View elevation={2} style={styles.modalView2}>
                <TouchableOpacity
                  style={{
                    flex: 0.2,
                    marginEnd: "2%",
                    justifyContent: "flex-start",
                    alignItems: "flex-end",
                    // height: "30%",
                    // marginEnd: 15,
                    // marginTop: 15,
                  }}
                  onPress={() => setBackgroundEdit(false)}
                >
                  <AntDesign
                    name="close"
                    size={deviceType === 1 ? 25 : 40}
                    style={{ color: "#224229" }}
                  />
                </TouchableOpacity>
                <View
                  style={{
                    flex: 1,
                    // justifyContent: "space-evenly",
                    width: "100%",
                    // backgroundColor: "red",
                    alignItems: "center",
                  }}
                >
                  {/* <TouchableOpacity
                    style={{ alignItems: "center" }}
                    onPress={() => handlePickBackgroundImage()}
                  >
                    <Text></Text>
                  </TouchableOpacity> */}
                  <TouchableOpacity
                    style={{
                      flex: 0.6,
                      // backgroundColor: "#B4C5CF",
                      // height: 40,
                      justifyContent: "center",
                      width: "100%",
                      borderBottomWidth: 1,
                      borderBottomColor: "darkgray",
                      // alignItems: "center",
                      // borderRadius: 10,
                    }}
                    onPress={() => handlePickBackgroundImage()}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: responsiveScreenFontSize(1.5),
                        color: "#28456B",
                        fontWeight: "bold",
                      }}
                    >
                      Change Background
                    </Text>
                  </TouchableOpacity>
                  {/* <TouchableOpacity
                    style={{ alignItems: "center" }}
                    onPress={() => removeBackground()}
                  >
                    <Text>Remove Background</Text>
                  </TouchableOpacity> */}

                  <TouchableOpacity
                    style={{
                      flex: 0.6,
                      // backgroundColor: "#B4C5CF",
                      // height: 40,
                      justifyContent: "center",
                      width: "100%",
                      // alignItems: "center",
                      borderRadius: 5,
                    }}
                    onPress={() => removeBackground()}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: responsiveScreenFontSize(1.5),
                        color: "#28456B",
                        fontWeight: "bold",
                      }}
                    >
                      Remove Background
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

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
                      // backgroundColor: "red",
                    }}
                  >
                    <Avatar
                      accessory={
                        deviceType === 1
                          ? {
                              size: 45,
                            }
                          : deviceType === 2
                          ? {
                              size: 70,
                            }
                          : {
                              size: 70,
                            }
                      }
                      rounded
                      source={{ uri: editPic }}
                      showAccessory
                      onAccessoryPress={handlePickImage}
                      size="xlarge"
                      style={
                        deviceType === 1
                          ? {
                              ...styles.profileImageEdit,
                              width: 140,
                              height: 140,
                            }
                          : deviceType === 2
                          ? {
                              ...styles.profileImageTab,
                              width: 250,
                              height: 250,
                              // overflow: "hidden",
                            }
                          : {
                              ...styles.profileImageEdit,
                              width: 140,
                              height: 140,
                            }
                      }
                    />

                    <Input
                      inputContainerStyle={{
                        // width: "100%",
                        borderColor: "black",
                        // height: 40,
                        height: responsiveScreenHeight(5),
                        width: responsiveScreenWidth(60),
                        // backgroundColor: "green",
                        // alignItems: "center",
                        justifyContent: "center",
                        // flexDirection: "row",
                        paddingLeft: 6,
                        // width: "60%",

                        borderColor: "gray",
                        borderWidth: 2,
                        borderRadius: 5,
                        // marginBottom: 10,
                      }}
                      label="Display Name"
                      // labelStyle={(fontSize = responsiveScreenFontSize(2))}
                      value={editDisplayName}
                      onChangeText={(name) => {
                        setEditDisplayName(name);
                        setDisplayNameErr("");
                        setShowDisplayErr(false);
                      }}
                      // onSubmitEditing={saveImage}
                    />
                    {showDisplayErr ? (
                      <Text
                        style={
                          showDisplayErr
                            ? { color: "red" }
                            : { color: "transparent" }
                        }
                      >
                        {displayNameErr}
                      </Text>
                    ) : null}
                  </View>

                  <View
                    style={{
                      justifyContent: "space-evenly",
                      flex: 0.5,
                      // backgroundColor: "green",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        // backgroundColor: "red",
                        // marginTop: 20,
                        width: "100%",
                        // marginEnd: 50,
                        // flex: 1,
                      }}
                    >
                      <View
                        style={{
                          flex: 0.4,
                          backgroundColor: "#2E9E9B",
                          borderRadius: 10,
                          // borderWidth: 4,
                          height: responsiveScreenHeight(5),
                          width: responsiveScreenWidth(40),
                          // width: "30%",
                          // alignSelf: "center",
                          justifyContent: "center",
                          alignItems: "center",
                          //marginStart: "2%",
                          marginEnd: "3%",

                          //marginBottom: 10,
                        }}
                      >
                        <TouchableOpacity onPress={saveImage}>
                          <Text
                            style={{
                              textAlign: "center",
                              fontSize: responsiveScreenFontSize(2),
                              color: "white",
                            }}
                          >
                            Save
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={{
                          flex: 0.4,
                          backgroundColor: "#901616",
                          // borderWidth: 4,
                          height: responsiveScreenHeight(5),
                          width: responsiveScreenWidth(40),
                          // alignSelf: "center",
                          justifyContent: "center",
                          alignItems: "center",
                          marginStart: "3%",
                          // marginEnd: "3%",
                          borderRadius: 10,
                          //marginBottom: 10,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            setPhotoURL(photoURL);
                            setEditPic(photoURL);
                            setEdit(false);
                            setEditDisplayName(displayName);
                          }}
                        >
                          <Text
                            style={{
                              textAlign: "center",
                              fontSize: responsiveScreenFontSize(2),
                              color: "white",
                            }}
                          >
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View
                      style={{ justifyContent: "center", alignItems: "center" }}
                    >
                      <View
                        style={{
                          backgroundColor: "lightgray",

                          // backgroundColor: "#2E9E9B",
                          borderRadius: 10,
                          // borderWidth: 4,
                          height: responsiveScreenHeight(5),
                          width: responsiveScreenWidth(60),
                          // alignSelf: "center",
                          justifyContent: "center",
                          alignItems: "center",
                          //marginStart: "2%",
                          //marginEnd: "2%",
                          // borderRadius: 20,
                          //marginBottom: 10,
                        }}
                      >
                        <TouchableOpacity
                          disabled={
                            editPic ===
                              "https://toppng.com/uploads/preview/user-account-management-logo-user-icon-11562867145a56rus2zwu.png" ||
                            photoURL ===
                              "https://toppng.com/uploads/preview/user-account-management-logo-user-icon-11562867145a56rus2zwu.png"
                              ? true
                              : false
                          }
                          onPress={() => removeProfile()}
                        >
                          <Text
                            style={{
                              textAlign: "center",
                              fontSize: responsiveScreenFontSize(2),
                              color: "darkgray",
                              fontWeight: "bold",
                            }}
                          >
                            Remove Current Picture
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </KeyboardAvoidingView>
              </View>
            </View>
          </Modal>
          <View style={{ flex: 1 }}>
            <View
              style={{
                // backgroundColor: "green",
                //paddingLeft: -5,
                width: "104.6%",
                marginStart: -20,
                marginEnd: 50,
              }}
            >
              <ButtonGroup
                onPress={(index) => setView(index)}
                selectedIndex={view}
                buttons={buttons}
                //width={"100%"}
                // containerStyle={{ height: 100 }}
                //style={{ width: "100%" }}
                containerStyle={{
                  backgroundColor: "#D2D4DA",
                  borderWidth: 1,
                  //backgroundColor: "red",
                  // borderBottomColor: "red",
                  // borderBottomWidth: 0,
                  // borderTopLeftRadius: 6,
                  // borderTopRightRadius: 6,
                  // borderBottomLeftRadius: 40,
                  width: "100%",
                  height: responsiveScreenHeight(5),
                  borderColor: "darkgrey",
                  // borderRightColor: "black",
                }}
                selectedButtonStyle={{
                  backgroundColor: "white",
                  borderBottomWidth: 0,
                  //backgroundColor: "blue",
                  width: "100%",
                }}
                selectedTextStyle={
                  deviceType === 1 || deviceType === 0
                    ? {
                        color: "black",
                        fontWeight: "bold",
                        fontSize: responsiveScreenFontSize(2),
                      }
                    : {
                        color: "black",
                        fontWeight: "bold",
                        fontSize: responsiveScreenFontSize(1.5),
                      }
                }
                textStyle={
                  deviceType === 1 || deviceType === 0
                    ? {
                        color: "#535150",
                        fontWeight: "bold",
                        fontSize: responsiveScreenFontSize(2),
                      }
                    : {
                        color: "black",
                        fontWeight: "bold",
                        fontSize: responsiveScreenFontSize(1.5),
                      }
                }
              />
            </View>
            <View
              //width={Dimensions.get("window").width}
              style={[styles.containerLogin]}
            >
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
                width: "100%",
                borderTopWidth: 1,
                borderColor: "darkgray",
                alignItems: "center",
                alignSelf: "center",
                flex: 0.8,
                backgroundColor: "white",
              }}
            >
              <View
                // elevation={2}
                // style={{
                //   marginTop: "-1.5%",
                //   // width: "95%",
                //   borderWidth: 1,
                //   borderColor: "darkgray",
                //   flex: 0.95,

                //   // backgroundColor: "red",
                // }}
                elevation={2}
                style={{
                  width: "100%",
                  flex: 1,
                  borderWidth: 1,
                  borderTopWidth: 0,
                  borderColor: "darkgray",
                  // borderRadius: 0,
                  backgroundColor: "white",
                }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    // backgroundColor: "red",
                    // justifyContent: "space-around",
                    // alignItems: "center",
                  }}
                >
                  {/* <FontAwesome5
                name="heart"
                size={35}
                color="black"
                onPress={() =>
                  props.navigation.navigate("Car", { user: props.user })
                } 
              /> */}

                  <TouchableOpacity
                    style={{
                      flex: 0.8,
                      // backgroundColor: "green",
                      //
                      // width: "100%",
                      // flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => setFavoritesModal(true)}
                  >
                    <Image
                      width={Dimensions.get("window").width / 8}
                      source={require("../../assets/images/flist.png")}
                      autoPlay
                      loop
                      style={
                        {
                          // width: "22%",
                          // height: "100%",
                          // backgroundColor: "green",
                          // justifyContent: "space-evenly",
                          // alignItems: "center",
                        }
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      position: "relative",
                      // width: "100%",
                      flex: 0.8,
                      // height: "100%",
                      // backgroundColor: "red",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => props.navigation.navigate("Subscription")}
                  >
                    <Image
                      width={Dimensions.get("window").width / 3.5}
                      source={require("../../assets/images/subscribe1.png")}
                      autoPlay
                      loop
                      style={
                        {
                          // position: "relative",
                          // width: "100%",
                          // height: "49%",
                          // flex: 1,
                          // justifyContent: "center",
                          // alignItems: "center",
                          // paddingTop: "5%",
                        }
                      }
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setCarsModal(true)}
                    style={{
                      // position: "relative",
                      // width: "100%",
                      flex: 0.8,
                      // height: "100%",
                      // backgroundColor: "blue",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      width={Dimensions.get("window").width / 5}
                      source={require("../../assets/images/mycar.png")}
                      autoPlay
                      onPress={() => setCarsModal(true)}
                      loop
                      style={
                        {
                          // position: "relative",
                          // width: "70%",
                          // height: "75%",
                          // flex: 1,
                          // backgroundColor: "blue",
                          // justifyContent: "center",
                          // alignItems: "center",
                          // paddingTop: "5%",
                        }
                      }
                    />
                  </TouchableOpacity>

                  {/* <View
                  style={{
                    // position: "relative",
                    // width: "100%",
                    flex: 1.5,
                    // height: "100%",
                    backgroundColor: "red",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={require("../../assets/booking.gif")}
                    autoPlay
                    loop
                    style={{
                      // position: "relative",
                      width: "60%",
                      height: "70%",
                      // flex: 1,
                      // backgroundColor: "blue",
                      // justifyContent: "center",
                      // alignItems: "center",
                      // paddingTop: "5%",
                    }}
                  />
                </View> */}
                </View>
              </View>
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
            <PointsExchage
              pointsModal={pointsModal}
              setPointsModal={setPointsModal}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
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
  container2: {
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
  coverContainerTab: {
    marginBottom: 60,
    position: "relative",
  },
  coverImage: {
    height: Dimensions.get("window").width * (3 / 7),
    width: Dimensions.get("window").width,
  },
  coverImageTab: {
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
    marginRight: "2%",
    marginTop: "1%",
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
    // height: 140,
    // width: 140,
  },
  profileImageTab: {
    borderColor: "#FFF",
    borderRadius: 280 / 2,
    borderWidth: 4,
    // height: 140,
    // width: 140,
  },
  profileImageContainer: {
    // top: "10%",
    bottom: 0,
    position: "absolute",
  },
  modalView: {
    margin: 20,
    height: height / 1.5,
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
  modalView2: {
    marginTop: 90,
    marginRight: 10,
    height: height / 6,
    width: width / 2.2,
    backgroundColor: "#fff",
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    borderRadius: 5,
    // padding: 35,
    // justifyContent: "center",
    // alignItems: "center",
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
    // flexWrap: "wrap",
    // justifyContent: "flex-start",
    // // alignItems: "flex-start",
    // flex: 0.07,
  },
  tabRowRight: {
    // backgroundColor: "red",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  tabLabelNumber: {
    fontWeight: "bold",
    color: "#229277",
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
    // marginLeft: 10.5,
    // backgroundColor: "#E8ECF4",
    // backgroundColor: "red",
    // width: "100%",
    marginTop: -5,
    marginBottom: "4%",
    //borderColor: "red",
    //borderWidth: 3,
    //backgroundColor: "yellow",
    // alignSelf: "center",
  },
});

ProfileScreen.navigationOptions = {
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
};
