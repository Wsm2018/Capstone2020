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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import ActionButton from "react-native-action-button";

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
    <View View style={styles.container}>
      <ScrollView>
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
          My Schedule
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

        <View style={styles.two}>
          <Text style={styles.cardTitle}>My services</Text>
          {user.services &&
            services.length > 0 &&
            user.services.map((service) => (
              <View style={{ width: "33%", alignItems: "center" }}>
                <TouchableOpacity
                  // onPress={}
                  style={{
                    backgroundColor: "#185a9d",
                    width: 100,
                    height: 100,
                    margin: 5,
                    alignItems: "center",
                    flexDirection: "row",
                    //elevation: 12,
                    borderWidth: 2,
                    borderColor: "#185a9d",
                  }}
                >
                  <View
                    style={{
                      // height: "20%",
                      width: "100%",
                      justifyContent: "center",
                      textAlign: "center",
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="worker"
                      size={33}
                      color="white"
                    />

                    <Text
                      style={{
                        fontSize: 20,
                        color: "white",
                        marginBottom: "2%",
                        // fontWeight: "bold",
                      }}
                    >
                      {services.filter((s) => s.id === service)[0].name}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
        </View>

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
      <ActionButton
        buttonColor={"#3ea3a3"}
        size={50}
        //  style={styles.actionButtonIcon2}
        // icon={responsiveScreenFontSize(10)}
        buttonTextStyle={{ fontSize: 20 }}
        // position="left"
        //verticalOrientation="down"
      >
        <ActionButton.Item
          buttonColor="#3498db"
          title="Logout"
          onPress={() => {
            firebase.auth().signOut();
            console.log(firebase.auth().currentUser.uid);
          }}
        >
          <MaterialCommunityIcons
            name="logout"
            size={20}
            style={styles.actionButtonIcon}
          />
        </ActionButton.Item>
      </ActionButton>
    </View>
  );
}
Schedule.navigationOptions = (props) => ({
  title: "Schedule",
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
});
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
    height: 50,
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
});
