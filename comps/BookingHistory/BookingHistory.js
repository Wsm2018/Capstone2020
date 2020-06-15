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
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import Review from "./Review.js";
import LottieView from "lottie-react-native";
import {
  FontAwesome5,
  Fontisto,
  Ionicons,
  //AntDesign,
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
  const [payments, setPayments] = useState("");
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
  const [users, setUsers] = useState([]);
  const [workerSchedule, setWorkerSchedule] = useState([]);

  //Card styling
  const [historyDetails, setHistoryDetails] = useState(false);

  useEffect(() => {
    getBookings();
  }, []);

  useEffect(() => {
    getUserFavoriteAssets();
  }, []);

  ////////////////////review//////////////////////////////////////////////////
  const [favoriteAssets, setFavoriteAssets] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const getUserFavoriteAssets = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("favorites")
      .onSnapshot((querySnap) => {
        let favorites = [];
        let favoritesId = [];

        querySnap.forEach((document) => {
          favorites.push({ id: document.id, ...document.data() });
          favoritesId.push(document.id);
        });
        setFavoriteAssets([...favorites]);
        setFavoriteIds([...favoritesId]);
      });
  };

  const handleAddFavorite = async (item) => {
    console.log("fav preseddddddddddddddddddd ");
    if (!favoriteIds.includes(item.id)) {
      alert("Added to Favorite Successfully!");
      const addFavorite = firebase.functions().httpsCallable("addFavorite");
      const response = await addFavorite({
        uid: firebase.auth().currentUser.uid,
        asset: item.id,
      });
    } else {
      alert("Favourite Deleted  from Your Favourites Successfully!");
      handleDeleteFavorite(item.id);
    }
  };

  // const handleAddFavorite = async (item) => {
  //   console.log("fav preseddddddddddddddddddd ");
  //   const addFavorite = firebase.functions().httpsCallable("addFavorite");
  //   const response = await addFavorite({
  //     uid: firebase.auth().currentUser.uid,
  //     asset: item.id,
  //   });
  //   console.log(response);
  //   if (response.data !== "Exists") {

  //   } else {

  //     // showMessage({
  //     //   message: "Favourite Deleted!",
  //     //   description: "Item deleted from your favourites successfully!",
  //     //   // type: "success",
  //     //   backgroundColor: "#3ea3a3",
  //     //   // duration: 2300,
  //     // });
  //     handleDeleteFavorite(item.id);
  //   }
  // };

  const handleDeleteFavorite = async (id) => {
    console.log("deleteddddddddddd ", id);
    const deleteFavorite = firebase.functions().httpsCallable("deleteFavorite");
    const response = await deleteFavorite({
      uid: firebase.auth().currentUser.uid,
      assetId: id,
    });
    // if (response.data !== null) {
    //   // alert("Asset Deleteted");
    //   showMessage({
    //     message: "Favourite Deleted!",
    //     description: "Item deleted from your favourites successfully!",
    //     // type: "success",
    //     backgroundColor: "#3ea3a3",
    //     // duration: 2300,
    //   });
    // }
  };
  //////////////////////////////////////////////////////////////////////////////////////////////////////////

  const getBookings = () => {
    //payment has booking and user id
    db.collection("payments")
    .orderBy("dateTime", "asc").onSnapshot((querySnapshot) => {
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
      .where("role", "==", "services employee")
      .onSnapshot((snapshot) => {
        var worker = [];
        snapshot.forEach((doc) => {
          worker.push({ ...doc.data(), id: doc.id });
        });
        // console.log("ahaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", temp.schedules)
        setUsers(worker);
      });
    // console.log("AAAAAAAAAAAAAHHHHHHHHHHHHHHHAAAAAAAAAA")

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
    if (users) {
      for (let i = 0; i < users.length; i++) {
        //var workerId = doc.id

        var temp = workers;
        var schedules = [];
        db.collection("users")
          .doc(users[i].id)
          .collection("schedules")
          .onSnapshot((snapshot) => {
            schedules = [];
            snapshot.forEach((doc) => {
              // console.log("{ ...doc.data(), worker: workerId, id: doc.id }")
              //console.log("thhhhhhheeeeeee hel")
              schedules.push({
                ...doc.data(),
                worker: users[i].id,
                id: doc.id,
              });
            });

            temp.push({ worker: users[i], schedules });
          });
        setWorkers(temp);
      }
      // console.log("OOOOOOOOOOOOOOOOOOOHHHHHHHHHHHHHAAAAAAAAAAAAAAAAAAAA", workers[0])
    }
  }, [users]);

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
    Alert.alert("Cancel", "", [
      { text: "Yes?", onPress: () => confirmCancel() },

      { text: "No", onPress: () => console.log("No Pressed") },
    ]);
  };

  const confirmCancel = async () => {
    //delete Payment
    db.collection("payments").doc(viewDetails.id).delete();
    //delete asset booking
    // console.log("187", viewDetails.assetBooking.asset.id, viewDetails.assetBooking.id)
    db.collection("assets")
      .doc(viewDetails.assetBooking.asset.id)
      .collection("assetBookings")
      .doc(viewDetails.assetBooking.id)
      .delete();

    for (let i = 0; i < viewDetails.bookedServices.length; i++) {
      //   //update worker schedule
      var worker = workers.filter(
        (w) => w.worker.id == viewDetails.bookedServices[i].worker
      )[0];
      var sch = worker.schedules.filter(
        (s) => s.serviceBooking.assetBooking.id === viewDetails.assetBooking.id
      )[0];
      //console.log("worker schedule", worker.schedules, "--", viewDetails.bookedServices[i].worker, "--,sch", sch, "--", viewDetails.bookedServices[i].service.id, "--", viewDetails.bookedServices[i].id)

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
    } else {
      setTotalAmount(totalAmount - serviceBookingTotal);
      setServiceBookingTotal(0);
    }
  }, [newServiceBookings]);

  const getServiceBookings = (bookings, show, userdays, updateAvailable) => {
    if (bookings) {
      setNewServiceBookings(bookings);
    } else {
      setTotalAmount(totalAmount - serviceBookingTotal);
      setServiceBookingTotal(0);
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
        //console.log("337")

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
        //  console.log("---------------------------------------",totalAmount + parseInt(viewDetails.totalAmount))
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

    back();
  };

  const getType = (s) => {
    var section = assetSections.filter((o) => o.id == s)[0];
    var type = assetTypes.filter((o) => o.id == section.assetType)[0];
    return type.name;
  };

  const getImage = (s) => {
    var section = assetSections.filter((o) => o.id == s)[0];
    var type = assetTypes.filter((o) => o.id == section.assetType)[0];
    return type.image;
  };

  const getTypeIcon = (s) => {
    var section = assetSections.filter((o) => o.id == s)[0];
    var type = assetTypes.filter((o) => o.id == section.assetType)[0];
    return type.assetIcon;
  };

  // const getTypeIcon = (s) => {
  //   var section = assetSections.filter(o => o.id == s)[0]
  //   var type = assetTypes.filter(o => o.id == section.assetType)[0]
  //   return type.name
  // }

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

  const ext = (end) => {
    if (
      end.assetBooking.endDateTime.split(" ")[2].split(":")[0].split("")
        .length == 1
    ) {
      var t = end.split(" ")[0] + "T0" + end.split(" ")[2];
      console.log("here", t);
      return new Date().getTime() < new Date(t.split(" ").join("")).getTime();
    } else {
      return new Date().getTime() < new Date(end.split(" ").join("")).getTime();
    }
  };

  const ext2 = (end) => {
    //var hour = converte(end)
    //console.log("end" , end)
    if (
      end.split(" ")[2].split(":")[0].split("")
        .length == 1
    ) {
      var t = end.split(" ")[0] + "T0" + end.split(" ")[2];
      //console.log("here", t);
      return new Date().getTime() > new Date(t.split(" ").join("")).getTime();
    } else {
      return new Date().getTime() > new Date(end.split(" ").join("")).getTime();
    }
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
        backgroundColor: payments == ""? "white":"#e3e3e3",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        flex: 1,
      }}
    >

      {
    
        payments && payments.length > 0 ?
        <ScrollView style={{ backgroundColor: "#e3e3e3", width: "100%" }}>
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
                  borderWidth: 3,
                  borderColor:"#185a9d",
                  //backgroundColor:"red"
                }}
                title={
                  <View style={{ paddingTop: "3%", padding: "2%"  }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-start",
                      }}
                    >
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
                        <TouchableOpacity
                          onPress={() =>
                            props.navigation.navigate("Payment", {
                              partial: item,
                            })
                          }
                        >
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: "bold",
                              color: "#901616",
                              // borderWidth: 2,
                              borderRadius: 8,
                              borderColor: "#901616",
                              // marginTop: "10%",
                              // width:"20%",
                              marginLeft:
                                assetSections.length > 0 &&
                                getType(
                                  item.assetBooking.asset.assetSection
                                ) === "Parking"
                                  ? "35%"
                                  : "22%",
                              //   textDecorationLine:'underline',
                            }}
                          >
                            {!item.status ? "UNPAID" : "PAID"}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            color: "#3ea3a3",
                            // borderWidth: 2,
                            borderRadius: 8,
                            borderColor: "#3ea3a3",
                            // marginTop: "10%",
                            marginLeft:
                              assetSections.length > 0 &&
                              getType(item.assetBooking.asset.assetSection) ===
                                "Parking"
                                ? "35%"
                                : "22%",
                            //   textDecorationLine:'underline',
                          }}
                        >
                          {!item.status ? "UNPAID" : "PAID"}
                        </Text>
                      )}
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-start",
                      }}
                    >
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
                        {item.dateTime.split(" ")[0]} {converte(item.dateTime)}
                      </Text>
                    </View>
                    <Text style={{ color:ext2(item.assetBooking.endDateTime) ? "green" : "#800000" , fontSize:15 , paddingLeft: "1%"}}>{ext2(item.assetBooking.endDateTime) ? "* Completed" : "* Incomplete"}</Text>
                   { assetSections.length > 0 &&
                    <Image
                      style={{
                        // width: Platform.isPad ? "70%" : "80%",
                        // height: Platform.isPad ? "100%" : "80%",
                        aspectRatio: 1 / 1,
                        width: "80%",
                        marginLeft: "auto",
                        marginRight: "auto",
                      }}
                      source={{
                        uri:
                          assetSections.length > 0 
                            ? getImage(item.assetBooking.asset.assetSection)
                            : null,
                        // uri: t.image,
                      }}
                    />
                }
                  </View>
                }

                // image={
                //   assetSections.length > 0
                //     ? getImage(item.assetBooking.asset.assetSection)
                //     : "Loading ..."
                // }
              >
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#185a9d",
                      width: "40%",
                    }}
                  >
                    Section{" "}
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
                </View>
                <Text></Text>
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#185a9d",
                      width: "40%",
                    }}
                  >
                    {assetSections.length > 0
                      ? getType(item.assetBooking.asset.assetSection)
                      : null}
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
                      width: "40%",
                    }}
                  >
                    Booked Date{""}
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
                      width: "40%",
                    }}
                  >
                    End Date{""}
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
                      width: "40%",
                    }}
                  >
                    Total Amount{" "}
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
                <TouchableOpacity
                  style={{
                    marginTop: "2%",
                    marginLeft: "auto",
                    marginRight: "auto",
                    width: "30%",
                    backgroundColor: "#2E9E9B",
                    borderRaduis: 5,
                    padding: 10,
                  }}
                  onPress={() => setViewDetails(item)}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 18,
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  >
                    Details
                  </Text>
                </TouchableOpacity>
              </Card>
            )}
          />
        ) : (
          <View>
            {viewDetails ? (
              <View>
                {/* <Text>{viewDetails.id}</Text> */}
                <View style={styles.box}>
                  <MaterialCommunityIcons
                    name="close"
                    size={25}
                    color={"#901616"}
                    style={{ position: "absolute", left: "90%" }}
                    onPress={() => back()}
                  />

                  <View
                    style={{
                      width: "100%",
                      marginRight: "auto",
                      marginLeft: "auto",
                      backgroundColor: "#f5f5f5",
                      marginTop: "5%",
                    }}
                  >
                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.names}>Booking Type</Text>
                      <MaterialCommunityIcons
                        name={getTypeIcon(
                          viewDetails.assetBooking.asset.assetSection
                        )}
                        size={20}
                        color={"#901616"}
                        // style={{ position:"absolute" , left:"90%" }}
                        onPress={() => back()}
                      />
                      <Text>
                        {assetSections.length > 0
                          ? getType(viewDetails.assetBooking.asset.assetSection)
                          : "Loading ..."}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.names}>From</Text>
                      <Text>
                        {" "}
                        {
                          viewDetails.assetBooking.startDateTime.split(" ")[0]
                        } T {converte(viewDetails.assetBooking.startDateTime)}
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.names}>To</Text>
                      <Text>
                        {viewDetails.assetBooking.endDateTime.split(" ")[0]} T{" "}
                        {converte(viewDetails.assetBooking.endDateTime)}
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.names}>Total Amount</Text>
                      <Text>{viewDetails.totalAmount} QR </Text>
                      <Text>
                        {!viewDetails.status ? "   Not Payed" : "   Payed"}
                      </Text>
                    </View>

                    {displayServices && displayServices.length > 0 ? (
                      <View style={{ flexDirection: "row" }}>
                        <Text style={styles.names}>Booked Services</Text>
                        <View>
                          {displayServices.map((s, index) => (
                            <View style={{}}>
                              <Text
                                style={{ color: "#18414e", fontWeight: "bold" }}
                              >
                                {s.service}
                              </Text>

                              {s.timings.map((h) => (
                                <View
                                  style={{
                                    flexDirection: "row",
                                    marginLeft: "5%",
                                  }}
                                >
                                  <Text
                                    style={{ width: "100%", color: "#246175" }}
                                  >
                                    {h.split("T")[0]} {converte(h)}
                                  </Text>
                                  {/* <TouchableOpacity onPress={() => deleteBooking(index)}><Text>X</Text></TouchableOpacity>  */}
                                </View>
                              ))}
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : (
                      <Text
                        style={{
                          width: "40%",
                          color: "#901616",
                          fontSize: 15,
                        }}
                      >
                        No Booked Services
                      </Text>
                    )}
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    {ext(viewDetails.assetBooking.endDateTime) ? (
                      <TouchableOpacity
                        style={styles.btn}
                        onPress={() => showDateInput(true)}
                      >
                        <Text style={styles.btnTitle}>Extend</Text>
                      </TouchableOpacity>
                    ) : null}

                    {ext(viewDetails.assetBooking.startDateTime) ? (
                      <TouchableOpacity
                        style={styles.Cancelbtn}
                        onPress={() => cancelBooking()}
                      >
                        <Text style={styles.btnTitle}>Cancel</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>

                <Review
                  // sName={selectedSection.name}
                  // tName={tName}
                  asset={viewDetails.assetBooking.asset}
                  startDateTime={viewDetails.assetBooking.startDateTime}
                  // endDateTime={endDate}
                  // type={type}
                  navigation={props.navigation}
                  handleAddFavorite={handleAddFavorite}
                  favoriteAssets={favoriteIds}
                  assetIcon={getTypeIcon(
                    viewDetails.assetBooking.asset.assetSection
                  )}
                  //sectionIcon={sectionIcon}
                />
              </View>
            ) : null}

            {dateInput ? (
              <View style={styles.box2}>
                <Text
                  style={{
                    //width: "40%",
                    color: "#395e60",
                    fontSize: 18,
                    marginLeft: "auto",
                    marginRight: "auto",
                    fontWeight: "bold",
                    marginBottom: "2%",
                  }}
                >
                  Extend Booking
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                  }}
                >
                  <View
                    style={{
                      padding: 2,
                      backgroundColor: "#d9d9d9",
                      marginTop: "auto",
                      marginBottom: "auto",
                      borderWidth: 0.5,
                      borderColor: "#dcdcdc",
                      height: 40,
                      width: 160,
                    }}
                  >
                    <Text style={{ marginTop: "auto", marginBottom: "auto" }}>
                      {viewDetails.assetBooking.endDateTime.split(" ")[0]} T{" "}
                      {converte(viewDetails.assetBooking.endDateTime)}
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={25}
                    color={"#3ea3a3"}
                    style={{ marginTop: "auto", marginBottom: "auto" }}
                  />
                  <DatePicker
                    style={{
                      backgroundColor: "#d9d9d9",
                      marginTop: "auto",
                      marginBottom: "auto",
                      borderWidth: 0.5,
                      borderColor: "#dcdcdc",
                      width: 160,
                    }}
                    //is24Hour
                    minuteInterval={15}
                    date={extension}
                    mode="datetime"
                    placeholder="Extend Till"
                    format="YYYY-MM-DD T hh:00 A"
                    minDate={viewDetails.assetBooking.endDateTime}
                    maxDate={moment().add(3, "month")}
                    minTime={moment(
                      viewDetails.assetBooking.endDateTime
                    ).format()}
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    customStyles={{
                      dateIcon: {
                        width: 0,
                        height: 0,
                      },
                      dateInput: {
                        backgroundColor: "#d9d9d9",
                        borderWidth: 0,
                        borderColor: "#185a9d",
                      },
                      // ... You can check the source to find the other keys.
                    }}
                    onDateChange={setExtension}
                  />
                </View>

                {accepted && extension ? (
                  <View style={styles.box3}>
                    <View style={styles.extension}>
                      <Text
                        style={{
                          color: "#3ea3a3",
                          marginTop: "auto",
                          marginBottom: "auto",
                          fontSize: 17,
                          marginRight: "3%",
                        }}
                      >
                        Extension Valid
                      </Text>
                      <AntDesign
                        name="checkcircle"
                        size={25}
                        color={"#3ea3a3"}
                        style={{
                          marginTop: "auto",
                          marginBottom: "auto",
                          marginLeft: "3%",
                        }}
                      />
                    </View>

                    <View>
                      {!viewDetails.status ? (
                        <View>
                          <View style={{ flexDirection: "row" }}>
                            <Text style={styles.amount}>Added Amount </Text>
                            <Text style={{ color: "#246175" }}>
                              {totalAmount} QR
                            </Text>
                          </View>

                          <View style={{ flexDirection: "row" }}>
                            <Text style={styles.amount}>Services Total </Text>
                            <Text style={{ color: "#246175" }}>
                              {" "}
                              {serviceBookingTotal} QR
                            </Text>
                          </View>

                          {newServiceBookings.length > 0 ? (
                            <View style={{ width: "100%" }}>
                              {newShow && newShow.length > 0
                                ? newShow.map((s) => (
                                    <View style={{ marginLeft: "5%" }}>
                                      <Text
                                        style={{
                                          color: "#18414e",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {s.service.name}
                                      </Text>
                                      {/* <Text>Total: {s.service.price * s.hours.length}</Text> */}

                                      {s.hours.map((h) => (
                                        <View style={{ flexDirection: "row" }}>
                                          <Text
                                            style={{
                                              width: "50%",
                                              color: "#246175",
                                            }}
                                          >
                                            {h}
                                          </Text>
                                          <Text style={{ color: "#246175" }}>
                                            {s.service.price} QR
                                          </Text>
                                        </View>
                                      ))}
                                    </View>
                                  ))
                                : null}
                            </View>
                          ) : null}
                          <View>
                            <View style={{ flexDirection: "row" }}>
                              <Text style={styles.amount}>Total Amount </Text>
                              <Text style={{ color: "#246175" }}>
                                {" "}
                                {totalAmount + viewDetails.totalAmount} QR
                              </Text>
                            </View>
                          </View>
                          <Text
                            style={{
                              color: "red",
                              marginLeft: "auto",
                              marginRight: "auto",
                            }}
                          >
                            * Extension Amount will be added to this booking
                            bill
                          </Text>
                        </View>
                      ) : (
                        <View>
                          <View style={{ flexDirection: "row" }}>
                            <Text style={styles.amount}>Total Amount</Text>
                            <Text style={{ color: "#246175" }}>
                              {" "}
                              {totalAmount} QR
                            </Text>
                          </View>

                          <View style={{ flexDirection: "row" }}>
                            <Text style={styles.amount}>Services Total </Text>
                            <Text style={{ color: "#246175" }}>
                              {" "}
                              {serviceBookingTotal} QR
                            </Text>
                          </View>
                          {newServiceBookings.length > 0 ? (
                            <View style={{ width: "100%" }}>
                              {newShow && newShow.length > 0
                                ? newShow.map((s) => (
                                    <View style={{ marginLeft: "5%" }}>
                                      <Text
                                        style={{
                                          color: "#18414e",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {s.service.name}
                                      </Text>
                                      {/* <Text>Total: {s.service.price * s.hours.length}</Text> */}

                                      {s.hours.map((h) => (
                                        <View style={{ flexDirection: "row" }}>
                                          <Text
                                            style={{
                                              width: "50%",
                                              color: "#246175",
                                            }}
                                          >
                                            {h}
                                          </Text>
                                          <Text style={{ color: "#246175" }}>
                                            {s.service.price} QR
                                          </Text>
                                        </View>
                                      ))}
                                    </View>
                                  ))
                                : null}
                            </View>
                          ) : null}
                          <Text
                            style={{
                              color: "red",
                              marginLeft: "auto",
                              marginRight: "auto",
                            }}
                          >
                            * Extension Amount will be added to a new bill
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flexDirection: "row" }}>
                      <TouchableOpacity
                        style={styles.btn}
                        onPress={() => setAddServices(true)}
                      >
                        <Text style={styles.btnTitle}>Services</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.btn}
                        onPress={() => confirm()}
                      >
                        <Text style={styles.btnTitle}>Confirm</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : !accepted && extension ? (
                  <View style={styles.extension}>
                    <Text
                      style={{
                        color: "#901616",
                        marginTop: "auto",
                        marginBottom: "auto",
                        fontSize: 17,
                        marginRight: "3%",
                      }}
                    >
                      Extension Not Valid
                    </Text>
                    <AntDesign
                      name="closecircle"
                      size={25}
                      color={"#901616"}
                      style={{
                        marginTop: "auto",
                        marginBottom: "auto",
                        marginLeft: "3%",
                      }}
                    />
                  </View>
                ) : null}
              </View>
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
          </View>
        )}
      </ScrollView>

        : payments == "" ?
        
        <LottieView
          source={require("../../assets/loadingAnimations/890-loading-animation.json")}
          autoPlay
          loop
          style={{
            position: "relative",
            width: "50%",
            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center",
            alignContent: "center",
            alignSelf: "center",
          }}
        />
      :
      null
      }
      {/* <Header
        containerStyle={{ backgroundColor: "#185a9d" }}
        //leftComponent={{ icon: 'menu', color: '#fff' }}
        centerComponent={{
          text: "My Bookings History",
          style: { color: "#fff", fontSize: 22 },
        }}
        // rightComponent={{ icon: 'home', color: '#fff' }}
      /> */}
     
    </View>
  );
}

BookingHistory.navigationOptions = {
  title: "My Bookings",
  headerStyle: { backgroundColor: "#185a9d" },
  // headerStyle: { backgroundColor: theme2 === "light" ? "#185a9d" : "black" },
  headerTintColor: "white",
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
    width: "90%",
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
  box: {
    width: "100%",
    borderColor: "#cccccc",
    //borderTopWidth: 2,
    borderBottomWidth: 2,
    marginLeft: "auto",
    marginRight: "auto",
    backgroundColor: "white",
    // marginTop: "2%",
    marginBottom: "2%",
    paddingTop: "4%",
    paddingBottom: "4%",
    paddingLeft: "2%",
    paddingRight: "2%",
  },
  box2: {
    width: "100%",
    borderColor: "#cccccc",
    borderTopWidth: 2,
    borderBottomWidth: 2,
    marginLeft: "auto",
    marginRight: "auto",
    backgroundColor: "#f2f2f2",
    marginTop: "2%",
    marginBottom: "2%",
    paddingTop: "4%",
    paddingBottom: "4%",
    paddingLeft: "2%",
    paddingRight: "2%",
  },
  box3: {
    width: "85%",
    //borderColor: "#cccccc",
    //borderWidth: 2,
    //borderBottomWidth: 2,
    marginLeft: "auto",
    marginRight: "auto",
    backgroundColor: "#f2f2f2",
    //marginTop: "2%",
    marginBottom: "2%",
    paddingTop: "4%",
    //paddingBottom: "4%",
    //paddingLeft: "2%",
    //paddingRight: "2%"
  },
  names: {
    width: "40%",
    color: "#395e60",
    fontSize: 18,
  },
  btn: {
    width: "30%",
    backgroundColor: "#2E9E9B",
    borderRadius: 5,
    margin: "3%",
    padding: 10,
    alignItems: "center",
  },
  Cancelbtn: {
    width: "30%",
    backgroundColor: "#901616",
    borderRadius: 5,
    margin: "3%",
    padding: 10,
    alignItems: "center",
  },
  btnTitle: {
    color: "white",
    fontSize: 15,
    marginBottom: "1%",
  },
  extension: {
    width: "50%",
    flexDirection: "row",
    // marginTop: "1%",
    marginBottom: "3%",
    marginLeft: "auto",
    marginRight: "auto",
    justifyContent: "center",
    borderBottomWidth: 0.5,
    width: "100%",
    paddingBottom: "3%",
  },
  extensionTitle: {
    marginTop: "auto",
    marginBottom: "auto",
    fontSize: 15,
  },
  amount: {
    width: "50%",
    marginBottom: "1%",
    fontSize: 15,
    color: "#18414e",
    fontWeight: "bold",
  },
}); //backgroundColor:"white" fontWieght:"bold" , paddingLeft: 5
