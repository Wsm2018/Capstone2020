import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

export default function FriendsList(props) {
  const [friends, setFriends] = useState(null);

  const handleFriends = async () => {
    const getQuery = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("friends")
      .get();

    if (getQuery.size > 0) {
      console.log("no friends");
    }

    // const getQuery = await db
    //   .collection("users")
    //   .doc(firebase.auth().currentUser)
    //   .collection("friends")
    //   .limit(1)
    //   .get();

    // console.log("Friends:", getQuery.size);
  };

  useEffect(() => {
    handleFriends();
  }, []);
  return (
    <View style={styles.container}>
      <Text>FriendsList</Text>
      {friends ? <View></View> : <View></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
  },
});
