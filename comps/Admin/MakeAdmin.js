import React, { useState, useEffect } from "react";
import { TextInput, Button, View, Text } from "react-native";
import firebase from "firebase";
import "firebase/functions";
import db from "../../db";

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

  // -------------------------------------- RETURN -----------------------------------

  return (
    <View>
      <TextInput
        placeholder="Email"
        onChangeText={(email) => {
          setEmail(email);
          setErr("");
          setShowErr(false);
        }}
        value={email}
      />
      {showErr ? (
        <Text style={showErr ? { color: "red" } : { color: "transparent" }}>
          {err}
        </Text>
      ) : null}

      <Button title="submit" onPress={handleSubmit} />
    </View>
  );
}
