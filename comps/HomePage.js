//@refresh reset
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import Home from "../mainpages/Admin/Home";

export default function HomePage() {
  const handleLogout = () => {
    firebase.auth().signOut();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          handleLogout();
        }}
      >
        <Text>Logout !</Text>
      </TouchableOpacity>

      <Home />
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
