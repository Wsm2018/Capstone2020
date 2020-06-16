import React, { useState, useEffect, useRef } from "react";
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
  Platform,
} from "react-native";

import { Image, Badge } from "react-native-elements";
import ReactNativePickerModule from "react-native-picker-module";

import LottieView from "lottie-react-native";
import { ButtonGroup, Input, SearchBar } from "react-native-elements";
import { Feather, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
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
  const [selectedValue, setSelectedValue] = useState({
    value: "-1",
    error: false,
  });

  const [title, setTitle] = useState({ text: "", error: false });
  const [description, setDescription] = useState({ text: "", error: false });
  const [view, setView] = useState("home");
  const [ticketList, setTicketList] = useState(null);
  const [other, setOther] = useState("");
  const [priority, setPriority] = useState("normal");

  const [image, setImage] = useState(null);

  const [ticketListSearch, setTicketListSearch] = useState(null);

  const [loading, setLoading] = useState(false);

  const descriptionBox = useRef();

  let pickerRef = null;

  //UseEffect
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    db.collection("customerSupport")
      .where("userId", "==", firebase.auth().currentUser.uid)
      .onSnapshot((Snap) => {
        let temp = [];
        Snap.forEach((doc) => {
          temp.push({ id: doc.id, ...doc.data() });
        }),
          setTicketList(temp);
        setTicketListSearch(temp);
      });
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
      tempServ.push(doc.data().name);
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

  // -------------------------------VALIDATE INPUTS-----------------------------------
  const validated = () => {
    let count = 0;

    if (title.text === "") {
      console.log("title bad");
      setTitle({ text: title.text, error: true });
    } else {
      console.log("title good");
      count++;
    }

    if (description.text === "") {
      console.log("description bad");
      setDescription({ text: description.text, error: true });
    } else {
      console.log("description good");
      count++;
    }
    console.log(selectedValue.value, selectedValue.value === "-1");
    if (selectedValue.value === "-1") {
      console.log("subject bad");
      setSelectedValue({ value: selectedValue.value, error: true });
    } else {
      console.log("subject good");
      count++;
    }

    console.log(count);
    if (count === 3) {
      return true;
    } else {
      return false;
    }
  };

  //Submiting a ticket
  const addTicket = async () => {
    if (validated()) {
      setLoading(true);
      const add = firebase.functions().httpsCallable("addTicket");
      const response = await add({
        user,
        description: description.text,
        title: title.text,
        selectedValue: selectedValue.value,
        other,
        priority,
      });
      console.log("start uploading");
      if (image) {
        const response1 = await fetch(image);
        const blob = await response1.blob();
        const upload = await firebase
          .storage()
          .ref()
          .child("customerSupport/" + response.data._path.segments[1])
          .put(blob);
      }
      setLoading(false);
      setView("home");
      setTitle({ text: "", error: false });
      setDescription({ text: "", error: false });
      setSelectedValue({ value: "-1", error: false });
      setImage(null);
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
      {loading ? (
        <View>
          <Text>Loading....</Text>
          <Button title="back" onPress={() => setLoading(false)} />
        </View>
      ) : view == "create" ? (
        <View
          style={{
            flex: 1,
            margin: "4%",
            backgroundColor: "#e3e3e3",
            padding: "2%",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 20 }}>Title: </Text>
          <TextInput
            placeholder="Subject"
            onChangeText={(text) => setTitle({ text, error: false })}
            style={{
              alignSelf: "center",
              height: 40,
              // width: Dimensions.get("window").width / 1.03,
              width: "100%",
              borderWidth: 1,
              padding: "2%",
              borderColor: "gray",
            }}
          />
          <Text
            style={title.error ? { color: "red" } : { color: "transparent" }}
          >
            * Title is required
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: 20 }}>Description:</Text>
          <TouchableOpacity
            style={{
              width: "100%",
              borderWidth: 1,
              height: "40%",
              padding: "2%",
              borderColor: "gray",
            }}
            onPress={() => {
              descriptionBox.current.focus();
            }}
          >
            <TextInput
              style={{
                width: "100%",
                // borderWidth: 1,
                // paddingLeft: 5,
                // borderColor: "gray",
                // height: "100%",
              }}
              // numberOfLines={8}
              // maxLength={300}
              multiline={true}
              placeholder="Description"
              onChangeText={(text) => setDescription({ text, error: false })}
              ref={(ref) => (descriptionBox.current = ref)}
            />
          </TouchableOpacity>
          <Text
            style={
              description.error ? { color: "red" } : { color: "transparent" }
            }
          >
            * Description is required
          </Text>

          {Platform.OS !== "ios" ? (
            <View
              style={{
                flexDirection: "row",
                // paddingTop: 10,
                // paddingBottom: 10,
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>Subject:</Text>
              <Picker
                selectedValue={selectedValue.value}
                style={{
                  height: 30,
                  // width: Dimensions.get("window").width / 1.3,
                  width: "50%",
                  borderWidth: 1,
                  borderColor: "gray",
                }}
                onValueChange={(itemValue, itemIndex) =>
                  setSelectedValue({ value: itemValue, error: false })
                }
              >
                <Picker.Item label="Select Subject" value="-1" />
                {servicesList.map((item, index) => (
                  <Picker.Item key={index} label={item} value={item} />
                ))}

                <Picker.Item label="Car" value="user" />
              </Picker>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>Subject:</Text>
              <TouchableOpacity
                onPress={() => {
                  pickerRef.show();
                }}
                style={{
                  height: 30,

                  width: "50%",

                  borderColor: "gray",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingLeft: "2%",
                }}
              >
                <Text style={{ fontSize: 17 }}>
                  {selectedValue.value === "-1"
                    ? "Select a role"
                    : selectedValue.value}
                </Text>
                <Ionicons
                  name="md-arrow-dropdown"
                  size={23}
                  color="#333333"
                  style={{
                    marginRight: "5%",
                  }}
                />
              </TouchableOpacity>
              {servicesList && (
                <ReactNativePickerModule
                  pickerRef={(e) => (pickerRef = e)}
                  selectedValue={selectedValue.value}
                  title={"Select role"}
                  items={servicesList}
                  onValueChange={(itemValue, itemIndex) =>
                    setSelectedValue({ value: itemValue, error: false })
                  }
                />
              )}
            </View>
          )}
          <View
            style={{
              flexDirection: "row",
              paddingTop: 10,
              // paddingBottom: 10,
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>Image:</Text>
            <TouchableOpacity
              style={{
                backgroundColor: "gray",
                borderRadius: 8,
                // padding: "2%",
                marginStart: 5,
                width: "20%",
                height: 30,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white" }}>Attach</Text>
            </TouchableOpacity>
          </View>
          <Text
            style={
              selectedValue.error ? { color: "red" } : { color: "transparent" }
            }
          >
            * Select a Subject
          </Text>
          {selectedValue.value == "user" ? (
            <View>
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                Car Details:{" "}
              </Text>
              <TextInput
                placeholder="Plate No."
                onChangeText={(text) => setOther(text)}
                style={{
                  // width: Dimensions.get("window").width / 1.03,
                  width: "100%",
                  borderWidth: 1,
                  alignSelf: "center",
                  height: 40,
                  paddingLeft: 5,
                  borderColor: "gray",
                }}
              />
            </View>
          ) : null}
          {/* <TouchableOpacity
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
          </TouchableOpacity> */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              marginTop: "5%",
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
                backgroundColor: "#901616",
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
          {/* <Text>{title.text}</Text>
          <Text>{description.text}</Text>
          <Text>{selectedValue.value}</Text> */}
          {/* <Text>{JSON.stringify(servicesList, null, 2)}</Text>  */}
        </View>
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
          <View style={{}}>
            <ButtonGroup
              onPress={setSelectedIndex}
              selectedIndex={selectedIndex}
              buttons={buttons}
              containerStyle={{
                height: 50,
                // width: Dimensions.get("window").width / 1.25,
              }}
              selectedButtonStyle={{ backgroundColor: "#185a9d" }}
            />
          </View>
          {selectedIndex === 0 ? (
            <View style={{ height: Dimensions.get("window").height * 0.75 }}>
              <ScrollView>
                {ticketListSearch
                  ? ticketListSearch.map((item, index) =>
                      item.status != "Closed" ? (
                        <TouchableOpacity
                          onPress={() =>
                            props.navigation.navigate("Details", {
                              ticket: item,
                              user,
                            })
                          }
                          // style={{ marginTop: -35 }}
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
                        </TouchableOpacity>
                      ) : null
                    )
                  : null}
                <View style={{ height: 50 }}></View>
              </ScrollView>
              <View>
                <Text>{"  "}</Text>
              </View>
            </View>
          ) : selectedIndex === 1 ? (
            <View style={{ height: Dimensions.get("window").height * 0.75 }}>
              <ScrollView>
                {ticketListSearch
                  ? ticketListSearch.map((item, index) =>
                      item.status === "Closed" ? (
                        <TouchableOpacity
                          onPress={() =>
                            props.navigation.navigate("Details", {
                              ticket: item,
                              user,
                            })
                          }
                          // style={{ marginTop: -35 }}
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
                        </TouchableOpacity>
                      ) : null
                    )
                  : null}
                <View style={{ height: 50 }}></View>
              </ScrollView>
              <View>
                <Text>{"  "}</Text>
              </View>
            </View>
          ) : null}
          <TouchableOpacity
            onPress={() => setView("create")}
            style={{
              position: "absolute",
              right: "2%",
              bottom: "4%",
              borderRadius: 1000,
              backgroundColor: "#3ea3a3",
              padding: "4%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="pencil-plus"
              size={30}
              color={"white"}
              style={
                {
                  // backgroundColor: "#3ea3a3",
                  // textAlign: "center",
                  // //width: 75,
                  // //height: 30,
                  // alignSelf: "flex-end",
                  // justifyContent: "center",
                  // borderRadius: 10,
                  // //color: "white",
                  // margin: 5,
                }
              }
            />
          </TouchableOpacity>
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
