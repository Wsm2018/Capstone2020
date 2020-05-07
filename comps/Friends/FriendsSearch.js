import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import { Button } from "react-native";

export default function FriendsList(props) {
  const [users, setUsers] = useState(null);
  const [friends, setFriends] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const handleCurrentuser = async () => {
    const doc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    setCurrentUser({ id: doc.id, ...doc.data() });
  };

  const handleFriends = async () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("friends")
      .orderBy("name")
      .onSnapshot((queryBySnapshot) => {
        if (queryBySnapshot.size > 0) {
          let tempFriends = [];
          queryBySnapshot.forEach((doc) => {
            tempFriends.push({ id: doc.id, ...doc.data() });
          });

          users.forEach((user, index) => {
            tempFriends.map((friend) => {
              if (user.id === friend.id) {
                users[index].friendStatus = friend.status;
              }
            });
          });

          setFriends(tempFriends);
        } else {
          setFriends([]);
        }
      });
  };

  const handleUsers = () => {
    db.collection("users").onSnapshot((queryBySnapshot) => {
      let tempUsers = [];
      queryBySnapshot.forEach((doc) => {
        tempUsers.push({ id: doc.id, ...doc.data() });
      });

      setUsers(tempUsers);
    });
  };

  const addFriend = (user) => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("friends")
      .doc(user.id)
      .set({ name: user.name, status: "added" });

    db.collection("users")
      .doc(user.id)
      .collection("friends")
      .doc(firebase.auth().currentUser.uid)
      .set({ name: currentUser.name, status: "added" });
  };

  useEffect(() => {
    handleCurrentuser();
    handleUsers();
  }, []);

  useEffect(() => {
    if (users) {
      console.log("handleFriends is gunna run");
      handleFriends();
    }
  }, [users]);

  return (
    <View style={styles.container}>
      <Text>FriendsSearch</Text>
      {users &&
        friends &&
        users.map((user) => (
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
            key={user.id}
          >
            <Text>{user.name}</Text>
            {user.friendStatus === "added" ? (
              <TouchableOpacity
                style={{ borderWidth: 1 }}
                onPress={() => removeFriend(friend.id)}
              >
                <Text>Added</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{ borderWidth: 1 }}
                onPress={() => addFriend(user)}
              >
                <Text>Add Friend</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
