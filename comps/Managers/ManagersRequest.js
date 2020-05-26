import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Button } from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

export default function ManagersRequest(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [requests, setRequests] = useState();

  // ------------------------------CURRENT USER------------------------------------
  const handleCurrentuser = async () => {
    const doc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    setCurrentUser({ id: doc.id, ...doc.data() });
  };

  //   const handleRequests = () =>{
  //     const doc = await db
  //     .collection("users")
  //     .where("role","==",)
  //     .onSnapshot(()=>{

  //     })
  //   }

  // ------------------------------------------------------------------
  useEffect(() => {
    handleCurrentuser();
  }, []);

  return (
    <View style={styles.container}>
      <Text>ManagersRequest</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
