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
      user: user.data(),
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

    props.navigation.navigate("Home");
  };
  return (
    <ScrollView style={styles.container}>
      {/* {console.log(
        "-=-=-=-==-=-=-=-=-=-serviceBooking",
        serviceBooking,
        "--assetBooking",
        assetBooking,
        "--tName",
        tName,
        "--sName",
        sName
      )} */}
      <View style={styles.header}>
        <LottieView
          source={require("../../assets/trialimages/7337-credit-card-check-animation.json")}
          autoPlay
          loop
          style={{
            position: "relative",
            width: "50%",
            backgroundColor: "#e3e3e3",
            alignItems: "center",
            justifyContent: "flex-end",
            alignContent: "center",
            alignSelf: "center",
          }}
        />
      </View>
      <View style={styles.all}>
        <View style={styles.card}>
          <Text
            style={{
              marginLeft: "2%",
              fontSize: 22,
              color: "#474a47",
              padding: "2%",
              // textAlign:"center"
            }}
          >
            Booking Summary
          </Text>
          <View style={styles.text}>
            <Text style={{ fontSize: 15, color: "gray", marginTop: "1%" }}>
              Type
            </Text>
            <Text style={{ fontSize: 15, marginTop: "1%" }}>{tName}</Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 15, color: "gray" }}>Section</Text>
            <Text style={{ fontSize: 15 }}> {sName}</Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 15, color: "gray" }}>Item</Text>
            <Text style={{ fontSize: 15 }}> {assetBooking.asset.name}</Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 15, color: "gray" }}>
              Start Date & Time
            </Text>
            <Text style={{ fontSize: 15 }}>{assetBooking.startDateTime}</Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 15, color: "gray" }}>End Date & Time</Text>
            <Text style={{ fontSize: 15 }}>{assetBooking.endDateTime}</Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 15, color: "gray" }}>Price Per Hour</Text>
            <Text style={{ fontSize: 15 }}>{assetBooking.asset.price} QAR</Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 15, color: "gray", marginBottom: "3%" }}>
              Amount
            </Text>
            <Text style={{ fontSize: 15 }}>{totalAmount} QAR </Text>
          </View>
          {/* <View
            style={{
              flexDirection: "row",
              backgroundColor: "#f5f5f5",
              padding: "2%",
              margin: "2%",
            }}
          >
            <View style={{ width: "30%" }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#20365F",
                  width: 70,
                  height: 70,
                  margin: 5,
                  alignItems: "center",
                  flexDirection: "row",
                  //elevation: 12,
                  borderWidth: 2,
                  borderColor: "#20365F",
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
                    size={30}
                    color={"white"}
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      color: "white",
                      fontSize: 15,
                    }}
                  >
                    
                    {tName}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ width: "70%" }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                <Text style={{ fontWeight: "bold" }}>Price: </Text>
                <Text></Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                <Text style={{ fontWeight: "bold" }}>Description: </Text>
                <Text></Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                <Text style={{ fontWeight: "bold" }}>Average Rating:</Text>
                <Text></Text>
              </View>
            </View>
          </View> */}
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
            Service(s)
          </Text>
          {serviceBooking.length > 0 ? (
            serviceBooking.map((s, i) => (
              <View>
                <View style={styles.text}>
                  <Text
                    style={{ fontSize: 15, color: "gray", marginTop: "1%" }}
                  >
                    Service #{i + 1}
                  </Text>
                  <Text style={{ fontSize: 15, marginTop: "1%" }}>
                    {s.service.name}
                  </Text>
                </View>
                <View style={styles.text}>
                  <Text style={{ fontSize: 15, color: "gray" }}>
                    Date & Time
                  </Text>
                  <Text style={{ fontSize: 15 }}>{(s.day, "", s.show)} </Text>
                </View>
                <View style={styles.text}>
                  <Text style={{ fontSize: 15, color: "gray" }}>
                    Price Per Hour
                  </Text>
                  <Text style={{ fontSize: 15 }}>{s.service.price} QAR</Text>
                </View>

                <View style={styles.text}>
                  <Text
                    style={{ fontSize: 15, color: "gray", marginBottom: "3%" }}
                  >
                    Amount
                  </Text>
                  <Text style={{ fontSize: 15, marginBottom: "3%" }}>
                    {s.service.price} QAR
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignSelf: "flex-end" }}>
                  {/* <TouchableOpacity
                  onPress={() => payLater()}
                  style={styles.edit}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    <Feather name="edit-3" size={24} color="#809cb0" />
                  </Text>
                </TouchableOpacity> */}
                  {/* <TouchableOpacity
                  onPress={() => payLater()}
                  style={styles.delete}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    <FontAwesome name="remove" size={20} color="#d64231" />
                  </Text>
                </TouchableOpacity> */}
                </View>
              </View>
            ))
          ) : (
            <View style={{ paddingLeft: "4%", paddingBottom: "1%" }}>
              <Text>No services added</Text>
            </View>
          )}
          {/* <Divider style={{ backgroundColor: "lightgray" }} /> */}
        </View>
        <View style={{ marginTop: "3%" }}></View>
        <View style={styles.card}>
          <View style={styles.text}>
            <Text style={{ fontSize: 15, color: "gray", marginTop: "3%" }}>
              Subtotal
            </Text>
            <Text style={{ fontSize: 15, marginTop: "3%" }}>
              {/* {subtotal} QAR (Backend code needed) */}
            </Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 15, color: "gray" }}>Discount</Text>
            <Text style={{ fontSize: 15 }}> 50% (Backend needed)</Text>
          </View>
          <View style={styles.text}>
            <Text
              style={{
                fontSize: 16,
                color: "#0d1c38",
                fontWeight: "bold",
                marginBottom: "3%",
              }}
            >
              Total
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#0d1c38",
                fontWeight: "bold",
                marginBottom: "3%",
              }}
            >
              {totalAmount} QAR (Backend needed)
            </Text>
          </View>
          <Card.Actions>
            <TouchableOpacity
              onPress={() =>
                props.navigation.navigate("Payment", {
                  assetBooking: assetBooking,
                })
              }
              style={styles.payButton}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Pay Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => payLater()}
              style={styles.payButton}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Pay Later
              </Text>
            </TouchableOpacity>
          </Card.Actions>
        </View>
        {/*service*/}
        {/* {displayServices.map((s) => (
          <View>
            <Text>Service: {s.service.name}</Text>
            <Text>Price Per Hour {s.service.price}</Text>

            <Text>Total: {s.service.price * s.hours.length}</Text>
            <Text>Bookings</Text>
            {s.hours.map((h) => (
              <Text>{h}</Text>
            ))}
          </View>
        ))} */}
      </View>
    </ScrollView>
  );
}

CheckOut.navigationOptions = {
  title: "CheckOut",
  headerStyle: { backgroundColor: "#20365F" },
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
  text: {
    fontSize: 80,
    marginLeft: "4%",
    marginRight: "5%",
    marginBottom: "1%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  payButton: {
    backgroundColor: "#519153",
    height: 40,
    width: "45%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 10,
    marginBottom: 10,
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
