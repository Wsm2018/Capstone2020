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
      <View
        style={{
          flex: 0.5,
          alignItems: "center",
        }}
      >
        <Text>Admin Home</Text>
      </View>
      <View
        style={{
          flex: 0.5,
          flexDirection: "row",
          // flexWrap: "wrap",
          justifyContent: "space-evenly",
        }}
      >
        <TouchableOpacity onPress={() => props.navigation.navigate("Users")}>
          <Text>Users List</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => props.navigation.navigate("Statistics")}
        >
          <Text>Statistics</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flex: 0.5,
          flexDirection: "row",
          // flexWrap: "wrap",
          justifyContent: "space-evenly",
        }}
      >
        <TouchableOpacity
          onPress={() => props.navigation.navigate("Promotion")}
        >
          <Text>Promotion Code</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleLogout()}>
          <Text>Logout</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flex: 0.5,
          flexDirection: "row",
          // flexWrap: "wrap",
          justifyContent: "space-evenly",
        }}
      >
        <TouchableOpacity
          onPress={() => props.navigation.navigate("MakeAdmin")}
        >
          <Text>Make Admin</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => props.navigation.navigate("Types")}>
          <Text>Booking</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flex: 0.5,
          flexDirection: "row",
          // flexWrap: "wrap",
          justifyContent: "space-evenly",
        }}
      >
        <TouchableOpacity onPress={() => handleChangeRole()}>
          <Text>Change Role</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // flexDirection: "row",
    // flexWrap: "wrap",
    backgroundColor: "#fff",
    // alignItems: "center",
    justifyContent: "space-evenly",
  },
});
