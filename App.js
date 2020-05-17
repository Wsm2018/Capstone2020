//@refresh reset
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Authentication from "./mainpages/Authentication";
import Assets from "./comps/Assets/Assets";

console.disableYellowBox = true;
import firebase from "firebase/app";
import "firebase/auth";

import { createAppContainer } from "react-navigation";
import { createBottomTabNavigator } from "react-navigation-tabs";
import HomeStack from "./navigation/HomeStack";




const TabNavigator = createBottomTabNavigator({
  Home: HomeStack,
});

const AppContainer = createAppContainer(TabNavigator);

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    return firebase.auth().onAuthStateChanged(setLoggedIn);
  }, []);

  if (!loggedIn) {
    return (
      <View style={styles.container}>
        
        <Authentication />
      </View>
    );
  } else {
    return <Assets />;
  }

  // return (
  //   // <View style={styles.container}>
  //   //   {!loggedIn ? (

  //   //   ) : (
  //   //     // <View style={styles.container}>
  //   //       <AppContainer />
  //   //       {/* <HomePage /> */}
  //   //     // </View>
  //   //   )}
  //   // </View>
  // );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});