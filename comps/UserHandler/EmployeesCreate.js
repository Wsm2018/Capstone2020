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
import db from "../../db";
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
  const [role, setRole] = useState("-1");

  // ------------------------------CURRENT USER------------------------------------
  const handleCurrentuser = async () => {
    const doc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    setCurrentUser({ id: doc.id, ...doc.data() });
  };

  // ------------------------------------------------------------------
  const handleCompany = async () => {
    let snapshot = await db.collection("company").get();
    let tempCompany = "";
    snapshot.forEach((doc) => (tempCompany = doc.data().domain));

    setCompany(tempCompany);
  };

  // ------------------------------------------------------------------
  const validated = async () => {
    let count = 0;

    let emailList = await db
      .collection("users")
      .where("email", "==", email.text + company)
      .get();

    let nameList = await db
      .collection("users")
      .where("displayName", "==", email.text + company)
      .get();

    if (emailList.size > 0 || email.text === "") {
      console.log("email bad");
      setEmail({ text: email.text, error: true });
    } else {
      console.log("email good");
      count++;
    }

    if (nameList.size > 0 || displayName.text === "") {
      console.log("displayName bad");
      setDisplayName({ text: displayName.text, error: true });
    } else {
      console.log("displayName good");
      count++;
    }

    if (count === 2) {
      return true;
    } else {
      return false;
    }
  };

  // ------------------------------------------------------------------
  const handleCreate = async () => {
    if (validated()) {
      let create = firebase.functions().httpsCallable("createEmployee");
      let response = await create({
        email: email.text + company,
        displayName: displayName.text,
        role,
      });
      console.log("response", response.data);

      let page = `<View><Text>Email:${
        email.text + company
      }</Text><Text>Password:${response.data.password}</Text></View>`;
      let pdf = await Print.printToFileAsync({ html: page });
      let uri = pdf.uri;
      const response2 = await fetch(uri);
      const blob = await response2.blob();
      const putResult = await firebase
        .storage()
        .ref()
        .child(`pdf/${response.data.id}`)
        .put(blob);

      props.navigation.navigate("EmployeesCreateSuccess", {
        id: response.data.id,
        email: email.text + company,
      });
    }
  };

  // ------------------------------------------------------------------
  const handleDelete = async () => {
    let query = await db
      .collection("users")
      .where("email", "==", "asd@company.com")
      .get();

    let uid;
    query.forEach((doc) => (uid = doc.id));
    console.log(uid);
    let remove = await fetch(
      `https://us-central1-capstone2020-b64fd.cloudfunctions.net/deleteUser?uid=${uid}`
    );

    await db.collection("users").doc(uid).delete();
    await firebase.storage().ref().child(`pdf/${uid}`).delete();
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    handleCurrentuser();
    handleCompany();
  }, []);

  return (
    <View style={styles.container}>
      {/* <Text>EmployeeHandlerCreate</Text> */}

      {/* ----------------------------------EMAIL-------------------------------- */}
      <Text>Email</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TextInput
          onChangeText={(text) => setEmail({ text, error: false })}
          value={email.text}
          style={{ width: "55%" }}
        />
        <TextInput value={company} style={{ width: "40%" }} disabled />
      </View>
      <Text style={email.error ? { color: "red" } : { color: "transparent" }}>
        * Invalid Email
      </Text>

      {/* ---------------------------------DISPLAY NAME--------------------------------- */}
      <Text>Display Name</Text>
      <TextInput
        onChangeText={(text) => setDisplayName({ text, error: false })}
        value={displayName.text}
      />
      <Text
        style={displayName.error ? { color: "red" } : { color: "transparent" }}
      >
        * A Display Name is required
      </Text>

      {/* ---------------------------------ROLE--------------------------------- */}
      <Text>Role</Text>
      <View style={{ borderColor: "lightgray", backgroundColor: "lightgray" }}>
        <Picker
          // mode="dropdown"
          selectedValue={role}
          onValueChange={(itemValue, itemIndex) => setRole(itemValue)}
        >
          <Picker.Item
            label="Select a role"
            value="-1"
            itemStyle={{ textAlign: "center" }}
          />
          {roles.map((role, index) => (
            <Picker.Item label={role} value={role} key={index} />
          ))}
        </Picker>
      </View>

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
        <Text>Create</Text>
      </TouchableOpacity>

      {/* ---------------------------------DELETE--------------------------------- */}
      <Text></Text>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          width: "100%",
          height: "15%",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={handleDelete}
      >
        <Text>DELETE</Text>
      </TouchableOpacity>
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

// {/* ----------------------------------PASSWORD-------------------------------- */}
// <Text>Password</Text>
// <TextInput
//   onChangeText={(text) => setPassword({ text, error: false })}
//   value={password}
// />
// <Text
//   style={password.error ? { color: "red" } : { color: "transparent" }}
// >
//   * Passwords do not match
// </Text>

// {/* ----------------------------------CONFIRM PASSWORD-------------------------------- */}
// <Text>Confirm Password</Text>
// <TextInput
//   onChangeText={(text) => setConfirmPassword({ text, error: false })}
//   value={confirmPassword}
// />
