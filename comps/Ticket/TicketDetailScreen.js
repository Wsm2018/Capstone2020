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
import { Card } from "react-native-elements";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import moment from "moment";
import db from "../../db";

import { Overlay } from "react-native-elements";
import firebase from "firebase/app";
import "firebase/auth";
export default function TicketDetailScreen(props) {
  const ticket = props.navigation.getParam("ticket");
  const user = props.navigation.getParam("user");
  const agentList = props.navigation.getParam("agentList");

  const [num, setNum] = useState(false);
  const [searchResult, setSearchResult] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [url, setUrl] = useState(false);

  const [visible, setVisible] = useState(false);
  const [visibleSearch, setVisibleSearch] = useState(false);
  const [visibleTransfare, setVisibleTransfare] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // -------------------------------ADD-----------------------------------
  // Create a live chat room between agents and users
  const TakeTicket = async () => {
    let temp = [...ticket.agentsContributed];
    temp.push(user.id);
    const add = firebase.functions().httpsCallable("updateTicket");
    const response = await add({ ticket, agents: temp, user, query: "take" });
    console.log("response", response);
    props.navigation.navigate("Agent");
  };
  const CloseTicket = async () => {
    const add = firebase.functions().httpsCallable("updateTicket");
    const response = await add({ ticket, query: "close" });
    console.log("response", response);
  };
  const Transfare = async () => {
    let temp = [...ticket.agentsContributed];
    if (temp.includes(selectedValue.id)) {
      temp.push(selectedValue.id);
    }
    console.log("g", ticket, selectedValue, temp);
    const add = firebase.functions().httpsCallable("updateTicket");
    const response = await add({
      ticket,
      user: selectedValue,
      agents: temp,
      query: "transfare",
    });
    props.navigation.navigate("Agent");
  };

  const searchCar = async () => {
    const result = await db
      .collectionGroup("cars")
      .where("plate", "==", num)
      .get();
    let temp;
    result.forEach((doc) => {
      temp = doc.ref.path.split("/");
    });
    const path = temp;
    if (path) {
      const user = await db.collection("users").doc(path[1]).get();
      setSearchResult(user.data());
    } else {
      setSearchResult(false);
    }
  };

  const fetchData = async () => {
    const response = await firebase
      .storage()
      .ref()
      .child(`customerSupport/${ticket.id}`)
      .getDownloadURL();
    setUrl(response);
  };
  const ApproveReport = async () => {
    const add = firebase.functions().httpsCallable("updateTicket");
    const response = await add({
      user,
      ticket,
      query: "Approve",
    });
  };

  const toggleOverlayAttachment = () => {
    setVisible(!visible);
  };
  const toggleOverlaySearch = () => {
    setVisibleSearch(!visibleSearch);
  };
  const toggleOverlayTransfare = () => {
    setVisibleTransfare(!visibleTransfare);
  };

  return (
    <View style={styles.container}>
      <Overlay isVisible={visible} onBackdropPress={toggleOverlayAttachment}>
        {url ? (
          <Image
            source={{ uri: url }}
            style={{
              width: Dimensions.get("window").width / 1.1,
              height: Dimensions.get("window").height / 2,
            }}
          />
        ) : (
          <Text>No Attachment</Text>
        )}
      </Overlay>
      <Overlay isVisible={visibleSearch} onBackdropPress={toggleOverlaySearch}>
        <View>
          <TextInput onChangeText={setNum} />
          <Button title="search" onPress={searchCar} />
          {searchResult ? (
            <View style={{ borderWidth: 1 }}>
              <Text>User : {searchResult.displayName}</Text>
              <Button title="Approve" onPress={ApproveReport} />
            </View>
          ) : null}
        </View>
      </Overlay>
      <Overlay
        isVisible={visibleTransfare}
        onBackdropPress={toggleOverlayTransfare}
      >
        <Picker
          selectedValue={selectedValue}
          style={{ height: 50, width: 150 }}
          onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
        >
          {agentList ? (
            agentList.map((item, index) => (
              <Picker.Item key={index} label={item.displayName} value={item} />
            ))
          ) : (
            <Picker.Item label="Loading" value="Loading" />
          )}
        </Picker>
        <TouchableOpacity onPress={() => Transfare()}>
          <Text>transfare Ticket</Text>
        </TouchableOpacity>
      </Overlay>
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          margin: "4%",
          borderWidth: 2,
          borderColor: "lightgray",
          padding: "2%",
        }}
      >
        <View
          style={{
            flex: 1.3,
            // backgroundColor: "red"
          }}
        >
          <Text
            style={{
              fontSize: 22,
              width: "85%",
              textTransform: "capitalize",
              fontWeight: "bold",
            }}
            numberOfLines={3}
          >
            {ticket.title}
          </Text>

          <Text
            style={{
              color:
                ticket.status === "pending"
                  ? "#919129"
                  : ticket.status === "closed"
                  ? "green"
                  : "orange",
              fontSize: 20,
              fontWeight: "bold",
              textTransform: "capitalize",
            }}
          >
            {ticket.status}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "bold",
              }}
            >
              Priority:
            </Text>
            <Text
              style={{
                color:
                  ticket.priority === "very high"
                    ? "red"
                    : ticket.priority === "high"
                    ? "red"
                    : ticket.priority === "medium"
                    ? "orange"
                    : "green",
                fontSize: 15,
                fontWeight: "bold",
                textTransform: "capitalize",
              }}
            >
              {" "}
              {ticket.priority}
            </Text>
          </View>
          <Text>
            <Text style={{ fontWeight: "bold", fontSize: 15 }}>Subject: </Text>
            {ticket.target}
          </Text>

          <Text>
            <Text style={{ fontWeight: "bold", fontSize: 15 }}>Opened: </Text>
            {moment(ticket.dateOpen.toDate()).format("LLL")}
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold", fontSize: 15 }}>Closed: </Text>
            {ticket.dateClose != "" ? (
              <Text>{moment(ticket.dateClose.toDate()).format("LLL")}</Text>
            ) : (
              <Text>-</Text>
            )}
          </Text>
        </View>
        <Text></Text>
        <Text></Text>
        <View
          style={{
            borderWidth: 2,
            // margin: "1%",
            marginTop: "5%",
            borderColor: "#e3e3e3",
            flex: 2,
            padding: "1%",
            paddingBottom: 0,
          }}
        >
          <View style={{ height: "90%" }}>
            <Text
              style={{
                width: "100%",
                // minHeight: 25,
                backgroundColor: "#e3e3e3",
                textAlign: "center",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              Details
            </Text>
            {ticket.extraInfo !== "" && (
              <Text style={{ fontWeight: "bold" }}>
                Plate No: {ticket.extraInfo}
              </Text>
            )}
            <Text numberOfLines={10} style={{ fontSize: 16 }}>
              {ticket.description}
            </Text>
          </View>
          {url && (
            <View
              style={{
                height: "10%",
                // backgroundColor: "red",
                alignItems: "flex-start",
                // paddingRight: "2%",
                // justifyContent: "center",
                // marginBottom: "2.5%",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "lightgray",
                  // padding: 3.5,
                  // borderRadius: 25,
                  justifyContent: "center",
                  flexDirection: "row",
                  borderWidth: 0,
                  // borderColor: "gray",
                  padding: 5,
                  // paddingTop: 5,
                  marginTop: -5,
                }}
                onPress={() => setVisible(!visible)}
              >
                <MaterialIcons
                  name="attach-file"
                  size={25}
                  color={"#185a9d"}
                  style={
                    {
                      // textAlign: "center",
                      // justifyContent: "center",
                      // margin: 5,
                    }
                  }
                />
                {/* <Text style={{ color: "#185a9d" }}>Attachment</Text> */}
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View
          style={{
            borderWidth: 0,
            // margin: "1%",
            marginTop: "5%",
            borderColor: "gray",
            flex: 0.5,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          {!ticket.status === "pending" && (
            <TouchableOpacity
              style={{
                backgroundColor: "#3ea3a3",
                // padding: 3.5,
                borderRadius: 8,
                justifyContent: "center",
                alignItems: "center",
                width: "18%",
                aspectRatio: 1 / 1,
                marginRight: "1%",
                marginLeft: "1%",
              }}
              onPress={() => TakeTicket()}
            >
              <MaterialIcons
                name="note-add"
                size={32}
                color={"white"}
                style={{
                  textAlign: "center",
                  justifyContent: "center",
                  margin: 5,
                }}
              />
              <Text style={{ color: "white", fontSize: 10 }}>Take</Text>
            </TouchableOpacity>
          )}
          {user.activeRole == "customer support" &&
            ticket.status != "Closed" &&
            ticket.supportAgentUid == user.id && (
              <TouchableOpacity
                style={{
                  backgroundColor: "#3ea3a3",
                  // padding: 3.5,
                  borderRadius: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  width: "18%",
                  aspectRatio: 1 / 1,
                  marginRight: "1%",
                  marginLeft: "1%",
                }}
                onPress={() => CloseTicket()}
              >
                <MaterialIcons
                  name="done"
                  size={32}
                  color={"white"}
                  style={{
                    textAlign: "center",
                    justifyContent: "center",
                    margin: 5,
                  }}
                />
                <Text style={{ color: "white", fontSize: 10 }}>Done</Text>
              </TouchableOpacity>
            )}
          <TouchableOpacity
            style={{
              backgroundColor: "#3ea3a3",
              // padding: 3.5,
              borderRadius: 8,
              justifyContent: "center",
              alignItems: "center",
              width: "18%",
              aspectRatio: 1 / 1,
              marginRight: "1%",
              marginLeft: "1%",
            }}
            onPress={() => props.navigation.navigate("Chat", { ticket, user })}
          >
            <MaterialCommunityIcons
              name="wechat"
              size={32}
              color={"white"}
              style={{
                textAlign: "center",
                justifyContent: "center",
                margin: 5,
              }}
            />
            <Text style={{ color: "white", fontSize: 10 }}>Chat</Text>
          </TouchableOpacity>
          {user.activeRole == "customer support" &&
            ticket.status != "Closed" &&
            ticket.supportAgentUid == user.id && (
              <TouchableOpacity
                style={{
                  backgroundColor: "#3ea3a3",
                  // padding: 3.5,
                  borderRadius: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  width: "18%",
                  aspectRatio: 1 / 1,
                  marginRight: "1%",
                  marginLeft: "1%",
                }}
                onPress={() => setVisibleTransfare(!visibleTransfare)}
              >
                <MaterialCommunityIcons
                  name="file-send"
                  size={32}
                  color={"white"}
                  style={{
                    textAlign: "center",
                    justifyContent: "center",
                    margin: 5,
                  }}
                />
                <Text style={{ color: "white", fontSize: 10 }}>Transfer</Text>
              </TouchableOpacity>
            )}

          {user.activeRole == "customer support" &&
            ticket.status != "Closed" &&
            ticket.supportAgentUid == user.id &&
            ticket.extraInfo !== "" && (
              <TouchableOpacity
                style={{
                  backgroundColor: "#3ea3a3",
                  // padding: 3.5,
                  borderRadius: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  width: "18%",
                  aspectRatio: 1 / 1,
                  marginRight: "1%",
                  marginLeft: "1%",
                }}
                onPress={() => toggleOverlaySearch()}
              >
                <MaterialCommunityIcons
                  name="account-search"
                  size={32}
                  color={"white"}
                  style={{
                    textAlign: "center",
                    justifyContent: "center",
                    margin: 5,
                  }}
                />
                <Text style={{ color: "white", fontSize: 10 }}>Search</Text>
              </TouchableOpacity>
            )}
        </View>
      </View>
      {/* <View style={{ flex: 1, backgroundColor: "green" }}></View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",
  },
  text: {
    padding: 5,
    fontSize: 22,
  },
});
