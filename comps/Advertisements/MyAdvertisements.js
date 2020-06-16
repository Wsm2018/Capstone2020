import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Picker,
  Modal,
  Platform,
  Dimensions,
} from "react-native";

import { Image, Avatar, Divider, ButtonGroup } from "react-native-elements";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

import moment from "moment";

import {
  FontAwesome5,
  Ionicons,
  FontAwesome,
  AntDesign,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";

import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
} from "react-native-responsive-dimensions";

import LottieView from "lottie-react-native";
import * as Linking from "expo-linking";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function MyAdvertisements(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [ads, setAds] = useState(null);
  const [buttonIndex, setButtonIndex] = useState(0);
  const [approvedAds, setApprovedAds] = useState(null);
  const [pendingAds, setPendingAds] = useState(null);
  const [deniedAds, setDeniedAds] = useState(null);

  // ------------------------------CURRENT USER------------------------------------
  const handleCurrentuser = async () => {
    const doc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    // console.log(doc.data());
    setCurrentUser({ id: doc.id, ...doc.data() });
  };

  const handleAds = () => {
    const unsub = db
      .collection("advertisements")
      .where("user.email", "==", currentUser.email)
      //   .where("status", "==", "pending")
      .onSnapshot((queryBySnapshot) => {
        let tempAds = [];
        let approved = [];
        let denied = [];
        let pending = [];
        queryBySnapshot.forEach((doc) => {
          tempAds.push({ id: doc.id, ...doc.data() });
          if (doc.data().status === "approved") {
            approved.push({ id: doc.id, ...doc.data() });
          } else if (doc.data().status === "pending") {
            pending.push({ id: doc.id, ...doc.data() });
          } else {
            denied.push({ id: doc.id, ...doc.data() });
          }
        });
        setApprovedAds(approved);
        setPendingAds(pending);
        setDeniedAds(denied);
        // console.log(tempAds);
        setAds(tempAds);
      });
    return unsub;
  };

  const openLink = async (item) => {
    await db
      .collection("advertisements")
      .doc(item.id)
      .update({
        clickers: item.clickers + 1,
      });
    Linking.openURL(item.link);
  };

  // ------------------------------------------------ USE EFFECTS -----------------------------

  useEffect(() => {
    handleCurrentuser();
    console.log(windowHeight * 0.1);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const unsubAds = handleAds();
      return () => {
        unsubAds();
      };
    }
  }, [currentUser]);

  // useEffect(() => {
  //   if (ads) {
  //     ads.map((item) => {
  //       item.status === "approved"
  //         ? approved.push(item)
  //         : item.status === "pending"
  //         ? pending.push(item)
  //         : denied.push(item);
  //     });
  //   }
  // }, [ads]);

  // ------------------------------------------------ RETURN  ----------------------------------

  return (
    ads && (
      <View style={styles.container}>
        <TouchableOpacity
          style={{
            backgroundColor: "#3ea3a3",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            bottom: "3%",
            right: "3%",
            borderRadius: 100,
            // height: "10%",
            width: "15%",
            aspectRatio: 1 / 1,
            zIndex: 10,
          }}
          onPress={() => props.navigation.navigate("AdvertisementsForm")}
        >
          <Ionicons name={"md-add"} size={45} color={"white"} />
        </TouchableOpacity>
        <ButtonGroup
          onPress={(index) => {
            setButtonIndex(index);
          }}
          selectedIndex={buttonIndex}
          buttons={["Approved", "Pending", "Denied"]}
          containerStyle={{ width: "95%" }}
        />

        {buttonIndex === 0 ? (
          <ScrollView>
            {approvedAds.length !== 0 ? (
              approvedAds.map((ad, index) => (
                <View
                  style={{
                    flex: 1,
                    height: 250,
                    margin: 15,
                    backgroundColor: "white",
                    borderWidth: 3,
                    borderColor: "#185a9d",
                    padding: 5,
                  }}
                >
                  <View
                    style={{
                      flex: 2,
                      flexDirection: "row",
                    }}
                    key={index}
                  >
                    <View style={{ flex: 1 }}>
                      {ad.image != null ? (
                        <Image
                          source={{ uri: ad.image }}
                          style={{
                            width: 150,
                            height: 175,
                            borderWidth: 1,
                            borderColor: "transparent",
                          }}
                        />
                      ) : null}
                    </View>

                    {/* -------------------------------- */}

                    <View
                      style={{
                        flex: 1.5,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* ---------------------------------TITLE--------------------------------- */}
                      <View
                        style={{
                          flex: 0.3,
                          width: "80%",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#185a9d",
                            fontSize: 20,
                            fontWeight: "bold",
                            textTransform: "none",
                          }}
                        >
                          {ad.title}
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 0.5,
                          width: "90%",
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          alignItems: "flex-start",
                          // backgroundColor: "#185a9d",
                          borderColor: "#185a9d",
                          borderWidth: 1,
                          padding: 5,
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>{ad.description}</Text>
                      </View>

                      {/* ---------------------------------LINK--------------------------------- */}
                      <TouchableOpacity
                        style={{
                          flex: 0.2,
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        onPress={() => openLink(ad)}
                      >
                        <Feather name="link" size={20} color="gray" />
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontSize: 16,
                            color: "blue",
                            textDecorationLine: "underline",
                          }}
                        >
                          {" "}
                          Link
                        </Text>
                      </TouchableOpacity>

                      {/* ---------------------------------DATE--------------------------------- */}
                      <View
                        style={{
                          flex: 0.2,
                          width: "95%",
                          alignItems: "center",
                          justifyContent: "center",
                          borderBottomWidth: 1,
                        }}
                      >
                        <View>
                          <Text
                            style={{
                              fontSize: responsiveScreenFontSize(1.5),
                            }}
                          >
                            {moment(ad.startDate.toDate()).format("L")}{" "}
                            <Text
                              style={{
                                fontWeight: "bold",
                                color: "#185a9d",
                              }}
                            >
                              {" "}
                              To{" "}
                            </Text>{" "}
                            {moment(ad.endDate.toDate()).format("L")}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 0.5,
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        flex: 0.3,
                        backgroundColor: "#3ea3a3",
                        height: 30,

                        justifyContent: "center",
                        alignItems: "center",

                        borderRadius: 10,
                      }}
                    >
                      {/* ---------------------------------PAY--------------------------------- */}
                      {ad.paid ? (
                        <Text
                          style={{
                            textAlign: "center",
                            fontSize: 16,
                            color: "black",
                            fontWeight: "bold",
                          }}
                        >
                          Paid
                        </Text>
                      ) : (
                        <TouchableOpacity
                          onPress={() =>
                            props.navigation.navigate("AdvertisementsPayment", {
                              totalAmount: ad.amount,
                              ad,
                            })
                          }
                        >
                          <Text
                            style={{
                              textAlign: "center",
                              fontSize: 16,
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            Pay
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={{ flex: 10, alignItems: "center" }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    // flex: 0.7,
                    paddingTop: "15%",
                  }}
                >
                  <LottieView
                    source={require("../../assets/17723-waitting.json")}
                    autoPlay
                    loop
                    style={{
                      position: "relative",
                      width: "80%",
                      justifyContent: "center",
                      alignSelf: "center",
                      // paddingTop: "30%",
                    }}
                  />
                  <Text
                    style={{
                      // paddingTop: "15%",
                      fontSize: responsiveScreenFontSize(3),
                      color: "darkgray",
                      fontWeight: "bold",
                    }}
                  >
                    You have no Ads
                  </Text>
                  <View
                    style={{
                      flex: 4,
                      // backgroundColor: "red",
                      // justifyContent: "flex-end",
                      alignItems: "flex-end",
                      flexDirection: "row-reverse",
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#2E9E9B",
                        height: responsiveScreenHeight(5),
                        width: responsiveScreenWidth(40),
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 10,
                      }}
                      onPress={() =>
                        props.navigation.navigate("AdvertisementsForm")
                      }
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: responsiveScreenFontSize(2),
                          color: "white",
                          // fontWeight: "bold",
                        }}
                      >
                        + Request
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        ) : buttonIndex === 1 ? (
          <ScrollView>
            {pendingAds.length !== 0 ? (
              pendingAds.map((ad, index) => (
                <View
                  style={{
                    flex: 1,
                    height: 250,
                    margin: 15,
                    backgroundColor: "white",
                    borderWidth: 3,
                    borderColor: "#185a9d",
                    padding: 5,
                  }}
                >
                  <View
                    style={{
                      flex: 2,
                      flexDirection: "row",
                    }}
                    key={index}
                  >
                    <View style={{ flex: 1 }}>
                      {ad.image != null ? (
                        <Image
                          source={{ uri: ad.image }}
                          style={{
                            width: 150,
                            height: 175,
                            borderWidth: 1,
                            borderColor: "transparent",
                          }}
                        />
                      ) : null}
                    </View>

                    {/* -------------------------------- */}

                    <View
                      style={{
                        flex: 1.5,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* ---------------------------------TITLE--------------------------------- */}
                      <View
                        style={{
                          flex: 0.3,
                          width: "80%",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#185a9d",
                            fontSize: 20,
                            fontWeight: "bold",
                            textTransform: "none",
                          }}
                        >
                          {ad.title}
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 0.5,
                          width: "90%",
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          alignItems: "flex-start",
                          // backgroundColor: "#185a9d",
                          borderColor: "#185a9d",
                          borderWidth: 1,
                          padding: 5,
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>{ad.description}</Text>
                      </View>

                      {/* ---------------------------------LINK--------------------------------- */}
                      <TouchableOpacity
                        style={{
                          flex: 0.2,
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        onPress={() => openLink(ad)}
                      >
                        <Feather name="link" size={20} color="gray" />
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontSize: 16,
                            color: "blue",
                            textDecorationLine: "underline",
                          }}
                        >
                          {" "}
                          Link
                        </Text>
                      </TouchableOpacity>

                      {/* ---------------------------------DATE--------------------------------- */}
                      <View
                        style={{
                          flex: 0.2,
                          width: "95%",
                          alignItems: "center",
                          justifyContent: "center",
                          borderBottomWidth: 1,
                        }}
                      >
                        <View>
                          <Text
                            style={{
                              fontSize: responsiveScreenFontSize(1.5),
                            }}
                          >
                            {moment(ad.startDate.toDate()).format("L")}{" "}
                            <Text
                              style={{
                                fontWeight: "bold",
                                color: "#185a9d",
                              }}
                            >
                              {" "}
                              To{" "}
                            </Text>{" "}
                            {moment(ad.endDate.toDate()).format("L")}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 0.5,
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "row",
                    }}
                  ></View>
                </View>
              ))
            ) : (
              <View style={{ flex: 10, alignItems: "center" }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    // flex: 0.7,
                    paddingTop: "15%",
                  }}
                >
                  <LottieView
                    source={require("../../assets/17723-waitting.json")}
                    autoPlay
                    loop
                    style={{
                      position: "relative",
                      width: "80%",
                      justifyContent: "center",
                      alignSelf: "center",
                      // paddingTop: "30%",
                    }}
                  />
                  <Text
                    style={{
                      // paddingTop: "15%",
                      fontSize: responsiveScreenFontSize(3),
                      color: "darkgray",
                      fontWeight: "bold",
                    }}
                  >
                    You have no Ads
                  </Text>
                  <View
                    style={{
                      flex: 4,
                      // backgroundColor: "red",
                      // justifyContent: "flex-end",
                      alignItems: "flex-end",
                      flexDirection: "row-reverse",
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#2E9E9B",
                        height: responsiveScreenHeight(5),
                        width: responsiveScreenWidth(40),
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 10,
                      }}
                      onPress={() =>
                        props.navigation.navigate("AdvertisementsForm")
                      }
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: responsiveScreenFontSize(2),
                          color: "white",
                          // fontWeight: "bold",
                        }}
                      >
                        + Request
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        ) : buttonIndex === 2 ? (
          <ScrollView>
            {deniedAds.length !== 0 ? (
              deniedAds.map((ad, index) => (
                <View
                  style={{
                    flex: 1,
                    height: 250,
                    margin: 15,
                    backgroundColor: "white",
                    borderWidth: 3,
                    borderColor: "#185a9d",
                    padding: 5,
                  }}
                >
                  {console.log(":ded", deniedAds)}
                  <View
                    style={{
                      flex: 2,
                      flexDirection: "row",
                    }}
                    key={index}
                  >
                    <View style={{ flex: 1 }}>
                      {ad.image != null ? (
                        <Image
                          source={{ uri: ad.image }}
                          style={{
                            width: 150,
                            height: 175,
                            borderWidth: 1,
                            borderColor: "transparent",
                          }}
                        />
                      ) : null}
                    </View>

                    {/* -------------------------------- */}

                    <View
                      style={{
                        flex: 1.5,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* ---------------------------------TITLE--------------------------------- */}
                      <View
                        style={{
                          flex: 0.3,
                          width: "80%",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#185a9d",
                            fontSize: 20,
                            fontWeight: "bold",
                            textTransform: "none",
                          }}
                        >
                          {ad.title}
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 0.5,
                          width: "90%",
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          alignItems: "flex-start",
                          // backgroundColor: "#185a9d",
                          borderColor: "#185a9d",
                          borderWidth: 1,
                          padding: 5,
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>{ad.description}</Text>
                      </View>

                      {/* ---------------------------------LINK--------------------------------- */}
                      <TouchableOpacity
                        style={{
                          flex: 0.2,
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        onPress={() => openLink(ad)}
                      >
                        <Feather name="link" size={20} color="gray" />
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontSize: 16,
                            color: "blue",
                            textDecorationLine: "underline",
                          }}
                        >
                          {" "}
                          Link
                        </Text>
                      </TouchableOpacity>

                      {/* ---------------------------------DATE--------------------------------- */}
                      <View
                        style={{
                          flex: 0.2,
                          width: "95%",
                          alignItems: "center",
                          justifyContent: "center",
                          borderBottomWidth: 1,
                        }}
                      >
                        <View>
                          <Text
                            style={{
                              fontSize: responsiveScreenFontSize(1.5),
                            }}
                          >
                            {moment(ad.startDate.toDate()).format("L")}{" "}
                            <Text
                              style={{
                                fontWeight: "bold",
                                color: "#185a9d",
                              }}
                            >
                              {" "}
                              To{" "}
                            </Text>{" "}
                            {moment(ad.endDate.toDate()).format("L")}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View
                style={{
                  flex: 10,
                  alignItems: "center",
                  justifyContent: "space-evenly",
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    // flex: 0.7,
                    paddingTop: "15%",
                    marginBottom: "10%",
                  }}
                >
                  <LottieView
                    source={require("../../assets/17723-waitting.json")}
                    autoPlay
                    loop
                    style={{
                      position: "relative",
                      width: "80%",
                      justifyContent: "center",
                      alignSelf: "center",
                      // paddingTop: "30%",
                    }}
                  />
                  <Text
                    style={{
                      // paddingTop: "15%",
                      fontSize: responsiveScreenFontSize(3),
                      color: "darkgray",
                      fontWeight: "bold",
                    }}
                  >
                    You have no Ads
                  </Text>
                  <View
                    style={{
                      flex: 4,
                      // backgroundColor: "red",
                      // justifyContent: "flex-end",
                      alignItems: "flex-end",
                      flexDirection: "row-reverse",
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#2E9E9B",
                        height: responsiveScreenHeight(5),
                        width: responsiveScreenWidth(40),
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 10,
                      }}
                      onPress={() =>
                        props.navigation.navigate("AdvertisementsForm")
                      }
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: responsiveScreenFontSize(2),
                          color: "white",
                          // fontWeight: "bold",
                        }}
                      >
                        + Request
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        ) : null}
      </View>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    // borderWidth: 1,
  },

  two: {
    backgroundColor: "white",
    width: "90%",
    // marginTop: "3%",
    // padding: "5%",
    // borderTopWidth: 1,
    // borderBottomWidth: 1,
    borderWidth: 1,
    borderColor: "lightgray",
    // flexDirection: "row",
    // flexWrap: "wrap",
    height: windowHeight * 0.3,
    margin: "5%",

    // justifyContent: "space-between",
  },

  cardTitle: {
    fontSize: 18,
    // backgroundColor: "red",
    width: "100%",
    height: 50,
    color: "#185a9d",
    fontWeight: "bold",
  },
});

{
}
