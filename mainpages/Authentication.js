import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableOpacity,
} from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../db";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

const config = {
  apiKey: "AIzaSyBLdt-1iHho-6QGiq30plqoBz4Sjox4_hA",
  authDomain: "capstone2020-b64fd.firebaseapp.com",
  databaseURL: "https://capstone2020-b64fd.firebaseio.com",
  projectId: "capstone2020-b64fd",
  storageBucket: "capstone2020-b64fd.appspot.com",
  messagingSenderId: "930744827368",
  appId: "1:930744827368:web:6f2a6287721546d272785d",
};
try {
  firebase.initializeApp(config);
} catch (err) {
  console.log(err);
}

export default function Authentication(props) {
  const [view, setView] = useState("Register");

  // ***** Register useState *****

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmRegisterPassword, setConfirmRegisterPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");

  // the register button status for validation
  const [btnStatus, setBtnStatus] = useState(true);

  // ***** Login useState *****

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ***** Phone Verification useState *****
  // to know if the registration is completed, used for phone verification
  const [registered, setRegistered] = useState(false);
  const recaptchaVerifier = React.useRef(null);
  const [verificationId, setVerificationId] = React.useState();
  const [verificationCode, setVerificationCode] = React.useState();
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

  // ***** ForgotPass useState *****

  const [forgotPassEmail, setForgotPassEmail] = useState("");

  // it check if the email and password is not empty to enable the register button
  // and it will keep checking whenever the user edits on the email or password fields
  useEffect(() => {
    if (registerEmail !== "" && registerPassword !== "") {
      setBtnStatus(false);
    } else {
      setBtnStatus(true);
    }
  }, [registerEmail, registerPassword]);

  // used for sending verfication code to the phone.
  const handleSendVerificationCode = async () => {
    if (phone !== "") {
      // checking if Phone No. is 8 digits
      if (phone.length !== 8) {
        return alert("Phone Number is Not Available!");
      }
    } else {
      return alert("Enter your Phone Number!");
    }

    if (displayName === "") {
      return alert("Enter your Display Name!");
    }

    if (registerPassword !== confirmRegisterPassword) {
      return alert("Password and Confirm Password should be same !");
    }

    try {
      const phoneProvider = new firebase.auth.PhoneAuthProvider();
      const verificationId = await phoneProvider.verifyPhoneNumber(
        `+974${phone}`,
        recaptchaVerifier.current
      );
      setVerificationId(verificationId);
      alert("Verification code has been sent to your phone.");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
    setRegistered(true);
  };

  // handleRegister will create a the user and create the document for the user in the
  // database with all the needed information
  const handleRegister = async () => {
    try {
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      if (credential !== null) {
        try {
          // waiting for the user to be created in the authentication
          await firebase
            .auth()
            .createUserWithEmailAndPassword(registerEmail, registerPassword);

          // initiating user info in firebase funcations to add a display image and display name
          const response = await fetch(
            `https://us-central1-capstone2020-b64fd.cloudfunctions.net/initUser?uid=${
              firebase.auth().currentUser.uid
            }&phoneNumber=${phone}&displayName=${displayName}`
          );

          //sending the user a verification email
          await firebase
            .auth()
            .currentUser.sendEmailVerification()
            .then(() => {
              console.log("Email Sent!");
            })
            .catch((err) => {
              console.log(err);
            });

          // calling createUserInfo and waiting for it before moving the user to login page
          await createUserInfo();
        } catch (error) {
          alert(error.message);
        }
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
    // trying creating user and if there is any error it will alert it for example:
    // email is not corrent or password is not strong
  };

  // createUserInfo will complete all the data for the user to create a document in the
  // database
  const createUserInfo = async () => {
    // creating user document in the database with all the information
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .set({
        outstandingBalance: 0,
        balance: 0,
        email: registerEmail,
        role: "user",
        qrCode: "",
        name: displayName,
        phone: `+974${phone}`,
        loyaltyCode: "",
        subscription: {
          name: null,
          startDate: null,
          endDate: null,
          point: null,
        },
        location: null,
        privacy: {
          emailP: false,
          nameP: false,
          locationP: false,
          carsP: false,
        },
        favorite: [],
        reputation: 0,
        points: 0,
      });
  };

  const handleLogin = async () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(loginEmail, loginPassword)
      .then(() => {
        console.log("successful login!");
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const handleSubmit = async () => {
    firebase
      .auth()
      .sendPasswordResetEmail(forgotPassEmail)
      .then(() => {
        alert("Email Sent");
      })
      .catch((err) => alert(err.message));
  };

  return view === "Register" ? (
    !registered ? (
      <View style={styles.container}>
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={config}
        />
        <View>
          <TextInput
            onChangeText={setRegisterEmail}
            placeholder="username@email.com"
            value={registerEmail}
          />
        </View>
        <View>
          <TextInput
            onChangeText={setRegisterPassword}
            placeholder="Password"
            secureTextEntry={true}
            value={registerPassword}
          />
        </View>
        <View>
          <TextInput
            onChangeText={setConfirmRegisterPassword}
            placeholder="Confirm Password"
            secureTextEntry={true}
            value={confirmRegisterPassword}
          />
        </View>
        <View>
          <TextInput
            onChangeText={setDisplayName}
            placeholder="Display Name"
            value={displayName}
          />
        </View>
        <View>
          <TextInput
            onChangeText={setPhone}
            keyboardType="number-pad"
            placeholder="Phone No."
            value={phone}
          />
          {/* <TextInput
            onChangeText={setReferral}
            selectionColor={"blue"}
            placeholder="Referral Code"
            value={referral}
          /> */}
          {/* <TouchableOpacity
            style={{ flexDirection: "row", padding: 13 }}
            onPress={checkReferral}
          >
            <Text>Use Code</Text>
          </TouchableOpacity> */}
        </View>
        <TouchableOpacity onPress={handleSendVerificationCode}>
          <Text>Sign Up!</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setView("Login")}>
          <Text>Already Have Account?</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <View>
        <Text style={{ marginTop: 20 }}>Enter Verification code</Text>
        <TextInput
          style={{ marginVertical: 10, fontSize: 17 }}
          editable={!!verificationId}
          placeholder="123456"
          keyboardType="number-pad"
          onChangeText={setVerificationCode}
        />
        <Button
          title="Confirm Verification Code"
          disabled={!verificationId}
          onPress={handleRegister}
        />
      </View>
    )
  ) : view === "Login" ? (
    <View style={styles.container}>
      <View>
        <TextInput
          onChangeText={setLoginEmail}
          placeholder="username@email.com"
          value={loginEmail}
        />
      </View>
      <View>
        <TextInput
          onChangeText={setLoginPassword}
          placeholder="Password"
          secureTextEntry={true}
          value={loginPassword}
        />
        <TouchableOpacity onPress={() => setView("ForgotPass")}>
          <Text>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => handleLogin()}>
        <Text>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setView("Register")}>
        <Text>Create New Account</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View>
      <Text>Forgot Password</Text>
      <TextInput
        placeholder="Email"
        value={forgotPassEmail}
        onChangeText={setForgotPassEmail}
      />
      <TouchableOpacity onPress={handleSubmit}>
        <Text>Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setView("Login")}>
        <Text>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    paddingHorizontal: 20,
  },
});
