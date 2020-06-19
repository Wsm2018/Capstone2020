import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  Picker,
  Dimensions,
  ScrollView,
  Image,
  ImageBackground,
} from "react-native";

import { ButtonGroup, Input, SearchBar } from "react-native-elements";
//Database Connection / firebase
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import { set } from "react-native-reanimated";
import { Card } from "react-native-shadow-cards";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as Device from "expo-device";
import { Feather, SimpleLineIcons } from "@expo/vector-icons";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import ActionButton from "react-native-action-button";
// Main Method
export default function TicketAgentScreen(props) {
  //UseState
  const [user, setUser] = useState(null);
  const [agentList, setAgentList] = useState([]);
  const [ticketList, setTicketList] = useState(null);
  const [ticketListSearch, setTicketListSearch] = useState(null);
  const handleChangeRole = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({ activeRole: null });
  };
  const [deviceType, setDeviceType] = useState(0);
  const handleLogout = () => {
    firebase.auth().signOut();
  };
  const getDeviceType = async () => {
    const type = await Device.getDeviceTypeAsync();
    setDeviceType(type);
  };
  useEffect(() => {
    getDeviceType();
  }, []);
  //UseEffect
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const unsub = db.collection("customerSupport").onSnapshot((Snap) => {
      let temp = [];
      Snap.forEach((doc) => {
        temp.push({ id: doc.id, ...doc.data() });
      }),
        //setTicketList(temp);
        sorting(temp);
    });

    return () => {
      unsub();
    };
  }, []);

  const sorting = (item) => {
    let veryHigh = [],
      high = [],
      medium = [],
      normal = [];

    for (let i = 0; i < item.length; i++) {
      if (item[i].priority == "very high") {
        veryHigh.push(item[i]);
      } else if (item[i].priority == "high") {
        high.push(item[i]);
      } else if (item[i].priority == "medium") {
        medium.push(item[i]);
      } else {
        normal.push(item[i]);
      }
    }
    veryHigh = veryHigh.reverse(
      (a, b) => a.dateOpen.toDate() - b.dateOpen.toDate()
    );
    high = high.reverse((a, b) => a.dateOpen.toDate() - b.dateOpen.toDate());
    medium = medium.reverse(
      (a, b) => a.dateOpen.toDate() - b.dateOpen.toDate()
    );
    normal = normal.reverse(
      (a, b) => a.dateOpen.toDate() - b.dateOpen.toDate()
    );

    let sortedTicketList = [];
    veryHigh.forEach((item) => sortedTicketList.push(item));
    high.forEach((item) => sortedTicketList.push(item));
    medium.forEach((item) => sortedTicketList.push(item));
    normal.forEach((item) => sortedTicketList.push(item));

    setTicketList(sortedTicketList);
    setTicketListSearch(sortedTicketList);
  };
  //fetching user data from firebase
  const fetchData = async () => {
    let tempUser;
    const info = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    tempUser = { id: info.id, ...info.data() };
    setUser(tempUser);

    let agentsTemp = [];
    const info2 = await db
      .collection("users")
      .where("activeRole", "==", "customer support")
      .get();
    info2.forEach((doc) => agentsTemp.push({ id: doc.id, ...doc.data() }));
    setAgentList(agentsTemp);
  };

  const buttons = ["Ticket List", "My Tickets", "Archive"];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    handleSearch(search);
  }, [search]);

  const handleSearch = (query) => {
    if (query.length > 0) {
      setSearch(query);
      let tempUsers = [...ticketList];
      let result = tempUsers.filter((ticket) =>
        ticket.title.toLowerCase().match(query.toLowerCase())
      );

      setTicketListSearch(result);
    } else {
      setSearch(query);
      setTicketListSearch(ticketList);
    }
  };

  // Render
  return user ? (
    <View style={{ flex: 1 }}>
      <SearchBar
        placeholder="Type Title Here..."
        onChangeText={setSearch}
        value={search}
        round
        containerStyle={{
          backgroundColor: "transparent",
          borderTopWidth: 0,
          borderBottomWidth: 0,
        }}
        inputContainerStyle={{ backgroundColor: "white" }}
      />
      <ButtonGroup
        onPress={setSelectedIndex}
        selectedIndex={selectedIndex}
        buttons={buttons}
        containerStyle={{ height: 50 }}
        selectedButtonStyle={{ backgroundColor: "#185a9d" }}
      />
      {selectedIndex == 0 ? (
        <ScrollView>
          {ticketListSearch
            ? ticketListSearch.map((item, index) =>
                item.supportAgentUid == "" ? (
                  // --------------------------------CARD----------------------------------
                  <TouchableOpacity
                    onPress={() =>
                      props.navigation.navigate("Details", {
                        ticket: item,
                        user,
                        agentList,
                      })
                    }
                  >
                    <Card
                      key={index}
                      elevation={2}
                      // width={Dimensions.get("window").width - 5}
                      style={{
                        margin: 10,
                        padding: 10,
                        width: "95%",
                        borderWidth: 1,
                        borderColor: "darkgray",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          // backgroundColor: "red",
                        }}
                      >
                        <Text
                          style={{
                            margin: 2,
                            fontSize: 20,
                            width: 60,
                            fontWeight: "bold",
                          }}
                        >
                          Title:{" "}
                        </Text>

                        <Text
                          style={{
                            fontSize: 20,
                            width: "80%",
                            // backgroundColor: "yellow",
                          }}
                        >
                          {item.title.length > 30
                            ? item.title.substring(0, 30) + "..."
                            : item.title}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                        }}
                      >
                        <Text
                          style={{ width: 60, fontWeight: "bold", margin: 2 }}
                        >
                          Status:{" "}
                        </Text>
                        <Text> {item.status}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                        }}
                      >
                        <Text
                          style={{ width: 60, fontWeight: "bold", margin: 2 }}
                        >
                          Priority:{" "}
                        </Text>
                        <Text>{item.priority}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                        }}
                      >
                        <Text
                          style={{ width: 60, fontWeight: "bold", margin: 2 }}
                        >
                          Target:{" "}
                        </Text>
                        <Text>{item.target}</Text>
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          props.navigation.navigate("Details", {
                            ticket: item,
                            user,
                            agentList,
                          })
                        }
                        style={{ marginTop: -35 }}
                      >
                        <MaterialCommunityIcons
                          name="arrow-right-box"
                          size={35}
                          color={"#3ea3a3"}
                          style={{
                            //backgroundColor: "#3ea3a3",
                            textAlign: "center",
                            //width: 75,
                            //height: 30,
                            alignSelf: "flex-end",
                            justifyContent: "center",
                            //borderRadius: 10,
                            //color: "white",
                            margin: 5,
                          }}
                        />
                      </TouchableOpacity>
                    </Card>
                  </TouchableOpacity>
                ) : null
              )
            : null}
        </ScrollView>
      ) : selectedIndex == 1 ? (
        <ScrollView>
          {ticketListSearch
            ? ticketListSearch.map((item, index) =>
                item.supportAgentUid == firebase.auth().currentUser.uid &&
                item.status != "Closed" ? (
                  <TouchableOpacity
                    onPress={() =>
                      props.navigation.navigate("Details", {
                        ticket: item,
                        user,
                        agentList,
                      })
                    }
                  >
                    <Card
                      key={index}
                      elevation={2}
                      width={Dimensions.get("window").width - 5}
                      style={{
                        margin: 10,
                        padding: 10,
                        width: "95%",
                        borderWidth: 1,
                        borderColor: "darkgray",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                        }}
                      >
                        <Text
                          style={{
                            margin: 2,
                            fontSize: 20,
                            width: 60,
                            fontWeight: "bold",
                          }}
                        >
                          Title:{" "}
                        </Text>
                        <Text
                          style={{
                            fontSize: 20,
                            width: "80%",
                            // backgroundColor: "yellow",
                          }}
                        >
                          {item.title.length > 30
                            ? item.title.substring(0, 30) + "..."
                            : item.title}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                        }}
                      >
                        <Text
                          style={{ width: 60, fontWeight: "bold", margin: 2 }}
                        >
                          Status:{" "}
                        </Text>
                        <Text> {item.status}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                        }}
                      >
                        <Text
                          style={{ width: 60, fontWeight: "bold", margin: 2 }}
                        >
                          Priority:{" "}
                        </Text>
                        <Text>{item.priority}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                        }}
                      >
                        <Text
                          style={{ width: 60, fontWeight: "bold", margin: 2 }}
                        >
                          Target:{" "}
                        </Text>
                        <Text>{item.target}</Text>
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          props.navigation.navigate("Details", {
                            ticket: item,
                            user,
                            agentList,
                          })
                        }
                        style={{ marginTop: -35 }}
                      >
                        <MaterialCommunityIcons
                          name="arrow-right-box"
                          size={35}
                          color={"#3ea3a3"}
                          style={{
                            //backgroundColor: "#3ea3a3",
                            textAlign: "center",
                            //width: 75,
                            //height: 30,
                            alignSelf: "flex-end",
                            justifyContent: "center",
                            //borderRadius: 10,
                            //color: "white",
                            margin: 5,
                          }}
                        />
                      </TouchableOpacity>
                    </Card>
                  </TouchableOpacity>
                ) : null
              )
            : null}
        </ScrollView>
      ) : selectedIndex == 2 ? (
        <ScrollView>
          {ticketListSearch
            ? ticketListSearch.map((item, index) =>
                item.supportAgentUid == firebase.auth().currentUser.uid &&
                item.status == "Closed" ? (
                  <TouchableOpacity
                    onPress={() =>
                      props.navigation.navigate("Details", {
                        ticket: item,
                        user,
                        agentList,
                      })
                    }
                  >
                    <Card
                      key={index}
                      elevation={2}
                      width={Dimensions.get("window").width - 5}
                      style={{
                        margin: 10,
                        padding: 10,
                        width: "95%",
                        borderWidth: 1,
                        borderColor: "darkgray",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                        }}
                      >
                        <Text
                          style={{
                            margin: 2,
                            fontSize: 20,
                            width: 60,
                            fontWeight: "bold",
                          }}
                        >
                          Title:{" "}
                        </Text>
                        <Text
                          style={{
                            fontSize: 20,
                            width: "80%",
                            // backgroundColor: "yellow",
                          }}
                        >
                          {item.title.length > 30
                            ? item.title.substring(0, 30) + "..."
                            : item.title}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                        }}
                      >
                        <Text
                          style={{ width: 60, fontWeight: "bold", margin: 2 }}
                        >
                          Status:{" "}
                        </Text>
                        <Text> {item.status}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                        }}
                      >
                        <Text
                          style={{ width: 60, fontWeight: "bold", margin: 2 }}
                        >
                          Priority:{" "}
                        </Text>
                        <Text>{item.priority}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                        }}
                      >
                        <Text
                          style={{ width: 60, fontWeight: "bold", margin: 2 }}
                        >
                          Target:{" "}
                        </Text>
                        <Text>{item.target}</Text>
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          props.navigation.navigate("Details", {
                            ticket: item,
                            user,
                            agentList,
                          })
                        }
                        style={{ marginTop: -35 }}
                      >
                        {/* <Text
                        style={{
                          backgroundColor: "#3ea3a3",
                          textAlign: "center",
                          width: 75,
                          height: 20,
                          alignSelf: "flex-end",
                          justifyContent: "center",
                          borderRadius: 20,
                          color: "white",
                          margin: 5,
                        }}
                      >
                        Details
                        
                      </Text> */}
                        <MaterialCommunityIcons
                          name="arrow-right-box"
                          size={35}
                          color={"#3ea3a3"}
                          style={{
                            textAlign: "center",
                            alignSelf: "flex-end",
                            justifyContent: "center",
                            margin: 5,
                          }}
                        />
                      </TouchableOpacity>
                    </Card>
                  </TouchableOpacity>
                ) : null
              )
            : null}
        </ScrollView>
      ) : (
        <Text>Something Went wrong??</Text>
      )}
      <ActionButton
        // buttonColor={"#3ea3a3"}
        // size={deviceType === 1 ? 60 : 80}
        buttonColor={"#3ea3a3"}
        size={responsiveScreenFontSize(8)}
        //  style={styles.actionButtonIcon2}
        // icon={responsiveScreenFontSize(10)}
        buttonTextStyle={{ fontSize: responsiveScreenFontSize(3) }}

        // position="left"
        //verticalOrientation="down"
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
            style={styles.actionButtonIcon}
          />
        </ActionButton.Item>
      </ActionButton>
    </View>
  ) : (
    <Text>Loading...</Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  itemContainer: {
    justifyContent: "flex-end",
    borderRadius: 5,
    // flex: 2,
    height: responsiveScreenWidth(40),
  },
  itemName: {
    fontSize: responsiveScreenFontSize(1.9),
    fontWeight: "bold",
    color: "#fff",
    // fontWeight: "600",
  },
  itemCode: {
    fontWeight: "600",
    fontSize: 12,
    color: "#fff",
  },
  actionButtonIcon: {
    fontSize: responsiveFontSize(2.5),
    // height: 40,
    color: "white",
  },
  actionButtonIcon2: {
    //height: 22,
    // width: 22,
    fontSize: responsiveFontSize(2.5),
  },
});
