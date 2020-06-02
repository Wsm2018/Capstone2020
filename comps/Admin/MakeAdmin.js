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
          width={Dimensions.get("window").width / 1.2}
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
          flex: 1,
          // backgroundColor: "red",
          justifyContent: "flex-start",
          // marginTop: 10,
        }}
      >
        <TextInput
          width={Dimensions.get("window").width / 1.2}
          style={{
            backgroundColor: "white",
            height: 50,
            // color: "red",
            // position: "absolute",
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
        <View style={{ marginBottom: 10 }}>
          <Text
            style={{
              textAlign: "center",
              fontSize: 16,
              color: "gray",
              // fontWeight: "bold",
            }}
          >
            Enter an email to give admin privileges.
          </Text>
        </View>
        <View
          style={{
            flex: 4,
            // backgroundColor: "red",
            // justifyContent: "space-between",
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
            onPress={handleSubmit}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 18,
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
    backgroundColor: "#e3e3e3",
  },
});
