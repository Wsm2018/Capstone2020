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
  Modal,
  ScrollViewBase,
} from "react-native";
import firebase from "firebase";
import "firebase/functions";
import "firebase/auth";
import db from "../../db";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import { ListItem } from "react-native-elements";

export default function Schedule(props) {
  const [user, setUser] = useState({});
  const [services, setServices] = useState({});
  const [date, setDate] = useState();
  const [next, setNext] = useState();
  const [schedule, setSchedule] = useState([]);
  const [show, setShow] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [today, setToday] = useState(true);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [currentDate, setCurrentDate] = useState(
    moment().format("YYYY-MM-DDTHH:MM:SS")
  );
  //const [currentDate, setCurrentDate] = useState("2020-05-30T00:00:00")

  useEffect(() => {
    db.collection("services").onSnapshot((snapshot) => {
      const temp = [];
      snapshot.forEach((doc) => {
        temp.push({ id: doc.id, ...doc.data() });
      });
      setServices(temp);
    });

    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("schedules")
      .onSnapshot((snapshot) => {
        const temp = [];
        snapshot.forEach((doc) => {
          temp.push({ id: doc.id, ...doc.data() });
        });
        setSchedule(temp.filter((t) => t.completed === false));
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
        (t) => t.dateTime.split("T")[0] === currentDate.split("T")[0]
        //(t) => new Date(t.dateTime).getTime() < new Date(currentDate).getTime()
      )[0]
    );
    // console.log(
    //   "s.serviceBooking.assetBooking.asset.location",
    //   newOrder.filter(
    //     (t) => t.dateTime.split("T")[0] === currentDate.split("T")[0]
    //     //(t) => new Date(t.dateTime).getTime() < new Date(currentDate).getTime()
    //   )[0].serviceBooking.assetBooking.asset.location
    // );
    setShow(newOrder);
  };

  const handleComplete = async (s) => {
    s.completed = true;
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("schedules")
      .doc(s.id)
      .update(s);

    // let customer = {};
    // db.collection("users")
    //   .doc(s.serviceBooking.assetBooking.user.id)
    //   .onSnapshot((querySnap) => {
    //     customer = querySnap.data();
    //     customer.id = s.serviceBooking.assetBooking.user.id;
    //   });
    // customer.completedService = {
    //   title: "Service completed",
    //   body: `The ${s.serviceBooking.service.name} servise on ${s.serviceBooking.assetBooking.asset.name} is completed)`,
    // };
    // await db.collection("users").doc(customer.id).update(customer);

    setModalVisible(false);
  };

  return (
    <View>
      <ScrollView>
        <Text>Schedule</Text>
        <View>
          <Text>My services </Text>
          {user.services &&
            services &&
            user.services.map((service) => (
              <Text>{services.filter((s) => s.id === service)[0].name}</Text>
            ))}
        </View>

        <DatePicker
          style={{ width: 200 }}
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
          onDateChange={(t) => setDate(t) || setToday(false)}
        />
        <TouchableOpacity
          style={{ borderWidth: 2, padding: 3, width: 100 }}
          onPress={() => props.navigation.navigate("ScheduleCompleted")}
        >
          <Text>view completed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ borderWidth: 2, padding: 3, width: 100 }}
          onPress={() => setToday(true)}
        >
          <Text>Today</Text>
        </TouchableOpacity>

        <Text>Next: </Text>
        {next ? (
          <View>
            <ListItem
              key={next.id}
              title={next.dateTime.split("T")[1]}
              rightTitle={next.serviceBooking.service.name}
              subtitle={next.serviceBooking.assetBooking.asset.description}
              rightSubtitle={next.serviceBooking.assetBooking.asset.name}
              titleStyle={{ color: "black", fontWeight: "bold" }}
              rightTitleStyle={{ color: "black", fontWeight: "bold" }}
              subtitleStyle={{ color: "gray" }}
              rightSubtitleStyle={{ color: "gray" }}
              bottomDivider
            />

            <TouchableOpacity
              style={{ borderWidth: 2, padding: 3, width: 100 }}
              onPress={() =>
                props.navigation.navigate("ScheduleMap", {
                  assetDestination: {
                    coords: {
                      latitude: parseFloat(
                        next.serviceBooking.assetBooking.asset.location.U
                      ),
                      longitude: parseFloat(
                        next.serviceBooking.assetBooking.asset.location.k
                      ),
                    },
                  },
                })
              }
            >
              <Text>view in map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ borderWidth: 2, padding: 3, width: 100 }}
              onPress={() => setModalVisible(true)}
            >
              <Text>Completed</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text>All Done</Text>
        )}

        {today ? (
          <View>
            {todaySchedule.length > 0 ? (
              <View>
                <Text style={{ fontSize: 26 }}>
                  {todaySchedule[0].dateTime.split("T")[0]}
                </Text>
                <View>
                  {todaySchedule.map((s) => (
                    <ListItem
                      key={s.id}
                      title={s.dateTime.split("T")[1]}
                      rightTitle={s.serviceBooking.service.name}
                      subtitle={s.serviceBooking.assetBooking.asset.description}
                      rightSubtitle={s.serviceBooking.assetBooking.asset.name}
                      titleStyle={{ color: "black", fontWeight: "bold" }}
                      rightTitleStyle={{ color: "black", fontWeight: "bold" }}
                      subtitleStyle={{ color: "gray" }}
                      rightSubtitleStyle={{ color: "gray" }}
                      bottomDivider
                    />
                  ))}
                </View>
              </View>
            ) : (
              <Text>No Scheduled Bookings</Text>
            )}
          </View>
        ) : (
          <View>
            <Text style={{ fontSize: 26 }}>
              {show &&
                show.filter((s) => s.dateTime.split("T")[0] === date).length >
                  0 &&
                show
                  .filter((s) => s.dateTime.split("T")[0] === date)[0]
                  .dateTime.split("T")[0]}
            </Text>
            <View>
              {show.map((s) =>
                s.dateTime.split("T")[0] === date ? (
                  <ListItem
                    key={s.id}
                    title={s.dateTime.split("T")[1]}
                    rightTitle={s.serviceBooking.service.name}
                    subtitle={s.serviceBooking.assetBooking.asset.description}
                    rightSubtitle={s.serviceBooking.assetBooking.asset.name}
                    titleStyle={{ color: "black", fontWeight: "bold" }}
                    rightTitleStyle={{ color: "black", fontWeight: "bold" }}
                    subtitleStyle={{ color: "gray" }}
                    rightSubtitleStyle={{ color: "gray" }}
                    bottomDivider
                  />
                ) : null
              )}
            </View>
          </View>
        )}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          <View style={{ marginTop: 22 }}>
            <View
              style={{
                marginTop: 22,
                backgroundColor: "#919191",
                margin: "5%",
                padding: "5%",
                // paddingTop: "1%",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 5,
                ...Platform.select({
                  ios: {
                    paddingTop: 50,
                    margin: "15%",
                    minHeight: 300,
                    width: "70%",
                  },
                  android: {
                    minHeight: 200,
                  },
                }),
              }}
            >
              <Text>Did you complete the service</Text>
              <Button title="yes" onPress={() => handleComplete(next)} />
              <Button title="no" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}
