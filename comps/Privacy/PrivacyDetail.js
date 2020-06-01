import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Button } from "react-native";
import { ButtonGroup } from "react-native-elements";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

export default function PrivacyScreen(props) {
  const currentUser = props.navigation.getParam("currentUser");
  const type = props.navigation.getParam("type");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const buttons = ["Everyone", "Friends", "No One"];

  const handleUpdate = (item) => {
    let privacy = currentUser.privacy;
    privacy[type] = buttons[selectedIndex];
    console.log(privacy);
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({ privacy });
    props.navigation.goBack();
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    buttons.forEach((button, index) => {
      if (button === currentUser.privacy[type]) {
        setSelectedIndex(index);
      }
    });
    console.log(type);
  }, []);

  return (
    <View style={styles.container}>
      <Text>PrivacyDetail</Text>

      <Text>Type: {type}</Text>
      <Text>Status: {currentUser && currentUser.privacy[type]}</Text>
      <ButtonGroup
        onPress={setSelectedIndex}
        selectedIndex={selectedIndex}
        buttons={buttons}
        containerStyle={{ height: 100 }}
      />
      <TouchableOpacity onPress={handleUpdate}>
        <Text>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// const handleUpdate = (item) => {
//     db.collection("users")
//       .doc(firebase.auth().currentUser.uid)
//       .update(
//         type === "locationP"
//           ? {
//               "privacy.locationP": true,
//             }
//           : type === "nameP"
//           ? {
//               "privacy.nameP": true,
//             }
//           : {
//               "privacy.emailP": true,
//             }
//       );
//   };
