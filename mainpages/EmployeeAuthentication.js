import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  ScrollView,
  Picker,
} from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";
import "firebase/storage";
import db from "../db";
import { TextInput } from "react-native-paper";

import * as Print from "expo-print";

export default function EmployeeHandlerCreate(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState({ text: "", error: false });
  const [displayName, setDisplayName] = useState({ text: "", error: false });
  const [phone, setPhone] = useState({ text: "", error: false });
  const roles = [
    "asset handler",
    "customer support",
    "manager",
    "user handler",
  ];
  const [role, setRole] = useState({ value: "-1", error: false });
  const [password, setPassword] = useState({ text: "", error: false });
  const [confirmPassword, setConfirmPassword] = useState({
    text: "",
    error: false,
  });

  // ------------------------------CURRENT USER------------------------------------
  const handleCurrentuser = async () => {
    const doc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    setCurrentUser({ id: doc.id, ...doc.data() });
  };

  // -------------------------------COMPANY DOMAIN-----------------------------------
  const handleCompany = async () => {
    let snapshot = await db.collection("company").get();
    let tempCompany = "";
    snapshot.forEach((doc) => (tempCompany = doc.data().domain));

    setCompany(tempCompany);
  };

  // -------------------------------VALIDATE INPUTS-----------------------------------
  const validated = async () => {
    let count = 0;

    if (password.text === "") {
      console.log("password bad");
      setPassword({ text: password.text, error: true });
    } else {
      console.log("password good");
      count++;
    }

    if (password.text !== confirmPassword.text) {
      console.log("confirmPassword bad");
      setConfirmPassword({ text: confirmPassword.text, error: true });
    } else {
      console.log("confirmPassword good");
      count++;
    }

    if (password.text !== confirmPassword.text) {
      console.log("phone bad");
      setPhone({ text: phone.text, error: true });
    } else {
      console.log("phone good");
      count++;
    }

    console.log(count);
    if (count === 3) {
      return true;
    } else {
      return false;
    }
  };

  // --------------------------------CREATE----------------------------------
  const handleCreate = async () => {
    if (await validated()) {
      let set = firebase.functions().httpsCallable("setEmployeeAuthentication");
      let response = await set({
        user: currentUser,
        password: password.text,
        phone: phone.text,
      });
      console.log("response", response.data);
      // let page = `<View><Text>Email:${
      //   email.text + company
      // }</Text><Text>Password:${response.data.password}</Text></View>`;
      // let pdf = await Print.printToFileAsync({ html: page });
      // let uri = pdf.uri;
      // const response2 = await fetch(uri);
      // const blob = await response2.blob();
      // const putResult = await firebase
      //   .storage()
      //   .ref()
      //   .child(`pdf/${response.data.id}`)
      //   .put(blob);
      // props.navigation.navigate("EmployeesCreateSuccess", {
      //   id: response.data.id,
      //   email: email.text + company,
      // });
    }
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    handleCurrentuser();
    handleCompany();
  }, []);

  const test = () => {
    let test = "user handler (incomplete)";
    console.log(test.slice(0, test.length - 13));
  };

  return (
    <View style={styles.container}>
      <Text>Complete User Information</Text>
      <Text></Text>

      {/* ----------------------------------PASSWORD-------------------------------- */}
      <Text>Password</Text>
      <TextInput
        onChangeText={(text) => setPassword({ text, error: false })}
        value={password.text}
        secureTextEntry={true}
      />
      <Text
        style={password.error ? { color: "red" } : { color: "transparent" }}
      >
        * Invalid Password
      </Text>

      {/* ----------------------------------CONFIRM PASSWORD-------------------------------- */}
      <Text>Confirm Password</Text>
      <TextInput
        onChangeText={(text) => setConfirmPassword({ text, error: false })}
        value={confirmPassword.text}
        secureTextEntry={true}
      />
      <Text
        style={
          confirmPassword.error ? { color: "red" } : { color: "transparent" }
        }
      >
        * Passwords do not match
      </Text>

      {/* ----------------------------------PHONE-------------------------------- */}
      <Text>Phone</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TextInput value={"+974"} style={{ width: "20%" }} disabled />
        <TextInput
          onChangeText={(text) => setPhone({ text, error: false })}
          value={phone.text}
          style={{ width: "75%" }}
          keyboardType={"phone-pad"}
          maxLength={8}
        />
      </View>
      <Text style={phone.error ? { color: "red" } : { color: "transparent" }}>
        * Invalid Phone Number
      </Text>

      {/* ---------------------------------SUBMIT--------------------------------- */}
      <Text></Text>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          width: "100%",
          height: "15%",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={handleCreate}
      >
        <Text>Confirm</Text>
      </TouchableOpacity>
      <Button title="test" onPress={() => firebase.auth().signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // borderWidth: 1,
    // flex: 1,
    margin: 20,
    // height: "100%",
  },
});
