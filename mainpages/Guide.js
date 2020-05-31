//@refresh reset
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import { Icon } from "react-native-elements";
import AdminHome from "../comps/Admin/HomeScreen";
import LottieView from "lottie-react-native";

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
              justifyContent: "flex-end",
              alignItems: "center",
              width: "60%",
              // backgroundColor: "red",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
              Book a Parking
            </Text>
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
            <Text onPress={() => props.guideSkip()}>Skip</Text>
          </View>
        </View>
      </View>
      <View style={styles.bodyView}>
        <View
          style={{
            marginLeft: "10%",
            height: "70%",
            justifyContent: "center",
            alignItems: "center",
            // alignSelf: "center",
            alignContent: "center",
            // borderWidth: 1,
            // backgroundColor: "#CCDBEA",
          }}
        >
          <Image
            style={{
              width: "100%",
              height: "80%",
              // backgroundColor: "#CCDBEA",
            }}
            source={require("../assets/trialimages/parking4.png")}
          />
        </View>
        <View
          style={{
            height: "30%",
            justifyContent: "flex-start",
            alignItems: "center",
            //borderWidth: 1,
          }}
        >
          <Text
            style={{
              justifyContent: "center",
              alignItems: "center",
              alignContent: "center",
              width: "85%",
              color: "gray",
            }}
          >
            Book Prepay for your spot and get a parking pass instantly via text,
            email, or the app Book Prepay for your spot and get a parking pass
            instantly via text
          </Text>
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
              backgroundColor: "#3574E1",
            }}
          >
            <Text style={{ color: "white" }}>Next</Text>
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
    backgroundColor: "#ffffff",

    // alignItems: "center",
    // justifyContent: "center",
  },
  headerView: {
    flex: 1,
    //backgroundColor: "#CCDBEA",
    //borderWidth: 1,
  },
  bodyView: {
    flex: 6,
    //backgroundColor: "#CCDBEA",
    //borderWidth: 1,
  },
  footerView: {
    flex: 1,
    //backgroundColor: "red",
    //borderWidth: 1,
  },
});
