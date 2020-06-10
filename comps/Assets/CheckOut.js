import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Image,
  Platform,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Picker,
} from "react-native";
import firebase from "firebase/app";
import "firebase/functions";
import "firebase/auth";
import db from "../../db";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import { Divider } from "react-native-elements";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { CheckBox } from "react-native-elements";
import LottieView from "lottie-react-native";
import { Card } from "react-native-paper";

export default function CheckOut(props) {
  const [disable, setDisable] = useState(false);
  const tName = props.navigation.getParam("tName", "failed");
  const sName = props.navigation.getParam("sName", "failed");
  const assetBooking = props.navigation.getParam(
    "assetBooking",
    "some default value"
  );
  const serviceBooking = props.navigation.getParam(
    "serviceBooking",
    "some default value"
  );
  const [displayServices, setDisplayServices] = useState([]);
  //const [assetBooking, setAssetBooking] = useState({ asset: { id: "5uhqZwCDvQDH13OhKBJf", price: 100 }, startDateTime: "2020-05-15T01:00", endDateTime: "2020-05-16T08:00" })
  const [start, setStart] = useState();
  const [end, setEnd] = useState();
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (assetBooking) {
      fixTimings();
      countTotal();
      orderList();
    }
  }, []);

  const fixTimings = () => {
    if (assetBooking.startDateTime.split(" ")[3] == "PM") {
      setStart(
        assetBooking.startDateTime.split(" ")[0] +
          " T " +
          (parseInt(assetBooking.startDateTime.split(" ")[2].split(":")[0]) +
            12) +
          ":00:00"
      );
    } else {
      setStart(
        assetBooking.startDateTime.split(" ")[0] +
          " T " +
          assetBooking.startDateTime.split(" ")[2] +
          ":00"
      );
    }
    if (assetBooking.endDateTime.split(" ")[3] == "PM") {
      setEnd(
        assetBooking.endDateTime.split(" ")[0] +
          " T " +
          (parseInt(assetBooking.endDateTime.split(" ")[2].split(":")[0]) +
            12) +
          ":00:00"
      );
    } else {
      setEnd(
        assetBooking.endDateTime.split(" ")[0] +
          " T " +
          assetBooking.endDateTime.split(" ")[2] +
          ":00"
      );
    }
  };

  const countTotal = () => {
    var start = assetBooking.startDateTime.split(" ").join("");
    var end = assetBooking.endDateTime.split(" ").join("");
    var startHour = "";
    var endHour = "";

    if (
      assetBooking.startDateTime.split(" ")[2].split(":")[0].split("").length ==
      1
    ) {
      startHour =
        "0" +
        assetBooking.startDateTime.split(" ")[2].split(":")[0].split("")[0];
      start =
        assetBooking.startDateTime.split(" ")[0] + "T" + startHour + ":00:00";
    }
    if (
      assetBooking.endDateTime.split(" ")[2].split(":")[0].split("").length == 1
    ) {
      endHour =
        "0" + assetBooking.endDateTime.split(" ")[2].split(":")[0].split("")[0];
      end = assetBooking.endDateTime.split(" ")[0] + "T" + endHour + ":00:00";
    }

    // count days and total
    var s = new Date(start);
    var e = new Date(end);
    var diff = (e.getTime() - s.getTime()) / 1000;

    diff /= 60 * 60;

    var assetTotal =
      Math.round(diff * parseInt(assetBooking.asset.price) * 100) / 100;

    var serviceTotal = 0;
    if (serviceBooking.length > 0) {
      for (let i = 0; i < serviceBooking.length; i++) {
        serviceTotal = serviceTotal + parseInt(serviceBooking[i].service.price);
      }
    }
    setTotalAmount(assetTotal + serviceTotal);
  };

  const orderList = () => {
    var newServiceArr = [];
    for (let i = 0; i < serviceBooking.length; i++) {
      newServiceArr = newServiceArr.filter(
        (s) => s.service !== serviceBooking[i].service
      );
      var bookedhours = serviceBooking.filter(
        (s) => s.service == serviceBooking[i].service
      );
      var hours = [];
      var whatever = [];
      for (let k = 0; k < bookedhours.length; k++) {
        hours.push(bookedhours[k].day + " " + bookedhours[k].show);
        if (bookedhours[k].time.split(":")[0].split("").length == 1) {
          whatever.push({
            hr24: bookedhours[k].day + "T0" + bookedhours[k].time,
            hr12: bookedhours[k].day + "T0" + bookedhours[k].show,
          });
        } else {
          whatever.push({
            hr24: bookedhours[k].day + "T" + bookedhours[k].time,
            hr12: bookedhours[k].day + "T" + bookedhours[k].show,
          });
        }
      }
      newServiceArr.push({
        service: serviceBooking[i].service,
        hours,
        whatever,
      });
    }

    //order timings
    for (let i = 0; i < newServiceArr.length; i++) {
      var arranged = [];
      var use = newServiceArr[i].whatever;
      if (use.length > 0) {
        var counter = use.length;
        while (counter > 0) {
          var min = use[0].hr24;
          var index = 0;
          for (let k = 0; k < use.length; k++) {
            if (new Date(min).getTime() > new Date(use[k].hr24).getTime()) {
              min = newServiceArr[i].whatever[k];
              index = k;
            }
          }
          arranged.push(use[index].hr12);
          use = use.filter((t, i) => i != index);
          counter = counter - 1;
        }
      }
      newServiceArr[i].hours = arranged;
    }
    setDisplayServices(newServiceArr);
  };
  ////////////////curremt change////////////////
  // const payLater = async () => {
  //   const handleBooking = firebase.functions().httpsCallable("handleBooking");
  //   var u = await db
  //     .collection("users")
  //     .doc(firebase.auth().currentUser.uid)
  //     .get();
  //   //user, asset, startDateTime, endDateTime, card, promotionCode,dateTime, status(true for complete, false for pay later)
  //   user = u.data();
  //   user.id = firebase.auth().currentUser.uid;
  //   user.points = user.points + 10;
  //   const response = await handleBooking({
  //     user: user,
  //     asset: assetBooking.asset,
  //     startDateTime: assetBooking.startDateTime,
  //     endDateTime: assetBooking.endDateTime,
  //     card: {
  //       cardNo: "",
  //       expiryDate: "",
  //       CVC: "",
  //       cardType: "",
  //       cardHolder: "",
  //     },
  //     promotionCode: null,
  //     dateTime: moment().format("YYYY-MM-DD T HH:mm"),
  //     status: true,
  //     addCreditCard: false,
  //     uid: firebase.auth().currentUser.uid,
  //     totalAmount: totalAmount,
  //     status: false,
  //     serviceBooking,
  //   });

  const payLater = async () => {
    const handleBooking = firebase.functions().httpsCallable("handleBooking");
    var user = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    var u = user.data();
    u.id = firebase.auth().currentUser.uid;
    //user, asset, startDateTime, endDateTime, card, promotionCode,dateTime, status(true for complete, false for pay later)

    const response = await handleBooking({
      user: u,
      asset: assetBooking.asset,
      startDateTime: assetBooking.startDateTime,
      endDateTime: assetBooking.endDateTime,
      card: {
        cardNo: "",
        expiryDate: "",
        CVC: "",
        cardType: "",
        cardHolder: "",
      },
      promotionCode: null,
      dateTime: moment().format("YYYY-MM-DD T HH:mm"),
      status: true,
      addCreditCard: false,
      uid: firebase.auth().currentUser.uid,
      totalAmount: totalAmount,
      status: false,
      serviceBooking,
    });

    props.navigation.navigate("Types");
  };
  return (
    <View style={styles.container}>
      {/* {console.log(assetBooking, "]]]]]]]]]]]]]]]]]]]]]]]]]]]]")} */}
      {/* <View style={{ backgroundColor: "yellow", flex: 0.5 }}></View> */}
      <View style={{ flex: 8 }}>
        <ScrollView>
          <View style={styles.all}>
            <View style={styles.card}>
              <Text
                style={{
                  marginLeft: "2%",
                  fontSize: 25,
                  color: "#185a9d",
                  padding: "2%",
                  fontWeight: "bold",
                  // textAlign:"center"
                }}
              >
                Booking Summary
              </Text>
              {/* <View
                style={{
                  borderBottomWidth: 1,
                  borderColor: "#185a9d",
                  width: "30%",
                  marginLeft: "10%",
                  marginTop: "-1%",
                }}
              ></View> */}
              <View
                style={{
                  // backgroundColor: "yellow",
                  width: "100%",
                  padding: "2%",
                  marginTop: "3%",
                  marginBottom: "3%",
                  // marginRight: "-2%",
                }}
              >
                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    backgroundColor: "#3ea3a3",
                    // backgroundColor: "#185a9d",
                    paddingTop: "1%",
                    paddingBottom: "1%",
                    // marginBottom: 5,
                  }}
                >
                  <View
                    style={{
                      width: "45%",
                      // backgroundColor: "yellow",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {assetBooking.startDateTime}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: "10%",
                      // backgroundColor: "green",
                      alignItems: "center",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={20}
                      color="white"
                    />
                  </View>
                  <View
                    style={{
                      width: "45%",
                      // backgroundColor: "yellow",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {assetBooking.endDateTime}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    backgroundColor: "#f0f0f0",
                    width: "100%",
                    padding: "2%",
                    flexDirection: "row",
                    // margin: "2%",
                    // marginRight: "-2%",
                  }}
                >
                  <View
                    style={{
                      width: "30%",
                      // backgroundColor: "red",
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#185a9d",
                        width: "90%",
                        // height: 70,
                        margin: 5,
                        alignItems: "center",
                        flexDirection: "row",
                        //elevation: 12,
                        borderWidth: 2,
                        borderColor: "#185a9d",
                        aspectRatio: 1 / 1,
                      }}
                      disabled
                    >
                      <View
                        style={{
                          height: "100%",
                          width: "100%",
                          justifyContent: "center",
                          textAlign: "center",
                          alignContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <MaterialCommunityIcons
                          name="car"
                          // name={props.assetIcon}
                          size={50}
                          color={"white"}
                        />
                        <Text
                          style={{
                            textAlign: "center",
                            color: "white",
                            fontSize: 18,
                            textTransform: "capitalize",
                          }}
                        >
                          {tName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      width: "70%",
                      paddingLeft: "3%",
                      justifyContent: "space-evenly",
                      // backgroundColor: "green"
                    }}
                  >
                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                      <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                        ITEM:{" "}
                      </Text>
                      <Text
                        style={{ fontSize: 16, textTransform: "capitalize" }}
                      >
                        {assetBooking.asset.name}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                      <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                        SECTION:{" "}
                      </Text>
                      <Text
                        style={{ fontSize: 16, textTransform: "capitalize" }}
                      >
                        {sName}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                      <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                        PRICE:{" "}
                      </Text>
                      <Text style={{ fontSize: 16 }}>
                        {assetBooking.asset.price} QR/Hour
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                      <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                        DESCRIPTION:{" "}
                      </Text>
                      <Text
                        style={{ fontSize: 16, textTransform: "capitalize" }}
                      >
                        {assetBooking.asset.description}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View style={{ marginBottom: "3%" }}></View>

            <View style={styles.card}>
              <Text
                style={{
                  marginLeft: "2%",
                  fontSize: 18,
                  color: "#474a47",
                  padding: "2%",
                  // textAlign: "center",
                }}
              >
                Services
              </Text>
              <View
                style={{
                  // backgroundColor: "red",
                  margin: "1%",
                  marginStart: "4%",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  minHeight: 100,
                  // justifyContent: "center",
                }}
              >
                {serviceBooking.length > 0 ? (
                  serviceBooking.map((s, i) => (
                    <View
                      style={{ width: "22%", aspectRatio: 1 / 1.5, margin: 4 }}
                    >
                      <TouchableOpacity
                        style={{
                          // backgroundColor: "#185a9d",
                          // width: "22%",
                          // height: 70,
                          // margin: 5,
                          alignItems: "center",
                          flexDirection: "row",
                          borderWidth: 3,
                          borderColor: "#185a9d",
                          // aspectRatio: 1 / 1,
                        }}
                        disabled
                      >
                        <View
                          style={{
                            height: "80%",
                            width: "100%",
                            justifyContent: "center",
                            textAlign: "center",
                            alignContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <MaterialCommunityIcons
                            name={s.service.serviceIcon}
                            size={30}
                            color={"#185a9d"}
                          />
                          <Text
                            style={{
                              textAlign: "center",
                              color: "#185a9d",
                              fontSize: 14,
                              textTransform: "capitalize",
                              // fontWeight: "bold",
                            }}
                          >
                            {s.service.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <View
                        style={{
                          backgroundColor: "#185a9d",
                          height: "20%",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: "white",
                            fontWeight: "bold",
                            padding: "2%",
                          }}
                        >
                          {(s.day, "", s.show)}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: "#3ea3a3",
                          fontWeight: "bold",
                          position: "absolute",
                          left: 5,
                          top: 2,
                        }}
                      >
                        #{i + 1}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View
                    style={{
                      paddingLeft: "2%",
                      paddingBottom: "1%",
                      paddingTop: "2%",
                    }}
                  >
                    <Text>No services added</Text>
                  </View>
                )}
              </View>
              {/* <Divider style={{ backgroundColor: "lightgray" }} /> */}
            </View>
          </View>
        </ScrollView>
      </View>
      {/* <View style={{ marginTop: "1%" }}></View> */}
      <View style={{ flex: 1, justifyContent: "center" }}>
        <View style={styles.bottomCard}>
          <View
            style={{
              width: "33%",
              // backgroundColor: "red",
              justifyContent: "center",
              // alignItems: "center",
              paddingLeft: "5%",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "#185a9d",
                fontWeight: "bold",
                // marginBottom: "2%",
              }}
            >
              TOTAL
            </Text>
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                // backgroundColor: "red",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  // color: "#0d1c38",
                  fontWeight: "bold",
                  marginBottom: "3%",
                }}
              >
                {totalAmount}
              </Text>
              <Text
                style={{
                  fontSize: 14.5,
                  // color: "#0d1c38",
                  fontWeight: "bold",
                  // marginBottom: "3%",
                  paddingLeft: 2,
                }}
              >
                QAR
              </Text>
            </View>
          </View>
          <View
            style={{
              // backgroundColor: "yellow",
              width: "65%",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <TouchableOpacity
              onPress={() => payLater()}
              style={styles.payLaterButton}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                PAY LATER
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                props.navigation.navigate("Payment", {
                  assetBooking: assetBooking,
                  serviceBooking: serviceBooking,
                  totalAmount: totalAmount,
                })
              }
              style={styles.payButton}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                PAY NOW
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

CheckOut.navigationOptions = {
  title: "CheckOut",
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
};
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",
    // width: Math.round(Dimensions.get("window").width),
    // height: Math.round(Dimensions.get("window").height),
  },
  header: {
    backgroundColor: "#e3e3e3",
    justifyContent: "flex-start",
    alignItems: "center",
    // height: "17%",
    // flex:1
  },
  footer: {
    flex: 0.1,
    flexDirection: "row",
    alignSelf: "center",
  },
  all: {
    flex: 0.6,
    width: "100%",
    alignContent: "center",
    textAlign: "center",
    alignSelf: "center",
  },
  card: {
    backgroundColor: "white",
    width: "100%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
  },
  bottomCard: {
    backgroundColor: "white",
    width: "100%",
    flex: 1,
    borderTopWidth: 1,
    // borderBottomWidth: 1,
    borderColor: "lightgray",
    flexDirection: "row",
  },
  text: {
    fontSize: 80,
    marginLeft: "4%",
    marginRight: "5%",
    marginBottom: "1%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  payButton: {
    backgroundColor: "#3ea3a3",
    height: 40,
    width: "60%",
    // alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 8,
    // marginBottom: 10,
  },
  payLaterButton: {
    backgroundColor: "#3ea3a3",
    height: 40,
    width: "34%",
    // alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    // padding: "1%",
    borderRadius: 8,
    // marginBottom: 10,
  },
  edit: {
    //backgroundColor: "#809cb0",
    height: 35,
    width: "13%",
    alignSelf: "flex-end",
    justifyContent: "center",
    alignItems: "center",
    marginEnd: "1%",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#809cb0",
  },
  delete: {
    //backgroundColor: "#d64231",
    height: 35,
    width: "10%",
    alignSelf: "flex-end",
    justifyContent: "center",
    alignItems: "center",
    marginEnd: "1%",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d64231",
  },
  text2: {
    fontSize: 30,
    marginBottom: "1%",
    alignItems: "center",
    flexDirection: "column",
    marginBottom: "2%",
  },
});
