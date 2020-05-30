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
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Divider } from "react-native-elements";

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
      enabled={true}
    >
      <View
        style={{
          flexDirection: "row",
          alignContent: "center",
          alignItems: "center",
          //  marginBottom: 20,
          height: "8%",
          maxHeight: "8%",
          backgroundColor: "#20365F",
          justifyContent: "flex-start",
          flex: 1,
          flexWrap: "wrap",
          paddingLeft: "4%",
        }}
      >
        <Ionicons name="ios-arrow-back" size={35} color="white" />
        <Text style={{ color: "white", fontSize: 24, paddingLeft: "3%" }}>
          {" "}
          {friend.displayName}
        </Text>
      </View>

      <ScrollView>
        <View style={{ paddingTop: "5%" }}></View>
        {chats &&
          chats.map((chat) => (
            // <TouchableOpacity style={{alignContent:'flex-end'}}>

            // </TouchableOpacity>
            <View
              style={{ borderRadius: 20, width: "90%", alignSelf: "center" }}
            >
              <TouchableOpacity
                disabled={true}
                style={
                  chat.from
                    ? {
                        textAlign: "right",
                        backgroundColor: "#49679F",
                        alignSelf: "flex-end",
                        maxWidth: "85%",
                        minWidth: "20%",
                        borderRadius: 20,
                      }
                    : {
                        textAlign: "left",
                        backgroundColor: "white",
                        alignSelf: "flex-start",
                        maxWidth: "85%",
                        minWidth: "20%",
                        borderRadius: 20,
                      
                      }
                }
                key={chat.id}
              >
                <Text
                  style={
                    chat.from
                      ? {
                          textAlign: "left",
                          paddingLeft:'4%',
                          paddingRight: "4%",
                          fontSize: 20,
                          color: "white",

                        }
                      : {
                          textAlign: "left",
                          paddingLeft: "4%",
                          paddingRight: "4%",
                          fontSize: 20,
                          color: "#20365F",
                       
                        }
                  }
                  key={chat.id}
                >
                  {chat.text}
                </Text>
              </TouchableOpacity>
              <Text>{"\n"}</Text>
            </View>
          ))}
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          alignContent: "center",
          alignItems: "center",
          marginBottom: 20,
         // height: "8%",
          minHeight:'12%',
          maxHeight: "8%",
          backgroundColor: "#20365F",
          justifyContent: "space-evenly",
          flex: 1,
          flexWrap: "wrap",
          paddingTop:'1%'
          //position:'relative'
        }}
      >
        <TextInput
          style={{
            borderWidth: 1,
            minHeight:'50%',
            maxHeight:'100%',
            width: "80%",
            paddingLeft: "4%",
            backgroundColor: "white",
            borderRadius: 30,
          }}
          numberOfLines={10}
          multiline={true}
          placeholder="Type here"
          placeholderTextColor="black"
          onChangeText={setText}
          value={text}
        />
        <TouchableOpacity onPress={send}>
          <MaterialIcons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //  alignContent:'center',
    //  justifyContent: "space-e",
    backgroundColor: "#E7E8EA",
  },
});
