import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Button } from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

// <Button title="" onPress={() => props.navigation.navigate("")} />

export default function indexM(props) {
  return (
    <View style={styles.container}>
      <Text>Managers Index</Text>
      <Button
        title="Mangers Request"
        onPress={() => props.navigation.navigate("ManagersRequest")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "space-around",
  },
});
