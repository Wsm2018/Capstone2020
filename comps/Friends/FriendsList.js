import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Button } from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

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
        // console.log(queryBySnapshot.size, "friends - FriendsList");
        if (queryBySnapshot.size > 0) {
          let tempFriends = [];
          queryBySnapshot.forEach((doc) => {
            if (doc.data().status === "accepted") {
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
      <Text>Friends List</Text>
      <Button title="TEST" onPress={() => props.navigation.navigate("Test")} />
      <Button title="Delete All" onPress={deleteAll} />

      {friends.length > 0 ? (
        friends.map((friend) => (
          <View
            key={friend.id}
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text>{friend.displayName}</Text>

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
