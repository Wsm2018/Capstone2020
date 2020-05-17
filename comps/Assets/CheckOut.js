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
import { AsyncStorage } from "react-native";
import { CheckBox } from "react-native-elements";
import { Divider } from "react-native-paper";
import LottieView from "lottie-react-native";

export default function CheckOut(props) {
  const tName = props.navigation.getParam("tName", "failed");
  const sName = props.navigation.getParam("sName", "failed");
  const assetBooking = props.navigation.getParam(
    "assetBooking",
    "some default value"
  );
  //const [assetBooking, setAssetBooking] = useState({ asset: { id: "5uhqZwCDvQDH13OhKBJf", price: 100 }, startDateTime: "2020-05-15T01:00", endDateTime: "2020-05-16T08:00" })

  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (assetBooking) {
      console.log("assset -----------------------", assetBooking.asset.price);

      var split1 = assetBooking.startDateTime.split(" ");
      var split2 = assetBooking.endDateTime.split(" ");

      var start = split1.join("");
      var end = split2.join("");

      var s = new Date(start);
      var e = new Date(end);
      var diff = (e.getTime() - s.getTime()) / 1000;
      console.log("diff 40-----------------------", diff);
      diff /= 60 * 60;
      console.log("diff 42-----------------------", diff);
      var totalAmount1 =
        Math.round(diff * parseInt(assetBooking.asset.price) * 100) / 100;
      setTotalAmount(totalAmount1);

      //             const hours = Math.floor(
      //                 Math.abs(
      //                   new Date().getTime(assetBooking.endDateTime) -  new Date().getTime(assetBooking.startDateTime)
      //                 ) / 36e5
      //               );
      //               console.log("**********hours",  hours)
      // setTotalAmount(hours * parseInt(assetBooking.asset.price))
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
    });

    props.navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <Text
        style={{
          fontSize: 25,
          color: "darkgray",
          marginLeft: "5%",
          marginTop: "3%",
        }}
      >
        Checkout Summary
      </Text>
      <View style={styles.all}>
        <View style={styles.text}>
          <Text style={{ fontSize: 16, color: "gray" }}>Type Name</Text>
          <Text style={{ fontSize: 16 }}>{tName}</Text>
        </View>
        <View style={styles.text}>
          <Text style={{ fontSize: 16, color: "gray" }}>Section name</Text>
          <Text style={{ fontSize: 16 }}> {sName}</Text>
        </View>
        <View style={styles.text}>
          <Text style={{ fontSize: 16, color: "gray" }}>Amount</Text>
          <Text style={{ fontSize: 16 }}>{totalAmount} QAR </Text>
        </View>
        <View style={styles.text}>
          <Text style={{ fontSize: 16, color: "gray" }}>Price</Text>
          <Text style={{ fontSize: 16 }}>
            {" "}
            {assetBooking.asset.price} Per Hour
          </Text>
        </View>
        <View style={styles.text}>
          <Text style={{ fontSize: 16, color: "gray" }}>
            Start Date and Time{" "}
          </Text>
          <Text style={{ fontSize: 16 }}>{assetBooking.startDateTime}</Text>
        </View>
        <View style={styles.text}>
          <Text style={{ fontSize: 16, color: "gray" }}>
            End Date and Time{" "}
          </Text>
          <Text style={{ fontSize: 16 }}>{assetBooking.endDateTime}</Text>
        </View>
        <View
          style={{
            //width: "30%",
            flex: 0.4,
            flexDirection: "row",
            alignSelf: "center",
          }}
        >
          <TouchableOpacity
            onPress={() =>
              props.navigation.navigate("Payment", {
                assetBooking: assetBooking,
              })
            }
            style={styles.registerButton}
          >
            <Text style={{ color: "white" }}>PAY NOW</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => payLater()}
            style={styles.registerButton}
          >
            <Text style={{ color: "white" }}>PAY LATER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    //backgroundColor: "green",
    //justifyContent: "center",
    // alignContent: "center",
    // alignItems: "center",
    // // backgroundColor: "purple",
    // fontSize: 20,
    // marginTop: "10%",
  },
  all: {
    flex: 0.6,
    marginTop: "2%",
    //backgroundColor: "green",
    //justifyContent: "center",
    // alignContent: "",
    // alignItems: "center",
    // backgroundColor: "purple",
    fontSize: 30,
    width: "90%",
    // alignContent: "center",
    // textAlign: "center",
    alignSelf: "center",
    //marginTop: "10%",
    flexDirection: "column",
    elevation: 20,
    // width: "100%",
    // marginBottom: "5%",
    // marginTop: "5%",
    backgroundColor: "white",
  },
  text: {
    flex: 0.1,
    fontSize: 80,
    marginTop: "5%",
    marginLeft: "5%",
    marginRight: "10%",
    // marginBottom: "5%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  registerButton: {
    backgroundColor: "#20365F",
    height: 40,
    width: "40%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 18,
    // marginRight:8,
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 10,
    marginBottom: 10,
  },
  text2: {
    flex: 0.5,
    fontSize: 30,
    //backgroundColor: "green",
    //justifyContent: "center",
    // alignContent: "",
    alignItems: "center",
    //  backgroundColor: "purple",
    //marginTop: "10%",
    flexDirection: "column",
    marginBottom: "5%",
  },
});
