import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  ScrollView,
} from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";
import db from "../../db";
import { TextInput } from "react-native-paper";
import { Picker } from "react-native";

import * as Linking from "expo-linking";
import * as Print from "expo-print";

export default function EmployeeHandlerCreate(props) {
  const [account, setAccount] = useState(null);
  const email = props.navigation.getParam("email");
  const password = props.navigation.getParam("password");

  const handleDownload = async () => {
    let query = await db.collection("users").where("email", "==", email).get();
    let user = {};
    query.forEach((doc) => (user = { id: doc.id, ...doc.data() }));
    console.log(user);

    const url = await firebase
      .storage()
      .ref()
      .child(`pdf/${user.id}`)
      .getDownloadURL();

    console.log("url", url);

    Linking.openURL(url);
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    handleAccount();
  }, []);

  return (
    <View style={styles.container}>
      <Text>EmployeeHandlerSuccess</Text>
      <Text></Text>
      <Text>Account Successfully Created</Text>
      <Text>{email}</Text>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          width: "100%",
          // height: "10%",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={handleDownload}
      >
        <Text>Download PDF</Text>
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
