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

      <Card
        height={130}
        style={{
          justifyContent: "space-evenly",
          flex: 1,
          margin: 10,
          width: Dimensions.get("window").width,
        }}
      >
        {/* <ImageBackground
          style={{ width: "100%", height: "100%", position: "absolute" }}
          source={{
            uri:
              "https://images.all-free-download.com/images/graphicthumb/red_bar_abstract_background_6821811.jpg",
          }}
        ></ImageBackground> */}
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
          <Text numberOfLines={2} style={{ fontSize: 20, width: "85%" }}>
            {ticket.title}
          </Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <View
            style={{
              flexDirection: "row",
              width: "45%",
            }}
          >
            <Text style={{ width: 60, fontWeight: "bold", margin: 2 }}>
              Status:
            </Text>
            <Text>{ticket.status}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              width: "45%",
            }}
          >
            <Text style={{ width: 60, fontWeight: "bold", margin: 2 }}>
              Opened:
            </Text>
            <Text>{moment(ticket.dateOpen.toDate()).format("LLL")}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              width: "45%",
            }}
          >
            <Text style={{ width: 60, fontWeight: "bold", margin: 2 }}>
              Target:
            </Text>
            <Text>{ticket.target}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              width: "45%",
            }}
          >
            <Text style={{ width: 60, fontWeight: "bold", margin: 2 }}>
              Closed :
            </Text>
            {ticket.dateClose != "" ? (
              <Text>{moment(ticket.dateClose.toDate()).format("LLL")}</Text>
            ) : null}
          </View>
        </View>
      </Card>

      <View style={{ flex: 2, padding: 15 }}>
        <Text style={{ width: "100%", fontWeight: "bold", margin: 2 }}>
          Description:
        </Text>
        <ScrollView>
          <Text
            width={Dimensions.get("window").width}
            style={{
              fontSize: 18,
              backgroundColor: "lightgray",
              borderWidth: 1,
              padding: 10,
            }}
          >
            {ticket.description}
          </Text>
        </ScrollView>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          padding: 10,
        }}
      >
        {user.activeRole == "customer support" &&
        ticket.status != "Closed" &&
        ticket.supportAgentUid == user.id ? (
          <>
            <View style={{ width: "18%", textAlign: "center" }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#3ea3a3",
                  padding: 3.5,
                  borderRadius: 25,
                  justifyContent: "center",
                }}
                onPress={() => setVisibleTransfare(!visibleTransfare)}
              >
                <MaterialCommunityIcons
                  name="clipboard-arrow-down-outline"
                  size={35}
                  color={"white"}
                  style={{
                    textAlign: "center",
                    justifyContent: "center",
                    margin: 5,
                  }}
                />
              </TouchableOpacity>
              <Text style={{ textAlign: "center" }}>Transfare</Text>
            </View>
            <View style={{ width: "18%", textAlign: "center" }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#3ea3a3",
                  padding: 3.5,
                  borderRadius: 25,
                  justifyContent: "center",
                }}
                onPress={() => CloseTicket()}
              >
                <MaterialCommunityIcons
                  name="close-box"
                  size={35}
                  color={"white"}
                  style={{
                    textAlign: "center",
                    justifyContent: "center",
                    margin: 5,
                  }}
                />
              </TouchableOpacity>
              <Text style={{ textAlign: "center" }}>Close</Text>
            </View>
            <View style={{ width: "18%", textAlign: "center" }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#3ea3a3",
                  padding: 3.5,
                  borderRadius: 25,
                  justifyContent: "center",
                }}
                onPress={() => toggleOverlaySearch()}
              >
                <MaterialCommunityIcons
                  name="book-remove"
                  size={35}
                  color={"white"}
                  style={{
                    textAlign: "center",
                    justifyContent: "center",
                    margin: 5,
                  }}
                />
              </TouchableOpacity>
              <Text style={{ textAlign: "center" }}>Search</Text>
            </View>
          </>
        ) : null}
        {ticket.status === "pending" ? (
          <View style={{ width: "18%", textAlign: "center" }}>
            <TouchableOpacity
              style={{
                backgroundColor: "#3ea3a3",
                padding: 3.5,
                borderRadius: 25,
                justifyContent: "center",
              }}
              onPress={() => TakeTicket()}
            >
              <MaterialCommunityIcons
                name="plus-box"
                size={35}
                color={"white"}
                style={{
                  textAlign: "center",
                  justifyContent: "center",
                  margin: 5,
                }}
              />
            </TouchableOpacity>
            <Text style={{ textAlign: "center" }}>Take</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: "column", width: "18%" }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#3ea3a3",
              padding: 3.5,
              borderRadius: 25,
              justifyContent: "center",
            }}
            onPress={() => setVisible(!visible)}
          >
            <MaterialCommunityIcons
              name="attachment"
              size={35}
              color={"white"}
              style={{
                textAlign: "center",
                justifyContent: "center",
                margin: 5,
              }}
            />
          </TouchableOpacity>
          <Text style={{ textAlign: "center" }}>Attachment</Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: "#3ea3a3",
            padding: 3.5,
            borderRadius: 25,
            justifyContent: "center",
            width: "18%",
          }}
          onPress={() => props.navigation.navigate("Chat", { ticket, user })}
        >
          <MaterialCommunityIcons
            name="wechat"
            size={35}
            color={"white"}
            style={{
              textAlign: "center",
              justifyContent: "center",
              margin: 5,
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  text: {
    padding: 5,
    fontSize: 22,
  },
});
