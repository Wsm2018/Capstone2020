import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Button } from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

export default function FriendsList(props) {
  const [friends, setFriends] = useState(null);

  const handleFriends = async () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("friends")
      .onSnapshot((queryBySnapshot) => {
        console.log(queryBySnapshot.size);
        if (queryBySnapshot.size > 0) {
          let tempFriends = [];
          queryBySnapshot.forEach((doc) => {
            tempFriends.push({ id: doc.id, ...doc.data() });
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

  const removeFriend = (id) => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("friends")
      .doc(id)
      .delete();

    db.collection("users")
      .doc(id)
      .collection("friends")
      .doc(firebase.auth().currentUser.uid)
      .delete();
  };

  useEffect(() => {
    handleFriends();
  }, []);

  return !friends ? (
    <View>
      <Text>LOADING...</Text>
    </View>
  ) : (
    <View style={styles.container}>
      <Text>Friends List</Text>
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
              onPress={() => removeFriend(friend.id)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
