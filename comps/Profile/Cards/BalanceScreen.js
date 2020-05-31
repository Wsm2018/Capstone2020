import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Image from "react-native-scalable-image";

import GradientButton from "react-native-gradient-buttons";
import { Text } from "react-native-elements";

import db from "../../../db";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import { Dimensions } from "react-native";

import { isMoment } from "moment";

export default function BalanceScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [codeView, setCodeView] = useState(false);

  const getUser = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((querySnap) => {
        setUser({ id: querySnap.id, ...querySnap.data() });
      });
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 1,
          justifyContent: "space-evenly",
          alignItems: "center",
          // backgroundColor: "blue",
          // marginTop: "-5%",
        }}
      >
        <View style={{ flex: 0.5 }}>
          <Text style={{ fontSize: 25, fontWeight: "bold", color: "#0D2C6A" }}>
            Current Balance
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              // backgroundColor: "green",

              // borderBottomWidth: 2,
            }}
          >
            {/* <Image
              source={require("../../../assets/images/cash2.png")}
              style={{ height: 40, width: 40 }}
              onPress={() =>
                props.navigation.navigate("Balance", { user: props.user })
              }
            /> */}
            <Text style={{ fontSize: 22, fontWeight: "bold", marginEnd: 5 }}>
              {user && user.balance}
            </Text>
            <Text style={{ fontSize: 22, fontWeight: "bold" }}>QR</Text>
          </View>
        </View>

        {/* <View
          style={{
            flexDirection: "row",
            width: "100%",
            backgroundColor: "red",

            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flex: 2,
              // backgroundColor: "red",
              // height: 50,
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          > */}
        {/* ------------------------the gift code input and button---------------------------- */}
        {!codeView ? (
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              // backgroundColor: "red",

              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flex: 2,
                // backgroundColor: "red",
                // height: 50,
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flex: 1,
                  // backgroundColor: "red",
                  // height: 50,
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={{ alignItems: "center" }}
                  onPress={() => navigation.navigate("Cards", { user: user })}
                >
                  {/* <Image
                    width={Dimensions.get("window").width / 4}
                    source={require("../../../assets/images/listcard22.png")}
                    //style={{ height: 68, width: 68 }}
                  /> */}
                  <Text
                    style={{
                      // marginTop: -15,
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#20365F",
                    }}
                  >
                    Show My Cards
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ alignItems: "center" }}
                  onPress={() => setCodeView(true)}
                >
                  {/* <Image
                    width={Dimensions.get("window").width / 5}
                    source={require("../../../assets/images/giftbox2.png")}
                    //style={{ height: 68, width: 68 }}
                  /> */}
                  <Text
                    style={{
                      // marginTop: -15,
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#20365F",
                    }}
                  >
                    Use Gift Code
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View
            width={Dimensions.get("window").width / 2}
            style={{
              flex: 1,
              // backgroundColor: "yellow",
              // flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >
            <View
              style={{
                // backgroundColor: "green",
                // alignItems: "center",

                // flexDirection: "row",
                // paddingLeft: 6,
                // width: "60%",
                borderColor: "black",
                borderWidth: 1,
                borderRadius: 10,
                // marginBottom: 10,
              }}
            >
              {/* <MaterialCommunityIcons name="email" size={20} color="gray" /> */}
              <TextInput
                width={Dimensions.get("window").width / 2}
                style={{ height: 40, paddingLeft: 6 }}
                placeholder="Enter the code"
                // value={"email"}
                onChangeText={"setEmail"}
              />
            </View>
            <View
              // width={Dimensions.get("window").width}
              style={{
                flex: 0.5,
                // backgroundColor: "red",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                // width={Dimensions.get("window").width}
                style={{
                  // flex: 0.2,
                  // backgroundColor: "red",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  // paddingLeft: 6,
                  // width: "50%",
                  // borderBottomColor: "black",
                  // borderBottomWidth: 1,
                  // borderRadius: 10,
                  // marginBottom: 10,
                }}
                onPress={() => setCodeView(false)}
              >
                <Text style={{ fontSize: 15 }}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  // flex: 0.2,
                  // backgroundColor: "red",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  // paddingLeft: 6,
                  // width: "50%",
                  // borderBottomColor: "black",
                  // borderBottomWidth: 1,
                  // borderRadius: 10,
                  // marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 15 }}>Use Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ------------------------the gift code input ---------------------------- */}
      </View>
      {/* */}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "yellow",
    // justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#f5f0f0",
  },
});
