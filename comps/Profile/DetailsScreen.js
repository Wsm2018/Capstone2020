import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Header } from "react-navigation-stack";

import { Dimensions } from "react-native";

import BalanceScreen from "./Cards/BalanceScreen";
import { Icon } from "react-native-elements";
import { Card } from "react-native-shadow-cards";
import CarsScreen from "./Cars/CarsScreen";
import {
  FontAwesome5,
  Fontisto,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import db from "../../db";
import firebase from "firebase";
import "firebase/auth";

export default function DetailsScreen(props) {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Header.HEIGHT}
      >
        {/* width={Dimensions.get("window").width / 1.02}
        style={styles.container} */}
        <View style={{ flex: 1 }}>
          <Card
            elevation={2}
            style={{
              width: "100%",
              flex: 1,
              borderWidth: 1,
              borderTopWidth: 0,
              borderColor: "darkgray",
            }}
          >
            <BalanceScreen navigation={props.navigation} />
          </Card>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f0f0",
  },
});
