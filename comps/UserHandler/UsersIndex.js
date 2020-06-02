import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  ScrollView,
} from "react-native";
import { ListItem } from "react-native-elements";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

export default function ManagersRequest(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(null);

  // ------------------------------CURRENT USER------------------------------------
  const handleCurrentuser = async () => {
    const doc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    setCurrentUser({ id: doc.id, ...doc.data() });
  };

  const handleUsers = () => {
    db.collection("users").onSnapshot((queryBySnapshot) => {
      let tempUsers = [];
      queryBySnapshot.forEach((doc) =>
        tempUsers.push({ id: doc.id, ...doc.data() })
      );

      tempUsers = tempUsers.sort((a, b) =>
        a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase())
      );

      setUsers(tempUsers);
    });
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    handleCurrentuser();
    handleUsers();
  }, []);

  return users ? (
    <ScrollView style={styles.container}>
      <Text>UsersIndex</Text>
      {users.map((user, i) => (
        <ListItem
          key={i}
          // leftAvatar={{ source: { uri: l.avatar_url } }}
          title={user.displayName}
          subtitle={user.email}
          bottomDivider
        />
      ))}
    </ScrollView>
  ) : (
    <View>
      <Text>LOADING...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
