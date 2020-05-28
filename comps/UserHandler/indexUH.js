import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Button } from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

// <Button title="" onPress={() => props.navigation.navigate("")} />

export default function indexUH(props) {
  return (
    <View style={styles.container}>
      <Text>User Handler Index</Text>
      <Button
        title="Employees Index"
        onPress={() => props.navigation.navigate("EmployeesIndex")}
      />
      <Button
        title="Employees Create"
        onPress={() => props.navigation.navigate("EmployeesCreate")}
      />
      <Button
        title="Employees Create Success"
        onPress={() => props.navigation.navigate("EmployeesCreateSuccess")}
      />
      <Button
        title="Users Index"
        onPress={() => props.navigation.navigate("UsersIndex")}
      />
      <Button title="Test" onPress={() => props.navigation.navigate("test")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
  },
});
