import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Button } from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

// <Button title="" onPress={() => props.navigation.navigate("")} />

export default function indexUH(props) {
  const handleChangeRole = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({ activeRole: null });
  };

  return (
    <View style={styles.container}>
      <Text>User Handler Index</Text>
      <Button
        title="Employees Index"
        onPress={() => props.navigation.navigate("EmployeesIndex")}
      />
      <Button
        title="Employees Allowed"
        onPress={() => props.navigation.navigate("EmployeesAllowed")}
      />
      <Button
        title="Employees Pending"
        onPress={() => props.navigation.navigate("EmployeesPending")}
      />
      <Button
        title="Employees Create"
        onPress={() => props.navigation.navigate("EmployeesCreate")}
      />
      <Button
        title="Employees Create Success"
        onPress={() => props.navigation.navigate("EmployeesCreateSuccess")}
      />

      <Text>------------------------------------------------</Text>
      <Button
        title="Customers Index"
        onPress={() => props.navigation.navigate("CustomersIndex")}
      />

      <Text>------------------------------------------------</Text>
      <Button title="Test" onPress={() => props.navigation.navigate("test")} />

      <Button title="Change Role" onPress={handleChangeRole} />

      <Button
        title="Sign Out"
        onPress={() => {
          firebase.auth().signOut();
          console.log(firebase.auth().currentUser.uid);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
  },
});
