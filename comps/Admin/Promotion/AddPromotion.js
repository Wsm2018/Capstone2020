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
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "space-evenly",
            // backgroundColor: "red",
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "blue",
              alignItems: "center",
              justifyContent: "space-evenly",
            }}
          >
            <Text>Promotion Create</Text>
          </View>
          {/* <View></View> */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              // backgroundColor: "red",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                height: 40,
                flex: 2,
                paddingLeft: 10,
                borderColor: "black",
                borderWidth: 1,
                borderRadius: 5,
                justifyContent: "center",
              }}
            >
              <TextInput
                style={{ height: 50, width: "80%" }}
                value={code}
                onChangeText={(c) => {
                  setCode(c);
                  setCodeErr("");
                  setShowCodeErr(false);
                }}
                placeholder="Enter Code"
              />
            </View>

            {showCodeErr ? (
              <Text
                style={codeErr ? { color: "red" } : { color: "transparent" }}
              >
                {codeErr}
              </Text>
            ) : null}

            <View style={{ flex: 1 }}>
              <DatePicker
                style={{
                  height: 40,
                  width: "90%",
                  // paddingLeft: 6,
                  // borderColor: "black",
                  // borderWidth: 1,
                  borderRadius: 5,
                }}
                date={expiry}
                mode="date"
                placeholder=" Expiry Date"
                format="YYYY-MM-DD"
                minDate={new Date()}
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                customStyles={{
                  dateIcon: {
                    position: "absolute",
                    left: 0,
                    top: 4,
                    marginLeft: 0,
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
          <View style={{ width: "80%" }}>
            <View
              style={{
                height: 40,

                paddingLeft: 6,
                borderColor: "black",
                borderWidth: 1,
                borderRadius: 5,
                justifyContent: "center",
              }}
            >
              <TextInput
                style={{ height: 50, width: "80%" }}
                value={percentage}
                onChangeText={(percent) => {
                  setPercentage(percent);
                  setPercentageErr("");
                  setShowPercentageErr(false);
                }}
                placeholder="Percentage"
                keyboardType="numeric"
              />
            </View>

            {showPercentageErr ? (
              <Text
                style={
                  percentageErr ? { color: "red" } : { color: "transparent" }
                }
              >
                {percentageErr}
              </Text>
            ) : null}
          </View>
        </View>

        <View
          style={{
            flex: 0.5,
            justifyContent: "center",
            alignItems: "center",

            width: "90%",
            // flexDirection: "row",
            // marginTop: "5%",
            // marginBottom: "5%",
            alignSelf: "center",
            // justifyContent: "space-evenly",
            // alignItems: "center",
            textAlign: "center",
            // marginStart: "6%",
          }}
        >
          <TouchableOpacity
            style={{
              // backgroundColor: "#20365F",
              // height: 40,
              width: "40%",
              // justifyContent: "center",
              // alignItems: "center",
              // borderRadius: 30,

              backgroundColor: "#327876",
              height: 40,
              // width: "45%",
              alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
              // marginStart: "2%",
              // marginEnd: "2%",
              borderRadius: 10,
              // marginBottom: 10,
            }}
            onPress={handleSubmit}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 16,
                color: "white",
              }}
            >
              Submit
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
