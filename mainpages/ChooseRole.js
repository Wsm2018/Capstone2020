import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  ScrollView,
} from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";
import db from "../db";
import { TextInput } from "react-native-paper";
import { Picker } from "react-native";

import * as Linking from "expo-linking";
import * as Print from "expo-print";

export default function ChooseRole(props) {
  const [currentUser, setCurrentUser] = useState();
  const role = props.role;
  const [roles, setRoles] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const allRoles = [
    { name: "admin", photoURL: "", selected: false },
    { name: "manager", photoURL: "", selected: false },
    { name: "user handler", photoURL: "", selected: false },
    { name: "asset handler", photoURL: "", selected: false },
    { name: "customer support", photoURL: "", selected: false },
    { name: "services employee", photoURL: "", selected: false },
    { name: "customer", photoURL: "", selected: false },
  ];

  // ------------------------------CURRENT USER------------------------------------
  const handleCurrentuser = async () => {
    const doc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    setCurrentUser({ id: doc.id, ...doc.data() });
  };

  // ------------------------------------------------------------------
  const handleSelect = (parking, index) => {
    if (selectedIndex > -1) {
      roles[selectedIndex].selected = false;
    }
    setSelectedIndex(index);
    roles[index].selected = true;
  };

  // ------------------------------------------------------------------
  const handleNext = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({ activeRole: roles[selectedIndex].name });
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    switch (role) {
      case "admin":
        setRoles(allRoles);
        break;
      case "manager":
        allRoles.shift();
        setRoles(allRoles);
        break;
      case "user handler":
        allRoles.splice(0, 2);
        allRoles.splice(1, 1);
        setRoles(allRoles);
        break;
      case "asset handler":
        allRoles.splice(0, 3);
        setRoles(allRoles);
        break;
      case "customer support":
        allRoles.splice(0, 4);
        allRoles.splice(1, 1);
        setRoles(allRoles);
        break;
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text>Choose Role</Text>
      <Text></Text>
      <View
        style={{
          // flex: 1,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-around",
          // borderWidth: 1,
          height: "20%",
        }}
      >
        {roles.map((role, index) => (
          <TouchableOpacity
            key={index}
            style={
              role.selected
                ? {
                    width: `${90 / 3}%`,
                    height: `${
                      roles.length > 6
                        ? 100 / 3
                        : roles.length > 3
                        ? 100 / 2
                        : 100
                    }%`,
                    // borderWidth: 1,
                    borderRadius: 50,
                    backgroundColor: "green",
                    justifyContent: "center",
                    alignItems: "center",
                  }
                : {
                    width: `${90 / 3}%`,
                    height: `${
                      roles.length > 6
                        ? 100 / 3
                        : roles.length > 3
                        ? 100 / 2
                        : 100
                    }%`,
                    borderWidth: 1,
                    borderRadius: 50,
                    justifyContent: "center",
                    alignItems: "center",
                    // marginBottom: "2%",
                  }
            }
            onPress={() => handleSelect(role, index)}
          >
            <Text style={{ textAlign: "center" }}>{role.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text></Text>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          width: "100%",
          height: "5%",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={handleNext}
        // disabled={selectedIndex === -1}
      >
        <Text>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // borderWidth: 1,
    flex: 1,
    margin: 20,
    justifyContent: "center",
    // height: "100%",
  },
});
