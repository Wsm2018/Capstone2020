import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  ScrollView,
  Image,
} from "react-native";
import LottieView from "lottie-react-native";

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
  useEffect(() => {}, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LottieView
          source={require("../../assets/images/done.json")}
          autoPlay
          loop
          style={{
            position: "relative",
            width: "30%",
            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center",
            alignContent: "center",
            alignSelf: "center",
          }}
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{email}</Text>
        <Text style={styles.subtitle}>
          Employee Handler Account Successfully Created
        </Text>

        <TouchableOpacity style={styles.payButton} onPress={handleDownload}>
          <Text style={{ color: "white" }}>Download PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
EmployeeHandlerCreate.navigationOptions = (props) => ({
  title: "Employee Create Success",
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "white",
  },
  header: {
    backgroundColor: "white",
    justifyContent: "flex-end",
    alignItems: "center",
    flex: 0.2,
    // marginTop: "5%",
  },
  body: {
    flex: 0.6,
    justifyContent: "flex-start",
    width: "100%",
    marginTop: "3%",
  },
  title: {
    alignSelf: "center",
    fontSize: 20,
    marginBottom: "2%",
  },
  subtitle: { alignSelf: "center", fontSize: 16 },
  payButton: {
    backgroundColor: "#185a9d",
    height: 40,
    width: "55%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "4%",
    borderRadius: 10,
    marginBottom: 10,
  },
});
