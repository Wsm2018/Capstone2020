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
import { Input, Tooltip } from "react-native-elements";

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
      let temp = JSON.parse(JSON.stringify(props.user));
      temp.role = temp.role.slice(0, temp.role.length - 13);
      props.setUser(temp);
      let set = firebase.functions().httpsCallable("setEmployeeAuthentication");
      let response = await set({
        user: currentUser,
        password: password.text,
        phone: phone.text,
      });

      console.log(temp);
      console.log("response", response.data);
    }
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    handleCurrentuser();
    handleCompany();
  }, []);

  return (
    <View style={styles.container}>
      <Text
        style={{
          fontSize: 20,
          color: "#185a9d",
          justifyContent: "center",
          alignSelf: "center",
          marginTop: "5%",
          fontWeight: "bold",
        }}
      >
        Reset Password
      </Text>

      {/* ----------------------------------PASSWORD-------------------------------- */}
      <Input
        inputContainerStyle={{
          borderBottomWidth: 0,
        }}
        onChangeText={(text) => setPassword({ text, error: false })}
        value={password.text}
        secureTextEntry={true}
        containerStyle={styles.Inputs}
        placeholder="Password"
        placeholderTextColor="#185a9d"
        inputStyle={{
          color: "#185a9d",
          fontSize: 16,
        }}
      />
      <Text
        style={
          password.error
            ? { color: "red", marginLeft: "10%" }
            : { color: "transparent" }
        }
      >
        * Invalid Password
      </Text>
      <Input
        inputContainerStyle={{
          borderBottomWidth: 0,
        }}
        onChangeText={(text) => setConfirmPassword({ text, error: false })}
        value={confirmPassword.text}
        secureTextEntry={true}
        containerStyle={styles.Inputs}
        placeholder="Confirm Password"
        placeholderTextColor="#185a9d"
        inputStyle={{
          color: "#185a9d",
          fontSize: 16,
        }}
      />
      <Text
        style={
          confirmPassword.error
            ? { color: "red", marginLeft: "10%" }
            : { color: "transparent" }
        }
      >
        * Passwords do not match
      </Text>

      <Input
        inputStyle={{
          color: "#20365F",
          fontSize: 16,
        }}
        inputContainerStyle={{ borderBottomWidth: 0 }}
        containerStyle={styles.Inputs}
        onChangeText={(text) => setPhone({ text, error: false })}
        value={phone.text}
        style={{ width: "75%" }}
        keyboardType={"phone-pad"}
        maxLength={8}
        placeholderTextColor="#20365F"
        keyboardType="number-pad"
        placeholder="Phone No."
      />
      <Text
        style={
          phone.error
            ? { color: "red", marginLeft: "10%" }
            : { color: "transparent" }
        }
      >
        * Invalid Phone Number
      </Text>
      <Text></Text>
      <TouchableOpacity style={styles.loginButton} onPress={handleCreate}>
        <Text style={{ color: "white", fontWeight: "bold" }}>Confirm</Text>
      </TouchableOpacity>
      {/* 
      <TextInput
        onChangeText={(text) => setPassword({ text, error: false })}
        value={password.text}
        secureTextEntry={true}
      /> */}

      {/* ----------------------------------CONFIRM PASSWORD-------------------------------- */}
      {/* <Text>Confirm Password</Text>
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
      </Text> */}

      {/* ----------------------------------PHONE-------------------------------- */}
      {/* <Text>Phone</Text> */}
      {/* <View style={{ flexDirection: "row", justifyContent: "space-between" }}> */}
      {/* <TextInput value={"+974"} style={{ width: "20%" }} disabled /> */}
      {/* <TextInput
          onChangeText={(text) => setPhone({ text, error: false })}
          value={phone.text}
          style={{ width: "75%" }}
          keyboardType={"phone-pad"}
          maxLength={8} */}
      {/* /> */}
      {/* </View> */}
      {/* <Text style={phone.error ? { color: "red" } : { color: "transparent" }}>
        * Invalid Phone Number
      </Text> */}

      {/* ---------------------------------SUBMIT--------------------------------- */}
      <Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#e3e3e3",
    //height: "100%",
  },
  Inputs: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#185a9d",
    height: 50,
    width: "90%",
    alignSelf: "center",
    opacity: 0.8,
    paddingLeft: 12,
    marginTop: 20,
    marginLeft: "1%",
    backgroundColor: "white",
    // justifyContent:"center"
  },
  loginButton: {
    backgroundColor: "#60c4c4",
    height: 45,
    width: "60%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 30,
    marginBottom: 5,
    marginTop: 5,
    // borderWidth: 3,
    // borderColor: "#185a9d",
  },
});
