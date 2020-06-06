import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  TextInput,
  ScrollView,
} from "react-native";
import LottieView from "lottie-react-native";

export default function Loading(props) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "column",
      }}
    >
      <LottieView
        source={require("../../assets/17723-waitting.json")}
        autoPlay
        loop
        style={{
          position: "relative",
          width: "100%",
          justifyContent: "center",
          alignSelf: "center",
          paddingTop: "30%",
        }}
      />
      <Text style={{ color: "grey", fontSize: 20 }}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
