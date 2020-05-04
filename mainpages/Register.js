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

export default function Register(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  // the referral code that is entered
  const [referral, setReferral] = useState("");
  // the referralStatus will show if a referral code is used
  const [referralStatus, setReferralStatus] = useState(false);
  // the register button status for validation
  const [btnStatus, setBtnStatus] = useState(true);

  // it check if the email and password is not empty to enable the register button
  // and it will keep checking whenever the user edits on the email or password fields
  useEffect(() => {
    if (email !== "" && password !== "") {
      setBtnStatus(false);
    } else {
      setBtnStatus(true);
    }
  }, [email, password]);

  // checkReferral will check if the referral exists and the code is available
  const checkReferral = async () => {
    // checking if the referral code is not empty
    if (referral !== "") {
      // checking if referral code is 6 digits
      if (referral.length === 6) {
        // defining the users collection from firestore
        const users = db.collection("users");
        // getting the referral document if the referralCode is equal to the provided code
        // and using await because it will check all the documents
        let result = await users.where("referralCode", "==", referral).get();
        // it will check if there is only one document in the returned and
        // the referral doc exists
        if (result.size === 1) {
          alert("Referral Code Added!");
          setReferralStatus(true);
        } else {
          alert("Referral Code is Wrong!");
          setReferral("");
        }
      } else {
        alert("Referral Code is Not Available!");
      }
    } else {
      alert("Enter a Code First!");
    }
  };

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

    // trying creating user and if there is any error it will alert it for example:
    // email is not corrent or password is not strong
    try {
      // waiting for the user to be created in the authentication
      await firebase.auth().createUserWithEmailAndPassword(email, password);

      // initiating user info in firebase funcations to add a display image and display name
      const response = await fetch(
        `https://us-central1-capstone2020-b64fd.cloudfunctions.net/initUser?uid=${
          firebase.auth().currentUser.uid
        }&phoneNumber=${phone}`
      );

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

    const users = db.collection("users");
    // checking if any other user has the generated referralCode and waiting because its
    // checking all the users document
    let result = await users.where("referralCode", "==", referralCode).get();
    // while there is any user with that referralCode it will generate a new code and try
    // again till it returns 0 documents
    while (result.size > 0) {
      referralCode = Math.floor(Math.random() * 1000000) + "";
      result = await users.where("referralCode", "==", referralCode).get();
    }
    const name = email.split("@");

    // creating user document in the database with all the information
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .set({
        outstandingBalance: 0,
        balance: 0,
        email,
        role: "user",
        qrCode: "",
        name: name[0],
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

  return (
    <View>
      <View>
        <TextInput
          onChangeText={setEmail}
          placeholder="username@email.com"
          value={email}
        />
      </View>
      <View>
        <TextInput
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry={true}
          value={password}
        />
      </View>
      <View>
        <TextInput
          onChangeText={setPhone}
          placeholder="Phone No."
          value={phone}
        />
        <TextInput
          onChangeText={setReferral}
          selectionColor={"blue"}
          placeholder="Referral Code"
          value={referral}
        />
        <TouchableOpacity
          style={{ flexDirection: "row", padding: 13 }}
          onPress={checkReferral}
        >
          <Text>Use Code</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleRegister}>
        <Text>Sign Up!</Text>
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
