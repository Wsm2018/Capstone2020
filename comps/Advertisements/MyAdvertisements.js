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
import { add } from "react-native-reanimated";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function MyAdvertisements(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [ads, setAds] = useState(null);
  const [buttonIndex, setButtonIndex] = useState(0);

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
        queryBySnapshot.forEach((doc) => {
          tempAds.push({ id: doc.id, ...doc.data() });
        });
        // console.log(tempAds);
        setAds(tempAds);
      });
    return unsub;
  };

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

  return (
    ads && (
      <View style={styles.container}>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            height: "10%",
          }}
        >
          <TouchableOpacity
            style={{
              width: "15%",
              //   borderWidth: 1,
              height: "70%",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => props.navigation.navigate("AdvertisementsForm")}
          >
            <MaterialCommunityIcons
              name={"plus-box"}
              size={45}
              color={"#a6a6a6"}
            />
          </TouchableOpacity>
          <ButtonGroup
            onPress={(index) => {
              setButtonIndex(index);
            }}
            selectedIndex={buttonIndex}
            buttons={["Approved", "Pending", "Denied"]}
            containerStyle={{ width: "85%" }}
          />
        </View>
        {ads.length > 0 && (
          <ScrollView style={{ borderWidth: 1, height: "90%" }}>
            {ads.map((ad, index) =>
              buttonIndex === 0
                ? // ---------------------------------APPROVED---------------------------------
                ad.status === "approved" && (
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
                        // backgroundColor: "pink",
                        // borderRadius: 20,
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
                              // resizeMode: "contain",
                              // borderTopRightRadiusRadius: 10,
                              // borderRadius: 5,
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
                          // backgroundColor: "lightblue",
                        }}
                      >
                        {/* ---------------------------------TITLE--------------------------------- */}
                        <View
                          // elevation={3}
                          style={{
                            flex: 0.3,
                            width: "80%",
                            alignItems: "center",
                            justifyContent: "center",
                            // borderColor: "gray",
                            // borderRadius: 5,
                            // borderWidth: 1,
                            // backgroundColor: "lightgray",
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
                          {/* <Ionicons
                              name="md-paper"
                              size={22}
                              color="darkred"
                            /> */}
                          <Text style={{ fontSize: 16 }}>
                            {ad.description}
                          </Text>
                        </View>

                        {/* ---------------------------------LINK--------------------------------- */}
                        <TouchableOpacity
                          style={{
                            flex: 0.2,
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            // backgroundColor: "pink",
                          }}
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
                            // backgroundColor: "white",
                            borderBottomWidth: 1,
                            // flexDirection: "row",
                          }}
                        >
                          {/* <View>
                              <MaterialCommunityIcons
                                name="timer-sand"
                                size={22}
                                color="darkred"
                              />
                            </View> */}
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
                        // backgroundColor: "red",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "row",
                      }}
                    >
                      <View
                        style={{
                          flex: 0.3,
                          backgroundColor: "#e3e3e3",
                          // borderWidth: 4,
                          height: 30,
                          // width: "30%",
                          // alignSelf: "center",
                          justifyContent: "center",
                          alignItems: "center",
                          //marginStart: "2%",
                          // marginEnd: "3%",
                          borderRadius: 10,
                          //marginBottom: 10,
                        }}
                      >
                        {/* ---------------------------------PAY--------------------------------- */}
                        {ad.paid ? <Text
                          style={{
                            textAlign: "center",
                            fontSize: 16,
                            color: "black",
                            fontWeight: "bold",
                          }}
                        >
                          Paid
                            </Text> : <TouchableOpacity
                            onPress={() =>
                              props.navigation.navigate(
                                "AdvertisementsPayment",
                                {
                                  totalAmount: ad.amount,
                                  ad,
                                }
                              )
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
                          </TouchableOpacity>}
                      </View>
                      {/* <View
                          style={{
                            flex: 0.3,
                            backgroundColor: "#901919",
                            // borderWidth: 4,
                            height: 30,
                            // width: "30%",
                            // alignSelf: "center",
                            justifyContent: "center",
                            alignItems: "center",
                            //marginStart: "2%",
                            marginStart: "3%",
                            borderRadius: 10,
                            //marginBottom: 10,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => approve(ad.id, "denied")}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                fontSize: 16,
                                color: "white",
                                fontWeight: "bold",
                              }}
                            >
                              Reject
                            </Text>
                          </TouchableOpacity>
                        </View> */}
                    </View>
                  </View>
                )
                : buttonIndex === 1
                  ? // ---------------------------------PENDING---------------------------------
                  ad.status === "pending" && (
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
                          // backgroundColor: "pink",
                          // borderRadius: 20,
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
                                // resizeMode: "contain",
                                // borderTopRightRadiusRadius: 10,
                                // borderRadius: 5,
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
                            // backgroundColor: "lightblue",
                          }}
                        >
                          {/* ---------------------------------TITLE--------------------------------- */}
                          <View
                            // elevation={3}
                            style={{
                              flex: 0.3,
                              width: "80%",
                              alignItems: "center",
                              justifyContent: "center",
                              // borderColor: "gray",
                              // borderRadius: 5,
                              // borderWidth: 1,
                              // backgroundColor: "lightgray",
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
                            {/* <Ionicons
                              name="md-paper"
                              size={22}
                              color="darkred"
                            /> */}
                            <Text style={{ fontSize: 16 }}>
                              {ad.description}
                            </Text>
                          </View>

                          {/* ---------------------------------LINK--------------------------------- */}
                          <TouchableOpacity
                            style={{
                              flex: 0.2,
                              flexDirection: "row",
                              justifyContent: "center",
                              alignItems: "center",
                              // backgroundColor: "pink",
                            }}
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
                              // backgroundColor: "white",
                              borderBottomWidth: 1,
                              // flexDirection: "row",
                            }}
                          >
                            {/* <View>
                              <MaterialCommunityIcons
                                name="timer-sand"
                                size={22}
                                color="darkred"
                              />
                            </View> */}
                            <View>
                              <Text style={{ fontSize: 12 }}>
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
                          // backgroundColor: "red",
                          justifyContent: "center",
                          alignItems: "center",
                          flexDirection: "row",
                        }}
                      >
                        <View
                          style={{
                            flex: 0.3,
                            backgroundColor: "#2E9E9B",
                            // borderWidth: 4,
                            height: 30,
                            // width: "30%",
                            // alignSelf: "center",
                            justifyContent: "center",
                            alignItems: "center",
                            //marginStart: "2%",
                            // marginEnd: "3%",
                            borderRadius: 10,
                            //marginBottom: 10,
                          }}
                        >
                          {/* ---------------------------------PAY--------------------------------- */}
                          <TouchableOpacity
                            onPress={() =>
                              props.navigation.navigate(
                                "AdvertisementsPayment",
                                {
                                  totalAmount: ad.amount,
                                }
                              )
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
                        </View>
                        {/* <View
                          style={{
                            flex: 0.3,
                            backgroundColor: "#901919",
                            // borderWidth: 4,
                            height: 30,
                            // width: "30%",
                            // alignSelf: "center",
                            justifyContent: "center",
                            alignItems: "center",
                            //marginStart: "2%",
                            marginStart: "3%",
                            borderRadius: 10,
                            //marginBottom: 10,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => approve(ad.id, "denied")}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                fontSize: 16,
                                color: "white",
                                fontWeight: "bold",
                              }}
                            >
                              Reject
                            </Text>
                          </TouchableOpacity>
                        </View> */}
                      </View>
                    </View>
                  )
                  : buttonIndex === 2
                    ? // ---------------------------------DENIED---------------------------------
                    ad.status === "denied" && (
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
                            // backgroundColor: "pink",
                            // borderRadius: 20,
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
                                  // resizeMode: "contain",
                                  // borderTopRightRadiusRadius: 10,
                                  // borderRadius: 5,
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
                              // backgroundColor: "lightblue",
                            }}
                          >
                            {/* ---------------------------------TITLE--------------------------------- */}
                            <View
                              // elevation={3}
                              style={{
                                flex: 0.3,
                                width: "80%",
                                alignItems: "center",
                                justifyContent: "center",
                                // borderColor: "gray",
                                // borderRadius: 5,
                                // borderWidth: 1,
                                // backgroundColor: "lightgray",
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
                              {/* <Ionicons
                              name="md-paper"
                              size={22}
                              color="darkred"
                            /> */}
                              <Text style={{ fontSize: 16 }}>
                                {ad.description}
                              </Text>
                            </View>

                            {/* ---------------------------------LINK--------------------------------- */}
                            <TouchableOpacity
                              style={{
                                flex: 0.2,
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center",
                                // backgroundColor: "pink",
                              }}
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
                                // backgroundColor: "white",
                                borderBottomWidth: 1,
                                // flexDirection: "row",
                              }}
                            >
                              {/* <View>
                              <MaterialCommunityIcons
                                name="timer-sand"
                                size={22}
                                color="darkred"
                              />
                            </View> */}
                              <View>
                                <Text style={{ fontSize: 12 }}>
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
                            // backgroundColor: "red",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "row",
                          }}
                        >
                          {
                            <View
                              style={{
                                flex: 0.3,
                                backgroundColor: "#2E9E9B",
                                // borderWidth: 4,
                                height: 30,
                                // width: "30%",
                                // alignSelf: "center",
                                justifyContent: "center",
                                alignItems: "center",
                                //marginStart: "2%",
                                // marginEnd: "3%",
                                borderRadius: 10,
                                //marginBottom: 10,
                              }}
                            >
                              {/* ---------------------------------PAY--------------------------------- */}
                              <TouchableOpacity
                                onPress={() =>
                                  props.navigation.navigate(
                                    "AdvertisementsPayment",
                                    {
                                      totalAmount: ad.amount,
                                    }
                                  )
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
                            </View>
                          }
                          {/* <View
                          style={{
                            flex: 0.3,
                            backgroundColor: "#901919",
                            // borderWidth: 4,
                            height: 30,
                            // width: "30%",
                            // alignSelf: "center",
                            justifyContent: "center",
                            alignItems: "center",
                            //marginStart: "2%",
                            marginStart: "3%",
                            borderRadius: 10,
                            //marginBottom: 10,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => approve(ad.id, "denied")}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                fontSize: 16,
                                color: "white",
                                fontWeight: "bold",
                              }}
                            >
                              Reject
                            </Text>
                          </TouchableOpacity>
                        </View> */}
                        </View>
                      </View>
                    )
                    : null
            )}
          </ScrollView>
        )}
        {ads.length === 0 && (
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
        <Button
          title="Requests"
          onPress={() => props.navigation.navigate("AdvertisementsRequest")}
        />
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
