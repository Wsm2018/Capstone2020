//@refresh reset
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import { FlatGrid } from "react-native-super-grid";
// import LottieView from "lottie-react-native";

// import { Item } from "react-native-paper/lib/typescript/src/components/List/List";

export default function Home(props) {
  const handleLogout = () => {
    firebase.auth().signOut();
  };
  const items = [
    {
      name: "Users",
      code: "#216380",
      nav: () => props.navigation.navigate("Users"),
      image: require("../../assets/images/adminpic/list.jpg"),
      height: 120,
      width: 200,
    },
    {
      name: "Statistics",
      code: "#216380",
      nav: () => props.navigation.navigate("Statistics"),
      image: require("../../assets/images/adminpic/charts.jpg"),
      height: 120,
      width: 200,
    },

    {
      name: "Booking",
      code: "#216380",
      nav: () => props.navigation.navigate("Types"),
      image: require("../../assets/images/adminpic/bookings.jpg"),
      height: 120,
      width: 200,
    },
    {
      name: "Make Admin",
      code: "#216380",
      nav: () => props.navigation.navigate("MakeAdmin"),
      image: require("../../assets/images/adminpic/admin.jpg"),
      height: 120,
      width: 200,
    },

    {
      name: "Promotion",
      code: "#216380",
      nav: () => props.navigation.navigate("Promotion"),
      image: require("../../assets/images/adminpic/promotion.jpg"),
      height: 120,
      width: 200,
    },

    // {
    //   name: "Change Role",
    //   code: "#16a085",
    //   nav: () => handleChangeRole(),
    //   image: require("../../assets/images/chip.png"),
    //   height: 100,
    //   width: 100,
    // },
    // { name: "NEPHRITIS", code: "#27ae60" },
    // { name: "BELIZE HOLE", code: "#2980b9" },
    // { name: "WISTERIA", code: "#8e44ad" },
    // { name: "MIDNIGHT BLUE", code: "#2c3e50" },
    // { name: "SUN FLOWER", code: "#f1c40f" },
    // { name: "CARROT", code: "#e67e22" },
    // { name: "ALIZARIN", code: "#e74c3c" },
    // { name: "CLOUDS", code: "#ecf0f1" },
    // { name: "CONCRETE", code: "#95a5a6" },
    // { name: "ORANGE", code: "#f39c12" },
    // { name: "PUMPKIN", code: "#d35400" },
    // { name: "POMEGRANATE", code: "#c0392b" },
    // { name: "SILVER", code: "#bdc3c7" },
    // { name: "ASBESTOS", code: "#7f8c8d" },
  ];

  const handleChangeRole = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({ activeRole: null });
  };

  return (
    // <View style={styles.container}>
    <View style={styles.container}>
      <View>
        <Text></Text>
      </View>
      <FlatGrid
        itemDimension={150}
        items={items}
        style={styles.gridView}
        renderItem={({ item, index }) => (
          <View style={[styles.itemContainer, { backgroundColor: item.code }]}>
            <TouchableOpacity onPress={item.nav}>
              <View style={{ height: "100%", width: "100%" }}>
                <Image
                  source={item.image}
                  style={{
                    flex: 1,
                    height: undefined,
                    width: undefined,
                  }}
                />

                <View
                  style={{
                    alignItems: "center",
                    flex: 0.2,
                    justifyContent: "center",
                  }}
                >
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
      <View
        style={{
          alignItems: "flex-end",
        }}
      >
        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#216380",
            width: 75,
            height: 75,
            borderRadius: 75,
            borderColor: "#e3e3e3",
            borderWidth: 6,
          }}
          onPress={() => handleChangeRole()}
        >
          <Text style={{ color: "#e3e3e3", fontSize: 18, fontWeight: "bold" }}>
            Roles
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",
  },
  gridView: {
    marginTop: 20,
    flex: 1,
  },
  itemContainer: {
    justifyContent: "flex-end",
    borderRadius: 5,
    height: 150,
  },
  itemName: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  itemCode: {
    fontWeight: "600",
    fontSize: 12,
    color: "#fff",
  },
});
Home.navigationOptions = {
  headerStyle: { backgroundColor: "#20365F" },
  headerTintColor: "white",
};
