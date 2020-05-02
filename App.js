//@refresh reset
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Register from "./mainpages/Register";
import Login from "./mainpages/Login";
import ForgotPass from "./mainpages/ForgotPass"
console.disableYellowBox = true;
import firebase from "firebase/app";
import "firebase/auth";

import HomePage from "./comps/HomePage";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    return firebase.auth().onAuthStateChanged(setLoggedIn);
  }, []);

  const handleLogout = () => {
    firebase.auth().signOut();
  };

  return (
    <View style={styles.container}>
      {!loggedIn ? (
        <View style={styles.container}>
          <Register />
          <Login />
          <ForgotPass />
        </View>
      ) : (
        <View style={styles.container}>
          <HomePage />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
