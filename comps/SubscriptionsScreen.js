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
import {
  FontAwesome,
  Fontisto,
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import * as Device from "expo-device";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
import Image from "react-native-scalable-image";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
  responsiveFontSize,
  useResponsiveFontSize,
  responsiveHeight,
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
  const subscriptionLevel = ["gold", "silver", "bronze"];
  const [flag, setFlag] = useState(true);
  const [view, setView] = useState("first");
  const [modal, setModal] = useState(false);
  const [subscription, setSubscription] = useState();
  const [chosenSub, setChosenSub] = useState("");
  const [paymentFlag, setPaymentFlag] = useState(true);
  let levels = [
    { level: "bronze", points: 3, price: 10 },
    { level: "silver", points: 5, price: 20 },
    { level: "gold", points: 10, price: 50 },
  ];

  let levelPics = [
    require("../assets/images/bronze.png"),
    require("../assets/images/silver.png"),
    require("../assets/images/gold.png"),
  ];
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
    setValueText(l.level);
    setModal(true);
  };

  const subscribe = async (type) => {
    console.log("subs: ", valueText);
    const sub = {
      gold: {
        type: "gold",
        startDate: new Date(),
        endDate: new Date(moment().add(1, "month").calendar()),
      },
      silver: {
        type: "silver",
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
      console.log(type);
      if (valueText === "gold") {
        const decrement = firebase.firestore.FieldValue.increment(-50);
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({ balance: decrement });
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .collection("subscription")
          .add(sub.gold);
      } else if (valueText === "silver") {
        const decrement = firebase.firestore.FieldValue.increment(-20);
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({ balance: decrement });
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .collection("subscription")
          .add(sub.silver);
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
    console.log(type);
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
      } else if (valueText === "silver") {
        const decrement = firebase.firestore.FieldValue.increment(-20);
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({ balance: decrement });
        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .collection("subscription")
          .add(sub.silver);
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

  // useEffect(() => {
  //   setFlag(false)
  // }, [userSubscription]);

  return (
    <View style={styles.container}>
      <Modal visible={modal} transparent={true}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.centeredView2]}>
            <View elevation={5} style={styles.modalView2}>
              <TouchableOpacity
                style={{
                  justifyContent: "flex-start",
                  alignItems: "flex-end",
                }}
                onPress={() => setModal(false)}
              >
                <AntDesign
                  name="close"
                  size={20}
                  style={{ color: "#224229" }}
                />
              </TouchableOpacity>

              <View
                style={{
                  alignContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: responsiveFontSize(2),
                    color: "#005c9d",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Payment
                </Text>
              </View>

              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: responsiveFontSize(2),
                    // fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  This level will give you:{" "}
                  {chosenSub === "" ? null : chosenSub.points} Points & cost you
                  {chosenSub === "" ? null : chosenSub.price} Qatari Riyals.
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#2E9E9B",
                    height: responsiveHeight(5),
                    width: "60%",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 10,
                  }}
                >
                  {flag === true ? (
                    <TouchableOpacity
                      onPress={() => {
                        subscribe("new");
                      }}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: responsiveFontSize(2),
                          color: "white",
                          fontWeight: "bold",
                        }}
                      >
                        Subscribe{" "}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        subscribe("updateSub");
                      }}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: responsiveFontSize(2),
                          color: "white",
                          fontWeight: "bold",
                        }}
                      >
                        Renew
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <View
        style={{
          flex: 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ backgroundColor: "#e3e3e3", flex: 1, margin: 5 }}>
          <View
            style={{
              backgroundColor: "#e3e3e3",
              flex: 1,
              margin: 5,
              width: "95%",
            }}
          >
            {!userSubscription ? (
              <View>
                <View
                  style={{
                    // width: "100%",
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      // width: "100%",
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: responsiveScreenFontSize(3),
                          color: "#2E9E9B",
                          fontWeight: "bold",
                        }}
                      >
                        VIP Subscriptions
                      </Text>
                    </View>

                    <View style={styles.card}>
                      <Text
                        style={{
                          fontSize: responsiveScreenFontSize(1.4),
                          color: "#185a9d",
                          marginBottom: 15,
                          fontWeight: "bold",
                          // textAlign: "center",
                        }}
                      >
                        Collect points based on the Subscription Level you are
                        in.
                      </Text>

                      <View
                        style={{
                          ...styles.card2,
                          // justifyContent: "center",
                          // alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <AntDesign
                            name="check"
                            size={20}
                            style={{ color: "#2E9E9B" }}
                          />
                          <Text
                            style={{
                              fontSize: responsiveScreenFontSize(2),
                              color: "#185a9d",
                              fontWeight: "bold",
                            }}
                          >
                            Access VIP parking
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <AntDesign
                            name="check"
                            size={20}
                            style={{ color: "#2E9E9B" }}
                          />
                          <Text
                            style={{
                              fontSize: responsiveScreenFontSize(2),
                              color: "#185a9d",
                              fontWeight: "bold",
                            }}
                          >
                            Free car wash
                          </Text>
                        </View>

                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <AntDesign
                            name="check"
                            size={20}
                            style={{ color: "#2E9E9B" }}
                          />
                          <Text
                            style={{
                              fontSize: responsiveScreenFontSize(2),
                              color: "#185a9d",
                              fontWeight: "bold",
                            }}
                          >
                            Free liters of petrol
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <AntDesign
                            name="check"
                            size={20}
                            style={{ color: "#2E9E9B" }}
                          />
                          <Text
                            style={{
                              fontSize: responsiveScreenFontSize(2),
                              color: "#185a9d",
                              fontWeight: "bold",
                            }}
                          >
                            Access to the valet
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <AntDesign
                            name="check"
                            size={20}
                            style={{ color: "#2E9E9B" }}
                          />
                          <Text
                            style={{
                              fontSize: responsiveScreenFontSize(2),
                              color: "#185a9d",
                              fontWeight: "bold",
                            }}
                          >
                            Access to projector rooms
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View
                    style={{
                      width: "100%",
                      flex: 1,
                    }}
                  >
                    <View
                      width={Dimensions.get("window").width / 1}
                      style={{
                        // width: "100%",
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                      }}
                    >
                      {levels.map((l, i) => (
                        <View
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Image
                            width={Dimensions.get("window").width / 3.5}
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
                                paddingTop: "35%",
                                // backgroundColor: "red",
                                // justifyContent: "center",
                                // alignItems: "flex-end",
                                // marginTop: "-12%",
                                // marginEnd: "-3%",
                              }}
                            >
                              <Text
                                style={
                                  deviceType === 1 || deviceType === 0
                                    ? {
                                        ...styles.levelDescription,
                                        fontSize: responsiveScreenFontSize(2.8),
                                      }
                                    : {
                                        ...styles.levelDescription,
                                        fontSize: responsiveScreenFontSize(1.8),
                                      }
                                }
                              >
                                {l.price} QR
                              </Text>
                            </View>
                            <View style={{ alignItems: "flex-start", flex: 1 }}>
                              <Text
                                style={
                                  deviceType === 1 || deviceType === 0
                                    ? {
                                        ...styles.levelDescription,
                                        fontSize: responsiveScreenFontSize(2),
                                      }
                                    : {
                                        ...styles.levelDescription,
                                        fontSize: responsiveScreenFontSize(1.8),
                                      }
                                }
                              >
                                Points: {l.points}
                              </Text>
                            </View>
                            <View
                              style={{ alignItems: "flex-start", flex: 0.6 }}
                            >
                              <TouchableOpacity
                                onPress={() => process(l)}
                                style={{
                                  width: "100%",
                                  // height: "100%",
                                  // backgroundColor: "#e3e3e3",
                                }}
                              >
                                <Text
                                  style={
                                    deviceType === 1 || deviceType === 0
                                      ? {
                                          ...styles.levelDescription,
                                          fontSize: responsiveScreenFontSize(2),
                                          fontWeight: "bold",
                                          // color: "gray",
                                        }
                                      : {
                                          ...styles.levelDescription,
                                          fontSize: responsiveScreenFontSize(
                                            1.8
                                          ),
                                          fontWeight: "bold",
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
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <>
                <View
                  width={Dimensions.get("window").width / 1}
                  style={{
                    // width: "100%",
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: responsiveScreenFontSize(2),
                        color: "#2E9E9B",
                        fontWeight: "bold",
                      }}
                    >
                      VIP Subscriptions
                    </Text>
                  </View>

                  <View style={styles.card}>
                    <Text
                      style={{
                        fontSize: responsiveScreenFontSize(2),
                        color: "#185a9d",
                        marginBottom: 15,
                        fontWeight: "bold",

                        // textAlign: "center",
                      }}
                    >
                      Your subscription level is:{" "}
                      {
                        levels[
                          levels.findIndex(
                            (l) => l.level == userSubscription.type
                          )
                        ].level
                      }
                    </Text>
                    <Text
                      style={{
                        fontSize: responsiveScreenFontSize(1.5),
                        color: "#901616",
                        marginBottom: 15,
                        fontWeight: "bold",
                        // textAlign: "center",
                      }}
                    >
                      Subscription will end at:{" "}
                      {moment(userSubscription.endDate.toDate()).format("L")}
                    </Text>
                    <Text
                      style={{
                        fontSize: responsiveScreenFontSize(1.5),
                        color: "#185a9d",
                        marginBottom: 15,
                        fontWeight: "bold",
                        // textAlign: "center",
                      }}
                    >
                      You can use your Points in the Following services:
                    </Text>

                    <View
                      style={{
                        ...styles.card2,
                        // justifyContent: "center",
                        // alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <AntDesign
                          name="check"
                          size={20}
                          style={{ color: "#2E9E9B" }}
                        />
                        <Text
                          style={{
                            fontSize: responsiveFontSize(1.8),
                            color: "#185a9d",
                            fontWeight: "bold",
                          }}
                        >
                          Access VIP parking
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <AntDesign
                          name="check"
                          size={20}
                          style={{ color: "#2E9E9B" }}
                        />
                        <Text
                          style={{
                            fontSize: responsiveFontSize(1.8),
                            color: "#185a9d",
                            fontWeight: "bold",
                          }}
                        >
                          Free car wash
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <AntDesign
                          name="check"
                          size={20}
                          style={{ color: "#2E9E9B" }}
                        />
                        <Text
                          style={{
                            fontSize: responsiveFontSize(1.8),
                            color: "#185a9d",
                            fontWeight: "bold",
                          }}
                        >
                          Free liters of petrol
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <AntDesign
                          name="check"
                          size={20}
                          style={{ color: "#2E9E9B" }}
                        />
                        <Text
                          style={{
                            fontSize: responsiveFontSize(1.8),
                            color: "#185a9d",
                            fontWeight: "bold",
                          }}
                        >
                          Access to the valet
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <AntDesign
                          name="check"
                          size={20}
                          style={{ color: "#2E9E9B" }}
                        />
                        <Text
                          style={{
                            fontSize: responsiveFontSize(1.8),
                            color: "#185a9d",
                            fontWeight: "bold",
                          }}
                        >
                          Access to projector rooms
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    // width={Dimensions.get("window").width / 1}
                    height={responsiveScreenHeight(35)}
                    source={
                      levelPics[
                        levels.findIndex(
                          (l) => l.level == userSubscription.type
                        )
                      ]
                    }
                  />

                  <View
                    style={{
                      flex: 1,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      justifyContent: "space-around",
                      alignItems: "center",
                      // backgroundColor: "pink"
                      // marginTop: "10%",
                    }}
                  >
                    <View
                      width={Dimensions.get("window").width / 4}
                      // width={
                      //   deviceType === 1 || deviceType === 0
                      //     ? responsiveScreenFontSize(3.5)
                      //     :
                      //     responsiveScreenFontSize(3.5)
                      // }
                      style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingTop: "10%",
                        //backgroundColor: "red",
                        // justifyContent: "center",
                        // alignItems: "flex-end",
                        // marginTop: "-12%",
                        // marginEnd: "-3%",
                      }}
                    >
                      <Text
                        style={
                          deviceType === 1 || deviceType === 0
                            ? {
                                ...styles.levelDescription,
                                fontSize: responsiveScreenFontSize(2),
                              }
                            : {
                                ...styles.levelDescription,
                                fontSize: responsiveScreenFontSize(2),
                              }
                        }
                      >
                        {
                          levels[
                            levels.findIndex(
                              (l) => l.level == userSubscription.type
                            )
                          ].price
                        }{" "}
                        QAR
                      </Text>
                    </View>
                    <View
                      style={{
                        alignItems: "flex-start",
                        flex: 0.5,
                        marginTop: 40,
                        // backgroundColor: "red",
                      }}
                    >
                      <Text
                        style={
                          deviceType === 1 || deviceType === 0
                            ? {
                                ...styles.levelDescription,
                                fontSize: responsiveScreenFontSize(2.5),
                              }
                            : {
                                ...styles.levelDescription,
                                fontSize: responsiveScreenFontSize(2),
                              }
                        }
                      >
                        Points:
                        {
                          levels[
                            levels.findIndex(
                              (l) => l.level == userSubscription.type
                            )
                          ].points
                        }
                      </Text>
                    </View>
                    <View
                      style={{
                        alignItems: "center",
                        flex: 1,
                        marginTop: 50,
                        // backgroundColor: "green",
                        // justifyContent: "center",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          subscribe("update");
                        }}
                        style={{ width: "100%", height: "50%" }}
                      >
                        <Text
                          style={
                            deviceType === 1 || deviceType === 0
                              ? {
                                  ...styles.levelDescription,
                                  fontSize: responsiveScreenFontSize(2),
                                }
                              : {
                                  ...styles.levelDescription,
                                  fontSize: responsiveScreenFontSize(1.5),
                                }
                          }
                        >
                          Renew
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
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
    backgroundColor: "white",
  },
  modalView2: {
    // flex: 1,
    // margin: 20,
    height: height / 3,
    width: width / 1.4,
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
    padding: 5,
  },
  centeredView2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 22,
    // backgroundColor: "red",
  },
  levelDescription: {
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#e3e3e3",
    width: width / 1.3,
    marginTop: "5%",
    // paddingBottom: "15%",
    // borderTopWidth: 1,
    // borderBottomWidth: 1,
    // borderColor: "lightgray",
    //padding: "5%",
    alignItems: "center",
    // flexDirection: "row",
    //flexWrap: "wrap",
    // flex: 1,
    // height: "100%",
  },
  card2: {
    backgroundColor: "white",
    width: responsiveScreenWidth(80),
    // marginTop: "3%",
    // paddingBottom: "10%",
    borderWidth: 2,
    borderRadius: 10,
    // borderBottomWidth: 1,
    borderColor: "white",
    padding: "5%",
    // flexDirection: "row",
    //flexWrap: "wrap",
    // flex: 1,
    // height: "100%",
  },
});
