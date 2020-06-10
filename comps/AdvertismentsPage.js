//@refresh reset
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  //   Input,
  Modal,
} from "react-native";
import { Input, Tooltip } from "react-native-elements";

import firebase, { firestore } from "firebase/app";
import "firebase/auth";
import { Icon, Avatar, Button, Image } from "react-native-elements";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import * as ImagePicker from "expo-image-picker";
import "firebase/storage";
import db from "../db";
import SubscriptionsScreen from "./SubscriptionsScreen";
import { set } from "react-native-reanimated";
import * as Linking from "expo-linking";
import { ScrollView } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
export default function AdvertismentsPage(props) {
  const [hasCameraRollPermission, setHasCameraRollPermission] = useState(false);
  const [image, setImage] = useState(null);

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
        setImage(result.uri);
      }

      console.log(result);
    } catch (E) {
      console.log(E);
    }
  };
  const uploadImage = async (id) => {
    const response = await fetch(image);
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
    let a = moment(date);
    let b = moment(endDate);
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
      setDescription({ value: description.value, error: true });
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

    console.log(count);
    if (count === 5) {
      return true;
    } else {
      return false;
    }
  };

  const submit = async () => {
    if (await validated()) {
      db.collection("advertisements")
        .add({
          title: title,
          startDate: new Date(date),
          endDate: new Date(endDate),
          image: null,
          description: description,
          user: user,
          link: link,
          status: "pending",
          clickers: 0,
          amount: amount,
        })
        .then((doc) => {
          uploadImage(doc.id);
        });
      setTitle(null);
      setDate(null);
      setEndDate(null);
      setImage(null);
      setDescription(null);
      setAmount(30);
      setLink("");
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
      <View>
        <Button onPress={() => setFlag(flag + 1)}>switch</Button>
      </View>
      {
        flag == 0 ? (
          <View style={{ flex: 10 }}>
            {advertisements.map((item, index) => (
              <View key={index}>
                <Text>{item.title}</Text>
                <Text>{item.description}</Text>
                <Text>{item.link}</Text>
                <Text>{moment(item.endDate.toDate()).format("L")}</Text>
                <Text>{moment(item.startDate.toDate()).format("L")}</Text>
                {item.image != null ? (
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 100, height: 100 }}
                  />
                ) : null}
                <TouchableOpacity onPress={() => approve(item.id, "approved")}>
                  <Text>approve</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => approve(item.id, "denied")}>
                  <Text>denied</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : flag == 1 ? (
          <View style={styles.container}>
            <ScrollView>
              <Text
                style={{
                  fontSize: 20,
                  color: "#185a9d",
                  justifyContent: "center",
                  alignSelf: "center",
                  marginTop: "5%",
                  fontWeight: "bold",
                }}
              >
                Advertisments Form
              </Text>
              <Input
                inputContainerStyle={{
                  borderBottomWidth: 0,
                }}
                containerStyle={styles.Inputs}
                onChangeText={setTitle}
                placeholder="Enter Title"
                value={title}
                // placeholderTextColor="black"
                inputStyle={{
                  // color: "#185a9d",
                  fontSize: 16,
                }}
              />
              <Text
                style={
                  title.error
                    ? {
                        color: "red",
                        marginLeft: "9%",
                      }
                    : { color: "transparent" }
                }
              >
                * title is Required
              </Text>
              <Input
                inputContainerStyle={{
                  borderBottomWidth: 0,
                }}
                containerStyle={styles.Inputs}
                onChangeText={setLink}
                placeholder="Enter Link"
                value={link}
                //  placeholderTextColor="#185a9d"
                inputStyle={{
                  //  color: "#185a9d",
                  fontSize: 16,
                }}
              />
              <Text
                style={
                  link.error
                    ? {
                        color: "red",
                        marginLeft: "9%",
                      }
                    : { color: "transparent" }
                }
              >
                * link is Required
              </Text>
              <Input
                inputContainerStyle={{
                  borderBottomWidth: 0,
                }}
                containerStyle={styles.Inputs}
                onChangeText={setDescription}
                placeholder="Enter Description"
                value={description}
                // placeholderTextColor="black"
                inputStyle={{
                  //  color: "#",
                  fontSize: 16,
                }}
              />
              <Text
                style={
                  description.error
                    ? {
                        color: "red",
                        marginLeft: "9%",
                      }
                    : { color: "transparent" }
                }
              >
                * description is Required
              </Text>
              <View
                style={{
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "black",
                  height: 50,
                  width: "87%",
                  alignSelf: "center",
                  // opacity: 0.8,
                  paddingLeft: "3%",
                  marginTop: 20,
                  // flexDirection: "row-reverse",
                  // justifyContent: "space-between",
                  backgroundColor: "white",
                }}
              >
                <DatePicker
                  style={{
                    width: "100%",
                    color: "#667085",
                    justifyContent: "flex-start",
                    //backgroundColor: "lightgray",
                  }}
                  date={date.value}
                  mode="date"
                  placeholder="Select Published Date"
                  format="YYYY-MM-DD"
                  minDate={moment(new Date()).format("YYYY-MM-DD")}
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  customStyles={{
                    dateIcon: {
                      // // width: 1,
                      // // height: 1,
                      // left: true,
                    },
                    dateInput: {
                      borderWidth: 0,
                      //   color: "#698eb3",
                      alignItems: "flex-start",
                      fontSize: 12,
                      // marginRight: "68%",
                      backgroundColor: "white",
                    },
                    placeholderText: {
                      fontSize: 16,
                      //color: "#698eb3",
                      backgroundColor: "white",
                    },
                    dateText: {
                      fontSize: 15,
                      // color: "#698eb3",
                    },
                  }}
                  onDateChange={(date) =>
                    setDate({ value: date, error: false })
                  }
                />
                <Text
                  style={
                    date.error
                      ? {
                          color: "red",
                        }
                      : { color: "transparent" }
                  }
                >
                  * date is Required
                </Text>
              </View>
              <View
                style={{
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "black",
                  height: 50,
                  width: "87%",
                  alignSelf: "center",
                  // opacity: 0.8,
                  paddingLeft: "3%",
                  marginTop: 20,
                  // flexDirection: "row-reverse",
                  // justifyContent: "space-between",
                  backgroundColor: "white",
                }}
              >
                <DatePicker
                  style={{
                    width: "100%",
                    color: "#667085",
                    justifyContent: "flex-start",
                    //backgroundColor: "lightgray",
                  }}
                  date={endDate.value}
                  mode="date"
                  placeholder="Select End Date"
                  format="YYYY-MM-DD"
                  minDate={moment(date).format("YYYY-MM-DD")}
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  customStyles={{
                    dateIcon: {
                      // // width: 1,
                      // // height: 1,
                      // left: true,
                    },
                    dateInput: {
                      borderWidth: 0,
                      // color: "#698eb3",
                      alignItems: "flex-start",
                      fontSize: 12,
                      // marginRight: "68%",
                      backgroundColor: "white",
                    },
                    placeholderText: {
                      fontSize: 16,
                      //color: "#698eb3",
                      backgroundColor: "white",
                    },
                    dateText: {
                      fontSize: 15,
                      // color: "#698eb3",
                    },
                  }}
                  onDateChange={(endDate) =>
                    setEndDate({ value: endDate, error: false })
                  }
                />
                <Text
                  style={
                    endDate.error ? { color: "red" } : { color: "transparent" }
                  }
                >
                  * Select a Date
                </Text>
              </View>

              {/* <TextInput
            style={{
              height: 40,
              width: 200,
              borderColor: "gray",
              borderWidth: 1,
            }}
            onChangeText={setTitle}
            placeholder="Enter Title"
            value={title}
          /> */}
              {/* <TextInput
            style={{
              height: 40,
              width: 200,
              borderColor: "gray",
              borderWidth: 1,
            }}
            onChangeText={setLink}
            placeholder="Enter Link"
            value={link}
          /> */}
              {/* <TextInput
            style={{
              height: 40,
              width: 200,
              borderColor: "gray",
              borderWidth: 1,
            }}
            onChangeText={setDescription}
            placeholder="Enter description"
            value={description}
          /> */}
              <Text></Text>
              <TouchableOpacity
                onPress={_pickImage}
                style={{
                  height: 35,
                  width: "35%",
                  alignSelf: "center",
                  alignContent: "center",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    flex: 0.5,
                    alignSelf: "center",
                    alignContent: "center",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons name="file-upload" size={24} color="#185a9d" />
                  <Text style={{ color: "#185a9d", fontSize: 18 }}>
                    Upload Image
                  </Text>
                </View>
              </TouchableOpacity>
              <View
                style={{
                  flex: 1,
                }}
              >
                <TouchableOpacity
                  //onPress={_pickImage}
                  style={{
                    flex: 1,
                    width: "35%",
                    alignSelf: "center",
                    alignContent: "center",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {image != null ? (
                    <Image
                      source={{ uri: image }}
                      style={{
                        width: 150,
                        height: 100,
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: "black",
                      }}
                    />
                  ) : null}
                </TouchableOpacity>
              </View>
              <Text></Text>
              <TouchableOpacity
                // onPress={}
                style={{
                  flex: 0.5,
                  width: "35%",
                  alignSelf: "center",
                  alignContent: "center",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 18 }}>
                  Total Price:
                  {amount > 0 ? amount : null}
                </Text>
              </TouchableOpacity>
              <Text></Text>
              <TouchableOpacity
                style={styles.payButton}
                onPress={async () => {
                  if (await submit()) {
                    setModal(true);
                  }
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    color: "white",
                  }}
                >
                  SUBMIT
                </Text>
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={() => submit()}>
              <Text>submit</Text>
            </TouchableOpacity> */}
            </ScrollView>
          </View>
        ) : flag === 2 ? (
          <View style={{ flex: 10 }}>
            <TouchableOpacity onPress={() => openLink()}>
              <Image
                source={{ uri: adsBox[adsNum].image }}
                style={{ width: 100, height: 100 }}
              />
            </TouchableOpacity>
          </View>
        ) : null
        // <SubscriptionsScreen style={{ flex: 10 }} />
      }
      <Modal transparent={true} visible={modal} animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignContent: "center",
            alignSelf: "center",
            alignItems: "center",
            marginTop: 22,
            // ---This is for Width---
            width: "80%",
          }}
        >
          <View
            style={{
              margin: 20,
              backgroundColor: "white",
              borderRadius: 20,
              padding: 35,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              justifyContent: "center",
              alignContent: "center",
              alignSelf: "center",
              alignItems: "center",
              // ---This is for Height---
              height: "50%",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                textAlign: "center",
              }}
            >
              Your Request has been sent!
            </Text>
            <Text></Text>
            <Text></Text>
            <View
              style={{
                width: "100%",
                height: "5%",
                justifyContent: "space-evenly",
                alignItems: "center",
                alignSelf: "center",
                flexDirection: "row",
              }}
            >
              {/* ---------------------------------OK--------------------------------- */}
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => props.navigation.goBack()}
              >
                <Text style={{ color: "white" }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
AdvertismentsPage.navigationOptions = (props) => ({
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
    marginBottom: 10,
    //flexDirection: "row",
  },
});
