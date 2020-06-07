import React, { useState, useEffect } from "react";
import {
  View,
  Picker,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Modal,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
const LottieView = require("lottie-react-native");

import { AntDesign, MaterialCommunityIcons } from "react-native-vector-icons";

import { Input, Button } from "react-native-elements";
import { Card } from "react-native-shadow-cards";
const validator = require("email-validator");
const { width, height } = Dimensions.get("screen");
import ReactNativePickerModule from "react-native-picker-module";
import db from "../../db";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";
export default function GiftScreen(props) {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [flag, setFlag] = useState(false);
  const [view, setView] = useState("first");
  const [modal, setModal] = useState(false);
  const amounts = {
    labels: ["100", "50", "10", "Other Amount"],
    values: ["100", "50", "10", "other"],
  };
  let pickerRef = null;
  const [errorMessage, setErrorMessage] = useState("");
  const [amountErrMsg, setAmountErrMsg] = useState("");

  useEffect(() => {
    if (amount === "other") {
      setFlag(true);
    }
  }, [amount]);

  useEffect(() => {
    if (amountErrMsg !== "" && !flag) {
      setAmountErrMsg("");
    }
  }, [flag]);

  const handleCancel = () => {
    setAmountErrMsg("");
    setAmount("");
    setEmail("");
    setFlag(false);
  };

  const handleSend = async () => {
    if (amount === "" || amount === "other") {
      setAmountErrMsg("* Enter the Amount");
      return;
    }
    if (parseInt(amount) === 0) {
      setAmountErrMsg("* The amount cannot be 0");
      return;
    }
    // alert("sending...");

    // checking if the user balance is less than the gift balance
    const userDoc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    if (userDoc.data().balance < parseInt(amount)) {
      alert("You don't have enough balance!");
      setAmount("");
    } else {
      let send = firebase.functions().httpsCallable("sendGift");
      let response = await send({
        email,
        giftBalance: parseInt(amount),
        uid: firebase.auth().currentUser.uid,
        displayName: firebase.auth().currentUser.displayName,
      });
      console.log("dsfsdfdsfsfsadfadsf", response);
      setModal(true);
    }
  };

  const handleFlag = () => {
    setAmount("");
    setFlag(false);
  };

  const handleClear = () => {
    setEmail("");
  };

  const emailValidity = () => {
    if (validator.validate(email)) {
      const emailParts = email.split("@");
      const providers = ["gmail", "yahoo", "outlook", "hotmail", "protonmail"];
      const providerParts = emailParts[1].split(".");
      const provider = providerParts[0];
      return providers.includes(provider);
    }
  };

  const handleNext = () => {
    if (email !== "") {
      if (emailValidity()) {
        if (email === firebase.auth().currentUser.email) {
          setErrorMessage("Cannot use your own email");
          return;
        } else {
          setView("second");
        }
      } else {
        setErrorMessage("Not a valid email address");
      }
    } else {
      setErrorMessage("Enter Your Email");
    }
  };

  const hanldeGoback = () => {
    setAmount("");
    setFlag(false);
    setView("first");
    setErrorMessage("");
  };

  useEffect(() => {
    if (amount !== "" || amount === "other") {
      setAmountErrMsg("");
    }
  }, [amount]);

  useEffect(() => {
    if (email === "") {
      setErrorMessage("");
    } else {
      if (errorMessage !== "") {
        setErrorMessage("");
      }
    }
  }, [email]);
  //aminehmollazehi@gmail.com
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
      <View style={{ flex: 1 }}>
        <View
          //elevation={2}
          style={{
            width: "100%",
            backgroundColor: "white",
            flex: 1,
            borderWidth: 1,
            borderTopWidth: 0,
            borderColor: "darkgray",
          }}
        >
          {view === "first" ? (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                // backgroundColor: "red",
                flex: 1.5,
                marginTop: "10%",
              }}
              onPress={handleCancel}
            >
              <View
                width={Dimensions.get("window").width / 1.5}
                style={{
                  // backgroundColor: "white",
                  alignItems: "center",
                  flexDirection: "row",
                  // paddingLeft: 6,
                  // width: "60%",
                  // borderColor: "black",
                  // borderWidth: 1,
                  // borderRadius: 10,
                  // marginBottom: 10,
                }}
              >
                {/* <MaterialCommunityIcons name="email" size={20} color="gray" /> */}
                <Input
                  inputContainerStyle={{
                    width: "100%",
                    borderColor: "black",
                    height: 40,
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
                  placeholder="Receiver@email.com"
                  value={email}
                  onChangeText={(email) => setEmail(email.toLowerCase())}
                  errorMessage={errorMessage}
                  errorStyle={{ color: "red", fontWeight: "bold" }}
                />
              </View>
            </View>
          ) : !flag ? (
            Platform.OS !== "ios" ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-end",
                  alignItems: "center",
                  // backgroundColor: "black",
                }}
              >
                <View
                  style={{
                    borderColor: "black",
                    height: 40,
                    // backgroundColor: "green",
                    alignItems: "center",
                    justifyContent: "center",
                    // flexDirection: "row",
                    // paddingLeft: 6,
                    width: "60%",
                    borderColor: "gray",
                    borderWidth: 1,
                    borderRadius: 5,
                    // marginBottom: 10,
                  }}
                >
                  <Picker
                    style={{
                      width: "100%",
                      // alignItems: "flex-end",
                      marginTop: "8%",
                      // justifyContent: "flex-end",
                      // backgroundColor: "blue",
                    }}
                    selectedValue={amount}
                    onValueChange={(item) => setAmount(item)}
                  >
                    <Picker.Item value="" label="Select Amount" />
                    {amounts.labels.map((item, index) => (
                      <Picker.Item
                        key={index}
                        value={amounts.values[index]}
                        label={item}
                      />
                    ))}
                  </Picker>
                  <Text style={{ color: "red" }}>{amountErrMsg}</Text>
                </View>
              </View>
            ) : (
              <View>
                <TouchableOpacity
                  style={{
                    paddingVertical: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => {
                    pickerRef.show();
                  }}
                >
                  <View
                    style={{
                      width: "60%",
                      height: 40,

                      flexDirection: "row",
                      // justifyContent: "space-evenly",
                      alignItems: "center",
                      // backgroundColor: "red",
                      borderWidth: 1,

                      paddingLeft: 6,
                      // width: "60%",
                      borderColor: "black",
                      borderWidth: 1,
                      borderRadius: 10,
                      // marginBottom: 10,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "space-between",
                        flexDirection: "row",
                      }}
                    >
                      <Text style={{ fontWeight: "bold" }}>
                        {amount === ""
                          ? "Select Amount"
                          : `Selected amount: ${amount}`}
                      </Text>
                      <AntDesign
                        style={{ marginRight: "5%" }}
                        name="caretdown"
                        size={15}
                        color="gray"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
                {/* <Text>{amount !== "" ? amount : null}</Text> */}
                <ReactNativePickerModule
                  pickerRef={(e) => (pickerRef = e)}
                  title={"Amount"}
                  items={amounts.labels}
                  onDismiss={() => {
                    console.log("onDismiss");
                  }}
                  onCancel={() => {
                    console.log("Cancelled");
                  }}
                  onValueChange={(valueText, index) => {
                    setAmount(amounts.values[index]);
                  }}
                />
              </View>
            )
          ) : (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "flex-end",
                flex: 1,
                // backgroundColor: "blue",
              }}
            >
              {/* <View style={{ flex: 0.5 }}> */}
              <View
                style={{
                  flex: 0.5,
                  backgroundColor: "white",
                  alignItems: "center",

                  flexDirection: "row",
                  paddingLeft: 6,

                  justifyContent: "center",
                  // flexDirection: "row",
                  // paddingLeft: 6,
                  // width: "60%",
                  borderColor: "gray",
                  borderWidth: 2,
                  borderRadius: 5,
                  // marginBottom: 10,

                  // marginBottom: 10,
                }}
              >
                {/* <MaterialCommunityIcons name="email" size={20} color="gray" /> */}
                {/* <View
                    style={{
                      flex: 2,
                      flexDirection: "row",
                    }}
                  > */}
                <TextInput
                  style={{
                    height: 40,
                    width: "80%",
                    paddingLeft: 6,
                    // backgroundColor: "red",
                  }}
                  placeholder={
                    amountErrMsg !== ""
                      ? amountErrMsg
                      : amount !== "other"
                      ? null
                      : "Enter Amount"
                  }
                  placeholderTextColor={amountErrMsg !== "" ? "red" : "gray"}
                  onChangeText={(amt) => {
                    setAmount(amt);
                    setAmountErrMsg("");
                  }}
                  // value={amount}
                  keyboardType="numeric"
                />
                {/* </View> */}
                {/* </View> */}
                {/* <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text style={{ color: "red", fontWeight: "bold" }}>
                    {amountErrMsg}
                  </Text>
                </View> */}
              </View>
              <View style={{ flex: 0.1, paddingBottom: 10 }}>
                <TouchableOpacity
                  style={{
                    alignSelf: "center",
                    justifyContent: "center",
                    alignItems: "center",
                    // backgroundColor: "red",
                  }}
                  onPress={handleFlag}
                >
                  <AntDesign
                    name="closecircle"
                    size={25}
                    style={{ color: "gray" }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {view === "first" ? (
            <View
              style={{
                flex: 4,
                // backgroundColor: "red",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 0.3,
                  backgroundColor: "#2E9E9B",
                  // borderWidth: 4,
                  height: 40,
                  // width: "30%",
                  // alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  //marginStart: "2%",
                  marginEnd: "3%",
                  borderRadius: 10,
                  //marginBottom: 10,
                }}
                onPress={handleClear}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    color: "white",
                    // fontWeight: "bold",
                  }}
                >
                  Clear
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 0.3,
                  backgroundColor: "#2E9E9B",
                  // borderWidth: 4,
                  height: 40,
                  // width: "30%",
                  // alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  marginStart: "3%",
                  // marginEnd: "3%",
                  borderRadius: 10,
                  //marginBottom: 10,
                }}
                onPress={handleNext}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    color: "white",
                    // fontWeight: "bold",
                  }}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                flex: 1.5,
                // backgroundColor: "red",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 0.3,
                  backgroundColor: "#2E9E9B",
                  // borderWidth: 4,
                  height: 40,
                  // width: "30%",
                  // alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  //marginStart: "2%",
                  marginEnd: "3%",
                  borderRadius: 10,
                  //marginBottom: 10
                }}
                onPress={hanldeGoback}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    color: "white",
                    // fontWeight: "bold",
                  }}
                >
                  Go Back
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 0.3,
                  backgroundColor: "#2E9E9B",
                  // borderWidth: 4,
                  height: 40,
                  // width: "30%",
                  // alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  //marginStart: "2%",
                  marginStart: "3%",
                  borderRadius: 10,
                  //marginBottom: 10
                }}
                onPress={handleSend}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    color: "white",
                    // fontWeight: "bold",
                  }}
                >
                  Send
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <Modal transparent={true} visible={modal}>
        <View style={styles.centeredView}>
          <View elevation={5} style={styles.modalView}>
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "flex-end",
                marginEnd: 15,
                marginTop: 15,
              }}
              onPress={() => setModal(false)}
            >
              <AntDesign name="close" size={25} style={{ color: "#224229" }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 4,
                // backgroundColor: "green",

                // width: "100%",
                // flexDirection: "row",
                // justifyContent: "space-around",
                // alignItems: "center",
              }}
            >
              <LottieView
                // width={Dimensions.get("window").width}
                source={require("../../assets/images/lf20_d7VBaD.json")}
                autoPlay
                // loop
                style={
                  {
                    // flex: 1,
                    // width: "22%",
                    // height: "100%",
                    // backgroundColor: "green",
                    // justifyContent: "space-evenly",
                    // alignItems: "center",
                  }
                }
              />
            </TouchableOpacity>

            <View
              style={{
                flex: 1,
                alignItems: "center",
                // backgroundColor: "red",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  // marginTop: -15,
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#20365F",
                }}
              >
                Gift Was Sent Successfully!
              </Text>
            </View>
          </View>
        </View>
      </Modal>
      {/* </TouchableWithoutFeedback> */}
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f5f0f0",
  },

  modalView: {
    // flexDirection:
    // flex: 1,
    // margin: 20,
    height: height / 2.8,
    width: width / 1.6,
    backgroundColor: "#fff",
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    borderRadius: 20,
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
  header: {
    justifyContent: "center",
    alignItems: "center",
    // flex: 0.7,
    paddingTop: "15%",
  },
  title: {
    // alignItems: "flex-end",
    fontSize: 20,
    color: "black",
    textAlign: "center",
    fontWeight: "bold",
    textTransform: "capitalize",
  },
});
