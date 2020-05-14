//@refresh reset
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import { Icon } from "react-native-elements";

export default function Settings() {
  const handleLogout = () => {
    firebase.auth().signOut();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
      // onPress={() => {
      //   handleLogout();
      // }}
      >
        <Text>Settings !</Text>
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
  },
});

Settings.navigationOptions = {
  title: "Settings",
  tabBarIcon: () => {
    <Icon name="home" type="font-awesome" size={24} />;
  },
};
