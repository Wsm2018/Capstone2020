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
  SwipeableListView,
} from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db.js";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import { AsyncStorage } from "react-native";
import ExtendServices from "./ExtendServices";

export default function BookingHistory(props) {
  const [assetBookings, setAssetBookings] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [viewDetails, setViewDetails] = useState();
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [extension, setExtension] = useState();
  const [dateInput, showDateInput] = useState(false);
  const [addServices, setAddServices] = useState(false);

  useEffect(() => {
    getBookings();
    console.log("Booking History Page");
  }, []);

  const getBookings = () => {
    //payment has booking and user id
    db.collection("payments").onSnapshot((querySnapshot) => {
      const p = [];
      querySnapshot.forEach((doc) => {
        if (
          doc.data().assetBooking.user.id == firebase.auth().currentUser.uid
        ) {
          console.log("r u heere");
          p.push({ id: doc.id, ...doc.data() });
          setPayments([...p]);
        }
      });
    });

    db.collection("services").onSnapshot((querySnapshot) => {
      const p = [];
      querySnapshot.forEach((doc) => {
        p.push({ id: doc.id, ...doc.data(), bookings: "" });
      });
      setServices([...p]);
    });

    db.collection("users")
      .where("role", "==", "worker")
      .onSnapshot((snapshot) => {
        var worker = "";
        snapshot.forEach((doc) => {
          worker = { ...doc.data(), id: doc.id };

          var workerId = doc.id;
          db.collection("users")
            .doc(doc.id)
            .collection("schedules")
            .onSnapshot((snapshot) => {
              const schedules = [];
              snapshot.forEach((doc) => {
                schedules.push({ ...doc.data(), worker: workerId, id: doc.id });
              });
              var temp = workers;
              temp.push({ worker, schedules });
              setWorkers(temp);
            });
        });
      });
  };

  useEffect(() => {
    if (services) {
      for (let i = 0; i < services.length; i++) {
        db.collection("services")
          .doc(services[i].id)
          .collection("serviceBookings")
          .onSnapshot((querySnapshot) => {
            const p = [];
            querySnapshot.forEach((doc) => {
              p.push({ id2: doc.id, id: doc.id, ...doc.data() });
            });
            let temp = services;
            temp[i].bookings = [...p];
            setServiceBookings(temp);
          });
      }
    }
  }, [services]);

  useEffect(() => {
    if (viewDetails) {
      console.log("viewDetails.assetBooking", viewDetails.assetBooking);
      let bookedServices = [];
      let temp = viewDetails;
      for (let i = 0; i < serviceBookings.length; i++) {
        for (let k = 0; k < serviceBookings[i].bookings.length; k++) {
          if (
            serviceBookings[i].bookings[k].assetBooking.id ===
            viewDetails.assetBooking.id
          ) {
            bookedServices.push({
              id: serviceBookings[i].bookings[k].id2,
              dateTime: serviceBookings[i].bookings[k].dateTime,
              service: serviceBookings[i].bookings[k].service,
              worker: serviceBookings[i].bookings[k].worker,
            });
          }
        }
      }
      temp.bookedServices = bookedServices;
      setViewDetails(temp);
    }
  }, [viewDetails]);

  const cancelBooking = async () => {
    //delete Payment
    db.collection("payments").doc(viewDetails.id).delete();
    //delete asset booking
    db.collection("assets")
      .doc(viewDetails.assetBooking.asset.id)
      .collection("assetBookings")
      .doc(viewDetails.assetBooking.id)
      .delete();

    for (let i = 0; i < viewDetails.bookedServices.length; i++) {
      //update worker schedule
      var worker = workers.filter(
        (w) => w.worker.id == viewDetails.bookedServices[i].worker
      )[0];
      var sch = worker.schedules.filter(
        (s) => s.serviceBooking.assetBooking.id === viewDetails.assetBooking.id
      )[0];
      db.collection("users")
        .doc(viewDetails.bookedServices[i].worker)
        .collection("schedules")
        .doc(sch.id)
        .delete();
      //delete service booking
      db.collection("services")
        .doc(viewDetails.bookedServices[i].service.id)
        .collection("serviceBookings")
        .doc(viewDetails.bookedServices[i].id)
        .delete();
    }
    //update user points & balance
    var user = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    var points = parseInt(user.data().points) - 10;
    var status = viewDetails.status;
    if (status) {
      var balance = viewDetails.totalAmount + parseInt(90);
      db.collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({ points: points, balance: balance });
    } else {
      db.collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({ points: points });
    }
  };

  const extend = async () => {
    let bookingTemp = [];
    let bookings = await db
      .collection("assets")
      .doc(viewDetails.assetBooking.asset.id)
      .collection("assetBookings")
      .get();
    if (bookings) {
      bookings.forEach((b) => {
        bookingTemp.push(b.data());
      });
    }
    //console.log(" bookings", viewDetails.assetBooking.asset.id)

    var check = bookingTemp.filter(
      (assetBooking) =>
        (viewDetails.assetBooking.endDateTime <= assetBooking.startDateTime &&
          extension <= assetBooking.startDateTime) ||
        (viewDetails.assetBooking.endDateTime >= assetBooking.endDateTime &&
          extension >= assetBooking.endDateTime)
    );

    console.log("after checking time", check);
    setAddServices(check.length == bookingTemp.length);
  };

  useEffect(() => {
    if (extension) {
      extend();
    }
  }, [extension]);

  return (
    <View style={styles.container}> 
    
    <Text style={{paddingTop:'50%', fontSize:30}}>Booking History</Text>
    <View
      style={{ backgroundColor: "#F0F8FF", height: "100%", paddingTop: 10 }}
    >

      {payments && !viewDetails
        ? payments.map((p) => (
            <TouchableOpacity onPress={() => setViewDetails(p)}>
              <Text>{p.id}</Text>
              <Text>{p.totalAmount}</Text>
              <Text>{!p.status ? "Not Payed" : null}</Text>
            </TouchableOpacity>
          ))
        : null}

      {viewDetails ? (
        <View>
          <Text>{viewDetails.id}</Text>
          <Text>{viewDetails.assetBooking.startDateTime}</Text>
          <Text>{viewDetails.assetBooking.endDateTime}</Text>
          {/* <Button title={"edit"} onPress={}/> */}
          <Button title={"cancel"} onPress={() => cancelBooking()} />
          <Button
            title={"Back"}
            onPress={() => setViewDetails() || showDateInput(false)}
          />
          <Button title={"extend"} onPress={() => showDateInput(true)} />
        </View>
      ) : null}

      {dateInput ? (
        <DatePicker
          style={{ width: 200 }}
          //is24Hour
          minuteInterval={15}
          date={extension}
          mode="datetime"
          placeholder="select a Start date"
          format="YYYY-MM-DD T h:mm A"
          minDate={viewDetails.assetBooking.endDateTime}
          maxDate={moment().add(3, "month")}
          minTime={moment(viewDetails.assetBooking.endDateTime).format()}
          confirmBtnText="Confirm"
          cancelBtnText="Cancel"
          customStyles={{
            dateIcon: {
              position: "absolute",
              left: 0,
              top: 4,
              marginLeft: 0,
            },
            dateInput: {
              marginLeft: 36,
            },
            // ... You can check the source to find the other keys.
          }}
          onDateChange={setExtension}
        />
      ) : null}
      {addServices ? (
        <ExtendServices
          //sName={selectedSection.name}
          //tName={tName}
          asset={viewDetails.assetBooking.asset}
          startDateTime={viewDetails.endDateTime}
          endDateTime={extension}
          //type={type}
          navigation={props.navigation}
        />
      ) : extension ? (
        <Text>Not Available to extend</Text>
      ) : null}
    </View>
    </View>
  
  );
}

BookingHistory.navigationOptions = {
  title: "BookingHistory",
};
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 40,
    borderColor: "#284057",
    borderWidth: 1,
    width: "60%",
    backgroundColor: "white",
    paddingLeft: 7,
  },
  label: {
    fontSize: 15,
    color: "#284057",
    width: "30%",
    fontWeight: "bold",
  },
}); //backgroundColor:"white" fontWieght:"bold" , paddingLeft: 5
