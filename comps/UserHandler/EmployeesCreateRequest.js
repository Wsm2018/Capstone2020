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

export default function EmployeesCreateRequest(props) {
  const email = props.navigation.getParam("email");
  const role = props.navigation.getParam("role");

  // ------------------------------------------------------------------
  useEffect(() => {}, []);

  return (
    <View style={styles.container}>
      <Text>EmployeeCreateRequest</Text>
      <Text></Text>
      <Text>
        Request to create {email} as a {role} has been sent.
      </Text>
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
