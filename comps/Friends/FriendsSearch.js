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
        if (doc.id !== firebase.auth().currentUser.uid) {
          tempUsers.push({ id: doc.id, ...doc.data() });
        }
      });
      tempUsers = tempUsers.sort((a, b) =>
        a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase())
      );
      setUsers(tempUsers);
    });
  };

  const addFriend = (user) => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("friends")
      .doc(user.id)
      .set({ displayName: user.displayName, status: "added" });

    db.collection("users")
      .doc(user.id)
      .collection("friends")
      .doc(firebase.auth().currentUser.uid)
      .set({ displayName: currentUser.displayName, status: "added" });
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
      <Text>Friends Search</Text>
      {users &&
        friends &&
        users.map((user) => (
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
            key={user.id}
          >
            <Text>{user.displayName}</Text>
            {user.friendStatus === "added" ? (
              <TouchableOpacity style={{ borderWidth: 1 }}>
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
