import React, { useState, useEffect } from "react";
import {
  View,
  Picker,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { AntDesign, MaterialCommunityIcons } from "react-native-vector-icons";

import { Input, Button } from "react-native-elements";
import { Card } from "react-native-shadow-cards";
const validator = require("email-validator");

import ReactNativePickerModule from "react-native-picker-module";
export default function GiftScreen(props) {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [flag, setFlag] = useState(false);
  const [view, setView] = useState("first");
  const amounts = {
    labels: ["100", "50", "10", "Other Amount"],
    values: ["100", "50", "10", "other"],
  };
  let pickerRef = null;

  useEffect(() => {
    if (amount === "other") {
      setFlag(true);
    }
  }, [amount]);

  const handleCancel = () => {
    setAmount("");
    setEmail("");
    setFlag(false);
  };

  const handleSend = async () => {
    alert("sending...");
    //const response = await fetch(`https://us-central1-capstone2020-b64fd.cloudfunctions.net/sendMail?dest=${email}?sub=Gift$body${}`)
    // const message = `You got a gift code worth ${amount}QR from ${firebase.auth().currentUser.email}. \n Your code is`
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
        setView("second");
      } else {
        alert("Not a valid email address");
      }
    } else {
      alert("Enter Email");
      return;
    }
  };

  const hanldeGoback = () => {
    setAmount("");
    setFlag(false);
    setView("first");
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={{ flex: 1 }}>
        <Card
          elevation={2}
          style={{
            width: "100%",
            flex: 1,
            borderWidth: 1,
            borderTopWidth: 0,
            borderColor: "darkgray",
          }}
        >
          {view === "first" ? (
            <View
              style={{
                // justifyContent: "space-around",
                alignItems: "center",
                // backgroundColor: "red",
                flex: 1.5,
                marginTop: "10%",
              }}
              onPress={handleCancel}
            >
              <View
                style={{
                  // backgroundColor: "white",
                  alignItems: "center",

                  flexDirection: "row",
                  paddingLeft: 6,
                  width: "60%",
                  borderColor: "black",
                  borderWidth: 1,
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              >
                <MaterialCommunityIcons name="email" size={20} color="gray" />
                <TextInput
                  style={{ height: 40, width: "80%", paddingLeft: 6 }}
                  placeholder="receiver@email.com"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>
          ) : !flag ? (
            Platform.OS !== "ios" ? (
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Picker
                  style={{
                    width: "50%",
                    marginTop: "10%",
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
                alignItems: "center",
                // flex: 0.5,
                // backgroundColor: "blue",
              }}
            >
              <View
                style={{
                  flex: 0.4,
                  marginTop: "10%",
                  // backgroundColor: "green",
                  // justifyContent: "flex-end",
                  alignItems: "center",
                  // alignItems: "flex-end",
                }}
              >
                <View
                  style={{
                    // backgroundColor: "white",
                    alignItems: "center",
                    flexDirection: "row",
                    // paddingLeft: 6,

                    // width: "60%",
                    borderColor: "black",
                    borderBottomWidth: 2,
                    borderRadius: 10,
                    // marginBottom: 20,
                  }}
                >
                  <MaterialCommunityIcons name="cash" size={30} color="gray" />
                  <TextInput
                    style={{ width: "80%", paddingLeft: 6 }}
                    placeholder="Enter Amount"
                    onChangeText={setAmount}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={{
                  // backgroundColor: "#20365F",
                  height: 40,
                  // width: "60%",
                  alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  marginStart: "2%",
                  // marginEnd: "2%",
                  // borderRadius: 30,

                  marginTop: "8%",
                  // flexDirection: "row",

                  flex: 0.2,
                }}
                onPress={handleFlag}
              >
                <Text
                  style={{
                    // textAl

                    // textAlign: "justify",
                    fontSize: 14,
                    fontWeight: "bold",
                    color: "darkred",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {view === "first" ? (
            <View
              style={{
                flex: 4,
                // backgroundColor: "red",
                justifyContent: "space-evenly",
                alignItems: "center",
                flexDirection: "row-reverse",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#20365F",
                  // borderWidth: 4,
                  height: 40,
                  width: "30%",
                  // alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  //marginStart: "2%",
                  //marginEnd: "2%",
                  borderRadius: 15,
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

              <TouchableOpacity
                style={{
                  backgroundColor: "#20365F",
                  height: 40,
                  width: "30%",
                  // borderWidth: 4,
                  // alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  //marginStart: "2%",
                  //marginEnd: "2%",
                  borderRadius: 15,
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
            </View>
          ) : (
            <View
              style={{
                flex: 4,
                // backgroundColor: "red",
                justifyContent: "space-evenly",
                alignItems: "center",
                flexDirection: "row-reverse",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#20365F",
                  // borderWidth: 4,
                  height: 40,
                  width: "30%",
                  // alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  //marginStart: "2%",
                  //marginEnd: "2%",
                  borderRadius: 15,
                  //marginBottom: 10,
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

              <TouchableOpacity
                style={{
                  backgroundColor: "#20365F",
                  height: 40,
                  width: "30%",
                  // borderWidth: 4,
                  // alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  //marginStart: "2%",
                  //marginEnd: "2%",
                  borderRadius: 15,
                  //marginBottom: 10,
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
            </View>
          )}
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f5f0f0",
  },
});
