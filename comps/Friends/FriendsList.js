import React, { useState, useEffect, useMemo, useReducer } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Button } from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import moment from "moment";

export default function FriendsList(props) {
  const [friends, setFriends] = useState(null);
  const [allFriends, setAllFriends] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState(null);

  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [chats, setChats] = useState(null);

  // ------------------------------CURRENT USER------------------------------------
  const handleCurrentuser = async () => {
    const doc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    setCurrentUser({ id: doc.id, ...doc.data() });
  };

  // --------------------------------FRIENDS----------------------------------
  const handleFriends = async () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("friends")
      .onSnapshot((queryBySnapshot) => {
        // console.log(queryBySnapshot.size, "friends - FriendsList");
        if (queryBySnapshot.size > 0) {
          let tempFriends = [];
          queryBySnapshot.forEach((doc) => {
            if (doc.data().status === "accepted") {
              tempFriends.push({
                id: doc.id,
                ...doc.data(),
                notifications: 0,
                dateTime: new Date(0),
              });
            }
          });
          tempFriends = tempFriends.sort((a, b) =>
            a.displayName
              .toLowerCase()
              .localeCompare(b.displayName.toLowerCase())
          );

          setAllFriends(tempFriends);
        } else {
          setAllFriends([]);
        }
      });
  };

  // -------------------------------FROM-----------------------------------
  const handleFrom = () => {
    db.collection("chats")
      .where("from", "==", firebase.auth().currentUser.uid)
      .onSnapshot((queryBySnapshot) => {
        let tempFrom = [];
        queryBySnapshot.forEach((doc) => {
          tempFrom.push({ id: doc.id, ...doc.data() });
        });
        setFrom(tempFrom);
      });
  };

  // --------------------------------TO----------------------------------
  const handleTo = () => {
    db.collection("chats")
      .where("to", "==", firebase.auth().currentUser.uid)
      .onSnapshot((queryBySnapshot) => {
        let tempFrom = [];
        queryBySnapshot.forEach((doc) => {
          tempFrom.push({ id: doc.id, ...doc.data() });
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

  // -------------------------------NOTIFICATIONS-----------------------------------
  const handleFriendsMessages = () => {
    let tempFriends = JSON.parse(JSON.stringify(allFriends));
    if (chats.length > 0) {
      tempFriends = tempFriends.map((friend, index) => {
        let from = chats.filter((chat) => chat.from === friend.id);
        let to = chats.filter((chat) => chat.to === friend.id);
        let chat = from.concat(to);
        chat = chat.sort((a, b) => b.dateTime.toDate() - a.dateTime.toDate());

        if (chat.length > 0) {
          friend.dateTime = new Date(
            moment(chat[0].dateTime.toDate()).format()
          );
          let notifications = chat.filter(
            (c) =>
              c.status === "unread" &&
              c.from !== firebase.auth().currentUser.uid
          ).length;
          friend.notifications = notifications;
        } else {
          friend.dateTime = new Date(friend.dateTime);
        }
        return friend;
      });
    }

    tempFriends = tempFriends.sort((a, b) => b.dateTime - a.dateTime);
    setFriends(tempFriends);
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    handleCurrentuser();
    handleFriends();
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
  useEffect(() => {
    if (allFriends && chats) {
      if (allFriends.length > 0) {
        handleFriendsMessages();
      } else {
        setFriends([]);
      }
    }
  }, [allFriends, chats]);

  // -------------------------------DELETE-----------------------------------
  const deleteAll = async () => {
    const userQuery = await db.collection("users").get();

    userQuery.forEach(async (user) => {
      const friendQuery = await db
        .collection("users")
        .doc(user.id)
        .collection("friends")
        .get();

      friendQuery.forEach((friend) => {
        db.collection("users")
          .doc(user.id)
          .collection("friends")
          .doc(friend.id)
          .delete();
      });
    });
  };

  // -------------------------------REMOVE-----------------------------------
  const removeFriend = async (user) => {
    const dec = firebase.functions().httpsCallable("removeFriend");
    const response = await dec({ user: currentUser, friend: user });
    console.log("response", response);
  };

  return !friends ? (
    <View>
      <Text>LOADING...</Text>
    </View>
  ) : (
    <View style={styles.container}>
      <Text>Friends List</Text>
      <Button title="TEST" onPress={() => testo()} />
      <Button title="TEST2" onPress={() => testo2()} />
      <Button title="TEST3" onPress={() => testo3()} />
      <Button title="TEST4" onPress={() => test()} />
      {/* <Button title="Delete All" onPress={deleteAll} /> */}

      {friends.length > 0 ? (
        friends.map((friend) => (
          <View
            key={friend.id}
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text>{friend.displayName}</Text>
            <Text>{friend.notifications}</Text>
            <TouchableOpacity
              style={{ borderWidth: 1 }}
              onPress={() =>
                props.navigation.navigate("FriendsChat", { friend })
              }
            >
              <Text>Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ borderWidth: 1 }}
              onPress={() => removeFriend(friend)}
            >
              <Text>Delete</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text>You have no friends</Text>
      )}

      <TouchableOpacity
        style={{ borderWidth: 1 }}
        onPress={() => props.navigation.navigate("FriendsSearch")}
      >
        <Text>Add A Friend</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ borderWidth: 1 }}
        onPress={() => props.navigation.navigate("FriendsRequest")}
      >
        <Text>Friend Requests</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
