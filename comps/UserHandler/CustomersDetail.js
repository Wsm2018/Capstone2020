import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, Platform } from "react-native";
import { Image, Avatar, ListItem, Divider } from "react-native-elements";
import { Card } from "react-native-shadow-cards";
import {
  Collapse,
  CollapseHeader,
  CollapseBody,
} from "accordion-collapse-react-native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

import * as Linking from "expo-linking";
import * as Print from "expo-print";
import { UserInterfaceIdiom } from "expo-constants";

export default function EmployeesRequest(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [friends, setFriends] = useState(null);
  const [marginVal, setMargin] = useState(0);

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

  return (
    <ScrollView contentContainerStyle={{ backgroundColor: "#e3e3e3" }}>
      <View style={styles.container}>
        <View style={styles.one}>
          <View
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "flex-start",
              //backgroundColor: "red",
            }}
          >
            <View
              style={
                Platform.OS === "ios" ? styles.avatarIpad : styles.avatarPhone
              }
              //style={Platform.isPad ? styles.avatarIpad : styles.avatarPhone}
            >
              <Avatar
                rounded
                source={{ uri: user.photoURL }}
                style={{
                  width: "40%",
                  height: 150,
                  // marginTop: "5%",
                  //marginBottom: "4%",
                }}
              />
              <Text
                style={{
                  alignSelf: "center",
                  fontWeight: "bold",
                  fontSize: 17,
                }}
              >
                {user.displayName}
              </Text>
              <Text
                style={{
                  alignSelf: "center",
                  fontSize: 15,
                  marginBottom: "2%",
                }}
              >
                Role: {user.role}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.two}>
          <Text style={styles.cardTitle}> Employees Details</Text>

          <View style={styles.text}>
            <Text style={{ fontSize: 16, color: "black", marginTop: "1%" }}>
              Role
            </Text>
            <Text style={{ fontSize: 16, marginTop: "1%" }}>{user.role}</Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 16, color: "black" }}>ID</Text>
            <Text style={{ fontSize: 16 }}>{user.id}</Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 16, color: "black" }}>Email</Text>
            <Text style={{ fontSize: 16, marginBottom: "5%" }}>
              {user.email}
            </Text>
          </View>
        </View>
        <View style={styles.two}>
          <Text style={styles.cardTitle}> Personal Information</Text>

          <View style={styles.text}>
            <Text style={{ fontSize: 16, color: "black", marginTop: "1%" }}>
              Balance
            </Text>
            <Text style={{ fontSize: 16, marginTop: "1%" }}>
              {user.balance}
            </Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 16, color: "black" }}>
              Outstanding Balance
            </Text>
            <Text style={{ fontSize: 16 }}>{user.outstandingBalance}</Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 16, color: "black" }}>Referral Code</Text>
            <Text style={{ fontSize: 16 }}>{user.referralCode}</Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 16, color: "black" }}>Teputation</Text>
            <Text style={{ fontSize: 16 }}>{user.reputation}</Text>
          </View>
          <View style={styles.text}>
            <Text style={{ fontSize: 16, color: "black" }}>Tokens</Text>
            <Text style={{ fontSize: 16, marginBottom: "5%" }}>
              {user.tokens}
            </Text>
          </View>
        </View>
        <View style={styles.two}>
          <Collapse>
            <CollapseHeader>
              <View
                style={Platform.isPad ? styles.arrowIpad : styles.arrowPhone}
              >
                <Text style={styles.cardTitle}>QR Code</Text>
                <Ionicons name="md-arrow-dropdown" size={30} color="#5c5b5b" />
              </View>
            </CollapseHeader>
            <CollapseBody>
              <Avatar source={{ uri: user.qrCode }} size="xlarge" />
            </CollapseBody>
          </Collapse>
        </View>
        <View style={styles.two}>
          <Collapse>
            <CollapseHeader>
              <View
                style={Platform.isPad ? styles.arrowIpad : styles.arrowPhone}
              >
                <Text style={styles.cardTitle}>
                  Friends No: {friends && friends.length}
                </Text>
                <Ionicons name="md-arrow-dropdown" size={30} color="#5c5b5b" />
              </View>
            </CollapseHeader>
            <CollapseBody>
              <ScrollView>
                {friends &&
                  friends.map((friend, i) => (
                    <ListItem
                      key={i}
                      // leftAvatar={{ source: { uri: l.avatar_url } }}
                      title={friend.displayName}
                      subtitle={friend.email}
                      bottomDivider
                      containerStyle={{ width: "75%" }}
                    />
                  ))}
              </ScrollView>
            </CollapseBody>
          </Collapse>
        </View>
        <Text></Text>
      </View>
    </ScrollView>
  );
}
EmployeesRequest.navigationOptions = (props) => ({
  title: "Customer Details",
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
});
const styles = StyleSheet.create({
  header: {
    flex: 0.7,
    alignItems: "center",
    backgroundColor: "#e3e3e3",
  },
  pi: {
    flex: 0.3,
    justifyContent: "flex-start",
    alignItems: "center",
    // backgroundColor: "#e3e3e3",
    // backgroundColor: "red",
  },

  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",
    //width: Math.round(Dimensions.get("window").width),
    // height: Math.round(Dimensions.get("window").height),
  },
  text: {
    fontSize: 80,
    marginLeft: "4%",
    marginRight: "5%",
    marginBottom: "1%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  text2: {
    fontSize: 80,
    marginLeft: "4%",
    marginBottom: "1%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  arrowPhone: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 375,
  },
  arrowIpad: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 10,
  },
  avatarPhone: {
    justifyContent: "center",
    alignItems: "center",
    width: "95%",
  },
  avatarIpad: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  one: {
    backgroundColor: "white",
    width: "100%",
    // marginTop: "3%",
    // padding: "2%",

    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
  },
  two: {
    backgroundColor: "white",
    width: "100%",
    marginTop: "3%",
    padding: "2%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
    // flexDirection: "row",
    //flexWrap: "wrap",

    // justifyContent: "space-between",
  },
  three: {
    backgroundColor: "white",
    width: "100%",
    marginTop: "3%",
    //padding: "5%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
    // flexDirection: "row",
    //flexWrap: "wrap",

    // justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 18,
    // backgroundColor: "red",
    width: "100%",
    height: 30,
    color: "black",
    fontWeight: "bold",
    padding: "1%",
    // marginLeft: "2%",
  },
});
