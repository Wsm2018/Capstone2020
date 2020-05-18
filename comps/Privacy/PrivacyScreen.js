import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Button } from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

export default function PrivacyScreen(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [privacy, setPrivacy] = useState(null);

  // ------------------------------CURRENT USER------------------------------------
  const handleCurrentuser = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((doc) => {
        setCurrentUser({ id: doc.id, ...doc.data() });
        let tempPrivacy = Object.entries(doc.data().privacy);
        console.log("tempPrivacy", tempPrivacy);
        setPrivacy(tempPrivacy);
      });
  };

  // ------------------------------UPDATE------------------------------------
  const handleUpdate = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({
        privacy: {
          email: "Everyone",
          name: "Everyone",
          location: "Everyone",
          phone: "Everyone",
        },
      });
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    handleCurrentuser();
  }, []);

  useEffect(() => {}, [currentUser]);

  return (
    <View style={styles.container}>
      <Text>PrivacyScreen</Text>
      <Button title="handleUpdate" onPress={handleUpdate} />
      {privacy &&
        privacy.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
            onPress={() =>
              props.navigation.navigate("PrivacyDetail", {
                currentUser,
                type: item[0],
              })
            }
          >
            <Text>{item[0][0].toUpperCase() + item[0].slice(1)}: </Text>
            <Text>{item[1]}</Text>
          </TouchableOpacity>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
