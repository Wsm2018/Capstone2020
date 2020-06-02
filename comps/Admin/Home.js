//@refresh reset
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

export default function Home(props) {
  const handleLogout = () => {
    firebase.auth().signOut();
  };

  const handleChangeRole = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({ activeRole: null });
  };

  return (
    <View style={styles.container}>
      <Text>Admin Home</Text>

      <TouchableOpacity onPress={() => props.navigation.navigate("Users")}>
        <Text>Users List</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => props.navigation.navigate("Statistiscs")}
      >
        <Text>Statistics</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleLogout()}>
        <Text>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => props.navigation.navigate("MakeAdmin")}>
        <Text>Make Admin</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => props.navigation.navigate("Types")}>
        <Text>Booking</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleChangeRole()}>
        <Text>Change Role</Text>
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
