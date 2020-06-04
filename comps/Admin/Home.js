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
      name: "Promote Users",
      code: "#1abc9c",
      nav: () => props.navigation.navigate("MakeAdmin"),
      image: require("../../assets/images/bookit.png"),
      height: 50,
      width: 150,
    },
    {
      name: "EMERALD",
      code: "#2ecc71",
      nav: () => props.navigation.navigate("MakeAdmin"),
      image: require("../../assets/images/chip.png"),
      height: 100,
      width: 100,
    },
    { name: "PETER RIVER", code: "#3498db" },
    { name: "AMETHYST", code: "#9b59b6" },
    { name: "WET ASPHALT", code: "#34495e" },
    { name: "GREEN SEA", code: "#16a085" },
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
    <FlatGrid
      itemDimension={150}
      items={items}
      style={styles.gridView}
      // staticDimension={300}
      // fixed
      // spacing={20}
      renderItem={({ item, index }) => (
        <View style={[styles.itemContainer, { backgroundColor: item.code }]}>
          <TouchableOpacity onPress={item.nav}>
            <View style={{ alignItems: "center" }}>
              <Image
                // width={Dimensions.get("window").width / 1.3}
                source={item.image}
                // autoPlay
                // loop
                style={{
                  height: item.height,
                  // width: 180,
                  width: item.width,
                  // alignItems: "center",
                  // position: "relative",
                }}
              />
              <Text style={styles.itemName}>{item.name}</Text>
            </View>

            {/* <Text style={styles.itemCode}>{item.code}</Text> */}
          </TouchableOpacity>
        </View>
      )}
    />

    /* <View
        width={Dimensions.get("window").width}
        style={{
          flex: 0.2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>Admin Home</Text>
      </View> */
    /* <View
        width={Dimensions.get("window").width}
        style={{
          flex: 0.5,
          // flexDirection: "row",
          // flexWrap: "wrap",
          // backgroundColor: "gray",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TouchableOpacity
          width={Dimensions.get("window").width / 2}
          style={{
            // flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "red",

            // justifyContent: "flex-end",
            borderRadius: 5,
            padding: 10,
            height: 100,
          }}
          onPress={() => handleChangeRole()}
        >
          <Text>Change Role</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flex: 0.5,
          flexDirection: "row",
          justifyContent: "space-around",
        }}
      >
        <View
          width={Dimensions.get("window").width / 2}
          style={
            {
              // justifyContent: "center",
              // alignItems: "stretch",
              // backgroundColor: "blue",
            }
          }
        > */
    /* <TouchableOpacity
            // width={Dimensions.get("window").width / 2}
            style={{
              // flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "red",

              // justifyContent: "flex-end",
              borderRadius: 5,
              padding: "10%",
              height: "80%",
            }}
            onPress={() => props.navigation.navigate("Users")}
          >
            <Text>Users List</Text>
          </TouchableOpacity>
        </View>

        <View
          width={Dimensions.get("window").width / 2}
          style={
            {
              // justifyContent: "center",
              // alignItems: "stretch",
              // backgroundColor: "green",
            }
          }
        >
          <TouchableOpacity
            // width={Dimensions.get("window").width / 2}
            style={{
              // flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "green",

              // justifyContent: "flex-end",
              borderRadius: 5,
              padding: "10%",
              height: "80%",
            }}
            onPress={() => props.navigation.navigate("Statistics")}
          >
            <Text>Statistics</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          flex: 0.5,
          flexDirection: "row",
          // flexWrap: "wrap",
          justifyContent: "space-evenly",
        }}
      >
        <View
          width={Dimensions.get("window").width / 2}
          style={
            {
              // justifyContent: "center",
              // alignItems: "stretch",
              // backgroundColor: "blue",
            }
          }
        >
          <TouchableOpacity
            // width={Dimensions.get("window").width / 2}
            style={{
              // flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "yellow",

              // justifyContent: "flex-end",
              borderRadius: 5,
              padding: "10%",
              height: "80%",
            }}
            onPress={() => props.navigation.navigate("Promotion")}
          >
            <Text>Promotion Code</Text>
          </TouchableOpacity>
        </View>
        <View
          width={Dimensions.get("window").width / 2}
          style={
            {
              // justifyContent: "center",
              // alignItems: "stretch",
              // backgroundColor: "blue",
            }
          }
        >
          <TouchableOpacity
            // width={Dimensions.get("window").width / 2}
            style={{
              // flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "lightblue",

              // justifyContent: "flex-end",
              borderRadius: 5,
              padding: "10%",
              height: "80%",
            }}
            onPress={() => handleLogout()}
          >
            <Text>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          flex: 0.5,
          flexDirection: "row",
          // flexWrap: "wrap",
          justifyContent: "space-evenly",
        }}
      >
        <View
          width={Dimensions.get("window").width / 2}
          style={
            {
              // justifyContent: "center",
              // alignItems: "stretch",
              // backgroundColor: "blue",
            }
          }
        >
          <TouchableOpacity
            // width={Dimensions.get("window").width / 2}
            style={{
              // flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "pink",

              // justifyContent: "flex-end",
              borderRadius: 5,
              padding: "10%",
              height: "80%",
            }}
            onPress={() => props.navigation.navigate("MakeAdmin")}
          >
            <Text>Make Admin</Text>
          </TouchableOpacity>
        </View>
        <View
          width={Dimensions.get("window").width / 2}
          style={
            {
              // justifyContent: "",
              // alignItems: "stretch",
              // backgroundColor: "blue",
            }
          }
        >
          <TouchableOpacity
            // width={Dimensions.get("window").width / 2}
            style={{
              // flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "gold",

              // justifyContent: "flex-end",
              borderRadius: 5,
              padding: "10%",
              height: "80%",
            }}
            onPress={() => props.navigation.navigate("Types")}
          >
            <Text>Booking</Text>
          </TouchableOpacity>
        </View>
      </View> */
    /* </View> */
  );
}

// const styles = StyleSheet.create({
//   container: {
//     // flex: 1,
//     // flexDirection: "row",
//     // flexWrap: "wrap",
//     // backgroundColor: "#fff",
//     // alignItems: "center",
//     // justifyContent: "space-evenly",
//   },
// });

const styles = StyleSheet.create({
  gridView: {
    marginTop: 20,
    flex: 1,
  },
  itemContainer: {
    // width: "100%",
    justifyContent: "flex-end",
    borderRadius: 5,
    padding: 10,
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
