//@refresh reset
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  //   Input,
  ScrollView,
  Modal,
} from "react-native";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
  responsiveFontSize,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import { Input, Tooltip, Divider } from "react-native-elements";
import { Feather } from "react-native-vector-icons";
import firebase, { firestore } from "firebase/app";
import LottieView from "lottie-react-native";
import "firebase/auth";
import { Icon, Avatar, Button, Image } from "react-native-elements";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import * as ImagePicker from "expo-image-picker";
import "firebase/storage";
import db from "../../db";
// import SubscriptionsScreen from "../SubscriptionsScreen";
import { set } from "react-native-reanimated";
import * as Linking from "expo-linking";

import { MaterialIcons } from "@expo/vector-icons";
export default function AdvertisementsRequest(props) {
  const [hasCameraRollPermission, setHasCameraRollPermission] = useState(false);
  const [image, setImage] = useState({ value: null, error: false });

  const [flag, setFlag] = useState(0);

  useEffect(() => {
    if (flag === 4) {
      setFlag(0);
    }
  }, [flag]);

  const [user, setUser] = useState();
  //const [title, setTitle] = useState("");
  //   const [link, setLink] = useState("");
  //   const [description, setDescription] = useState("");
  //   const [date, setDate] = useState();
  //   const [endDate, setEndDate] = useState();
  const [amount, setAmount] = useState();
  const [modal, setModal] = useState(false);

  const [title, setTitle] = useState({ text: "", error: false });
  const [link, setLink] = useState({ text: "", error: false });
  const [description, setDescription] = useState({ text: "", error: false });
  const [endDate, setEndDate] = useState({ value: null, error: false });
  const [date, setDate] = useState({ value: null, error: false });
  const [advertisements, setAdvertisements] = useState([]);
  const [adsBox, setAdsBox] = useState([]);
  const [adsNum, setAdsNum] = useState(0);
  useEffect(() => {
    askPermission();
  }, []);

  const askPermission = async () => {
    const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
    setHasCameraRollPermission(status === "granted");
  };
  const _pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.cancelled) {
        setImage({ value: result.uri, error: false });
      }

      console.log(result);
    } catch (E) {
      console.log(E);
    }
  };
  const uploadImage = async (id) => {
    const response = await fetch(image.value);
    const blob = await response.blob();
    const upload = await firebase
      .storage()
      .ref()
      .child("advertisements/" + id)
      .put(blob);
    const url = await firebase
      .storage()
      .ref()
      .child("advertisements/" + id)
      .getDownloadURL();
    db.collection("advertisements").doc(id).update({
      image: url,
      id,
    });
  };
  useEffect(() => {
    getUserObject();
  }, []);
  useEffect(() => {
    calculation();
  }, [date, endDate]);
  const getUserObject = async () => {
    let useracc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    setUser(useracc.data());
  };
  const calculation = () => {
    let a = moment(date.value);
    let b = moment(endDate.value);
    if (b.diff(a, "days") == 0) {
      setAmount(30);
    } else {
      let result = 30 * b.diff(a, "days");
      setAmount(result);
    }
  };
  const validated = async () => {
    let count = 0;

    if (title.text === "") {
      console.log("title is bad");
      setTitle({ text: title.text, error: true });
    } else {
      console.log("title good");
      count++;
    }

    if (link.text === "") {
      console.log("link bad");
      setLink({ text: link.text, error: true });
    } else {
      console.log("link good");
      count++;
    }

    if (description.text === "") {
      console.log("desc bad");
      setDescription({ text: description.text, error: true });
    } else {
      console.log("desc good");
      count++;
    }

    if (!endDate.value) {
      console.log("end date bad");
      setEndDate({ value: endDate.value, error: true });
    } else {
      console.log("end date good");
      count++;
    }
    if (!date.value) {
      console.log("daate bad");
      setDate({ value: date.value, error: true });
    } else {
      console.log("date good");
      count++;
    }

    if (!image.value) {
      console.log("image bad");
      setImage({ value: image.value, error: true });
    } else {
      console.log("image good");
      count++;
    }
    // rer
    console.log(count);
    if (count === 6) {
      return true;
    } else {
      return false;
    }
  };

  const submit = async () => {
    if (await validated()) {
      console.log("we got through validation");
      db.collection("advertisements")
        .add({
          title: title.text,
          startDate: new Date(date.value),
          endDate: new Date(endDate.value),
          image: null,
          description: description.text,
          user: user,
          link: link.text,
          status: "pending",
          clickers: 0,
          amount: amount,
          // dunno: "WHYYY",
        })
        .then((doc) => {
          console.log("we make it here?");
          uploadImage(doc.id);
        });
      //   setTitle(null);
      //   setDate(null);
      //   setEndDate(null);
      //   setImage(null);
      //   setDescription(null);
      //   setAmount(30);
      //   setLink("");
    }
  };

  useEffect(() => {
    db.collection("advertisements")
      .where("status", "==", "pending")
      .onSnapshot((querySnapshot) => {
        const advertisements = [];
        querySnapshot.forEach((doc) => {
          advertisements.push({ id: doc.id, ...doc.data() });
        });
        // console.log("advertisements.length", advertisements);
        setAdvertisements([...advertisements]);
      });
  }, []);

  const approve = (doc, dissection) => {
    db.collection("advertisements").doc(doc).update({
      status: dissection,
      handledBy: firebase.auth().currentUser.uid,
    });
  };

  useEffect(() => {
    db.collection("advertisements")
      .where("status", "==", "approved")
      .onSnapshot((querySnapshot) => {
        const adsBox = [];
        querySnapshot.forEach((doc) => {
          adsBox.push({ id: doc.id, ...doc.data() });
        });
        setAdsNum(Math.floor(Math.random() * Math.floor(adsBox.length)));
        setAdsBox([...adsBox]);
      });
  }, []);

  const openLink = async () => {
    const increment = firebase.firestore.FieldValue.increment(1);
    let doc = db.collection("advertisements").doc(adsBox[adsNum].id);
    doc.update({ clickers: increment });
    Linking.openURL(`https://${adsBox[adsNum].link}`);
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ backgroundColor: "white", flex: 1, margin: 5 }}>
          <View style={{ backgroundColor: "#e3e3e3", flex: 0.95, margin: 5 }}>
            <ScrollView style={{ flex: 1 }}>
              {advertisements.length !== 0 ? (
                advertisements.map((item, index) => (
                  <View
                    style={{
                      flex: 1,
                      height: responsiveHeight(50),
                      margin: 15,
                      backgroundColor: "white",
                      borderWidth: 3,
                      borderColor: "#185a9d",
                      padding: 5,
                    }}
                  >
                    <View
                      style={{
                        flex: 2,
                        // backgroundColor: "pink",
                        // borderRadius: 20,
                        flexDirection: "row",
                      }}
                      key={index}
                    >
                      <View
                        style={{
                          flex: 1,
                          // backgroundColor: "red",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {item.image != null ? (
                          <Image
                            source={{ uri: item.image }}
                            style={{
                              width: responsiveScreenWidth(30),
                              height: responsiveScreenHeight(20),
                              borderWidth: 1,
                              borderColor: "transparent",
                              resizeMode: "contain",
                              // borderTopRightRadiusRadius: 10,
                              // borderRadius: 5,
                            }}
                          />
                        ) : (
                          <Text>"null"</Text>
                        )}
                      </View>

                      {/* -------------------------------- */}

                      <View
                        style={{
                          flex: 1.5,

                          alignItems: "center",
                          justifyContent: "center",
                          // backgroundColor: "lightblue",
                        }}
                      >
                        <View
                          // elevation={3}
                          style={{
                            flex: 0.3,
                            width: "80%",
                            alignItems: "center",
                            justifyContent: "center",
                            // borderColor: "gray",
                            // borderRadius: 5,
                            // borderWidth: 1,
                            // backgroundColor: "lightgray",
                          }}
                        >
                          <Text
                            style={{
                              color: "#185a9d",
                              fontSize: responsiveFontSize(2),
                              fontWeight: "bold",
                              textTransform: "none",
                            }}
                          >
                            {item.title}
                          </Text>
                        </View>
                        <View
                          style={{
                            flex: 0.5,
                            width: "90%",
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            alignItems: "flex-start",
                            // backgroundColor: "#185a9d",
                            borderColor: "#185a9d",
                            borderWidth: 1,
                            padding: 5,
                          }}
                        >
                          {/* <Ionicons
                              name="md-paper"
                              size={22}
                              color="darkred"
                            /> */}
                          <Text style={{ fontSize: responsiveFontSize(2) }}>
                            {item.description}
                          </Text>
                        </View>

                        <View
                          style={{
                            flex: 0.2,
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            // backgroundColor: "pink",
                          }}
                        >
                          <Feather name="link" size={20} color="gray" />
                          <Text
                            style={{
                              fontWeight: "bold",
                              fontSize: responsiveFontSize(1.5),
                            }}
                          >
                            {" "}
                            {item.link}
                          </Text>
                        </View>

                        <View
                          style={{
                            flex: 0.2,
                            width: "95%",
                            alignItems: "center",
                            justifyContent: "center",
                            // backgroundColor: "white",
                            // borderBottomWidth: 1,
                            // flexDirection: "row",
                          }}
                        >
                          {/* <View>
                              <MaterialCommunityIcons
                                name="timer-sand"
                                size={22}
                                color="darkred"
                              />
                            </View> */}
                          <View>
                            <Text style={{ fontSize: responsiveFontSize(1.5) }}>
                              {moment(item.startDate.toDate()).format("L")}{" "}
                              <Text
                                style={{
                                  fontWeight: "bold",
                                  color: "#185a9d",
                                }}
                              >
                                {" "}
                                To{" "}
                              </Text>{" "}
                              {moment(item.endDate.toDate()).format("L")}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <Divider
                      style={{ height: "0.5%", backgroundColor: "#185a9d" }}
                    />
                    <View
                      style={{
                        flex: 0.5,
                        // backgroundColor: "red",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "row",
                      }}
                    >
                      <View
                        style={{
                          flex: 0.3,
                          backgroundColor: "#2E9E9B",
                          // borderWidth: 4,
                          // width: responsiveScreenWidth(30),
                          height: responsiveScreenHeight(5),
                          // width: "30%",
                          // alignSelf: "center",
                          justifyContent: "center",
                          alignItems: "center",
                          //marginStart: "2%",
                          // marginEnd: "3%",
                          borderRadius: 10,
                          //marginBottom: 10,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => approve(item.id, "approved")}
                        >
                          <Text
                            style={{
                              textAlign: "center",
                              fontSize: responsiveFontSize(1.5),
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            Approve
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={{
                          flex: 0.3,
                          backgroundColor: "#901919",
                          // borderWidth: 4,
                          height: responsiveScreenHeight(5),
                          // width: "30%",
                          // alignSelf: "center",
                          justifyContent: "center",
                          alignItems: "center",
                          //marginStart: "2%",
                          marginStart: "3%",
                          borderRadius: 10,
                          //marginBottom: 10,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => approve(item.id, "denied")}
                        >
                          <Text
                            style={{
                              textAlign: "center",
                              fontSize: responsiveFontSize(1.5),
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            Reject
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.header}>
                  <LottieView
                    source={require("../../assets/17723-waitting.json")}
                    autoPlay
                    loop
                    style={{
                      position: "relative",
                      width: "80%",
                      justifyContent: "center",
                      alignSelf: "center",
                      // paddingTop: "30%",
                    }}
                  />
                  <Text
                    style={{
                      // paddingTop: "15%",
                      fontSize: responsiveScreenFontSize(2),
                      color: "darkgray",
                      fontWeight: "bold",
                    }}
                  >
                    No Ad Requests
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
}
AdvertisementsRequest.navigationOptions = (props) => ({
  title: "Advertisement",
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",
    // alignItems: "center",
    // justifyContent: "center",
  },
  Inputs: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "black",
    height: 50,
    width: "87%",
    alignSelf: "center",
    opacity: 0.8,
    paddingLeft: 12,
    marginTop: 20,
    marginLeft: "1%",
    backgroundColor: "white",
    // justifyContent:"center"
  },
  redButton: {
    backgroundColor: "#901616",
    height: 40,
    width: "38%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 5,
    marginBottom: 10,
  },
  greenButton: {
    backgroundColor: "#3ea3a3",
    height: 40,
    width: "38%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 5,
    marginBottom: 10,

    //flexDirection: "row",
  },
  payButton: {
    backgroundColor: "#3ea3a3",
    height: 40,
    width: "50%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 5,
    marginBottom: 15,
    //flexDirection: "row",
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    // flex: 0.7,
    paddingTop: "15%",
  },
});
