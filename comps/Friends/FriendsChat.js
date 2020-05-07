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

  const [chats, setChats] = useState(null);
  const [text, setText] = useState("");

  const handleChat = () => {
    db.collection("chats")
      .orderBy("date")
      .onSnapshot((queryBySnapshot) => {
        let tempChats = [];
        queryBySnapshot.forEach((doc) => {
          tempChats.push({ id: doc.id, ...doc.data() });
        });
        setChats(tempChats);
      });
  };

  const send = () => {
    db.collection("chats").add({
      to: friend.id,
      from: firebase.auth().currentUser.uid,
      text,
      date: new Date(),
    });
  };

  const deleteAll = async () => {
    const getQuery = await db.collection("chats").get();
    getQuery.forEach((doc) => {
      db.collection("chats").doc(doc.id).delete();
    });
  };

  useEffect(() => {
    handleChat();
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container}>
      <Text>Friends Chat</Text>
      <Button title="Delete All" onPress={deleteAll} />

      <Text>To: {friend.name}</Text>
      <ScrollView>
        {chats && chats.map((chat) => <Text>{chat.text}</Text>)}
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
