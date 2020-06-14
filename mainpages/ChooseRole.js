import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  ScrollView,
  Image,
  Platform,
} from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";
import db from "../db";
import { TextInput } from "react-native-paper";
import { Picker } from "react-native";
// import { Image, Avatar } from "react-native-elements";

import * as Linking from "expo-linking";
import * as Print from "expo-print";

export default function ChooseRole(props) {
  const [currentUser, setCurrentUser] = useState();
  const role = props.role;
  const [roles, setRoles] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const allRoles = [
    {
      name: "admin",
      photoURL: require("../assets/icons/admin.png"),
      selected: false,
    },
    {
      name: "manager",
      photoURL: require("../assets/icons/manager.png"),
      selected: false,
    },
    {
      name: "user handler",
      photoURL: require("../assets/icons/userHandler.png"),
      selected: false,
    },
    {
      name: "asset handler",
      photoURL: require("../assets/icons/assetHandler.png"),
      selected: false,
    },
    {
      name: "customer support",
      photoURL: require("../assets/icons/customerSupport.png"),
      selected: false,
    },
    {
      name: "services employee",
      photoURL: require("../assets/icons/servicesEmployee.png"),
      selected: false,
    },
    {
      name: "customer",
      photoURL: require("../assets/icons/customer2.png"),
      selected: false,
    },
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
  const handleSelect = (role, index) => {
    // if (selectedIndex > -1) {
    //   roles[selectedIndex].selected = false;
    // }
    // setSelectedIndex(index);
    // roles[index].selected = true;
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({ activeRole: roles[index].name });

    // handleNext();
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
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          // backgroundColor: "red",
        }}
      >
        <Text style={{ fontSize: Platform.isPad ? 28 : 25 }}>Login As:</Text>
      </View>
      <View
        style={{
          flex: 6,
          // justifyContent: "center",
          alignItems: "center",
          // backgroundColor: "blue",
        }}
      >
        <View style={{ flexDirection: "row", flexWrap: "wrap", padding: "5%" }}>
          {roles.map((role, index) => (
            // index < 7 &&
            <View
              style={{
                width: "29%",
                // height: "29%",
                // backgroundColor: "yellow",

                // borderWidth: 1,
                marginTop: "5%",
                margin: "2%",
                padding: "5%",
                aspectRatio: 1 / 1,
              }}
            >
              <TouchableOpacity
                key={index}
                style={{
                  // backgroundColor: "red",
                  width: "100%",
                }}
                onPress={() => handleSelect(role, index)}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <View style={{}}>
                    <Image
                      source={role.photoURL}
                      style={{
                        width: 90,
                        height: 90,
                        // aspectRatio: 1 / 1,
                        // borderWidth: 10,
                      }}
                    />
                  </View>
                  <View
                    style={{
                      // backgroundColor: "green",
                      height: 30,
                      // width: "100%",
                      // justifyContent: "flex-end",
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        textTransform: "capitalize",
                        // color: "#20365F",
                        fontWeight: "bold",
                      }}
                    >
                      {role.name}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* <TouchableOpacity
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
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // borderWidth: 1,
    flex: 1,
    // margin: 20,
    justifyContent: "center",
    // height: "100%",
    backgroundColor: "#fafafa",
  },
});
