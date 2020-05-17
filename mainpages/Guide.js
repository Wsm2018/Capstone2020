//@refresh reset
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import { Icon } from "react-native-elements";
import AdminHome from "../comps/Admin/HomeScreen";

function Guide(props) {
  return (
    <View style={styles.container}>
      <View style={styles.headerView}>
        <View
          style={{
            height: "100%",
            flexDirection: "row",
            // justifyContent: "center",
            // alignItems: "center",
            // width:"80%"
          }}
        >
          <View
            style={{
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              width: "20%",
              //   backgroundColor: "red",
            }}
          >
            {/* for spacing */}
          </View>
          <View
            style={{
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              width: "60%",
              //   backgroundColor: "red",
            }}
          >
            <Text>Guide 1</Text>
          </View>
          <View
            style={{
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              width: "20%",
              //   backgroundColor: "blue",
            }}
          >
            <Text>Skip</Text>
          </View>
        </View>
      </View>
      <View style={styles.bodyView}>
        <View
          style={{
            height: "70%",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
          }}
        >
          <Text>Image</Text>
        </View>
        <View
          style={{
            height: "30%",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
          }}
        >
          <Text>Desc</Text>
        </View>
      </View>
      <View style={styles.footerView}>
        <View
          style={{
            // backgroundColor: "green",
            height: "50%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>. . . .</Text>
        </View>
        <View style={{ height: "50%" }}>
          <TouchableOpacity
            style={{
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "gray",
            }}
          >
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default Guide;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",

    // alignItems: "center",
    // justifyContent: "center",
  },
  headerView: {
    flex: 1,
    // backgroundColor: "red",
    borderWidth: 1,
  },
  bodyView: {
    flex: 6,
    // backgroundColor: "yellow",
    borderWidth: 1,
  },
  footerView: {
    flex: 1,
    // backgroundColor: "red",
    borderWidth: 1,
  },
});
