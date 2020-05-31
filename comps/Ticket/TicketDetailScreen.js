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

  const [chat, setChat] = useState(false);

  useEffect(() => {
    Check();
  }, []);
  const Check = async () => {
    const c = await db
      .collection("customerSupport")
      .doc(ticket.id + "")
      .collection("liveChat")
      .get();
    if (c.size != 0) {
      setChat(true);
    }
  };
  const TakeTicket = async () => {
    db.collection("customerSupport")
      .doc(ticket.id)
      .update({
        status: "in Process",
        supportAgentUid: firebase.auth().currentUser.uid,
        agentsContributed: firebase.firestore.FieldValue.arrayUnion(
          firebase.auth().currentUser.uid
        ),
      });
  };

  const CloseTicket = () => {
    db.collection("customerSupport").doc(ticket.id).update({
      status: "Closed",
    });
  };

  return (
    <View>
      <Text>Ticket {ticket.title}</Text>
      <Text>status {ticket.status}</Text>
      <Text>description {ticket.description}</Text>
      {user.role !== "customer support" ? (
        <Button
          title="Live Chat"
          onPress={() => props.navigation.navigate("Chat", { ticket, user })}
        />
      ) : (
        <View>
          {chat ? (
            <Button
              title="Live Chat"
              onPress={() =>
                props.navigation.navigate("Chat", { ticket, user })
              }
            />
          ) : null}

          {ticket.status === "pending" ? (
            <Button title="Take" onPress={() => TakeTicket()} />
          ) : null}
        </View>
      )}
      {user.role == "customer support" && ticket.status != "Closed" ? (
        <Button title="Close Ticket" onPress={() => CloseTicket()} />
      ) : null}
    </View>
  );
}
