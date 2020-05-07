import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../db";

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

  // handleRegister will create a the user and create the document for the user in the
  // database with all the needed information
  const handleRegister = async () => {
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

    // trying creating user and if there is any error it will alert it for example:
    // email is not corrent or password is not strong
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

      //sending the user an email verification
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
  };

  // createUserInfo will complete all the data for the user to create a document in the
  // database
  const createUserInfo = async () => {
    // generating a random 6 digit referralCode
    let referralCode = Math.floor(Math.random() * 1000000) + "";

    if (referralCode.length === 1) {
      referralCode = "00000" + referralCode;
    } else if (referralCode.length === 2) {
      referralCode = "0000" + referralCode;
    } else if (referralCode.length === 3) {
      referralCode = "000" + referralCode;
    } else if (referralCode.length === 4) {
      referralCode = "00" + referralCode;
    } else if (referralCode.length === 5) {
      referralCode = "0" + referralCode;
    }

    const users = db.collection("users");
    // checking if any other user has the generated referralCode and waiting because its
    // checking all the users document
    let result = await users.where("referralCode", "==", referralCode).get();
    // while there is any user with that referralCode it will generate a new code and try
    // again till it returns 0 documents
    while (result.size > 0) {
      referralCode = Math.floor(Math.random() * 1000000) + "";
      if (referralCode.length === 1) {
        referralCode = "00000" + referralCode;
      } else if (referralCode.length === 2) {
        referralCode = "0000" + referralCode;
      } else if (referralCode.length === 3) {
        referralCode = "000" + referralCode;
      } else if (referralCode.length === 4) {
        referralCode = "00" + referralCode;
      } else if (referralCode.length === 5) {
        referralCode = "0" + referralCode;
      }
      result = await users.where("referralCode", "==", referralCode).get();
    }
    // const name = email.split("@");

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
        referralCode,
        loyaltyCode: "",
        subscription: {
          name: null,
          startDate: null,
          endDate: null,
          point: null,
        },
        // checking if the user used referral code and giving him a token if he did
        tokens: referralStatus === true ? 1 : 0,
        location: null,
        privacy: {
          emailP: false,
          nameP: false,
          locationP: false,
          carsP: false,
        },
        friends: [],
        favorite: [],
        reputation: 0,
        points: 0,
      });

    // if the user used a referral code it will add document inside the referrer
    // subcollection and it will have the new user referral code and the status as false
    // the status will show if the user used the token or not
    if (referralStatus === true) {
      const referralDoc = await users
        .where("referralCode", "==", referral)
        .get();
      referralDoc.forEach((doc) => {
        db.collection("users").doc(doc.id).collection("referrer").doc().set({
          referrerCode: referralCode,
          status: false,
        });
      });
    }
  };

  const handleLogin = async () => {
    await firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword);
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
    <View style={styles.container}>
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
      </View>
      <TouchableOpacity onPress={handleRegister}>
        <Text>Sign Up!</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setView("Login")}>
        <Text>Already Have Account?</Text>
      </TouchableOpacity>
    </View>
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
