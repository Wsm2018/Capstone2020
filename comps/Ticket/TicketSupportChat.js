import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  Picker,
  CheckBox,
} from "react-native";
import db from "../../db";

import firebase from "firebase/app";
import "firebase/auth";

import moment from "moment";
export default function SupportChat(props) {
  const ticket = props.navigation.getParam("ticket");
  const user = props.navigation.getParam("user");

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    db.collection("customerSupport")
      .doc(ticket.id + "")
      .collection("liveChat")
      .onSnapshot((Snap) => {
        let temp = [];
        Snap.forEach((doc) => {
          temp.push({ id: doc.id, ...doc.data() });
          console.log(doc.id, "==>", doc.data());
        }),
          console.log("hello", temp);
        setMessages(temp);
      });
  }, []);

  useEffect(() => {
    Check();
  }, []);

  const Check = async () => {
    const c = await db
      .collection("customerSupport")
      .doc(ticket.id + "")
      .collection("liveChat")
      .get();
    console.log("---------------------", c.size);
    if (c.size == 0) {
      Create();
    }
  };
  const Create = async () => {
    console.log("Creating a Room", ticket);
    await db
      .collection("customerSupport")
      .doc(ticket.id)
      .collection("liveChat")
      .add({
        from: "Auto Reply",
        name: "Support Bot",
        text: "Please wait until a Support Agent Joins!",
        dateTime: new Date(),
      });
  };
  const send = async () => {
    await db
      .collection("customerSupport")
      .doc(ticket.id + "")
      .collection("liveChat")
      .add({
        from: firebase.auth().currentUser.uid,
        name: user.displayName,
        text,
        dateTime: new Date(),
      });
    setText("");
  };
  return (
    <View style={{ flex: 1 }}>
      {messages ? (
        <View>
          {messages.map((item, index) =>
            item.from == user.id ? (
              <View
                key={index}
                style={{ borderWidth: 1, textAlign: "right", width: "50%" }}
              >
                <Text>{moment(item.dateTime.toDate()).format("LLL")}</Text>
                <Text>{item.name}</Text>
                <Text>{item.text}</Text>
              </View>
            ) : (
              <View key={index} style={{ borderWidth: 1 }}>
                <Text>{moment(item.dateTime.toDate()).format("LLL")}</Text>
                <Text>{item.name}</Text>
                <Text>{item.text}</Text>
              </View>
            )
          )}
          <TextInput
            placeholder="Subject"
            onChangeText={(text) => setText(text)}
          />
          <Button title="send" onPress={() => send()} />
        </View>
      ) : null}
    </View>
  );
}
