//@refresh reset
import { Button } from "react-native-elements";
import React, { useState, useEffect, useRef } from "react";
import { createStackNavigator } from "react-navigation-stack";

import {
  Image,
  Platform,
  TextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import moment from "moment";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db.js";
import { timing } from "react-native-reanimated";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

require("firebase/firestore");

export default function Details(props) {
  ///////////////////Front-End///////////////////////////
  const [modalAddService, setModalAddService] = useState(false);

  /////////////////////////////////////////////////////////

  // const tName = props.navigation.getParam("tName", 'failed')
  // const sName = props.navigation.getParam("sName", 'failed')
  // const asset = props.navigation.getParam("asset", 'failed');
  const tName = props.tName;
  const sName = props.sName;
  const asset = props.asset;
  const [displayServices, setDisplayServices] = useState([]);
  const showBookings = useRef();
  const [serviceBooking, setServiceBooking] = useState([]);
  const SB = useRef();
  const [selectedService, setSelectedService] = useState();

  // const assetTypeId = props.navigation.getParam("assetTypeId", 'no');
  // const startDateTime = props.navigation.getParam("startDateTime", 'no');
  // const endDateTime = props.navigation.getParam("endDateTime", 'no');
  const assetTypeId = props.type;
  const startDateTime = props.startDateTime;
  const endDateTime = props.endDateTime;
  const start = useRef();
  const end = useRef();
  const [workers, setWorkers] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [update, setUpdate] = useState(false);
  const [services, setServices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [userDays, setUserDays] = useState([]);
  const [timesList, setTimesList] = useState([
    { book: false, show: "12:00 AM", time: "00:00:00" },
    { book: false, show: "1:00 AM", time: "1:00:00" },
    { book: false, show: "2:00 AM", time: "2:00:00" },
    { book: false, show: "3:00 AM", time: "3:00:00" },
    { book: false, show: "4:00 AM", time: "4:00:00" },
    { book: false, show: "5:00 AM", time: "5:00:00" },
    { book: false, show: "6:00 AM", time: "6:00:00" },
    { book: false, show: "7:00 AM", time: "7:00:00" },
    { book: false, show: "8:00 AM", time: "8:00:00" },
    { book: false, show: "9:00 AM", time: "9:00:00" },
    { book: false, show: "10:00 AM", time: "10:00:00" },
    { book: false, show: "11:00 AM", time: "11:00:00" },
    { book: false, show: "12:00 PM", time: "12:00:00" },
    { book: false, show: "1:00 PM", time: "13:00:00" },
    { book: false, show: "2:00 PM", time: "14:00:00" },
    { book: false, show: "3:00 PM", time: "15:00:00" },
    { book: false, show: "4:00 PM", time: "16:00:00" },
    { book: false, show: "5:00 PM", time: "17:00:00" },
    { book: false, show: "6:00 PM", time: "18:00:00" },
    { book: false, show: "7:00 PM", time: "19:00:00" },
    { book: false, show: "8:00 PM", time: "20:00:00" },
    { book: false, show: "9:00 PM", time: "21:00:00" },
    { book: false, show: "10:00 PM", time: "22:00:00" },
    { book: false, show: "11:00 PM", time: "23:00:00" },
  ]);
  const [showTimings, setShowTimings] = useState(false);
  const [week, setWeek] = useState([
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]);
  const [updateAvailableTimings, setUpdateAvailableTimings] = useState([]);
  const [expand, setExpand] = useState();

  useEffect(() => {
    setExpand(selectedService);
  }, [selectedService]);

  useEffect(() => {
    getServices();
  }, []);

  useEffect(() => {
    if (services.length > 0) {
      var temp = services;
      for (let i = 0; i < services.length; i++) {
        db.collection("services")
          .doc(services[i].id)
          .collection("workingDays")
          .onSnapshot((snapshot) => {
            const weekDays = [];
            snapshot.forEach(async (doc) => {
              weekDays.push({ day: doc.id, ...doc.data() });
            });
            temp[i].weekDays = weekDays;
            setServices(temp);
          });
      }
    }
  }, [services]);

  useEffect(() => {
    if (schedules) {
      if (
        startDateTime.split(" ")[3] == "PM" &&
        startDateTime.split(" ")[2].split(":")[0] !== "12"
      ) {
        start.current =
          startDateTime.split(" ")[0] +
          " T " +
          (parseInt(startDateTime.split(" ")[2].split(":")[0]) + 12) +
          ":00:00";
      } else {
        start.current =
          startDateTime.split(" ")[0] +
          " T " +
          startDateTime.split(" ")[2] +
          ":00";
      }
      if (
        endDateTime.split(" ")[3] == "PM" &&
        endDateTime.split(" ")[2].split(":")[0] !== "12"
      ) {
        end.current =
          endDateTime.split(" ")[0] +
          " T " +
          (parseInt(endDateTime.split(" ")[2].split(":")[0]) + 12) +
          ":00:00";
      } else {
        end.current =
          endDateTime.split(" ")[0] + " T " + endDateTime.split(" ")[2] + ":00";
      }
      filterTimings();
      getAvailableTimings();
    }
  }, [schedules]);

  const getServices = async () => {
    db.collection("services")
      .where("assetType", "==", assetTypeId)
      .onSnapshot((snapshot) => {
        const services = [];
        snapshot.forEach((doc) => {
          services.push({ id: doc.id, ...doc.data() });
        });
        setServices(services);
      });

    db.collection("users")
      .where("role", "==", "worker")
      .onSnapshot((snapshot) => {
        var worker = "";
        snapshot.forEach((doc) => {
          worker = { ...doc.data(), id: doc.id };
          if (worker.id != firebase.auth().currentUser.uid) {
            var workerId = doc.id;
            db.collection("users")
              .doc(doc.id)
              .collection("schedules")
              .onSnapshot((snapshot) => {
                const schedules = [];
                snapshot.forEach((doc) => {
                  schedules.push({ ...doc.data(), worker: workerId });
                });
                var temp = allWorkers;
                temp.push({ worker, schedules });
                setAllWorkers(temp);
              });
          }
        });
      });
  };

  useEffect(() => {
    if (selectedService) {
      setSchedules([]);
      setWorkers([]);
      filterTimings();
      getAvailableTimings();
      setShowTimings(true);
    }
  }, [selectedService]);

  const filterTimings = () => {
    var split1 = start.current.split(" ");
    var split2 = end.current.split(" ");
    var diffDays = Math.ceil(
      (new Date(split2[0]) - new Date(split1[0])) / (1000 * 60 * 60 * 24)
    );
    var firstDayHours = [];
    var lastDayHours = [];
    var days = [];
    //if more than one day
    if (diffDays > 0) {
      var startHour = start.current.split(" ")[2];
      var endHour = end.current.split(" ")[2];
      //remove hours before start hour
      for (let i = 0; i < timesList.length; i++) {
        if (timesList[i].time + "" === startHour) {
          for (let k = i; k < timesList.length; k++) {
            firstDayHours.push(timesList[k]);
          }
        }
      }
      //add only the hours before last hour
      for (let i = 0; i < timesList.length; i++) {
        if (timesList[i].time + "" == endHour) {
          break;
        }
        if (timesList[i].time + "" != endHour) {
          lastDayHours.push(timesList[i]);
        }
      }
      var currentDate = split1[0];

      for (let i = 1; i <= diffDays + 1; i++) {
        days.push({ day: currentDate, timesList, bookings: 0 });
        currentDate = moment(currentDate).add(1, "day").format("YYYY-MM-DD");
      }
      days[0].timesList = firstDayHours;
      days[days.length - 1].timesList = lastDayHours;
    } else {
      var startHour = start.current.split(" ")[2];
      for (let i = 0; i < timesList.length; i++) {
        if (timesList[i].time === startHour) {
          for (let k = i; k < timesList.length; k++) {
            firstDayHours.push(timesList[k]);
          }
        }
      }
      days.push({ day: split1[0], timesList: firstDayHours, bookings: 0 });
    }

    if (selectedService) {
      for (let i = 0; i < days.length; i++) {
        var temp = [];
        var findDay = week[new Date(days[i].day).getDay()];
        var serviceWorkingDay = selectedService.weekDays.filter(
          (h) => h.day == findDay
        )[0];
        if (serviceWorkingDay && serviceWorkingDay.hours) {
          for (let k = 0; k < days[i].timesList.length; k++) {
            var findHour = serviceWorkingDay.hours.filter(
              (h) => h === days[i].timesList[k].time
            )[0];

            if (findHour) {
              temp.push(days[i].timesList[k]);
            }
          }
        }
        days[i].timesList = temp;
      }
    }
    setUserDays(days);
  };

  const getAvailableTimings = () => {
    var toUpdate = [];
    var totalWorkers = [];

    for (let i = 0; i < userDays.length; i++) {
      //loop through day booked hours
      for (let k = 0; k < userDays[i].timesList.length; k++) {
        var counter = 0;
        for (let j = 0; j < allWorkers.length; j++) {
          var check = allWorkers[j].worker.services.filter(
            (s) => s == selectedService.id
          );
          if (check.length > 0) {
            totalWorkers = totalWorkers.filter((t) => t == allWorkers[j].id);
            if (totalWorkers.length == 0) {
              totalWorkers.push(allWorkers[j].id);
            }
            var userDateTime =
              userDays[i].day + "T" + userDays[i].timesList[k].time;
            var checkTime = allWorkers[j].schedules.filter(
              (s) => s.dateTime === userDateTime
            );
            if (checkTime.length > 0) {
              counter = counter + 1;
            }
          }
        }

        if (totalWorkers.length === counter) {
          toUpdate.push({ day: i, time: k });
        }
      }
    }
    setUpdateAvailableTimings(toUpdate);
  };

  const book = async (day, time) => {
    var check = serviceBooking.filter(
      (t) =>
        t.service.id == selectedService.id &&
        t.day == userDays[day].day &&
        t.time == userDays[day].timesList[time].time
    );

    if (
      parseInt(selectedService.maxBookings) == userDays[day].bookings &&
      check.length == 0
    ) {
      alert(
        "Sorry, Only " +
          selectedService.maxBookings +
          " " +
          selectedService.name +
          " Booking/s Allowed Per Day"
      );
    } else if (check == 0) {
      var temp = serviceBooking;
      var check = temp.filter(
        (t) =>
          t.service.id == selectedService.id &&
          t.day == userDays[day].day &&
          t.time == userDays[day].timesList[time].time
      );
      if (check.length == 0) {
        var selectedWorker = "";
        for (let j = 0; j < allWorkers.length; j++) {
          var findWorker = allWorkers[j].worker.services.filter(
            (s) => s == selectedService.id
          );

          if (findWorker.length > 0) {
            var checkSchedule = allWorkers[j].schedules.filter(
              (s) =>
                s.dateTime ==
                userDays[day].day + "T" + userDays[day].timesList[time]
            );
            if (checkSchedule.length == 0) {
              var updateSchedule = allWorkers;
              updateSchedule[j].schedules.push({
                dateTime:
                  userDays[day].day + "T" + userDays[day].timesList[time].time,
              });
              setAllWorkers(updateSchedule);
              selectedWorker = allWorkers[j];
            }
          }
        }
        temp.push({
          service: selectedService,
          day: userDays[day].day,
          time: userDays[day].timesList[time].time,
          show: userDays[day].timesList[time].show,
          worker: selectedWorker.worker.id,
        });
        var ud = userDays;
        ud[day].timesList[time].book = true;
        ud[day].bookings = ud[day].bookings + 1;
        setUserDays(ud);
        setServiceBooking(temp);
        SB.current = temp;
      }
    } else {
      var index = serviceBooking.findIndex(
        (i) =>
          i.day == userDays[day].day &&
          i.time == userDays[day].timesList[time].time
      );

      var updateWorkers = allWorkers;
      for (let i = 0; i < updateWorkers.length; i++) {
        if (updateWorkers[i].worker.id == serviceBooking[index].worker) {
          var newSchedule = updateWorkers[i].schedules.filter(
            (t) =>
              t.dateTime !=
              serviceBooking[index].day + "T" + serviceBooking[index].time
          );
          updateWorkers[i].schedules = newSchedule;
          var ud = userDays;
          for (let k = 0; k < userDays.length; k++) {
            if (userDays[k].day == serviceBooking[index].day) {
              ud[k].bookings = userDays[k].bookings - 1;
              setUserDays(ud);
            }
          }

          setAllWorkers(updateWorkers);
          break;
        }
      }
      var temp = [];
      for (let i = 0; i < serviceBooking.length; i++) {
        if (i !== index) {
          temp.push(serviceBooking[i]);
        }
      }
      SB.current = temp;

      setServiceBooking([...temp]);
    }

    orderList();
    getAvailableTimings();
  };

  const checkHour = (time, day) => {
    //not booked
    if (
      serviceBooking.filter(
        (t) =>
          t.service == selectedService &&
          t.day == userDays[day].day &&
          t.time == userDays[day].timesList[time].time
      ).length > 0
    ) {
      return "green";
    } else if (
      updateAvailableTimings.filter((a) => a.day === day && a.time === time)
        .length == 1
    ) {
      return "red";
    } else {
      return "white";
    }
  };

  const orderList = () => {
    setUpdate(false);
    var newServiceArr = [];

    for (let i = 0; i < SB.current.length; i++) {
      newServiceArr = newServiceArr.filter(
        (s) => s.service !== SB.current[i].service
      );
      var bookedhours = SB.current.filter(
        (s) => s.service == SB.current[i].service
      );
      var hours = [];
      var whatever = [];
      for (let k = 0; k < bookedhours.length; k++) {
        hours.push(bookedhours[k].day + " " + bookedhours[k].show);
        if (bookedhours[k].time.split(":")[0].split("").length == 1) {
          whatever.push(bookedhours[k].day + "T0" + bookedhours[k].time);
        } else {
          whatever.push(bookedhours[k].day + "T" + bookedhours[k].time);
        }
      }
      newServiceArr.push({ service: SB.current[i].service, hours, whatever });
    }

    //order timings
    for (let i = 0; i < newServiceArr.length; i++) {
      var arranged = [];
      var use = newServiceArr[i].whatever;
      if (use.length > 0) {
        var counter = use.length;
        while (counter > 0) {
          var min = use[0];
          var index = 0;
          for (let k = 0; k < use.length; k++) {
            if (new Date(min).getTime() > new Date(use[k]).getTime()) {
              min = newServiceArr[i].whatever[k];
              index = k;
            }
          }
          var show = "";

          for (let j = 0; j < timesList.length; j++) {
            var test = use[index].split("T")[1];
            if (test[0] == "0") {
              var test =
                test[1] +
                test[2] +
                test[3] +
                test[4] +
                test[5] +
                test[6] +
                test[7];
              if (timesList[j].time == test) {
                show = timesList[j].show;
              }
            } else {
              if (timesList[j].time == use[index].split("T")[1]) {
                show = timesList[j].show;
              }
            }
          }
          arranged.push(use[index].split("T")[0] + " " + show);

          use = use.filter((t, i) => i != index);
          counter = counter - 1;
        }
      }
      newServiceArr[i].hours = arranged;
    }

    setDisplayServices(newServiceArr);
    showBookings.current = newServiceArr;
    setUpdate(true);
  };

  const getDay = (date) => {
    return week[new Date(date).getDay()] + ", " + date;
  };

  return (
    <View style={styles.container}>
      <View style={{ marginTop: 15 }}>
        <Text style={{ color: "gray" }}>Services</Text>
      </View>

      <View>
        {/* {selectedService ? (
          <View>
            <Text>Service: {selectedService.name}</Text>
          </View>
        ) : null} */}

        {update ? (
          showBookings.current.map((s, index) => (
            <View>
              <View
                style={{
                  backgroundColor: "#f5f5f5",
                  marginTop: 5,
                  // borderRadius: 5,
                  // padding: 5,
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    width: "25%",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 5,
                  }}
                >
                  {/* <Text>{s.service.name} Icon</Text> */}
                  {/* <MaterialCommunityIcons
                  name="gas-station"
                  size={40}
                  color={"#20365F"}
                /> */}

                  <TouchableOpacity
                    style={{
                      backgroundColor: "#20365F",
                      width: 70,
                      height: 70,
                      margin: 5,
                      alignItems: "center",
                      flexDirection: "row",
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
                        name="gas-station"
                        size={30}
                        color={"white"}
                      />
                      <Text
                        style={{
                          textAlign: "center",
                          color: "white",
                          fontSize: 12,
                        }}
                      >
                        {s.service.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={{ width: "75%", padding: 10 }}>
                  <Text style={{ fontWeight: "bold" }}>Timing(s): </Text>
                  {s.hours.map((h) => (
                    <View style={{ flexDirection: "row" }}>
                      <Text style={{ fontSize: 12 }}>{h}</Text>
                      {/* <TouchableOpacity onPress={() => deleteBooking(index)}><Text>X</Text></TouchableOpacity>  */}
                    </View>
                  ))}
                  {/* <Text style={{ fontSize: 20 }}>{s.service.name}</Text> */}
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: "90%" }}>
              <Text>No services selected</Text>
            </View>
            {/* <View
              style={{
                
                width: "10%",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#20365F",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 5,
                  marginBottom: 5,
                }}
                onPress={() => setModalAddService(true)}
              >
               
                <MaterialCommunityIcons name="plus" size={22} color={"white"} />
              </TouchableOpacity>
            </View> */}
          </View>
        )}
        <View style={{ marginTop: 5, alignItems: "flex-end" }}>
          <View style={{ width: "10%" }}>
            <TouchableOpacity
              style={{
                // width: "10%",
                backgroundColor: "#20365F",
                justifyContent: "center",
                alignItems: "center",
                padding: 5,
                marginBottom: 5,
              }}
              onPress={() => setModalAddService(true)}
            >
              <MaterialCommunityIcons name="plus" size={22} color={"white"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalAddService}
        // key={news.id}
        onRequestClose={() => {
          setModalAddService(false);
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            margin: "5%",
            marginTop: "15%",
            height: "80%",
            padding: "3%",
            borderRadius: 20,
            borderColor: "#e3e3e3",
            borderWidth: 2,
            // justifyContent: "space-evenly",
          }}
        >
          <View style={{ alignItems: "flex-end", height: "10%" }}>
            {/* <Text>X</Text> */}
            <MaterialCommunityIcons
              name="close"
              size={22}
              color={"#20365F"}
              onPress={() => setModalAddService(false)}
            />
          </View>
          <View style={{ height: "85%" }}>
            <ScrollView>
              <View style={{}}>
                {services ? (
                  services.map((s) => (
                    <View>
                      <TouchableOpacity
                        onPress={
                          expand === s
                            ? () => setExpand([])
                            : () => setSelectedService(s) || setExpand(s)
                        }
                        // onPress={() => setSelectedService(s)}
                        style={{
                          // borderWidth: 1,
                          // borderBottomWidth: 1,
                          // borderColor: "#20365F",
                          backgroundColor: "#f5f5f5",
                          flexDirection: "row",
                          padding: 10,
                          // borderRadius: 5,
                          marginBottom: expand === s ? 0 : 10,
                        }}
                      >
                        <View
                          style={{
                            width: "80%",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <MaterialIcons
                            name="local-gas-station"
                            size={25}
                            color="#20365F"
                          />
                          <Text> {s.name}</Text>
                        </View>
                        <View style={{ width: "20%", alignItems: "flex-end" }}>
                          <Text style={{}}>
                            {expand === s ? (
                              <MaterialIcons
                                name="expand-less"
                                size={20}
                                color="#20365F"
                              />
                            ) : (
                              <MaterialIcons
                                name="expand-more"
                                size={20}
                                color="#20365F"
                              />
                            )}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      {expand === s && showTimings ? (
                        <View
                          style={{
                            backgroundColor: "#f5f5f5",
                            padding: 10,
                            marginBottom: 10,
                          }}
                        >
                          {userDays.map((d, dayindex) => (
                            <View
                              style={
                                {
                                  // marginBottom: d.timesList.length > 0 && 5,
                                }
                              }
                            >
                              {/* {console.log(userDays)} */}

                              {d.timesList.length > 0 && (
                                <Text>{getDay(d.day)}</Text>
                              )}
                              {d.timesList.length > 0 ? (
                                <View
                                  style={{
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    marginBottom: 10,
                                  }}
                                >
                                  {d.timesList.length > 0
                                    ? d.timesList.map((t, timeindex) =>
                                        checkHour(timeindex, dayindex) ==
                                        "green" ? (
                                          <TouchableOpacity
                                            style={{
                                              borderWidth: 2,
                                              borderColor: "#20365F",
                                              backgroundColor: "#20365F",
                                              borderRadius: 5,
                                              padding: 5,
                                              width: "23%",
                                              margin: 3,
                                              alignItems: "center",
                                              justifyContent: "center",
                                            }}
                                            onPress={() =>
                                              book(dayindex, timeindex)
                                            }
                                          >
                                            <Text
                                              style={{
                                                color: "white",
                                                fontSize: 13,
                                                textAlign: "center",
                                              }}
                                            >
                                              {t.show}
                                            </Text>
                                          </TouchableOpacity>
                                        ) : checkHour(timeindex, dayindex) ==
                                          "white" ? (
                                          <TouchableOpacity
                                            style={{
                                              borderWidth: 2,
                                              borderColor: "#20365F",
                                              backgroundColor: "white",
                                              borderRadius: 5,
                                              padding: 5,
                                              width: "23%",
                                              margin: 3,
                                              alignItems: "center",
                                              justifyContent: "center",
                                            }}
                                            onPress={() =>
                                              book(dayindex, timeindex)
                                            }
                                          >
                                            <Text
                                              style={{
                                                color: "#20365F",
                                                fontSize: 13,
                                                textAlign: "center",
                                              }}
                                            >
                                              {t.show}
                                            </Text>
                                          </TouchableOpacity>
                                        ) : (
                                          <View
                                            style={{
                                              borderWidth: 2,
                                              borderColor: "gray",
                                              backgroundColor: "transparent",
                                              borderRadius: 5,
                                              padding: 5,
                                              width: "23%",
                                              margin: 3,
                                              alignItems: "center",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <Text
                                              style={{
                                                color: "gray",
                                                fontSize: 13,
                                                textAlign: "center",
                                              }}
                                            >
                                              {t.show}
                                            </Text>
                                          </View>
                                        )
                                      )
                                    : // <Text>
                                      //   No services available for this day
                                      // </Text>
                                      null}
                                </View>
                              ) : // <Text>No Available Services</Text>
                              null}
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  ))
                ) : (
                  <Text>No Available Services</Text>
                )}
              </View>
            </ScrollView>
          </View>
          <View style={{ paddingTop: "5%" }}>
            <TouchableOpacity
              onPress={() => setModalAddService(false)}
              style={{
                backgroundColor: "#20365F",
                height: 50,
                width: "50%",
                alignSelf: "center",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 30,
              }}
            >
              {/* <Text style={{ color: "white", fontWeight: "bold" }}>
                Confirm
              </Text> */}
              <MaterialIcons
                name="done"
                size={22}
                color={"white"}
                // onPress={() => setModalAddService(false)}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity
          onPress={() =>
            props.navigation.navigate("CheckOut", {
              tName: tName,
              sName: sName,
              assetBooking: {
                asset,
                startDateTime: start.current,
                endDateTime: end.current,
              },
              serviceBooking,
            })
          }
          style={{
            backgroundColor: "#20365F",
            height: 50,
            width: "55%",
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            // marginStart: "2%",
            // marginEnd: "2%",
            borderRadius: 30,
            // marginBottom: 10,
          }}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
            Checkout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

Details.navigationOptions = (props) => ({
  title: "Details",
  headerStyle: { backgroundColor: "white" },
  headerTintColor: "black",
  headerTintStyle: { fontWeight: "bold" },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50,
  },
  TypesFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: "rgba(96,100,109, 0.8)",
  },
  codeHighlightContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 24,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center",
  },
  tabBarInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: "center",
    backgroundColor: "#fbfbfb",
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    textAlign: "center",
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
