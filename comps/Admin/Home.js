//@refresh reset
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

export default function Home(props) {
  return (
    <View style={styles.container}>
      <Text>Admin Home</Text>

      <TouchableOpacity onPress={() => props.navigation.navigate("Users")}>
        <Text>Users List</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text>Panel</Text>
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
