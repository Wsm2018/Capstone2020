import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  // Image,
} from "react-native";
import Image from "react-native-scalable-image";

import GradientButton from "react-native-gradient-buttons";
import { Text } from "react-native-elements";
import db from "../../../db";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import { Dimensions } from "react-native";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
} from "react-native-responsive-dimensions";

export default function BalanceScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [codeView, setCodeView] = useState(false);
  const [giftCode, setGiftCode] = useState("");
  const [giftCodeError, setGiftCodeError] = useState("#C7C7CD");
  const [giftErrorCounter, setGiftErrorCounter] = useState(0);
  // const [flag, setFlag] = useState(false);

  useEffect(() => {
    if (giftCode !== "") {
      setGiftCodeError("transparent");
      // setFlag(false);
    }

    //   // } else if (!flag) {
    //   //   setGiftCodeError("transparent");
    //   // }
  }, [giftCode]);

  const getUser = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((querySnap) => {
        setUser({ id: querySnap.id, ...querySnap.data() });
      });
  };

  const handleGiftCode = async () => {
    // if (giftCode === "") {
    //   setFlag(true);
    //   return;
    // }
    if (giftErrorCounter !== 3) {
      if (giftCode.length !== 8) {
        setGiftCodeError("red");
        setGiftCode("");
      } else {
        const result = await db
          .collectionGroup("gifts")
          .where("expiryDate", ">", new Date())
          .where("code", "==", giftCode)
          .where("status", "==", false)
          .get();
        if (result.size === 1) {
          result.forEach(async (doc) => {
            const response = await fetch(
              `https://us-central1-capstone2020-b64fd.cloudfunctions.net/redeemGiftCode?uid=${
                firebase.auth().currentUser.uid
              }&path=${doc.ref.path}`
            );
            const resultStatus = await response.json();
            if (resultStatus === "true") {
              setGiftCodeError("green");
              setGiftCode("");
            } else {
              setGiftCodeError("red");
              setGiftCode("");
              setGiftErrorCounter(giftErrorCounter + 1);
            }
          });
        } else {
          setGiftCodeError("red");
          setGiftCode("");
          setGiftErrorCounter(giftErrorCounter + 1);
        }
      }
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 1,
          justifyContent: "space-around",
          alignItems: "center",
          // backgroundColor: "blue",
          // marginTop: "5%",
        }}
      >
        <View style={{ flex: 0.4 }}>
          <Text
            style={{
              fontSize: responsiveScreenFontSize(2.8),
              fontWeight: "bold",
              color: "#185a9d",
            }}
          >
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
            <Text
              style={{
                fontSize: responsiveScreenFontSize(2.5),
                fontWeight: "bold",
                marginEnd: 5,
              }}
            >
              {user && user.balance}
            </Text>
            <Text
              style={{
                fontSize: responsiveScreenFontSize(2.5),
                fontWeight: "bold",
              }}
            >
              QR
            </Text>
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
                  justifyContent: "center",
                  // alignItems: "flex-start",
                }}
              >
                <TouchableOpacity
                  style={{
                    flex: 0.3,
                    backgroundColor: "#2E9E9B",
                    // borderWidth: 4,
                    height: responsiveScreenHeight(5.5),
                    // width: "30%",
                    // alignSelf: "center",
                    justifyContent: "center",
                    alignItems: "center",
                    //marginStart: "2%",
                    marginEnd: "3%",
                    borderRadius: 10,
                    //marginBottom: 10,
                  }}
                  onPress={() => navigation.navigate("Cards", { user: user })}
                >
                  {/* <Image
                    width={Dimensions.get("window").width / 4}
                    source={require("../../../assets/images/listcard22.png")}
                    //style={{ height: 68, width: 68 }}
                  /> */}
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: responsiveScreenFontSize(2),
                      color: "white",
                      // fontWeight: "bold",
                    }}
                  >
                    My Cards
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 0.3,

                    backgroundColor: "#2E9E9B",
                    height: responsiveScreenHeight(5.5),
                    // width: "30%",
                    // borderWidth: 4,
                    // alignSelf: "center",
                    justifyContent: "center",
                    alignItems: "center",
                    marginStart: "3%",
                    //marginEnd: "2%",
                    borderRadius: 10,
                    //marginBottom: 10,
                  }}
                  // style={{ alignItems: "center" }}
                  onPress={() => setCodeView(true)}
                >
                  {/* <Image
                    width={Dimensions.get("window").width / 5}
                    source={require("../../../assets/images/giftbox2.png")}
                    //style={{ height: 68, width: 68 }}
                  /> */}
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: responsiveScreenFontSize(2),
                      color: "white",
                      // fontWeight: "bold",
                    }}
                    // style={{
                    //   // marginTop: -15,
                    //   textAlign: "center",
                    //   fontSize: 16,
                    //   fontWeight: "bold",
                    //   color: "#20365F",
                    // }}
                  >
                    Use Gift
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View
            width={Dimensions.get("window").width / 1.6}
            style={{
              flex: 0.6,
              // backgroundColor: "yellow",
              // flexDirection: "row",
              // paddingTop: 10,
              // justifyContent: "space-evenly",
            }}
          >
            <View style={{ flex: 0.4 }}>
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
                  style={{
                    height: responsiveScreenHeight(5),
                    paddingLeft: 6,
                    fontSize: responsiveScreenFontSize(2),
                  }}
                  value={giftCode}
                  placeholder={
                    giftErrorCounter === 3
                      ? "* Try again later"
                      : giftCodeError === "red"
                      ? "* Code Invalid"
                      : giftCodeError === "green"
                      ? "* Balance Added"
                      : "Enter the code"
                  }
                  onChangeText={setGiftCode}
                  placeholderTextColor={giftCodeError}
                  editable={giftErrorCounter === 3 ? false : true}
                />
              </View>
            </View>
            {/* {!flag ? (
              <Text
                style={
                  giftCodeError === "red"
                    ? { color: "red" }
                    : giftCodeError === "green"
                    ? { color: "green" }
                    : giftErrorCounter === 3
                    ? { color: "red" }
                    : null
                }
              >
                {giftErrorCounter === 3
                  ? "* Try again later"
                  : giftCodeError === "red"
                  ? "* Invalid Code"
                  : giftCodeError === "green"
                  ? "* Balance Added"
                  : null}
              </Text>
            ) : (
              <Text style={{ color: "red" }}>* Enter Code</Text>
            )} */}
            <View
              // width={Dimensions.get("window").width}
              style={{
                flex: 0.4,
                flexDirection: "row",
                // width: "100%",
                // backgroundColor: "red",

                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                // width={Dimensions.get("window").width}
                style={{
                  flex: 0.5,
                  backgroundColor: "#2E9E9B",
                  // borderWidth: 4,
                  height: responsiveScreenHeight(5.5),
                  // width: "30%",
                  // alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  //marginStart: "2%",
                  marginEnd: "3%",
                  borderRadius: 10,
                }}
                onPress={() => {
                  setCodeView(false);
                  setGiftCode("");
                  setGiftCodeError("transparent");
                }}
              >
                {/* 12000000000QR  */}
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: responsiveScreenFontSize(2),
                    color: "white",
                    // fontWeight: "bold",
                  }}
                >
                  Go Back
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 0.5,
                  backgroundColor: "#2E9E9B",
                  // borderWidth: 4,
                  height: responsiveScreenHeight(5.5),
                  // width: "30%",
                  // alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  marginStart: "3%",
                  // marginEnd: "3%",
                  borderRadius: 10,
                }}
                onPress={handleGiftCode}
                disabled={giftErrorCounter === 3 ? true : false}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: responsiveScreenFontSize(2),
                    color: "white",
                    // fontWeight: "bold",
                  }}
                >
                  Use Code
                </Text>
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
