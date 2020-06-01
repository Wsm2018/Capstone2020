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

  // const [unsubscribe, setUnsubscribe] = useState(null);
  // const [unsubscribe2, setUnsubscribe2] = useState(null);

  // -------------------------------FROM-----------------------------------
  const handleFrom = () => {
    const unsubscribe = db
      .collection("chats")
      .where("from", "==", firebase.auth().currentUser.uid)
      .where("to", "==", friend.id)
      .onSnapshot((queryBySnapshot) => {
        let tempFrom = [];
        queryBySnapshot.forEach((doc) => {
          tempFrom.push({ id: doc.id, ...doc.data(), from: true });
        });
        // console.log(tempFrom);
        setFrom(tempFrom);
      });
    screenListener(unsubscribe);
  };

  // --------------------------------TO----------------------------------
  const handleTo = () => {
    console.log("yo we in to");
    const unsubscribe = db
      .collection("chats")
      .where("from", "==", friend.id)
      .where("to", "==", firebase.auth().currentUser.uid)
      .onSnapshot(async (queryBySnapshot) => {
        console.log("we in this?");
        let tempFrom = [];
        queryBySnapshot.forEach((doc) => {
          tempFrom.push({ id: doc.id, ...doc.data(), from: false });
        });
        // get all of this shit
        // filter only unread messages
        // update into read using their id
        let unread = tempFrom.filter((message) => message.status === "unread");
        if (unread.length > 0) {
          const update = firebase.functions().httpsCallable("updateToRead");
          const response = await update({ messages: unread });
        }
        // console.log(response);

        setTo(tempFrom);
      });
    screenListener(unsubscribe);
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
  const send = async () => {
    const message = firebase.functions().httpsCallable("sendMessage");
    const response = await message({
      to: friend.id,
      from: firebase.auth().currentUser.uid,
      text,
      dateTime: new Date(),
    });
    console.log("response", response);

    setText("");
  };

  // --------------------------------DELETE ALL----------------------------------
  const deleteAll = async () => {
    const getQuery = await db.collection("chats").get();
    getQuery.forEach((doc) => {
      db.collection("chats").doc(doc.id).delete();
    });
  };

  // --------------------------------SCREEN LISTENER----------------------------------
  const screenListener = (unsubscribe) => {
    let timerId = setInterval(() => {
      if (!props.navigation.isFocused()) {
        console.log("we stopping it");
        unsubscribe();
        clearInterval(timerId);
      } else {
        console.log("scrnlistener running");
      }
    }, 1000);
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

  // ------------------------------------------------------------------
  // useEffect(() => {
  //   if (unsubscribe && unsubscribe2) {
  //     screenListener();
  //   }
  // }, [unsubscribe && unsubscribe2]);

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
        value={text}
      />
      <TouchableOpacity
        style={{ borderWidth: 1, height: 30 }}
        onPress={send}
        disabled={text === "" ? true : false}
      >
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
