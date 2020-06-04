import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  Picker,
} from "react-native";

import db from "../../db";

import firebase from "firebase/app";
import "firebase/auth";

export default function TicketDetailScreen(props) {
  const ticket = props.navigation.getParam("ticket");
  const user = props.navigation.getParam("user");
  const agentList = props.navigation.getParam("agentList");

  const [selectedValue, setSelectedValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Check();
    var msDiff = ticket.dateOpen.toDate().getTime() - new Date().getTime();
    var daysTill30June2035 = Math.floor(msDiff / (1000 * 60 * 60 * 24));
    console.log("count in ", daysTill30June2035);
  }, []);

  const Check = async () => {
    const c = await db
      .collection("customerSupport")
      .doc(ticket.id + "")
      .collection("liveChat")
      .get();
    if (c.size != 0) {
      loading(true);
    }
  };

  // -------------------------------ADD-----------------------------------
  // Create a live chat room between agents and users
  const TakeTicket = async () => {
    let temp = [...ticket.agentsContributed];
    temp.push(user.id);
    const add = firebase.functions().httpsCallable("updateTicket");
    const response = await add({ ticket, agents: temp, user, query: "take" });
    console.log("response", response);
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
  };

  const temp = async () => {
    let users = [];
    const info = await db.collection("users").get();
    info.forEach((doc) => {
      users.push({ id: doc.id, reputation: doc.data().reputation });
    });
    users.forEach(async (user) => {
      await db.collection("users").doc(user.id).update({
        reputation: 0,
      });
    });
  };

  return (
    <View>
      <Text>Ticket {ticket.title}</Text>
      <Text>status {ticket.status}</Text>
      <Text>description {ticket.description}</Text>
      <View>
        <Button
          title="Chat"
          onPress={() => props.navigation.navigate("Chat", { ticket, user })}
        />
        {ticket.status === "pending" ? (
          <Button title="Take" onPress={() => TakeTicket()} />
        ) : null}
      </View>
      {user.ActiveRole == "customer support" &&
      ticket.status != "Closed" &&
      ticket.supportAgentUid == user.id ? (
        <>
          <Button title="Close Ticket" onPress={() => CloseTicket()} />
          <Button title="transfare Ticket" onPress={() => Transfare()} />
          <Picker
            selectedValue={selectedValue}
            style={{ height: 50, width: 150 }}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedValue(itemValue)
            }
          >
            {agentList ? (
              agentList.map((item, index) => (
                <Picker.Item label={item.displayName} value={item} />
              ))
            ) : (
              <Picker.Item label="Loading" value="Loading" />
            )}
          </Picker>
        </>
      ) : null}
      <Button title="reset" onPress={temp} />
    </View>
  );
}
