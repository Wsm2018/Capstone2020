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
} from "react-native";
import moment from "moment";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db.js";
import { timing } from "react-native-reanimated";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

require("firebase/firestore");

export default function ExtendServices(props) {
  //   const tName = props.tName
  //   const sName = props.sName
  const asset = props.asset;
  const [expand, setExpand] = useState();
  const [displayServices, setDisplayServices] = useState([]);
  const showBookings = useRef();
  const [serviceBooking, setServiceBooking] = useState([]);
  const SB = useRef();
  const [selectedService, setSelectedService] = useState();
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

  useEffect(() => {
    // if( props.oldSb != []){
    //   console.log(props.oldSb)
    //   setServiceBooking(props.oldSb)
    //   setUserDays(props.oldDays)
    //   showBookings.current = props.oldSh
    //   SB.current = serviceBooking
    //   setUpdateAvailableTimings(props.oldAvailable)
    //   console.log("old available is", props.oldAvailable)
    //   setUpdate(true)
    // }
    // if( props.oldSh != []){
    //   setDisplayServices(props.oldSh)
    // }

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
      .where("role", "==", "services employee")
      .onSnapshot((snapshot) => {
        var worker = "";
        snapshot.forEach((doc) => {
          worker = { ...doc.data(), id: doc.id };
          // if( worker.id != firebase.auth().currentUser.uid){
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
          //}
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

  const done = () => {
    props.serviceBookingArr(
      SB.current,
      displayServices,
      userDays,
      updateAvailableTimings
    );
  };
  const getDay = (date) => {
    return week[new Date(date).getDay()] + ", " + date;
  };

  const checkToDelete = (timing, service) => {
    var t = "";
    if (timing.split(" ").length >= 3) {
      t = timing.split(" ")[1] + " " + timing.split(" ")[2];
    } else {
      t = timing;
    }

    var index = SB.current.findIndex(
      (s) => s.service == service && s.show == t
    );
    var updateWorkers = allWorkers;
    for (let i = 0; i < updateWorkers.length; i++) {
      if (updateWorkers[i].worker.id == SB.current[index].worker) {
        var newSchedule = updateWorkers[i].schedules.filter(
          (t) =>
            t.dateTime != SB.current[index].day + "T" + SB.current[index].time
        );
        updateWorkers[i].schedules = newSchedule;
        var ud = userDays;
        for (let k = 0; k < userDays.length; k++) {
          if (userDays[k].day == SB.current[index].day) {
            ud[k].bookings = userDays[k].bookings - 1;
            setUserDays(ud);
          }
        }
        setAllWorkers(updateWorkers);
        break;
      }
    }
    var temp = [];
    for (let i = 0; i < SB.current.length; i++) {
      if (i !== index) {
        temp.push(SB.current[i]);
      }
    }
    SB.current = temp;
    setServiceBooking([...temp]);
    orderList();
    getAvailableTimings();
  };

  const deleteAll = (service) => {
    var toDelete = serviceBooking.filter((s) => s.service === service);
    for (let i = 0; i < toDelete.length; i++) {
      checkToDelete(toDelete[i].show, service);
    }
  };

  return (
    <ScrollView>
      <View>
        <MaterialCommunityIcons
          name={"close"}
          size={20}
          color={"#901616"}
          onPress={() => props.serviceBookingArr()}
          style={{ width: "15%", position: "absolute", left: "90%" }}
        />
        <Text
          style={{
            color: "#246175",
            marginTop: "4%",
            marginBottom: "2%",
            fontSize: 20,
            marginRight: "auto",
            marginLeft: "auto",
            fontWeight: "bold",
          }}
        >
          Services
        </Text>

        <ScrollView>
          <View style={{}}>
            {services
              ? services.map((s) => (
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
                        <MaterialCommunityIcons
                          name={s.serviceIcon}
                          size={25}
                          color="#185a9d"
                        />
                        <Text> {s.name}</Text>
                      </View>
                      <View style={{ width: "20%", alignItems: "flex-end" }}>
                        <Text style={{}}>
                          {expand === s ? (
                            <MaterialIcons
                              name="expand-less"
                              size={20}
                              color="#185a9d"
                            />
                          ) : (
                            <MaterialIcons
                              name="expand-more"
                              size={20}
                              color="#185a9d"
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
                            {/* {d.timesList.length > 0 && ( */}
                            <Text>{getDay(d.day)}</Text>
                            {/* )} */}
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
                                            // borderWidth: 2,
                                            borderColor: "#185a9d",
                                            backgroundColor: "#185a9d",
                                            borderRadius: 5,
                                            padding: 5,
                                            width: "25%",
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
                                            borderColor: "#185a9d",
                                            backgroundColor: "white",
                                            borderRadius: 5,
                                            padding: 5,
                                            width: "25%",
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
                                              color: "#185a9d",
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
                                            width: "25%",
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
                            ) : (
                              <Text
                                style={{
                                  marginBottom: 10,
                                  color: "#901616",
                                }}
                              >
                                No services available for this day
                              </Text>
                            )}
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ))
              : // <Text>No Available Services</Text>
                null}
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity
        style={{
          width: "30%",
          backgroundColor: "#2E9E9B",
          borderRadius: 5,
          margin: "3%",
          padding: 10,
          alignItems: "center",
          marginLeft: "auto",
          marginRight: "auto",
        }}
        onPress={() => done()}
      >
        <Text style={styles.btnTitle}>OK</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

ExtendServices.navigationOptions = (props) => ({
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
  btnTitle: {
    color: "white",
    fontSize: 15,
    marginBottom: "1%",
  },
  btn: {
    width: "30%",
    backgroundColor: "#2E9E9B",
    borderRadius: 5,
    margin: "3%",
    padding: 10,
    alignItems: "center",
  },
});
