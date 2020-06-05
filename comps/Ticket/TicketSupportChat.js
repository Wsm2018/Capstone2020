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
        });
        temp = temp.sort((a, b) => a.dateTime.toDate() - b.dateTime.toDate());
        console.log("hello", temp);
        setMessages(temp);
      });
  }, []);

  // const Check = async () => {
  //   const c = await db
  //     .collection("customerSupport")
  //     .doc(ticket.id + "")
  //     .collection("liveChat")
  //     .get();
  //   console.log("---------------------", c.size);
  //   if (c.size == 0) {
  //     addLiveChatRoom();
  //   }
  // };

  const sendSupportMessage = async () => {
    const send = firebase.functions().httpsCallable("sendSupportMessage");
    const response = await send({ ticket, user, text });
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
            value={text}
            onChangeText={setText}
          />
          <Button title="send" onPress={() => sendSupportMessage()} />
        </View>
      ) : null}
    </View>
  );
}
