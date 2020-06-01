//@refresh reset
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import { Icon } from "react-native-elements";
import AdminHome from "../comps/Admin/HomeScreen";

export default function HomePage(props) {
  const handleLogout = () => {
    firebase.auth().signOut();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          handleLogout();
        }}
      >
        <Text>Logout !</Text>

      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>props.navigation.navigate("CheckOut")}
      >
        <Text>Checkout</Text>
        
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

HomePage.navigationOptions = {
  header: null,
};
