import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  TouchableOpacity,
  FlatList,
} from "react-native";
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
    <View style={styles.container}>
      <View style={{ flex: 2 }}>
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

      {/* <Card
        elevation={2}
        style={{
          marginTop: "5%",
          width: "100%",
          borderWidth: 1,
          borderColor: "darkgray",
          flex: 0.8,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <FontAwesome5
            name="heart"
            size={35}
            color="black"
            onPress={() =>
              props.navigation.navigate("Car", { user: props.user })
            }
          />
          <TouchableOpacity onPress={() => setCarsModal(true)}>
            <Image
              source={require("../../assets/images/caricon4.png")}
              style={{ height: 38, width: 85 }}
            />
          </TouchableOpacity>
          <Image
            source={require("../../assets/images/bookingicon.png")}
            style={{ height: 48, width: 48 }}
            onPress={() =>
              props.navigation.navigate("Car", { user: props.user })
            }
          />
        </View>
      </Card>
      <CarsScreen
        carsModal={carsModal}
        setCarsModal={setCarsModal}
        navigation={props.navigation}
      /> */}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f0f0",
  },
});
