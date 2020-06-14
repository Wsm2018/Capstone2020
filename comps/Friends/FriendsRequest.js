import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  SafeAreaView,
  FlatList,
  ScrollView,
} from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import "firebase/functions";
import { ListItem } from "react-native-elements";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import LottieView from "lottie-react-native";
export default function FriendsList(props) {
  const [friends, setFriends] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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
      .doc(firebase.auth().currentUser.uid)
      .collection("friends")
      .onSnapshot((queryBySnapshot) => {
        // console.log(queryBySnapshot.size);
        if (queryBySnapshot.size > 0) {
          let tempFriends = [];
          queryBySnapshot.forEach((doc) => {
            if (doc.data().status === "requested") {
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

  // -------------------------------ACCEPT-----------------------------------
  const accept = async (user) => {
    db.collection("users")
      .doc(currentUser.id)
      .collection("friends")
      .doc(user.id)
      .update({ status: "accepted" });

    db.collection("users")
      .doc(user.id)
      .collection("friends")
      .doc(currentUser.id)
      .update({ status: "accepted" });
  };

  // -------------------------------DECLINE-----------------------------------
  const decline = async (user) => {
    // const dec = firebase.functions().httpsCallable("removeFriend");
    // const response = await dec({ user: currentUser, friend: user });
    // console.log("response", response);

    db.collection("users")
      .doc(currentUser.id)
      .collection("friends")
      .doc(user.id)
      .delete();

    db.collection("users")
      .doc(user.id)
      .collection("friends")
      .doc(currentUser.id)
      .delete();
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    handleCurrentuser();
    handleFriends();
  }, []);

  return !friends ? (
    <View
      style={{ flex: 1, justifyContent: "center", backgroundColor: "white" }}
    >
      <LottieView
        source={require("../../assets/loadingAnimations/890-loading-animation.json")}
        autoPlay
        loop
        style={{
          position: "relative",
          width: "50%",
          backgroundColor: "white",
          alignItems: "center",
          justifyContent: "center",
          alignContent: "center",
          alignSelf: "center",
        }}
      />
    </View>
  ) : (
    <View style={styles.container}>
      {/* <View
        style={{
          flexDirection: "row",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#185a9d",
          borderTopColor: "#185a9d",
          //paddingTop:'2%',
        }}
      >
        <Ionicons
          name="md-arrow-round-back"
          size={26}
          color="#fff"
          onPress={() => props.navigation.goBack()}
        />
        <Text
          style={{
            color: "white",
            fontSize: 26,
            paddingLeft: "3%",
            fontWeight: "600",
            marginLeft: 10,
            marginRight: 10,
            paddingTop: "3%",
            paddingBottom: "3%",
          }}
        >
          Friends Request
        </Text>
      </View> */}

      {friends.length > 0 ? (
        <SafeAreaView
          style={
            {
              // paddingTop: "2%"
            }
          }
        >
          <ScrollView>
            <FlatList
              data={friends}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item, index }) => (
                <ListItem
                  key={item.id}
                  //leftAvatar={{ source: { uri: item.photoURL } }}
                  leftAvatar={
                    <AntDesign name="adduser" size={35} color="#185a9d" />
                  }
                  rightIcon={
                    <TouchableOpacity
                      style={{
                        borderWidth: 1,
                        borderColor: "#3ea3a3",
                        backgroundColor: "#3ea3a3",
                        padding: "2%",
                        borderRadius: 8,
                        alignItems: "center",
                        minWidth: "20%",
                        maxWidth: "20%",
                      }}
                      onPress={() => accept(item)}
                    >
                      <Text style={{ color: "white", fontWeight: "600" }}>
                        Accept
                      </Text>
                    </TouchableOpacity>
                  }
                  rightElement={
                    <TouchableOpacity
                      style={{
                        borderWidth: 1,
                        borderColor: "#901616",
                        backgroundColor: "#901616",
                        padding: "2%",
                        borderRadius: 8,
                        alignItems: "center",
                        minWidth: "20%",
                        maxWidth: "20%",
                      }}
                      onPress={() => decline(item)}
                    >
                      <Text style={{ color: "white", fontWeight: "600" }}>
                        Decline
                      </Text>
                    </TouchableOpacity>
                  }
                  title={item.displayName}
                  titleStyle={{ fontSize: 22 }}
                  subtitle={item.status}
                  //subtitle={item.status + " to add you"}
                  subtitleStyle={{ fontSize: 12, color: "grey" }}
                  bottomDivider
                />
              )}
            />
          </ScrollView>
        </SafeAreaView>
      ) : (
        <View
          style={{
            flex: 1,
            //  paddingTop: "10%",
            alignContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <LottieView
            // source={require("../../assets/10000-empty-box.json")}
            source={require("../../assets/17723-waitting.json")}
            autoPlay
            duration={2000}
            // loop
            style={{
              position: "relative",
              width: "100%",
              paddingTop: "5%",
              // paddingLeft: "6%",
            }}
          />
          <Text
            style={{
              fontWeight: "500",
              fontSize: 26,
              paddingLeft: "3%",
              paddingTop: "8%",
              color: "#3062AE",
              // textDecorationLine: "underline",
            }}
          >
            No Requests
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",
  },
});
