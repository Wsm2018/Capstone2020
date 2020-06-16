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
import { ListItem, getIconType } from "react-native-elements";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";
import {
  Collapse,
  CollapseHeader,
  CollapseBody,
} from "accordion-collapse-react-native";
import * as Device from "expo-device";
import { Feather, SimpleLineIcons } from "@expo/vector-icons";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
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
  const [deviceType, setDeviceType] = useState(0);
  //const [currentDate, setCurrentDate] = useState("2020-05-30T00:00:00")
  const handleChangeRole = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({ activeRole: null });
  };

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
  const getDeviceType = async () => {
    const type = await Device.getDeviceTypeAsync();
    setDeviceType(type);
  };
  useEffect(() => {
    getDeviceType();
  }, []);
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
            fontSize: responsiveFontSize(2),
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
            // borderColor: "#185a9d",
            height: responsiveScreenHeight(5),
            width: "87%",
            alignSelf: "center",
            // opacity: 0.8,
            paddingLeft: "3%",
            marginTop: 20,
            justifyContent: "center",
            alignContent: "center",
            alignSelf: "center",
            backgroundColor: "white",
          }}
        >
          <DatePicker
            style={{
              width: "100%",

              // color: "#667085",
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
                //  color: "#698eb3",
                alignItems: "flex-start",
                fontSize: 12,
                // marginRight: "68%",
                // backgroundColor: "white",
              },
              placeholderText: {
                fontSize: responsiveFontSize(1.5),
                //color: "#698eb3",
                justifyContent: "flex-end",
                alignContent: "center",
                alignSelf: "center",
                backgroundColor: "white",
                width: "100%",
                height: responsiveScreenHeight(4),
              },
              dateText: {
                fontSize: 15,
                //  color: "#698eb3",
                fontSize: responsiveFontSize(1.5),
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
                    backgroundColor: "white",
                    width: responsiveScreenWidth(22),
                    height: responsiveScreenHeight(10),
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
                      name={
                        services.filter((s) => s.id === service)[0].serviceIcon
                      }
                      size={responsiveScreenHeight(4)}
                      color="#185a9d"
                    />

                    <Text
                      style={{
                        fontSize: responsiveFontSize(2),
                        color: "#185a9d",
                        marginBottom: "2%",
                        // fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {services.filter((s) => s.id === service)[0].name}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
        </View>

        {/* <TouchableOpacity
          style={{ borderWidth: 2, padding: 3, width: 100 }}
          onPress={() => setToday(true)}
        >
          <Text>Today</Text>
        </TouchableOpacity> */}

        {next ? (
          <View style={styles.two2}>
            <Text style={styles.cardTitle}>Next</Text>

            <View style={styles.text}>
              <Text
                style={
                  deviceType === 1
                    ? {
                        color: "black",
                        fontSize: responsiveScreenFontSize(2),
                        fontWeight: "bold",
                      }
                    : {
                        color: "black",
                        fontSize: responsiveScreenFontSize(2),
                        // fontWeight: "bold",
                      }
                }
              >
                Time
              </Text>
              <Text
                style={{ fontSize: responsiveFontSize(2), marginTop: "1%" }}
              >
                {next.dateTime.split("T")[1]}
              </Text>
            </View>
            <View style={styles.text}>
              <Text style={{ fontSize: responsiveFontSize(2), color: "black" }}>
                Service
              </Text>
              <Text
                style={{ fontSize: responsiveFontSize(2), marginTop: "1%" }}
              >
                {next.serviceBooking.service.name}
              </Text>
            </View>
            <View style={styles.text}>
              <Text style={{ fontSize: responsiveFontSize(2), color: "black" }}>
                Parking Name
              </Text>
              <Text
                style={{ fontSize: responsiveFontSize(2), marginTop: "1%" }}
              >
                {next.serviceBooking.assetBooking.asset.name}
              </Text>
            </View>
            <View style={styles.text}>
              <Text style={{ fontSize: responsiveFontSize(2), color: "black" }}>
                Description
              </Text>
              <Text
                style={{ fontSize: responsiveFontSize(2), marginTop: "1%" }}
              >
                {next.serviceBooking.assetBooking.asset.description}
              </Text>
            </View>
            <Text></Text>
            <View
              style={{
                // width: "100%",
                // height: "5%",
                justifyContent: "space-evenly",
                alignItems: "center",
                alignSelf: "center",
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#3ea3a3",
                  height: responsiveScreenHeight(4.5),
                  width: "38%",
                  alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  marginStart: "2%",
                  marginEnd: "2%",
                  borderRadius: 5,
                  marginBottom: 10,
                }}
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
                <Text
                  style={{
                    color: "white",
                    fontSize: responsiveScreenFontSize(2),
                  }}
                >
                  View in Map
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "#3ea3a3",
                  height: responsiveScreenHeight(4.5),
                  width: "38%",
                  alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  marginStart: "2%",
                  marginEnd: "2%",
                  borderRadius: 5,
                  marginBottom: 10,
                }}
                onPress={() => setModalVisible(true)}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: responsiveScreenFontSize(2),
                  }}
                >
                  {" "}
                  Complete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.two2}>
            <Text style={styles.cardTitle}>Next</Text>

            <View style={styles.text}>
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  color: "black",
                  marginTop: "1%",
                }}
              >
                All Done
              </Text>
            </View>
          </View>
        )}

        {/* <View>
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
          </View> */}
        {today ? (
          <View>
            {todaySchedule.length > 0 ? (
              <View style={styles.two2}>
                <Collapse>
                  <CollapseHeader>
                    <View
                      style={{
                        flexDirection: "row",
                        //justifyContent: "space-between",
                        // paddingLeft: 20,
                        paddingRight: "5%",
                      }}
                      // Platform.isPad ? styles.arrowIpad : styles.arrowPhone
                    >
                      <Text style={styles.cardTitle}>
                        {todaySchedule[0].dateTime.split("T")[0]}
                      </Text>
                      <Ionicons
                        name="md-arrow-dropdown"
                        size={responsiveScreenHeight(3)}
                        color="#5c5b5b"
                      />
                    </View>
                  </CollapseHeader>
                  <CollapseBody>
                    <View>
                      {/* <Text style={{ fontSize: 26 }}>
                           {todaySchedule[0].dateTime.split("T")[0]}
                         </Text> */}
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
                            titleStyle={{
                              color: "black",
                              fontWeight: "bold",
                              fontSize: responsiveFontSize(2),
                            }}
                            rightTitleStyle={{
                              color: "black",
                              fontSize: responsiveFontSize(2),
                              fontWeight: "bold",
                            }}
                            subtitleStyle={{
                              color: "gray",
                              fontSize: responsiveFontSize(2),
                            }}
                            rightSubtitleStyle={{
                              color: "gray",
                              fontSize: responsiveFontSize(2),
                            }}
                            bottomDivider
                          />
                        ))}
                      </View>
                    </View>
                  </CollapseBody>
                </Collapse>
              </View>
            ) : (
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
                      // Platform.isPad ? styles.arrowIpad : styles.arrowPhone
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
            <View style={styles.two2}>
              <Collapse>
                <CollapseHeader>
                  <View
                    style={{
                      flexDirection: "row",
                      //justifyContent: "space-between",
                      // paddingLeft: 20,
                      paddingRight: "5%",
                    }}
                    // Platform.isPad ? styles.arrowIpad : styles.arrowPhone
                  >
                    {show &&
                    show.filter((s) => s.dateTime.split("T")[0] === date)
                      .length > 0 ? (
                      <Text style={styles.cardTitle}>
                        {
                          show
                            .filter((s) => s.dateTime.split("T")[0] === date)[0]
                            .dateTime.split("T")[0]
                        }
                      </Text>
                    ) : (
                      <Text style={styles.cardTitle}>No Work On This Date</Text>
                    )}

                    {show.filter((s) => s.dateTime.split("T")[0] === date)
                      .length > 0 && (
                      <Ionicons
                        name="md-arrow-dropdown"
                        size={30}
                        color="#5c5b5b"
                      />
                    )}
                  </View>
                </CollapseHeader>
                <CollapseBody>
                  <View>
                    {/* <Text style={{ fontSize: 26 }}>
                           {todaySchedule[0].dateTime.split("T")[0]}
                         </Text> */}
                    <View>
                      {
                        show.filter((o) => o.dateTime.split("T")[0] === date)
                          .length > 0 &&
                          show.map((s) =>
                            s.dateTime.split("T")[0] === date ? (
                              <ListItem
                                key={s.id}
                                title={s.dateTime.split("T")[1]}
                                rightTitle={s.serviceBooking.service.name}
                                subtitle={
                                  s.serviceBooking.assetBooking.asset
                                    .description
                                }
                                rightSubtitle={
                                  s.serviceBooking.assetBooking.asset.name
                                }
                                titleStyle={{
                                  color: "black",
                                  fontWeight: "bold",
                                  fontSize: responsiveFontSize(2),
                                }}
                                rightTitleStyle={{
                                  color: "black",
                                  fontWeight: "bold",
                                  fontSize: responsiveFontSize(2),
                                }}
                                subtitleStyle={{
                                  color: "gray",
                                  fontSize: responsiveFontSize(2),
                                }}
                                rightSubtitleStyle={{
                                  color: "gray",
                                  fontSize: responsiveFontSize(2),
                                }}
                                bottomDivider
                              />
                            ) : null
                          )
                        // : (
                        //   <View style={styles.two}>
                        //     <Collapse>
                        //       <CollapseHeader>
                        //         <View
                        //           style={{
                        //             flexDirection: "row",
                        //             paddingRight: "5%",
                        //           }}
                        //         >
                        //           <Text style={styles.cardTitle}>
                        //             No Work Done Today
                        //           </Text>
                        //         </View>
                        //       </CollapseHeader>
                        //     </Collapse>
                        //   </View>
                        // )
                      }
                    </View>
                  </View>
                </CollapseBody>
              </Collapse>
            </View>

            {/* 
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
            </View> */}
          </View>
        )}
        <Text></Text>
        <TouchableOpacity
          style={styles.blueButton}
          onPress={() => props.navigation.navigate("ScheduleCompleted")}
        >
          <Text style={{ color: "white", fontSize: responsiveFontSize(2) }}>
            View Completed Work
          </Text>
        </TouchableOpacity>

        <Text></Text>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignContent: "center",
              alignSelf: "center",
              alignItems: "center",
              marginTop: 22,
              // ---This is for Width---
              width: "80%",
            }}
          >
            <View
              style={{
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
                justifyContent: "center",
                alignContent: "center",
                alignSelf: "center",
                alignItems: "center",
                // ---This is for Height---
                height: "50%",
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  textAlign: "center",
                }}
              >
                Did you complete the service
              </Text>
              <Text></Text>
              <Text></Text>
              <Text></Text>
              <Text></Text>
              <Text></Text>
              <Text></Text>
              <View
                style={{
                  width: "100%",
                  height: "5%",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  alignSelf: "center",
                  flexDirection: "row",
                }}
              >
                {/* ---------------------------------CONFIRM--------------------------------- */}
                <TouchableOpacity
                  onPress={() => handleComplete(next)}
                  style={styles.greenButton}
                >
                  <Text
                    style={{ color: "white", fontSize: responsiveFontSize(2) }}
                  >
                    {" "}
                    Yes
                  </Text>
                </TouchableOpacity>
                {/* ---------------------------------CANCEL--------------------------------- */}
                <TouchableOpacity
                  style={styles.redButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text
                    style={{ color: "white", fontSize: responsiveFontSize(2) }}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
              {/* 
              <Button title="yes" onPress={() => handleComplete(next)} />
              <Button title="no" onPress={() => setModalVisible(false)} /> */}
            </View>
          </View>
        </Modal>
      </ScrollView>
      {user.role != "services employee" ? (
        <ActionButton
          // buttonColor={"#3ea3a3"}
          // size={80}
          // //  style={styles.actionButtonIcon2}
          // // icon={responsiveScreenFontSize(10)}
          // buttonTextStyle={{ fontSize: 20 }}
          // position="left"
          //verticalOrientation="down"
          buttonColor={"#3ea3a3"}
          size={responsiveScreenFontSize(8)}
          //  style={styles.actionButtonIcon2}
          // icon={responsiveScreenFontSize(10)}
          buttonTextStyle={{ fontSize: responsiveScreenFontSize(3) }}
        >
          <ActionButton.Item
            buttonColor="#185a9d"
            title="Change Role"
            onPress={handleChangeRole}
          >
            <SimpleLineIcons
              name="people"
              size={deviceType === 1 ? 60 : 80}
              style={styles.actionButtonIcon}
            />
          </ActionButton.Item>
          <ActionButton.Item
            buttonColor="#901616"
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
      ) : (
        <TouchableOpacity
          style={{
            backgroundColor: "#901616",
            width: "20%",
            borderRadius: 1000,
            position: "absolute",
            aspectRatio: 1 / 1,
            justifyContent: "center",
            alignItems: "center",
            bottom: "3%",
            right: "5%",
          }}
          onPress={() => {
            firebase.auth().signOut();
            console.log(firebase.auth().currentUser.uid);
          }}
        >
          <MaterialCommunityIcons
            name="logout"
            size={25}
            style={styles.actionButtonIcon}
          />
          <Text style={{ color: "white", fontSize: 8 }}>Logout</Text>
        </TouchableOpacity>
      )}
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
    fontSize: responsiveFontSize(2.2),
    // backgroundColor: "red",
    width: "100%",
    // height: 25,
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
    padding: "3%",
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
    // fontSize: 20,
    // height: 40,
    color: "white",
  },
  actionButtonIcon2: {
    //height: 22,
    // width: 22,
    fontSize: 20,
  },
  text: {
    // fontSize: 100,
    // marginLeft: "1%",
    // marginRight: "1%",
    marginBottom: "1%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  blueButton: {
    backgroundColor: "#185a9d",
    height: responsiveScreenHeight(4.5),
    width: "75%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 5,
    marginBottom: 10,
  },
  greenButton: {
    backgroundColor: "#3ea3a3",
    height: responsiveScreenHeight(4.5),
    width: "38%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 5,
    marginBottom: 10,
  },
  redButton: {
    backgroundColor: "#901616",
    height: responsiveScreenHeight(4.5),
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
