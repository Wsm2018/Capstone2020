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
import db, { config } from "../db";
import { TextInput } from "react-native-paper";
import { Input, Tooltip } from "react-native-elements";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { Octicons } from "@expo/vector-icons";
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
  const [flag, setFlag] = useState(false);
  const recaptchaVerifier = React.useRef(null);
  const [verificationId, setVerificationId] = React.useState();
  const [verificationCode, setVerificationCode] = React.useState();
  const [showCodeErr, setShowCodeErr] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const firebaseConfig = firebase.apps.length
    ? firebase.app().options
    : undefined;
  const [message, showMessage] = React.useState(
    !firebaseConfig || Platform.OS === "web"
      ? {
          text:
            "To get started, provide a valid firebase config in App.js and open this snack on an iOS or Android device.",
        }
      : undefined
  );

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

  // -------------------------------Password Strength-----------------------------------
  const passwordStrength = (password) => {
    const strongRegex = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
    );
    console.log("pass", strongRegex.test(password));
    return strongRegex.test(password);
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

    if (
      password.text !== confirmPassword.text &&
      passwordStrength(password.text)
    ) {
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
      try {
        const phoneProvider = new firebase.auth.PhoneAuthProvider();
        const verificationId = await phoneProvider.verifyPhoneNumber(
          `+974${phone.text}`,
          recaptchaVerifier.current
        );
        setVerificationId(verificationId);
        alert("Verification code has been sent to your phone.");
        setFlag(true);
      } catch (err) {
        console.log(err195966);
        // setErrMsg(`Error: ${err.message}`);
        // setShowCodeErr(true);
      }
    }
  };

  const handleConfirmCode = async () => {
    if (
      verificationCode === null ||
      verificationCode === "" ||
      verificationCode === undefined
    ) {
      setErrMsg("* Enter the Code");
      setShowCodeErr(true);
    } else if (verificationCode.length < 6) {
      setErrMsg("* Invalid Code");
      setShowCodeErr(true);
    } else {
      try {
        const credential = firebase.auth.PhoneAuthProvider.credential(
          verificationId,
          verificationCode
        );
        if (credential !== null) {
          try {
            let temp = JSON.parse(JSON.stringify(props.user));
            let newRole = temp.role.slice(0, temp.role.length - 13);
            temp.role = newRole;
            temp.activeRole = newRole;
            console.log("temp.activeRole", temp.activeRole);
            props.setUser(temp);
            props.setActiveRole(temp.activeRole);
            console.log("new User", temp);
            console.log("going to set");
            let set = firebase
              .functions()
              .httpsCallable("setEmployeeAuthentication");
            console.log(set);
            let response = await set({
              user: currentUser,
              password: password.text,
              phone: phone.text,
            });
            console.log("did we get here?");
            console.log("new User", temp);
            console.log("response", response);
          } catch (err) {
            console.log(err);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    handleCurrentuser();
    handleCompany();
  }, []);

  return !flag ? (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={config}
      />
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
    </View>
  ) : (
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
        Verify Phone Number
      </Text>
      <Input
        inputStyle={{
          color: "#185a9d",
          fontSize: 16,
        }}
        editable={!!verificationId}
        // inputContainerStyle={{ borderBottomWidth: 10 }}
        leftIcon={<Octicons name="verified" size={20} color="#185a9d" />}
        containerStyle={styles.Inputs}
        placeholderTextColor="#185a9d"
        onChangeText={(code) => {
          setVerificationCode(code);
          setErrMsg("");
          setShowCodeErr(false);
        }}
        placeholder="Verification Code"
      />
      {showCodeErr ? <Text style={{ color: "red" }}>{errMsg}</Text> : null}

      <TouchableOpacity
        onPress={handleConfirmCode}
        disabled={!verificationId}
        style={styles.loginButton}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Confirm Verification Code
        </Text>
      </TouchableOpacity>
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
