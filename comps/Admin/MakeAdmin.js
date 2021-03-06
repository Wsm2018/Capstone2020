import React, { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  View,
  Text,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import firebase from "firebase";
import "firebase/functions";
import db from "../../db";
import LottieView from "lottie-react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from "react-native-responsive-dimensions";

export default function MakeAdmin(props) {
  // -------------------------------------- STATE -----------------------------------
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const [err, setErr] = useState("");
  const [showErr, setShowErr] = useState(false);

  // -------------------------------------- USE EFFECT -----------------------------------

  useEffect(() => {
    db.collection("users").onSnapshot((querySnap) => {
      let mails = [];
      querySnap.forEach((doc) => {
        mails.push(doc.data().email);
      });
      setEmails([...mails]);
    });
  }, []);

  useEffect(() => {
    if (email !== "" && !showErr) {
      setErr("");
      setShowErr(false);
    }
  }, [email]);

  // -------------------------------------- FUNCTIONS -----------------------------------

  const emailValidity = () => {
    const emailParts = email.split("@");
    const providers = ["gmail", "yahoo", "outlook", "hotmail", "protonmail"];
    const providerParts = emailParts[1].split(".");
    const provider = providerParts[0];
    console.log(providers.includes(provider));
    return providers.includes(provider);
  };

  const handleSubmit = async () => {
    if (email !== "") {
      if (emailValidity()) {
        if (emails.includes(email)) {
          const makeAdmin = firebase.functions().httpsCallable("makeAdmin");
          const response = await makeAdmin({ email: email });
          console.log(response);
        } else {
          setErr("* User does not exists");
          setShowErr(true);
        }
      } else {
        setErr("* Invalid Email");
        setShowErr(true);
      }
    } else {
      setErr("* Enter Email");
      setShowErr(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == "ios" ? "height" : "height"}
      style={styles.container}
    >
      <View
        style={{
          flex: 2,
          alignItems: "center",
          justifyContent: "center",
          // backgroundColor: "yellow",
        }}
      >
        <LottieView
          width={Dimensions.get("window").width / 1.3}
          source={require("../../assets/admin.json")}
          autoPlay
          loop
          style={{
            alignItems: "center",
            position: "relative",
          }}
        />
      </View>

      <View
        style={{
          alignItems: "center",
          flex: 1.5,
          // backgroundColor: "red",
          justifyContent: "flex-start",
          // marginTop: 10,
        }}
      >
        <View style={{ marginTop: 15, marginBottom: 5 }}>
          <Text
            style={{
              textAlign: "center",
              fontSize: responsiveFontSize(1.8),
              color: "#808080",
              // fontWeight: "bold",
            }}
          >
            Enter an email to give admin privileges.
          </Text>
        </View>
        <TextInput
          // width={Dimensions.get("window").width / 1.2}
          style={{
            backgroundColor: "white",
            height: responsiveScreenHeight(5),
            width: responsiveScreenWidth(90),
            // color: "red",
            // position: "absolute",
            fontSize: responsiveFontSize(1.8),
            borderColor: "gray",
            borderWidth: 1,
            borderRadius: 10,
            paddingStart: 10,
          }}
          placeholder="Example@email.com"
          onChangeText={(email) => {
            setEmail(email);
            setErr("");
            setShowErr(false);
          }}
        />
        {showErr ? (
          <Text style={showErr ? { color: "red" } : { color: "transparent" }}>
            {err}
          </Text>
        ) : null}
        <View
          style={{
            marginTop: 5,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row-reverse",
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#2E9E9B",
              height: responsiveScreenHeight(5),
              width: "30%",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 5,
            }}
            onPress={handleSubmit}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: responsiveFontSize(2),
                color: "white",
                // fontWeight: "bold",
              }}
            >
              Submit
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // position: "absolute",
    backgroundColor: "#ebe8e8",
  },
});
MakeAdmin.navigationOptions = {
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
};
