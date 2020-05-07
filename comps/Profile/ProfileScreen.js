import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import firebase from "firebase";
import db from "../../db";

export default function ProfileScreen(props) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile Screen {firebase.auth().currentUser.displayName}</Text>
    </View>
  );
}
