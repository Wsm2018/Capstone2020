import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Button } from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import "firebase/functions";

export default function FriendsList(props) {
  const [friends, setFriends] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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
        // console.log(queryBySnapshot.size);
        if (queryBySnapshot.size > 0) {
          let tempFriends = [];
          queryBySnapshot.forEach((doc) => {
            if (doc.data().status === "requested") {
              tempFriends.push({ id: doc.id, ...doc.data() });
            }
          });
          tempFriends = tempFriends.sort((a, b) =>
            a.displayName
              .toLowerCase()
              .localeCompare(b.displayName.toLowerCase())
          );

          // console.log(tempFriends);
          setFriends(tempFriends);
        } else {
          setFriends([]);
        }
      });
  };

  // -------------------------------ACCEPT-----------------------------------
  const accept = async (user) => {
    const add = firebase.functions().httpsCallable("acceptFriend");
    const response = await add({ user: currentUser, friend: user });
    console.log("response", response);
  };

  // -------------------------------DECLINE-----------------------------------
  const decline = async (user) => {
    const dec = firebase.functions().httpsCallable("removeFriend");
    const response = await dec({ user: currentUser, friend: user });
    console.log("response", response);
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    handleCurrentuser();
    handleFriends();
  }, []);

  return !friends ? (
    <View>
      <Text>LOADING...</Text>
    </View>
  ) : (
    <View style={styles.container}>
      <Text>Friends Request</Text>

      {friends.length > 0 ? (
        friends.map((friend) => (
          <View
            key={friend.id}
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text>{friend.displayName}</Text>

            <TouchableOpacity
              style={{ borderWidth: 1 }}
              onPress={() => accept(friend)}
            >
              <Text>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ borderWidth: 1 }}
              onPress={() => decline(friend)}
            >
              <Text>Decline</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text>You have no REQUESTS</Text>
      )}

      {/* <TouchableOpacity
        style={{ borderWidth: 1 }}
        onPress={() => props.navigation.navigate("FriendsSearch")}
      >
        <Text>Add A Friend</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
