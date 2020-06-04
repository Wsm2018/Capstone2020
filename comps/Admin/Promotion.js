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
import db from "../../db";
// import { KeyboardAvoidingView } from "react-native";

export default function Promotion(props) {
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

  const handleSubmit = () => {
    if (validate()) {
      alert("ge");
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
        <View style={{ alignItems: "center", flex: 0.5 }}>
          <Text style={{ fontSize: 20 }}>Promotion Code</Text>
        </View>
        <View style={{ justifyContent: "space-around", flex: 6 }}>
          <View>
            <TextInput
              value={code}
              onChangeText={(c) => {
                setCode(c);
                setCodeErr("");
                setShowCodeErr(false);
              }}
              placeholder="Code"
              style={{ borderWidth: 1, borderColor: "black" }}
            />
            {showCodeErr ? (
              <Text
                style={codeErr ? { color: "red" } : { color: "transparent" }}
              >
                {codeErr}
              </Text>
            ) : null}
          </View>
          <View>
            <DatePicker
              style={{ width: Dimensions.get("window").width }}
              date={expiry}
              mode="date"
              placeholder="Select Expiry Date"
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
                dateInput: {
                  marginLeft: 36,
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
                style={expiryErr ? { color: "red" } : { color: "transparent" }}
              >
                {expiryErr}
              </Text>
            ) : null}
          </View>
          <View>
            <TextInput
              style={{ borderWidth: 1, borderColor: "black" }}
              value={percentage}
              onChangeText={(percent) => {
                setPercentage(percent);
                setPercentageErr("");
                setShowPercentageErr(false);
              }}
              keyboardType="number-pad"
              placeholder="Percentage"
            />
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
          <View>
            <Button title="Submit" onPress={handleSubmit} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
