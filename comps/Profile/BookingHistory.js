import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Modal,
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
import "firebase/functions";
import db from "../../db.js";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import { AsyncStorage } from "react-native";
import ExtendServices from "./ExtendServices";
import { getIconType, Header, Card, Divider } from "react-native-elements";
import { FlatList } from "react-native";
import {
  FontAwesome5,
  Fontisto,
  Ionicons,
  AntDesign,
} from "@expo/vector-icons";

export default function BookingHistory(props) {
  const [assetBookings, setAssetBookings] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [newServiceBookings, setNewServiceBookings] = useState([]);
  const [newShow, setNewShow] = useState([]);
  const [newUserDays, setNewUserDays] = useState([]);
  const serviceTotal = useRef();
  const total = useRef();
  const assetTotal = useRef();
  const [payments, setPayments] = useState([]);
  const [viewDetails, setViewDetails] = useState();
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [extension, setExtension] = useState();
  const [dateInput, showDateInput] = useState(false);
  const [addServices, setAddServices] = useState(false);
  const [typeId, setTypeId] = useState();
  const [accepted, setAccepted] = useState();
  const [updateAvailableTimings, setUpdateAvailableTimings] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [assetBookingTotal, setAssetBookingTotal] = useState(0);
  const [serviceBookingTotal, setServiceBookingTotal] = useState(0);
  const [assetTypes, setAssetTypes] = useState([]);
  const [assetSections, setAssetSections] = useState([]);
  const [displayServices, setDisplayServices] = useState([]);
  const SB = useRef();

  //Card styling
  const [historyDetails, setHistoryDetails] = useState(false);

  useEffect(() => {
    getBookings();
  }, []);

  const getBookings = () => {
    //payment has booking and user id
    db.collection("payments").onSnapshot((querySnapshot) => {
      const p = [];
      querySnapshot.forEach((doc) => {
        if (
          doc.data().assetBooking.user.id == firebase.auth().currentUser.uid
        ) {
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
      .where("role", "==", "service worker")
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
              //console.log("worker",temp)
              setWorkers(temp);
            });
        });
      });

    db.collection("assetTypes").onSnapshot((querySnapshot) => {
      const p = [];
      querySnapshot.forEach((doc) => {
        p.push({ id: doc.id, ...doc.data() });
      });
      setAssetTypes([...p]);
    });

    db.collection("assetSections").onSnapshot((querySnapshot) => {
      const p = [];
      querySnapshot.forEach((doc) => {
        p.push({ id: doc.id, ...doc.data() });
      });
      setAssetSections([...p]);
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
      orderList();
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
      //console.log("worker schedule", worker)
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

    if (viewDetails.status) {
      db.collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({
          points: parseInt(user.data().points) - 10,
          balance: viewDetails.totalAmount + parseInt(user.data().balance),
        });
    } else {
      db.collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({ points: parseInt(user.data().points) - 10 });
    }
    back();
  };

  const checkExtension = async () => {
    if (viewDetails) {
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

      var check = bookingTemp.filter(
        (assetBooking) =>
          (viewDetails.assetBooking.endDateTime <= assetBooking.startDateTime &&
            extension <= assetBooking.startDateTime) ||
          (viewDetails.assetBooking.endDateTime >= assetBooking.endDateTime &&
            extension >= assetBooking.endDateTime)
      );

      setAccepted(check.length == bookingTemp.length);
      //get asset type id
      var type = await db
        .collection("assetSections")
        .doc(viewDetails.assetBooking.asset.assetSection)
        .get();
      setTypeId(type.data().assetType);
    }
  };

  useEffect(() => {
    if (accepted && viewDetails) {
      var start = viewDetails.assetBooking.endDateTime;
      var end = "";
      if (extension.split(" ")[3] == "PM") {
        end =
          extension.split(" ")[0] +
          " T " +
          (parseInt(extension.split(" ")[2].split(":")[0]) + 12) +
          ":00:00";
      } else {
        end = extension.split(" ")[0] + " T " + extension.split(" ")[2] + ":00";
      }
      if (end.split("T")[1].split(":")[0].split("").length == 1) {
        end = end.split("T")[0] + "T0" + end.split("T")[1];
      }

      if (start.split("T")[1].split(":")[0].split("").length == 2) {
        start = start.split("T")[0] + "T0" + start.split("T")[1];
      }

      // count days and total
      var s = new Date(start.split(" ").join(""));
      var e = new Date(end.split(" ").join(""));
      var diff = (e.getTime() - s.getTime()) / 1000;
      diff /= 60 * 60;

      var assetTotal =
        Math.round(
          diff * parseInt(viewDetails.assetBooking.asset.price) * 100
        ) / 100;
      setTotalAmount(assetTotal);
      // total.current = assetTotal
      // assetTotal.current = assetTotal
      setAssetBookingTotal(assetTotal);
    }
  }, [accepted]);

  useEffect(() => {
    if (extension) {
      setNewServiceBookings([]);
      // setExtension()
      setAccepted(false);
      checkExtension();
    }
  }, [extension]);

  useEffect(() => {
    var serviceT = 0;
    if (newServiceBookings.length > 0) {
      for (let i = 0; i < newServiceBookings.length; i++) {
        serviceT = serviceT + parseInt(newServiceBookings[i].service.price);
      }
      setTotalAmount(totalAmount + serviceT);
      setServiceBookingTotal(serviceT);
    }
  }, [newServiceBookings]);

  const getServiceBookings = (bookings, show, userdays, updateAvailable) => {
    if (bookings) {
      setNewServiceBookings(bookings);
    }

    setNewShow(show);
    //setNewUserDays(userdays)
    setAddServices(false);
  };

  const back = () => {
    setViewDetails();
    showDateInput(false);
    setAddServices(false);
    setExtension();
    setNewShow([]);
    setNewServiceBookings([]);
    setAssetBookingTotal();
    setAccepted();
    setServiceBookingTotal();
    setTotalAmount();
    setDisplayServices();
    //getBookings()
  };

  const confirm = async () => {
    Alert.alert("Payment", "", [
      { text: "Pay Now?", onPress: () => pay("now") },

      { text: "Pay Later", onPress: () => pay("later") },
      { text: "Cancel", onPress: () => console.log("No Pressed") },
    ]);
  };

  const pay = async (paymentStat) => {
    var u = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    var user = u.data();
    user.id = firebase.auth().currentUser.uid;

    var endDateTime = "";

    if (extension.split(" ")[3] == "PM") {
      endDateTime =
        extension.split(" ")[0] +
        " T " +
        (parseInt(extension.split(" ")[2].split(":")[0]) + 12) +
        ":00:00";
    } else {
      endDateTime =
        extension.split(" ")[0] + " T " + extension.split(" ")[2] + ":00";
    }

    const handleBooking = firebase.functions().httpsCallable("handleBooking");
    const editBooking = firebase.functions().httpsCallable("editBooking");
    if (viewDetails.status) {
      if (paymentStat == "later") {
        //payed and pay later
        const response = await handleBooking({
          user: user,
          asset: viewDetails.assetBooking.asset,
          startDateTime: viewDetails.assetBooking.endDateTime,
          endDateTime: endDateTime,
          card: {
            cardNo: "",
            expiryDate: "",
            CVC: "",
            cardType: "",
            cardHolder: "",
          },
          promotionCode: null,
          dateTime: moment().format("YYYY-MM-DD T HH:mm"),
          addCreditCard: false,
          uid: firebase.auth().currentUser.uid,
          totalAmount: totalAmount,
          status: false,
          serviceBooking: newServiceBookings,
        });
      } else {
        //if payed and pay now
        console.log("337");

        props.navigation.navigate("Payment", {
          assetBooking: {
            asset: viewDetails.assetBooking.asset,
            startDateTime: viewDetails.assetBooking.endDateTime,
            endDateTime,
            user,
          },
          serviceBooking: newServiceBookings,
          totalAmount: totalAmount,
        });
      }
      console.log("367");
    } else {
      if (paymentStat == "later") {
        //not payed and paylater
        const response = await editBooking({
          paymentId: viewDetails.id,
          endDateTime: endDateTime,
          assetBooking: viewDetails.assetBooking,
          totalAmount: totalAmount + viewDetails.totalAmount,
          status: false,
          serviceBooking: newServiceBookings,
        });
        //back()
      } else {
        //if not payed and pay now
        console.log(
          "---------------------------------------",
          totalAmount + parseInt(viewDetails.totalAmount)
        );
        props.navigation.navigate("Payment", {
          oldPayment: viewDetails,
          serviceBooking: newServiceBookings,
          totalAmount: totalAmount + parseInt(viewDetails.totalAmount),
          assetBooking: {
            asset: viewDetails.assetBooking.asset,
            startDateTime: viewDetails.assetBooking.startDateTime,
            endDateTime: endDateTime,
            user,
          },
        });
      }
    }

    //back()
  };

  const getType = (s) => {
    var section = assetSections.filter((o) => o.id == s)[0];
    var type = assetTypes.filter((o) => o.id == section.assetType)[0];
    console.log("Type Name: ", type.name);
    return type.name;
  };

  const getSection = (s) => {
    var section = assetSections.filter((o) => o.id == s)[0];
    return section.name;
  };

  const orderList = () => {
    var newServiceArr = [];

    for (let i = 0; i < services.length; i++) {
      var s = viewDetails.bookedServices.filter(
        (b) => b.service.id == services[i].id
      );

      if (s.length > 0) {
        var timings = [];
        for (let k = 0; k < s.length; k++) {
          timings.push(s[k].dateTime);
        }
        newServiceArr.push({ service: services[i].name, timings });
      }
    }

    var newOrder = [];

    for (let i = 0; i < newServiceArr.length; i++) {
      var min = "";
      var counter = newServiceArr[i].timings.length;
      var use = newServiceArr[i].timings;
      newOrder.push({ service: newServiceArr[i].service, timings: [] });
      while (counter > 0) {
        var min = use[0];
        for (let k = 0; k < use.length; k++) {
          if (min.split("T")[1].split(":")[0].split("").length == 1) {
            min = min.split("T")[0] + "T0" + min.split("T")[1];
          }
          if (use[k].split("T")[1].split(":")[0].split("").length == 1) {
            use[k] = use[k].split("T")[0] + "T0" + use[k].split("T")[1];
          }

          if (new Date(min).getTime() > new Date(use[k]).getTime()) {
            min = use[k];
            //index = k
          }
        }
        newOrder[i].timings.push(min);

        use = use.filter((m) => m != min);
        counter = counter - 1;
      }
    }
    setDisplayServices(newOrder);
    SB.current = newOrder;
  };

  const converte = (hour) => {
    if (parseInt(hour.split("T")[1].split(":")[0]) == 0) {
      return "12:00 AM";
    } else if (parseInt(hour.split("T")[1].split(":")[0]) >= 13) {
      return parseInt(hour.split("T")[1].split(":")[0]) - 12 + ":00 PM";
    } else {
      return parseInt(hour.split("T")[1].split(":")[0]) + ":00 AM";
    }
  };

  return (
    <View
      style={{
        backgroundColor: "#e3e3e3",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        flex: 1,
      }}
    >
      <Header
        containerStyle={{ backgroundColor: "#185a9d" }}
        //leftComponent={{ icon: 'menu', color: '#fff' }}
        centerComponent={{
          text: "My Bookings History",
          style: { color: "#fff", fontSize: 22 },
        }}
        // rightComponent={{ icon: 'home', color: '#fff' }}
      />
      <ScrollView
        style={{ backgroundColor: "#e3e3e3", width: "100%" }}
        // contentContainerStyle={{
        //   alignItems: "center",
        //   justifyContent: "center",
        // }}
      >
        {accepted && viewDetails ? (
          <View style={{ backgroundColor: "red" }}>
            <Text>total : {totalAmount}</Text>
            <Text>total Asset : {assetBookingTotal} </Text>
          </View>
        ) : null}

        {payments && !viewDetails ? (
          <FlatList
            data={payments}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <Card
                containerStyle={{
                  width: "90%",
                  marginLeft: "5%",
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#185a9d",
                }}
                title={
                  <View style={{ paddingTop: "3%", padding: "2%" }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-start",
                      }}
                    >
                      {/* <Text>
            {getType(item.assetBooking.asset.assetSection) ===
            "Parking" ? (
              <FontAwesome5 name="car" size={24} color="black" />
            ) : (
              <Fontisto name="room" size={24} color="black" />
            )}
          </Text> */}
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: "#185a9d",
                        }}
                      >
                        {" "}
                        Booked a{" "}
                        {assetSections.length > 0
                          ? getType(item.assetBooking.asset.assetSection)
                          : "Loading ..."}
                      </Text>
                      {!item.status === true ? (
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            color: "#901616",
                            borderWidth: 2,
                            borderRadius: 8,
                            borderColor: "#901616",
                            // marginTop: "10%",
                            marginLeft: assetSections.length > 0 &&
                            getType(item.assetBooking.asset.assetSection) === "Parking" ? '35%' :'22%',
                            //   textDecorationLine:'underline',
                          }}
                        >
                          {!item.status ? "UNPAID" : "PAID"}
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            color: "#3ea3a3",
                            borderWidth: 2,
                            borderRadius: 8,
                            borderColor: "#3ea3a3",
                            // marginTop: "10%",
                            marginLeft: assetSections.length > 0 &&
                            getType(item.assetBooking.asset.assetSection) === "Parking" ? '35%' :'22%',
                            //   textDecorationLine:'underline',
                          }}
                        >
                          {!item.status ? "UNPAID" : "PAID"}
                        </Text>
                      )}
                    </View>
                    {/* <Text></Text>
          <Divider/>
          <Text></Text> */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-start",
                      }}
                    >
                      {/* <Text>
            {getType(item.assetBooking.asset.assetSection) ===
            "Parking" ? (
              <FontAwesome5 name="car" size={24} color="black" />
            ) : (
              <Fontisto name="room" size={24} color="black" />
            )}
          </Text> */}
                      <Ionicons
                        name="ios-time"
                        size={16}
                        color="#B9B9B9"
                        style={{ paddingTop: "2%" }}
                      />
                      <Text
                        style={{
                          paddingLeft: "1%",
                          fontSize: 14,
                          color: "#B9B9B9",
                          paddingTop: "1.8%",
                        }}
                      >
                        {item.assetBooking.startDateTime.split(" ")[0]}{" "}
                        {converte(item.assetBooking.startDateTime)}
                      </Text>
                    </View>
                    <Text></Text>
                  </View>
                }
                image={
                  //Parking
                  assetSections.length > 0 &&
                  getType(item.assetBooking.asset.assetSection) === "Parking"
                    ? require("../../assets/Parking.jpg")
                    : //ClassRoom
                    assetSections.length > 0 &&
                      getType(item.assetBooking.asset.assetSection) ===
                        "Class Rooms"
                    ? require("../../assets/ClassRoom.jpg")
                    : //StudyRoom
                    assetSections.length > 0 &&
                      getType(item.assetBooking.asset.assetSection) ===
                        "Study Rooms"
                    ? require("../../assets/studyroomImage.jpg")
                    : //Tutor (ChangeIamge)
                      assetSections.length > 0 &&
                      getType(item.assetBooking.asset.assetSection) ===
                        "Tutor" &&
                      require("../../assets/tutor.jpg")
                }
              >
                <Text></Text>
                <Text></Text>
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#185a9d",
                    }}
                  >
                    Section:{" "}
                  </Text>
                  <Text
                    style={{
                      paddingLeft: "1%",
                      fontSize: 18,
                      color: "#404143",
                      paddingTop: "0.2%",
                    }}
                  >
                    {assetSections.length > 0
                      ? getSection(item.assetBooking.asset.assetSection)
                      : "Loading ..."}
                  </Text>

                  <Text></Text>

                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#185a9d",
                    }}
                  >

                    {  assetSections.length > 0 &&
                      getType(item.assetBooking.asset.assetSection) ===
                        "Class Rooms" ?'  Class:': '  Code:'}
                    {/* {"  "}Code:{""} */}
                  </Text>
                  <Text
                    style={{
                      paddingLeft: "1%",
                      fontSize: 18,
                      color: "#404143",
                      paddingTop: "0.2%",
                    }}
                  >
                    {item.assetBooking.asset.code}
                  </Text>
                </View>
                <Text></Text>
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#185a9d",
                    }}
                  >
                    Booked Date:{""}
                  </Text>
                  <Text
                    style={{
                      paddingLeft: "1%",
                      fontSize: 18,
                      color: "#404143",
                      paddingTop: "0.2%",
                    }}
                  >
                    {item.assetBooking.startDateTime.split(" ")[0]}{" "}
                    {converte(item.assetBooking.startDateTime)}
                  </Text>
                </View>
                <Text></Text>
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#185a9d",
                    }}
                  >
                    End Date:{""}
                  </Text>
                  <Text
                    style={{
                      paddingLeft: "1%",
                      fontSize: 18,
                      color: "#404143",
                      paddingTop: "0.2%",
                    }}
                  >
                    {item.assetBooking.endDateTime.split(" ")[0]}{" "}
                    {converte(item.assetBooking.endDateTime)}
                  </Text>
                </View>
                <Text></Text>
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#185a9d",
                    }}
                  >
                    Total Amount:{" "}
                  </Text>
                  {!item.status === true ? (
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#901616",
                        textDecorationLine: "underline",
                      }}
                    >
                      {item.totalAmount} QR{" "}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#3ea3a3",
                        textDecorationLine: "underline",
                      }}
                    >
                      {item.totalAmount} QR{" "}
                    </Text>
                  )}
                </View>

                {/* // <View>
                  //   <Text>
                  //   Section{" "}
                  //   {assetSections.length > 0
                  //     ? getSection(item.assetBooking.asset.assetSection)
                  //     : "Loading ..."}
                  // </Text>
                  // <Text>{item.assetBooking.asset.code}</Text>
                  // <Text>
                  //   {item.assetBooking.startDateTime.split(" ")[0]}{" "}
                  //   {converte(item.assetBooking.startDateTime)}
                  // </Text>
                  // <Text>
                  //   {item.assetBooking.endDateTime.split(" ")[0]}{" "}
                  //   {converte(item.assetBooking.endDateTime)}
                  // </Text>
                  // <Text style={{ backgroundColor: "red" }}>
                  //   {item.totalAmount} QR {!item.status ? "Not Payed" : "Payed"}
                  // </Text>
                  // <Text></Text>

                  // </View> */}
              </Card>
            )}
          />
        ) : (
          // payments.map((p) => (

          //   <TouchableOpacity style={{backgroundColor:'green'}} onPress={() => setViewDetails(p)}>
          //     <Text>
          //       Type{" "}
          //       {assetSections.length > 0
          //         ? getType(p.assetBooking.asset.assetSection)
          //         : "Loading ..."}
          //     </Text>
          //     <Text>
          //       Section{" "}
          //       {assetSections.length > 0
          //         ? getSection(p.assetBooking.asset.assetSection)
          //         : "Loading ..."}
          //     </Text>
          //     <Text>{p.assetBooking.asset.code}</Text>
          //     <Text>
          //       {p.assetBooking.startDateTime.split(" ")[0]}{" "}
          //       {converte(p.assetBooking.startDateTime)}
          //     </Text>
          //     <Text>
          //       {p.assetBooking.endDateTime.split(" ")[0]}{" "}
          //       {converte(p.assetBooking.endDateTime)}
          //     </Text>
          //     <Text  style={{backgroundColor:'red'}} >
          //       {p.totalAmount} QR {!p.status ? "Not Payed" : "Payed"}
          //     </Text>
          //     <Text></Text>
          //   </TouchableOpacity>

          // ))
          <View>
            {viewDetails ? (
              <View>
                {/* <Text>{viewDetails.id}</Text> */}
                <Text>
                  Type{" "}
                  {assetSections.length > 0
                    ? getType(viewDetails.assetBooking.asset.assetSection)
                    : "Loading ..."}
                </Text>
                <Text>
                  Section{" "}
                  {assetSections.length > 0
                    ? getSection(viewDetails.assetBooking.asset.assetSection)
                    : "Loading ..."}
                </Text>
                <Text>From: {viewDetails.assetBooking.startDateTime}</Text>
                <Text>To: {viewDetails.assetBooking.endDateTime}</Text>
                <Text>
                  Total Amount: {viewDetails.totalAmount} QR{" "}
                  {!viewDetails.status ? "Not Payed" : "Payed"}
                </Text>
                <Text>To: {viewDetails.id}</Text>

                {displayServices ? (
                  <View>
                    <Text>Booked Services</Text>
                    {displayServices.map((s, index) => (
                      <View>
                        <Text>Service: {s.service}</Text>
                        <Text>Timing/s: </Text>
                        {s.timings.map((h) => (
                          <View style={{ flexDirection: "row" }}>
                            <Text>
                              {h.split("T")[0]} {converte(h)}
                            </Text>
                            {/* <TouchableOpacity onPress={() => deleteBooking(index)}><Text>X</Text></TouchableOpacity>  */}
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text>No Booked Services</Text>
                )}

                {new Date().getTime() <
                new Date(
                  viewDetails.assetBooking.startDateTime.split(" ").join("")
                ).getTime() ? (
                  <Button title={"cancel"} onPress={() => cancelBooking()} />
                ) : null}

                <Button title={"cancel"} onPress={() => cancelBooking()} />
                <Button title={"Back"} onPress={() => back()} />
                {new Date().getTime() <
                new Date(
                  viewDetails.assetBooking.endDateTime.split(" ").join("")
                ).getTime() ? (
                  <Button
                    title={"extend"}
                    onPress={() => showDateInput(true)}
                  />
                ) : null}
                {!viewDetails.status ? (
                  <Button
                    title="Pay"
                    onPress={() =>
                      props.navigation.navigate("Payment", {
                        partial: viewDetails,
                      })
                    }
                  />
                ) : null}
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
                format="YYYY-MM-DD T hh:00 A"
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

            {accepted && extension ? (
              <View>
                <Text>Extension Valid</Text>
                <Button title="Services" onPress={() => setAddServices(true)} />
                <Button title="Confirm" onPress={() => confirm()} />
              </View>
            ) : !accepted && extension ? (
              <Text>Extension Not Valid</Text>
            ) : null}

            {addServices ? (
              <Modal
                animationType="slide"
                transparent={true}
                visible={addServices}
                onRequestClose={() => {
                  Alert.alert("Modal has been closed.");
                }}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <ExtendServices
                      //sName={selectedSection.name}
                      //tName={tName}
                      oldDays={newUserDays}
                      oldSb={newServiceBookings}
                      oldSh={newShow}
                      oldAvailable={updateAvailableTimings}
                      serviceBookingArr={(
                        bookings,
                        show,
                        days,
                        updateAvailable
                      ) =>
                        getServiceBookings(
                          bookings,
                          show,
                          days,
                          updateAvailable
                        )
                      }
                      asset={viewDetails.assetBooking.asset}
                      startDateTime={viewDetails.assetBooking.endDateTime}
                      endDateTime={extension}
                      type={typeId}
                      navigation={props.navigation}
                    />
                  </View>
                </View>
              </Modal>
            ) : null}

            {newServiceBookings.length > 0 ? (
              <View>
                <Text>Booked Services</Text>
                {newShow.map((s) => (
                  <View>
                    <Text>Service: {s.service.name}</Text>
                    <Text>Price Per Hour {s.service.price}</Text>

                    <Text>Total: {s.service.price * s.hours.length}</Text>
                    <Text>Bookings</Text>
                    {s.hours.map((h) => (
                      <Text>{h}</Text>
                    ))}
                  </View>
                ))}
                <Text>Services Total Amount: {serviceBookingTotal}</Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

BookingHistory.navigationOptions = {
  title: "History",
};
//
const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "#284057",
    borderWidth: 1,
    width: "60%",
    backgroundColor: "white",
    paddingLeft: 7,
  },
  label: { fontSize: 15, color: "#284057", width: "30%", fontWeight: "bold" },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
}); //backgroundColor:"white" fontWieght:"bold" , paddingLeft: 5
