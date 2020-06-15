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
  ImageBackground,
  KeyboardAvoidingView,
} from "react-native";

import { Image, Badge } from "react-native-elements";

import LottieView from "lottie-react-native";
import { ButtonGroup, Input, SearchBar } from "react-native-elements";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { Card } from "react-native-shadow-cards";
//Database Connection / firebase
import firebase from "firebase/app";
import "firebase/auth";
import moment from "moment";
import db from "../../db";
import * as ImagePicker from "expo-image-picker";
import { set } from "react-native-reanimated";

// Main Method
export default function TicketScreen(props) {
  //UseState
  const [user, setUser] = useState(null);
  const [servicesList, setServicesList] = useState(null);
  const [badge, setBadge] = useState(false);
  const [selectedValue, setSelectedValue] = useState("projecter");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [view, setView] = useState("home");
  const [ticketList, setTicketList] = useState(null);
  const [other, setOther] = useState("");
  const [priority, setPriority] = useState("normal");

  const [image, setImage] = useState(null);

  const [ticketListSearch, setTicketListSearch] = useState(null);

  const [loading, setLoading] = useState(false);

  //UseEffect
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const unsub = db
      .collection("customerSupport")
      .where("userId", "==", firebase.auth().currentUser.uid)
      .onSnapshot((Snap) => {
        let temp = [];
        Snap.forEach((doc) => {
          temp.push({ id: doc.id, ...doc.data() });
        }),
          setTicketList(temp);
        setTicketListSearch(temp);
      });

    return () => {
      unsub();
    };
  }, []);

  const changeView = () => {
    setBadge(false);
    setView("home");
  };
  //fetching user data from firebase
  const fetchData = async () => {
    let tempUser;
    const info = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    const info2 = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("subscription")
      .get();
    if (info2.size > 0) {
      info2.forEach((doc) => {
        let subTime =
          doc.data().endDate.toDate() - doc.data().startDate.toDate();
        if (subTime >= 0) {
          if (doc.data().type == "bronze") {
            setPriority("medium");
          } else if (doc.data().type == "silver") {
            setPriority("high");
          } else if (doc.data().type == "gold") {
            setPriority("very high");
          }
        }
      });
    } else {
      console.log("user is not a sub");
    }

    tempUser = { id: info.id, ...info.data() };
    setUser(tempUser);

    let tempServ = [];
    const info3 = await db.collection("services").get();
    info3.forEach((doc) => {
      tempServ.push({ id: doc.id, ...doc.data() });
    });
    setServicesList(tempServ);
  };

  const _pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.cancelled) {
        setImage(result.uri);
        setBadge(true);
      } else {
        setBadge(false);
      }
    } catch (E) {
      console.log(E);
    }
  };
  //Submiting a ticket
  const addTicket = async () => {
    if (description != "" && title != "") {
      setLoading(true);
      const add = firebase.functions().httpsCallable("addTicket");
      const response = await add({
        user,
        description,
        title,
        selectedValue,
        other,
        priority,
      });
      console.log("start uploading");
      const response1 = await fetch(image);
      const blob = await response1.blob();
      const upload = await firebase
        .storage()
        .ref()
        .child("customerSupport/" + response.data._path.segments[1])
        .put(blob);
      setLoading(false);
      setView("home");
    } else {
      alert("Please fill the required fields");
    }
    setLoading(false);
  };

  const buttons = ["Ticket List", "Archive"];
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
    <KeyboardAvoidingView
      behavior="height"
      style={{ flex: 1, height: Dimensions.get("window").height }}
    >
      {loading ? null : view == "create" ? (
        <Card
          style={{
            width: Dimensions.get("window").width,
            padding: 5,
            alignSelf: "center",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 20 }}>Title: </Text>
          <TextInput
            placeholder="Subject"
            onChangeText={(text) => setTitle(text)}
            style={{
              alignSelf: "center",
              height: 40,
              width: Dimensions.get("window").width / 1.03,
              borderWidth: 1,
            }}
          />
          <Text style={{ fontWeight: "bold", fontSize: 20 }}>Description:</Text>
          <ScrollView>
            <TextInput
              style={{
                width: Dimensions.get("window").width / 1.03,
                borderWidth: 1,
                maxHeight: Dimensions.get("window").height / 2.5,
              }}
              numberOfLines={8}
              multiline={true}
              placeholder="Description"
              onChangeText={(text) => setDescription(text)}
            />
          </ScrollView>
          <View
            style={{ flexDirection: "row", paddingTop: 10, paddingBottom: 10 }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 20 }}>Issued On:</Text>
            <Picker
              selectedValue={selectedValue}
              style={{
                height: 30,
                width: Dimensions.get("window").width / 1.3,
                borderWidth: 1,
              }}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedValue(itemValue)
              }
            >
              {servicesList ? (
                servicesList.map((item, index) => (
                  <Picker.Item
                    key={index}
                    label={item.name}
                    value={item.name}
                  />
                ))
              ) : (
                <Picker.Item label="Loading" value="Loading" />
              )}

              <Picker.Item label="Other User" value="user" />
            </Picker>
          </View>
          {selectedValue == "user" ? (
            <TextInput
              placeholder="User Details"
              onChangeText={(text) => setOther(text)}
              style={{
                width: Dimensions.get("window").width / 1.03,
                borderWidth: 1,
                alignSelf: "center",
                height: 40,
              }}
            />
          ) : null}

          <TouchableOpacity
            onPress={_pickImage}
            style={{
              alignSelf: "center",
              margin: 10,
              backgroundColor: "#3ea3a3",
              width: Dimensions.get("window").width / 2,
              height: 50,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white" }}>Attachment Image</Text>
            {badge ? (
              <Badge
                status="success"
                containerStyle={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                }}
              />
            ) : null}
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              margin: 10,
            }}
          >
            <TouchableOpacity
              style={{
                alignSelf: "center",
                margin: 10,
                backgroundColor: "#3ea3a3",
                width: Dimensions.get("window").width / 4,
                height: 50,
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => addTicket()}
            >
              <Text style={{ color: "white" }}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                alignSelf: "center",
                margin: 10,
                backgroundColor: "#3ea3a3",
                width: Dimensions.get("window").width / 4,
                height: 50,
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={changeView}
            >
              <Text style={{ color: "white" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ) : (
        <View>
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
          <View style={{ flexDirection: "row" }}>
            <ButtonGroup
              onPress={setSelectedIndex}
              selectedIndex={selectedIndex}
              buttons={buttons}
              containerStyle={{
                height: 50,
                width: Dimensions.get("window").width / 1.25,
              }}
              selectedButtonStyle={{ backgroundColor: "#3ea3a3" }}
            />
            <TouchableOpacity onPress={() => setView("create")}>
              <MaterialCommunityIcons
                name="pencil-plus"
                size={50}
                color={"white"}
                style={{
                  backgroundColor: "#3ea3a3",
                  textAlign: "center",
                  //width: 75,
                  //height: 30,
                  alignSelf: "flex-end",
                  justifyContent: "center",
                  borderRadius: 10,
                  //color: "white",
                  margin: 5,
                }}
              />
            </TouchableOpacity>
          </View>
          {selectedIndex === 0 ? (
            <View style={{ height: Dimensions.get("window").height * 0.75 }}>
              <ScrollView>
                {ticketListSearch
                  ? ticketListSearch.map((item, index) =>
                      item.status != "Closed" ? (
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
                              Title:
                            </Text>
                            <Text
                              style={{
                                fontSize: 20,
                                width: Dimensions.get("window").width / 1.4,
                              }}
                            >
                              {item.title}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                            }}
                          >
                            <Text
                              style={{
                                width: 60,
                                fontWeight: "bold",
                                margin: 2,
                              }}
                            >
                              Status:
                            </Text>
                            <Text> {item.status}</Text>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                            }}
                          >
                            <Text
                              style={{
                                width: 60,
                                fontWeight: "bold",
                                margin: 2,
                              }}
                            >
                              Created:
                            </Text>
                            <Text>
                              {moment(item.dateOpen.toDate()).format("LLL")}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                            }}
                          >
                            <Text
                              style={{
                                width: 60,
                                fontWeight: "bold",
                                margin: 2,
                              }}
                            >
                              Target:
                            </Text>
                            <Text>{item.target}</Text>
                          </View>

                          <TouchableOpacity
                            onPress={() =>
                              props.navigation.navigate("Details", {
                                ticket: item,
                                user,
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
                      ) : null
                    )
                  : null}
              </ScrollView>
              <View>
                <Text>{"  "}</Text>
              </View>
            </View>
          ) : selectedIndex === 1 ? (
            ticketList ? (
              ticketListSearch.map((item, index) =>
                item.status === "Closed" ? (
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
                        Title:
                      </Text>
                      <Text style={{ fontSize: 20 }}>{item.title}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                      }}
                    >
                      <Text
                        style={{
                          width: 60,
                          fontWeight: "bold",
                          margin: 2,
                        }}
                      >
                        Status:
                      </Text>
                      <Text> {item.status}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                      }}
                    >
                      <Text
                        style={{
                          width: 60,
                          fontWeight: "bold",
                          margin: 2,
                        }}
                      >
                        Created:
                      </Text>
                      <Text>
                        {moment(item.dateOpen.toDate()).format("LLL")}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                      }}
                    >
                      <Text
                        style={{
                          width: 60,
                          fontWeight: "bold",
                          margin: 2,
                        }}
                      >
                        Target:
                      </Text>
                      <Text>{item.target}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        props.navigation.navigate("Details", {
                          ticket: item,
                          user,
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
                ) : null
              )
            ) : null
          ) : null}
        </View>
      )}
    </KeyboardAvoidingView>
  ) : (
    <View>
      <Text>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
