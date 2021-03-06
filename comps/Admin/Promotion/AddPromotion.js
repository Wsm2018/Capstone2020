import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Button,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
  responsiveFontSize,
  useResponsiveScreenHeight,
} from "react-native-responsive-dimensions";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import db from "../../../db";
import firebase from "firebase";
import "firebase/functions";
import "firebase/auth";
// import { KeyboardAvoidingView } from "react-native";

export default function AddPromotion(props) {
  //-------------------------------------------- USE STATE ----------------------------------

  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [showCodeErr, setShowCodeErr] = useState(false);
  const [expiry, setExpiry] = useState("");
  const [expiryErr, setExpiryErr] = useState("");
  const [showExpiryErr, setShowExpiryErr] = useState(false);
  const [percentage, setPercentage] = useState("");
  const [percentageErr, setPercentageErr] = useState("");
  const [showPercentageErr, setShowPercentageErr] = useState(false);

  //------------------------------------------- FUNCTION ----------------------------------

  const validate = () => {
    let res = true;
    if (code === "") {
      setShowCodeErr(true);
      setCodeErr("Enter Code");
      res = false;
    }

    if (expiry === "") {
      setShowExpiryErr(true);
      setExpiryErr("Enter Date");
      res = false;
    }

    if (percentage === "") {
      setShowPercentageErr(true);
      setPercentageErr("Enter Percentage");
      res = false;
    }
    return res;
  };

  const handleSubmit = async () => {
    if (validate()) {
      console.log("we in");
      const addPromotion = firebase.functions().httpsCallable("addPromotion");
      const response = await addPromotion({
        code: code,
        expiry: expiry,
        percentage: parseInt(percentage),
      });
      if (response) {
        alert("Promotion Code Added");
      }
    }
  };

  //------------------------------------------- USE EFFECT ----------------------------------

  //   useEffect(() => {
  //     getPromotionCodes();
  //   }, []);

  // ------------------------------------ RETURN -------------------------------------------

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding " : null}
        style={{ flex: 1, backgroundColor: "#f5f0f0" }}
      >
        <View style={{ backgroundColor: "#185a9d", flex: 1, margin: 10 }}>
          <View style={{ backgroundColor: "#e3e3e3", flex: 1, margin: 5 }}>
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  flex: 0.5,

                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: responsiveFontSize(2),
                    color: "#005c9d",
                    justifyContent: "center",
                    alignSelf: "center",
                    // marginTop: "5%",
                    fontWeight: "bold",
                  }}
                >
                  Promotion Create
                </Text>
              </View>
              <View style={{ width: "80%" }}>
                <View
                  style={{
                    backgroundColor: "white",
                    alignItems: "center",
                    flexDirection: "column",
                    // paddingLeft: 6,
                    // width: "80%",
                    borderColor: "black",
                    borderWidth: 1,
                    borderRadius: 5,
                    marginBottom: "5%",
                  }}
                >
                  <TextInput
                    style={{ height: responsiveScreenHeight(5), width: "80%" }}
                    value={code}
                    onChangeText={(c) => {
                      setCode(c);
                      setCodeErr("");
                      setShowCodeErr(false);
                    }}
                    placeholder="Code"
                    maxLength={8}
                  />
                </View>

                {showCodeErr ? (
                  <Text
                    style={
                      codeErr ? { color: "red" } : { color: "transparent" }
                    }
                  >
                    {codeErr}
                  </Text>
                ) : null}
              </View>

              <View style={{ width: "80%" }}>
                <View
                  style={{
                    backgroundColor: "white",
                    alignItems: "center",

                    flexDirection: "column",
                    // paddingLeft: 6,
                    // width: "80%",
                    borderColor: "black",
                    borderWidth: 1,
                    borderRadius: 5,
                    marginBottom: "5%",
                  }}
                >
                  <TextInput
                    style={{ height: responsiveScreenHeight(5), width: "80%" }}
                    value={percentage}
                    onChangeText={(percent) => {
                      setPercentage(percent);
                      setPercentageErr("");
                      setShowPercentageErr(false);
                    }}
                    placeholder="Percentage"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>

                {showPercentageErr ? (
                  <Text
                    style={
                      percentageErr
                        ? { color: "red" }
                        : { color: "transparent" }
                    }
                  >
                    {percentageErr}
                  </Text>
                ) : null}
              </View>
              <View style={{ height: 50, width: "80%" }}>
                <DatePicker
                  style={{
                    width: "100%",
                    borderColor: "gray",
                    borderWidth: 0.5,
                    borderRadius: 5,
                    backgroundColor: "white",
                  }}
                  date={expiry}
                  mode="date"
                  placeholder="Select Expiry Date"
                  format="YYYY-MM-DD"
                  minDate={new Date()}
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  customStyles={{
                    dateIcon: {
                      right: 0,
                      top: 0,
                    },

                    placeholderText: {
                      fontSize: 15,
                      color: "#393f4a",
                    },
                    dateText: {
                      fontSize: 15,
                      color: "#393f4a",
                    },
                  }}
                  onDateChange={(date) => {
                    setExpiry(date);
                    setExpiryErr("");
                    setShowExpiryErr(false);
                  }}
                />
                {showExpiryErr ? (
                  <Text
                    style={
                      expiryErr ? { color: "red" } : { color: "transparent" }
                    }
                  >
                    {expiryErr}
                  </Text>
                ) : null}
              </View>
            </View>

            <View
              style={{
                flex: 0.5,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 0.3,
                  backgroundColor: "#2E9E9B",
                  height: responsiveScreenHeight(5),
                  justifyContent: "center",
                  alignItems: "center",
                  marginEnd: "3%",
                  borderRadius: 10,
                }}
                onPress={handleSubmit}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: responsiveFontSize(2),
                    color: "white",
                  }}
                >
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

AddPromotion.navigationOptions = {
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
};
