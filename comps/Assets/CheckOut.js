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
  Dimensions,
} from "react-native";
import { Card } from "react-native-paper";
import { FontAwesome, Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import firebase from "firebase/app";
import "firebase/functions";
import "firebase/auth";
import db from "../../db";
import moment from "moment";
import { Divider } from "react-native-elements";

export default function CheckOut(props) {
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
  const [displayServices2, setDisplayServices2] = useState([
    {
      ServiceName: "Name #1",
      Service: "Petrol",
      PricePerHour: 10,
      Total: 100,
      hours: "12:30 AM",
    },
  ]);
  const [displayServices3, setDisplayServices3] = useState([
    {
      ServiceNo: "Service Name #1",
      Service: "Petrol",
      PricePerHour: 10,
      Total: 10,
      hours: "8:30 AM",
    },
    {
      ServiceNo: "Service Name #2",
      Service: "Car wash",
      PricePerHour: 10,
      Total: 100,
      hours: "9:30",
    },
    {
      ServiceNo: "Service Name #3",
      Service: "Valet",
      PricePerHour: 10,
      Total: 10,
      hours: "10:30 AM",
    },
  ]);
  //const [assetBooking, setAssetBooking] = useState({ asset: { id: "5uhqZwCDvQDH13OhKBJf", price: 100 }, startDateTime: "2020-05-15T01:00", endDateTime: "2020-05-16T08:00" })

  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (assetBooking) {
      console.log("assset -----------------------", assetBooking.asset.price);

      var start = assetBooking.startDateTime.split(" ").join("");
      var end = assetBooking.endDateTime.split(" ").join("");

      //fix the hour if between 1 - 9
      var startHour = "";
      var endHour = "";

      if (
        assetBooking.startDateTime.split(" ")[2].split(":")[0].split("")
          .length == 1
      ) {
        startHour =
          "0" +
          assetBooking.startDateTime.split(" ")[2].split(":")[0].split("")[0];
        start =
          assetBooking.startDateTime.split(" ")[0] + "T" + startHour + ":00:00";
      }
      if (
        assetBooking.endDateTime.split(" ")[2].split(":")[0].split("").length ==
        1
      ) {
        endHour =
          "0" +
          assetBooking.endDateTime.split(" ")[2].split(":")[0].split("")[0];
        end = assetBooking.endDateTime.split(" ")[0] + "T" + endHour + ":00:00";
      }

      console.log("start", startHour, "end", endHour);

      var s = new Date(start);
      var e = new Date(end);
      var diff = (e.getTime() - s.getTime()) / 1000;
      //console.log("diff 40-----------------------",diff , s, e)
      diff /= 60 * 60;
      //console.log("diff 42-----------------------",diff)
      var assetTotal =
        Math.round(diff * parseInt(assetBooking.asset.price) * 100) / 100;
      //console.log("total asset",assetTotal)
      var serviceTotal = 0;
      if (serviceBooking.length > 0) {
        for (let i = 0; i < serviceBooking.length; i++) {
          serviceTotal =
            serviceTotal + parseInt(serviceBooking[i].service.price);
        }
      }
      //console.log("total service",serviceTotal)
      setTotalAmount(assetTotal + serviceTotal);

      //get all booked services
      var newServiceArr = [];
      for (let i = 0; i < serviceBooking.length; i++) {
        // console.log("here 67")
        newServiceArr = newServiceArr.filter(
          (s) => s.service !== serviceBooking[i].service
        );
        // console.log(" resulttt", newServiceArr)
        //get booked hours of service
        var bookedhours = serviceBooking.filter(
          (s) => s.service == serviceBooking[i].service
        );
        var hours = [];
        for (let k = 0; k < bookedhours.length; k++) {
          // console.log("73")
          hours.push(bookedhours[k].day + "T" + bookedhours[k].time);
        }
        newServiceArr.push({ service: serviceBooking[i].service, hours });
        ///console.log(" new",newServiceArr)
      }
      setDisplayServices(newServiceArr);
      //console.log(" ahaa??", displayServices)
      // add the hours of each
    }
  }, []);

  const payLater = async () => {
    const handleBooking = firebase.functions().httpsCallable("handleBooking");
    const user = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
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
              fontSize: 18,
              color: "#474a47",
              padding: "2%",
            }}
          >
            Parking Summary
          </Text>
          <View style={styles.text}>
            <Text style={{ fontSize: 15, color: "gray", marginTop: "1%" }}>
              Type Name
            </Text>
            <Text style={{ fontSize: 15, marginTop: "1%" }}>{tName}</Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 15, color: "gray" }}>Section name</Text>
            <Text style={{ fontSize: 15 }}> {sName}</Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 15, color: "gray" }}>
              Start Date and Time{" "}
            </Text>
            <Text style={{ fontSize: 15 }}>{assetBooking.startDateTime}</Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 15, color: "gray" }}>
              End Date and Time{" "}
            </Text>
            <Text style={{ fontSize: 15 }}>{assetBooking.endDateTime}</Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 15, color: "gray" }}>Price Per Hour</Text>
            <Text style={{ fontSize: 15 }}>
              {" "}
              {assetBooking.asset.price} QAR
            </Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 15, color: "gray", marginBottom: "3%" }}>
              Amount
            </Text>
            <Text style={{ fontSize: 15 }}>{totalAmount} QAR </Text>
          </View>
          {/* <TouchableOpacity onPress={() => payLater()} style={styles.edit}>
            <Text style={{ color: "white", fontWeight: "bold" }}>
              <Feather name="edit-3" size={24} color="#809cb0" />
            </Text>
          </TouchableOpacity> */}
        </View>
        <View style={{ marginBottom: "3%" }}></View>

        <View style={styles.card}>
          <Text
            style={{
              marginLeft: "2%",
              fontSize: 18,
              color: "#474a47",
              padding: "2%",
            }}
          >
            Service/s Summary
          </Text>
          {displayServices3.map((s) => (
            <View>
              <View style={styles.text}>
                <Text style={{ fontSize: 15, color: "gray", marginTop: "1%" }}>
                  {s.ServiceNo}
                </Text>
                <Text style={{ fontSize: 15, marginTop: "1%" }}>
                  {s.Service}
                </Text>
              </View>
              <View style={styles.text}>
                <Text style={{ fontSize: 15, color: "gray" }}>Time</Text>
                <Text style={{ fontSize: 15 }}>{s.hours} </Text>
              </View>
              <View style={styles.text}>
                <Text style={{ fontSize: 15, color: "gray" }}>
                  Price Per Hour
                </Text>
                <Text style={{ fontSize: 15 }}>{s.PricePerHour} QAR</Text>
              </View>

              <View style={styles.text}>
                <Text
                  style={{ fontSize: 15, color: "gray", marginBottom: "3%" }}
                >
                  Amount
                </Text>
                <Text style={{ fontSize: 15, marginBottom: "3%" }}>
                  {s.Total} QAR
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
          ))}
          {/* <Divider style={{ backgroundColor: "lightgray" }} /> */}
        </View>
        <View style={{ marginTop: "3%" }}></View>
        <View style={styles.card}>
          <View style={styles.text}>
            <Text style={{ fontSize: 15, color: "gray", marginTop: "3%" }}>
              Subtotal
            </Text>
            <Text style={{ fontSize: 15, marginTop: "3%" }}>120 QAR</Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 15, color: "gray" }}>Discount</Text>
            <Text style={{ fontSize: 15 }}> 50%</Text>
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
              60 QAR
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
    backgroundColor: "#00152B",
    justifyContent: "flex-start",
    alignItems: "center",
    height: "17%",
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
