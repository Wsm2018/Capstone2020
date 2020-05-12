import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

export default function FriendsList(props) {
  const friend = props.navigation.getParam("friend");

  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [chats, setChats] = useState(null);
  const [text, setText] = useState("");

  // -------------------------------FROM-----------------------------------
  const handleFrom = () => {
    db.collection("chats")
      .where("from", "==", firebase.auth().currentUser.uid)
      .where("to", "==", friend.id)
      .onSnapshot((queryBySnapshot) => {
        let tempFrom = [];
        queryBySnapshot.forEach((doc) => {
          tempFrom.push({ id: doc.id, ...doc.data(), from: true });
        });
        setFrom(tempFrom);
      });
  };

  // --------------------------------TO----------------------------------
  const handleTo = () => {
    db.collection("chats")
      .where("from", "==", friend.id)
      .where("to", "==", firebase.auth().currentUser.uid)
      .onSnapshot((queryBySnapshot) => {
        let tempFrom = [];
        queryBySnapshot.forEach((doc) => {
          tempFrom.push({ id: doc.id, ...doc.data(), from: false });
        });
        setTo(tempFrom);
      });
  };

  // -------------------------------CHAT-----------------------------------
  const handleChat = () => {
    let tempChat = from.concat(to);
    tempChat = tempChat.sort(
      (a, b) => a.dateTime.toDate() - b.dateTime.toDate()
    );
    setChats(tempChat);
  };

  // --------------------------------SEND----------------------------------
  const send = () => {
    db.collection("chats").add({
      to: friend.id,
      from: firebase.auth().currentUser.uid,
      text,
      dateTime: new Date(),
    });
  };

  // --------------------------------DELETE ALL----------------------------------
  const deleteAll = async () => {
    const getQuery = await db.collection("chats").get();
    getQuery.forEach((doc) => {
      db.collection("chats").doc(doc.id).delete();
    });
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    handleFrom();
    handleTo();
  }, []);

  // ------------------------------------------------------------------
  useEffect(() => {
    if (from && to) {
      handleChat();
    }
  }, [from, to]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text>Friends Chat</Text>
      <Button title="Delete All" onPress={deleteAll} />

      <Text>To: {friend.displayName}</Text>
      <ScrollView>
        {chats &&
          chats.map((chat) => (
            <Text
              style={chat.from ? { textAlign: "right" } : { textAlign: "left" }}
              key={chat.id}
            >
              {chat.text}
            </Text>
          ))}
      </ScrollView>

      <TextInput
        style={{ borderWidth: 1 }}
        placeholder="Type here"
        onChangeText={setText}
      />
      <TouchableOpacity style={{ borderWidth: 1, height: 30 }} onPress={send}>
        <Text>Send</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
});
