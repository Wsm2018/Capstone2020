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
    <View style={styles.container}>
      <View
        style={{ flex: 1, justifyContent: "center", backgroundColor: "white" }}
      >
        <LottieView
          source={require("../../assets/loadingAnimations/890-loading-animation.json")}
          autoPlay
          loop
          style={{
            position: "relative",
            width: "50%",
            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center",
            alignContent: "center",
            alignSelf: "center",
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",
  },
});
