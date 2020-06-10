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
import { Ionicons } from "@expo/vector-icons";

import firebase from "firebase";
import "firebase/functions";
import "firebase/auth";
import db from "../../db";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import { ListItem } from "react-native-elements";
import {
  Collapse,
  CollapseHeader,
  CollapseBody,
} from "accordion-collapse-react-native";
export default function ScheduleCompleted(props) {
  const [user, setUser] = useState({});
  const [date, setDate] = useState();
  const [next, setNext] = useState();
  const [schedule, setSchedule] = useState([]);
  const [show, setShow] = useState([]);
  const [today, setToday] = useState(true);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [currentDate, setCurrentDate] = useState(
    moment().format("YYYY-MM-DDTHH:MM:SS")
  );
  //const [currentDate, setCurrentDate] = useState("2020-05-30T00:00:00")

  useEffect(() => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("schedules")
      .onSnapshot((snapshot) => {
        const temp = [];
        snapshot.forEach((doc) => {
          temp.push({ id: doc.id, ...doc.data() });
        });
        setSchedule(temp.filter((t) => t.completed === true));
      });
    getUser();
  }, []);
  const getUser = async () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((querySnap) => {
        let data = querySnap.data();
        data.id = firebase.auth().currentUser.uid;
        setUser(data);
      });
  };

  useEffect(() => {
    if (schedule.length > 0) {
      manageTime();
    }
  }, [schedule]);

  useEffect(() => {
    setToday(true);
  }, [todaySchedule]);

  const manageTime = () => {
    var newSchedule = schedule;
    for (let k = 0; k < schedule.length; k++) {
      if (
        schedule[k].dateTime.split("T")[1].split(":")[0].split("").length == 1
      ) {
        newSchedule[k].dateTime =
          schedule[k].dateTime.split("T")[0] +
          "T0" +
          schedule[k].dateTime.split("T")[1];
      }
    }

    var temp = newSchedule;
    var newOrder = [];

    while (temp.length > 0) {
      var min = temp[0];
      for (let i = 0; i < temp.length; i++) {
        if (
          new Date(temp[i].dateTime).getTime() <
          new Date(min.dateTime).getTime()
        ) {
          min = temp[i];
        }
      }
      newOrder.push(min);
      temp = temp.filter((t) => t != min);
    }

    setTodaySchedule(
      newOrder.filter(
        (t) => t.dateTime.split("T")[0] === currentDate.split("T")[0]
      )
    );
    setNext(
      newOrder.filter(
        (t) => new Date(t.dateTime).getTime() < new Date(currentDate).getTime()
      )[0]
    );
    setShow(newOrder);
  };

  return (
    <View View style={styles.container}>
      <Text
        style={{
          fontSize: 20,
          color: "#185a9d",
          justifyContent: "center",
          alignSelf: "center",
          marginTop: "5%",
          fontWeight: "bold",
        }}
      >
        Completed Work
      </Text>
      <View
        style={{
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#185a9d",
          height: 50,
          width: "87%",
          alignSelf: "center",
          // opacity: 0.8,
          paddingLeft: "3%",
          marginTop: 20,
          // flexDirection: "row-reverse",
          // justifyContent: "space-between",
          backgroundColor: "white",
        }}
      >
        <DatePicker
          style={{
            width: "100%",
            color: "#667085",
            justifyContent: "flex-start",
          }}
          //is24Hour
          date={date}
          mode="date"
          placeholder="View my schedule in.."
          format="YYYY-MM-DD"
          //minDate={moment()}
          // maxDate={moment().add(3,"month")}
          confirmBtnText="Confirm"
          cancelBtnText="Cancel"
          customStyles={{
            dateIcon: {
              // // width: 1,
              // // height: 1,
              // left: true,
            },
            dateInput: {
              borderWidth: 0,
              color: "#698eb3",
              alignItems: "flex-start",
              fontSize: 12,
              // marginRight: "68%",
              backgroundColor: "white",
            },
            placeholderText: {
              fontSize: 16,
              color: "#698eb3",
              backgroundColor: "white",
            },
            dateText: {
              fontSize: 15,
              color: "#698eb3",
            },
          }}
          onDateChange={(t) => setDate(t) || setToday(false)}
        />
      </View>
      {/* <TouchableOpacity
        style={{ borderWidth: 2, padding: 3, width: 100 }}
        onPress={() => props.navigation.navigate("Schedule")}
      >
        <Text>Back</Text>
      </TouchableOpacity> */}
      {/* <TouchableOpacity
        style={{ borderWidth: 2, padding: 3, width: 100 }}
        onPress={() => setToday(true)}
      >
        <Text>Today</Text>
      </TouchableOpacity> */}

      {today ? (
        <View>
          {todaySchedule.length > 0 ? (
            <View style={styles.two}>
              <Collapse>
                <CollapseHeader>
                  <View
                    style={{
                      flexDirection: "row",
                      //justifyContent: "space-between",
                      // paddingLeft: 20,
                      paddingRight: "5%",
                    }}
                  >
                    <Text style={styles.cardTitle}>
                      Today's Completed Work:{" "}
                      {todaySchedule[0].dateTime.split("T")[0]}
                    </Text>
                  </View>
                  <CollapseBody>
                    <View>
                      <View>
                        {todaySchedule.map((s) => (
                          <ListItem
                            key={s.id}
                            title={s.dateTime.split("T")[1]}
                            rightTitle={s.serviceBooking.service.name}
                            subtitle={
                              s.serviceBooking.assetBooking.asset.description
                            }
                            rightSubtitle={
                              s.serviceBooking.assetBooking.asset.name
                            }
                            titleStyle={{ color: "black", fontWeight: "bold" }}
                            rightTitleStyle={{
                              color: "black",
                              fontWeight: "bold",
                            }}
                            subtitleStyle={{ color: "gray" }}
                            rightSubtitleStyle={{ color: "gray" }}
                            bottomDivider
                          />
                        ))}
                      </View>
                    </View>
                  </CollapseBody>
                </CollapseHeader>
              </Collapse>
            </View>
          ) : (
            <View style={styles.two}>
              <Collapse>
                <CollapseHeader>
                  <View
                    style={{
                      flexDirection: "row",
                      paddingRight: "5%",
                    }}
                  >
                    <Text style={styles.cardTitle}>No Scheduled Booking</Text>
                  </View>
                </CollapseHeader>
              </Collapse>
            </View>
          )}
        </View>
      ) : (
        <View>
          <View style={styles.two}>
            <Collapse>
              <CollapseHeader>
                <View
                  style={{
                    flexDirection: "row",
                    paddingRight: "5%",
                  }}
                >
                  <Text style={styles.cardTitle}>
                    Today's Completed Work{" "}
                    {todaySchedule[0].dateTime.split("T")[0]}
                  </Text>
                </View>
                <CollapseBody>
                  <View>
                    <View>
                      {todaySchedule.map((s) => (
                        <ListItem
                          key={s.id}
                          title={s.dateTime.split("T")[1]}
                          rightTitle={s.serviceBooking.service.name}
                          subtitle={
                            s.serviceBooking.assetBooking.asset.description
                          }
                          rightSubtitle={
                            s.serviceBooking.assetBooking.asset.name
                          }
                          titleStyle={{ color: "black", fontWeight: "bold" }}
                          rightTitleStyle={{
                            color: "black",
                            fontWeight: "bold",
                          }}
                          subtitleStyle={{ color: "gray" }}
                          rightSubtitleStyle={{ color: "gray" }}
                          bottomDivider
                        />
                      ))}
                    </View>
                  </View>
                </CollapseBody>
              </CollapseHeader>
            </Collapse>
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",
    //width: Dimensions.get("window").width,
    // height: Math.round(Dimensions.get("window").height),
  },
  cardTitle: {
    fontSize: 18,
    // backgroundColor: "red",
    width: "100%",
    height: 25,
    color: "#185a9d",
    fontWeight: "bold",
  },
  cardTitleInactive: {
    fontSize: 18,
    // backgroundColor: "red",
    width: "100%",
    height: 50,
    color: "#6b6b6b",
    // fontWeight: "bold",
  },
  two: {
    backgroundColor: "white",
    width: "100%",
    marginTop: "3%",
    padding: "5%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
    flexDirection: "row",
    flexWrap: "wrap",
    // justifyContent: "space-between",
  },
  two2: {
    backgroundColor: "white",
    width: "100%",
    marginTop: "3%",
    padding: "3%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
    // flexDirection: "row",
    //flexWrap: "wrap",
    borderBottomColor: "white",
    // justifyContent: "space-between",
  },
  surface: {
    flex: 0.3,
    marginTop: "2%",
    //  backgroundColor: "blue",
    // width: "50%",
    // height: "100%",
    // alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    // alignItems: "center",
    justifyContent: "space-evenly",

    // justifyContent: "space-between",
  },
  actionButtonIcon: {
    fontSize: 20,
    // height: 40,
    color: "white",
  },
  actionButtonIcon2: {
    //height: 22,
    // width: 22,
    fontSize: 20,
  },
  text: {
    fontSize: 80,
    // marginLeft: "1%",
    // marginRight: "1%",
    marginBottom: "1%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  redButton: {
    backgroundColor: "#3ea3a3",
    height: 40,
    width: "38%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 5,
    marginBottom: 10,
  },
});
