//@refresh reset
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Picker,
  ImageBackground,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,

} from "react-native";
import { FontAwesome, Fontisto, AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";


import * as Device from "expo-device";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
import Image from "react-native-scalable-image";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
} from "react-native-responsive-dimensions";

import { Card } from "react-native-shadow-cards";
import { ScrollView } from "react-native-gesture-handler";
import ReactNativePickerModule from "react-native-picker-module";
import db from "../db";
import firebase from "firebase";
import "firebase/auth";
import moment from "moment";
export default function SubscriptionsScreen(props) {
  let pickerRef = null;
  const [deviceType, setDeviceType] = useState(0);
  const [valueText, setValueText] = useState("");
  const [userSubscription, setUserSubscription] = useState();
  const subscriptionLevel = ["gold", "sliver", "bronze"];
  const [flag, setFlag] = useState(true);
  const [view, setView] = useState("first");
  const [modal, setModal] = useState(false);
  const [subscription, setSubscription] = useState();
  const [chosenSub, setChosenSub] = useState("");
  const [paymentFlag, setPaymentFlag] = useState(true);
  let levels = [{ level: "bronze", points: 3, price: 10 },
  { level: "silver", points: 5, price: 20 },
  { level: "gold", points: 10, price: 50 }
  ]

  let levelPics = [require("../assets/images/bronze.png"), require("../assets/images/silver.png"), require("../assets/images/gold.png")]
  console.log("user from referrel ", userSubscription);

  useEffect(() => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("subscription")
      .onSnapshot((snap) => {
        snap.forEach((doc) => {
          const endDate = doc.data().endDate.toDate();
          if (endDate > new Date()) {
            setUserSubscription({ id: doc.id, ...doc.data() });
            setSubscription({ id: doc.id, ...doc.data() });
          }
        });
      });
  }, []);

  const process = (l) => {
    setChosenSub(l);
    setModal(true);
    setValueText(l.level);
  };

  const subscribe = async (type) => {
    console.log("subs: ", userSubscription);
    const sub = {
      gold: {
        type: "gold",
        startDate: new Date(),
        endDate: new Date(moment().add(1, "month").calendar()),
      },
      sliver: {
        type: "sliver",
        startDate: new Date(),
        endDate: new Date(moment().add(1, "month").calendar()),
      },
      bronze: {
        type: "bronze",
        startDate: new Date(),
        endDate: new Date(moment().add(1, "month").calendar()),
      },
    };

    if (type === "updateSub") {
      db.collection("users")
        .doc(firebase.auth().currentUser.uid)
        .collection("subscription")
        .doc(subscription.id)
        .update({
          endDate: new Date(),
        });
      console.log(valueText);
      if (valueText === "gold") {
        const decrement = firebase.firestore.FieldValue.increment(-50);
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({ balance: decrement });
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .collection("subscription")
          .add(sub.gold);
      } else if (valueText === "sliver") {
        const decrement = firebase.firestore.FieldValue.increment(-20);
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({ balance: decrement });
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .collection("subscription")
          .add(sub.sliver);
      } else if (valueText === "bronze") {
        const decrement = firebase.firestore.FieldValue.increment(-10);
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({ balance: decrement });
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .collection("subscription")
          .add(sub.bronze);
      }
    }
    console.log(valueText);
    if (type === "new") {
      if (valueText === "gold") {
        const decrement = firebase.firestore.FieldValue.increment(-50);
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({ balance: decrement });
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .collection("subscription")
          .add(sub.gold);
      } else if (valueText === "sliver") {
        const decrement = firebase.firestore.FieldValue.increment(-20);
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({ balance: decrement });
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .collection("subscription")
          .add(sub.sliver);
      } else if (valueText === "bronze") {
        const decrement = firebase.firestore.FieldValue.increment(-10);
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({ balance: decrement });
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .collection("subscription")
          .add(sub.bronze);
      }
    } else if (type === "update") {
      setUserSubscription(undefined);
      setFlag(!flag);
    }
  };

  const getDeviceType = async () => {
    const type = await Device.getDeviceTypeAsync();
    setDeviceType(type);
  };
  useEffect(() => {
    getDeviceType();
  }, []);


  return (
    <View style={styles.container}>
      <Modal visible={modal} transparent={true}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.centeredView2]}>
            <View elevation={5} style={styles.modalView2}>
              <TouchableOpacity
                style={{
                  justifyContent: "center",
                  alignItems: "flex-end",
                  marginEnd: 15,
                  marginTop: 15,
                }}
                onPress={() => subscribe("new")}
              >

              </TouchableOpacity>

              <TouchableOpacity style={{
                justifyContent: "flex-start",
                alignItems: "flex-end",

              }} onPress={() => setModal(false)}>
                <AntDesign
                  name="close"
                  size={20}
                  style={{ color: "#224229" }}
                />
              </TouchableOpacity>

              <View style={{

                alignContent: "center",

              }}>

                <Text style={{
                  fontSize: 20,
                  color: "#005c9d",
                  fontWeight: "bold",
                  textAlign: "center"
                }}>Payment</Text>
              </View>

              <View
                style={{

                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1
                }}
              >


                <Text style={{ fontSize: 18, fontWeight: "bold", textAlign: "center" }}>this level will gives you: {chosenSub === "" ? null : chosenSub.points} Points  and will cost you {chosenSub === "" ? null : chosenSub.price} Qatari Riyals</Text>


              </View>
              <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"

              }}>
                <View style={{
                  backgroundColor: "#2E9E9B",
                  height: 40,
                  width: "60%",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 10,
                }}>
                  {flag === true ? (
                    <TouchableOpacity

                      onPress={() => {
                        subscribe("new");
                      }}
                    >
                      <Text style={{
                        textAlign: "center",
                        fontSize: 16,
                        color: "white",
                      }}>subscribe and pay </Text>
                    </TouchableOpacity>
                  ) : (
                      <TouchableOpacity

                        onPress={() => {
                          subscribe("updateSub");
                        }}
                      >
                        <Text>subscribe now</Text>
                      </TouchableOpacity>
                    )}
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <View style={{
        flex: 2, alignItems: "center", justifyContent: "center"
      }}>
        <View style={{
          width: "100%",
          flex: 1,
          alignItems: "center",
          justifyContent: "space-around",
          // backgroundColor: "pink",

        }}>
          <View>
            <Text style={{ fontSize: 30, }}>VIP Subscriptions</Text>
          </View>

          <View style={styles.card}>
            <Text style={{ fontSize: 15 }}>
              Get a number of points that depends on the level you get.
            </Text>
            <Text style={{ fontSize: 15 }}>
              Points can be used in:
            </Text>
          </View>
          <View>
            <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
              <Image width={Dimensions.get("window").width / 12} source={require('../assets/images/vip.png')} />
              <Text style={{ fontSize: 20, color: "#185a9d" }}> Access VIP Parking</Text></View>
            <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
              <Image width={Dimensions.get("window").width / 12} source={require('../assets/images/carwash.png')} />
              <Text style={{ fontSize: 20, color: "#185a9d" }}> FREE Car Washes</Text></View>

            <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
              <Image width={Dimensions.get("window").width / 12} source={require('../assets/images/petrol.png')} />
              <Text style={{ fontSize: 20, color: "#185a9d" }}> FREE Liters of Petrol</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
              <Image width={Dimensions.get("window").width / 12} source={require('../assets/images/valet.png')} />
              <Text style={{ fontSize: 22, color: "#185a9d" }}> Access to the Valet</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
              <MaterialCommunityIcons name="projector" size={30} color="black" /><Text style={{ fontSize: 20, color: "#185a9d" }}> FREE Access To Projector Rooms </Text>
            </View>
          </View>
        </View>
        <View

          style={{
            width: "100%",
            flex: 1,

          }}
        >

          {!userSubscription ? (
            // paymentFlag === true ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",

              }}
            >
              {levels.map((l, i) => (
                <View style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                  <Image
                    width={Dimensions.get("window").width / 3.3}
                    source={levelPics[i]}
                  />

                  <View
                    style={{
                      flex: 1,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      justifyContent: "center",
                      alignItems: "center",
                      // marginTop: "10%",
                    }}
                  >
                    <View
                      width={Dimensions.get("window").width / 4}
                      style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingTop: "35%"
                        // backgroundColor: "red",
                        // justifyContent: "center",
                        // alignItems: "flex-end",
                        // marginTop: "-12%",
                        // marginEnd: "-3%",
                      }}
                    >
                      <Text
                        style={
                          deviceType === 1
                            ? { ...styles.levelPrice, fontSize: responsiveScreenFontSize(2.8) }
                            : {
                              ...styles.levelPrice,
                              fontSize: responsiveScreenFontSize(3.5),
                            }
                        }
                      >
                        {l.price} QAR
                        </Text>
                    </View>
                    <View style={{ alignItems: "flex-start", flex: 1, }}>
                      <Text
                        style={
                          deviceType === 1
                            ? { ...styles.levelDescription, fontSize: responsiveScreenFontSize(2) }
                            : {
                              ...styles.levelDescription,
                              fontSize: responsiveScreenFontSize(3.5),
                            }
                        }
                      >
                        Points: {l.points}
                      </Text>

                    </View>
                    <View style={{ alignItems: "flex-start", flex: 0.6 }}>
                      <TouchableOpacity onPress={() => process(l)} style={{ width: "100%", height: "100%" }}>
                        <Text
                          style={
                            deviceType === 1
                              ? { ...styles.levelDescription, fontSize: responsiveScreenFontSize(2) }
                              : {
                                ...styles.levelDescription,
                                fontSize: responsiveScreenFontSize(3.5),
                              }
                          }
                        >
                          Sign Up
                        </Text>
                      </TouchableOpacity>

                    </View>
                  </View>



                </View>
              ))}

              {/* <ScrollView>
                  <View>
                    <Text>Selected Level: {valueText}</Text>
                    {Platform.OS === "ios" ? (
                      <View>


                        <TouchableOpacity
                          style={{
                            paddingVertical: 10,
                          }}
                          onPress={() => {
                            pickerRef.show();
                          }}
                        >
                          <Text>Select subscription level</Text>
                        </TouchableOpacity>
                        <ReactNativePickerModule
                          pickerRef={(e) => (pickerRef = e)}
                          title={"Select a subscription level"}
                          items={subscriptionLevel}
                          onDismiss={() => {
                            console.log("onDismiss");
                          }}
                          onCancel={() => {
                            console.log("Cancelled");
                          }}
                          onValueChange={(valueText, index) => {
                            setValueText(valueText);
                          }}
                        />
                      </View>
                    ) : (
                      <Picker
                        selectedValue={valueText}
                        style={{ height: 50, width: 150 }}
                        onValueChange={(item, itemIndex) => setValueText(item)}
                      >
                        {subscriptionLevel.map((item, index) => (
                          <Picker.Item key={index} label={item} value={item} />
                        ))}
                      </Picker>
                    )}

                    {valueText === "bronze" ? (
                      <Text>this level will gives you: 3 price : 10</Text>
                    ) : valueText === "sliver" ? (
                      <Text>this level will gives you: 5 price : 20</Text>
                    ) : valueText === "gold" ? (
                      <Text>this level will gives you: 10 price : 50</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 10,
                    }}
                    onPress={() => {
                      process();
                    }}
                  >
                    <Text>subscribe now and pay</Text>
                  </TouchableOpacity>
                </ScrollView> */}
            </View>
            // ) : (
            //   <View
            //     style={{
            //       flex: 1,
            //       justifyContent: "center",
            //       alignItems: "baseline",
            //     }}
            //   >
            //     <Text>Payment</Text>
            //     {valueText === "bronze" ? (
            //       <Text>this level will gives you: 3 price : 10</Text>
            //     ) : valueText === "sliver" ? (
            //       <Text>this level will gives you: 5 price : 20</Text>
            //     ) : valueText === "gold" ? (
            //       <Text>this level will gives you: 10 price : 50</Text>
            //     ) : null}
            //     {flag === true ? (
            //       <TouchableOpacity
            //         style={{
            //           paddingVertical: 10,
            //         }}
            //         onPress={() => {
            //           subscribe("new");
            //         }}
            //       >
            //         <Text>subscribe now</Text>
            //       </TouchableOpacity>
            //     ) : (
            //         <TouchableOpacity
            //           style={{
            //             paddingVertical: 10,
            //           }}
            //           onPress={() => {
            //             subscribe("updateSub");
            //           }}
            //         >
            //           <Text>subscribe now</Text>
            //         </TouchableOpacity>
            //       )}
            //   </View>
            // )
          ) : (

              ////////////////////////////////////////////////////////////////////////////////////
              <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}>
                <Text>
                  Subscription will end at:{" "}
                  {moment(userSubscription.endDate.toDate()).format("L")}
                </Text>
                <Text>your subscription level is: {levels[levels.findIndex(l => l.level == userSubscription.type)].level}</Text>
                <Image
                  width={Dimensions.get("window").width / 3.3}
                  source={levelPics[levels.findIndex(l => l.level == userSubscription.type)]}
                />

                <View
                  style={{
                    flex: 1,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    // marginTop: "10%",
                  }}
                >
                  <View
                    width={Dimensions.get("window").width / 4}
                    style={{
                      flex: 2,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingTop: "35%"
                      // backgroundColor: "red",
                      // justifyContent: "center",
                      // alignItems: "flex-end",
                      // marginTop: "-12%",
                      // marginEnd: "-3%",
                    }}
                  >
                    <Text
                      style={
                        deviceType === 1
                          ? { ...styles.levelPrice, fontSize: responsiveScreenFontSize(3.5) }
                          : {
                            ...styles.levelPrice,
                            fontSize: responsiveScreenFontSize(3.5),
                          }
                      }
                    >
                      {levels[levels.findIndex(l => l.level == userSubscription.type)].price} QAR
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-start", flex: 3, paddingTop: "15%" }}>
                    <Text
                      style={
                        deviceType === 1
                          ? { ...styles.levelDescription, fontSize: responsiveScreenFontSize(3) }
                          : {
                            ...styles.levelDescription,
                            fontSize: responsiveScreenFontSize(3.5),
                          }
                      }
                    >
                      Points: {levels[levels.findIndex(l => l.level == userSubscription.type)].points}
                    </Text>

                  </View>
                  <View style={{ alignItems: "flex-start", flex: 3, paddingTop: "13%" }}>
                    <TouchableOpacity onPress={() => { subscribe("update") }} style={{ width: "100%", height: "100%" }}>
                      <Text
                        style={
                          deviceType === 1
                            ? { ...styles.levelDescription, fontSize: responsiveScreenFontSize(2) }
                            : {
                              ...styles.levelDescription,
                              fontSize: responsiveScreenFontSize(3.5),
                            }
                        }
                      >
                        renew/upgrade
                    </Text>
                    </TouchableOpacity>

                  </View>
                </View>
              </View>



            )}
          {/* ------------------------------------------------------------------------------------------------ */}
        </View>

      </View >
      {/* <View style={{ flex: 0.3 }}>

      </View> */}
    </View >
  );
}

SubscriptionsScreen.navigationOptions = (props) => ({
  title: "Subscription",
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalView2: {
    // flex: 1,
    // margin: 20,
    height: height / 3,
    width: width / 1.6,
    backgroundColor: "#fff",
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    borderRadius: 10,
    // padding: 35,
    // justifyContent: "center",
    // alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    // backgroundColor: "red",
    padding: 5
  },
  centeredView2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 22,
    // backgroundColor: "red",
  },
  card: {
    backgroundColor: "white",
    width: "100%",
    marginTop: "3%",
    paddingBottom: "10%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
    padding: "5%",
    // flexDirection: "row",
    //flexWrap: "wrap",
    // flex: 1,
    // height: "100%",
  }
});
