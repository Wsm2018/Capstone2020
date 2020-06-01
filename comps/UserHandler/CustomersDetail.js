import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Picker,
  Modal,
} from "react-native";

import { Image, Avatar, ListItem } from "react-native-elements";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

import * as Linking from "expo-linking";
import * as Print from "expo-print";

export default function EmployeesRequest(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [friends, setFriends] = useState(null);

  const user = props.navigation.getParam("user");

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
      .doc(user.id)
      .collection("friends")
      .onSnapshot((queryBySnapshot) => {
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

  // ------------------------------------------------------------------
  useEffect(() => {
    handleCurrentuser();
    handleFriends();
  }, []);

  const test = () => {
    let word = "employee handler (incomplete)";
    console.log(word.slice(-12));
  };

  return (
    <ScrollView style={styles.container}>
      <Avatar rounded source={{ uri: user.photoURL }} size="xlarge" />
      <Text></Text>
      <Text>Employees Detail</Text>
      <Text>ID: {user.id}</Text>
      <Text>Email: {user.email}</Text>
      <Text>Display Name: {user.displayName}</Text>
      <Text>Role: {user.role}</Text>
      <Text>Phone: {user.phone}</Text>

      <Text></Text>
      <Text>Personal Info</Text>
      <Text>Balance:{user.balance}</Text>
      <Text>Outstanding Balance:{user.outstandingBalance}</Text>
      <Text>Referral Code: {user.referralCode}</Text>
      <Text>Reputation: {user.reputation}</Text>
      <Text>Tokens: {user.tokens}</Text>
      <Text>QR Code: </Text>
      <Avatar source={{ uri: user.qrCode }} size="xlarge" />

      <Text>Friends: {friends && friends.length}</Text>
      <ScrollView>
        {friends &&
          friends.map((friend, i) => (
            <ListItem
              key={i}
              // leftAvatar={{ source: { uri: l.avatar_url } }}
              title={friend.displayName}
              subtitle={friend.email}
              bottomDivider
            />
          ))}
      </ScrollView>
      <Text></Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
});
