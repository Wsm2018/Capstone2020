import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Button } from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

// <Button title="" onPress={() => props.navigation.navigate("")} />

export default function ManagersHome(props) {
  const handleChangeRole = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({ activeRole: null });
  };

  return (
    <View style={styles.container}>
      <Text>Managers Index</Text>
      <Button
        title="Mangers Request"
        onPress={() => props.navigation.navigate("ManagersRequest")}
      />
      <Button title="Change Role" onPress={handleChangeRole} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "space-around",
  },
});
