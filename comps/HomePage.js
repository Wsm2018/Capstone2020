//@refresh reset
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import { Icon } from "react-native-elements";
import Assets from "./Assets/Assets";


export default function HomePage() {
  const handleLogout = () => {
    firebase.auth().signOut();
  };

  return (
      <Assets />
      //<AddForm />
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

HomePage.navigationOptions = {
  title: null,
  tabBarIcon: () => {
    <Icon name="home" type="font-awesome" size={24} />
  },
};
