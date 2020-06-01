import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  ScrollView,
  FlatList,
} from "react-native";
import LottieView from "lottie-react-native";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import {
  FontAwesome5,
  Ionicons,
  FontAwesome,
  AntDesign,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-navigation";
import { ListItem } from "react-native-elements";

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
        // console.log(queryBySnapshot.size, "friends - FriendsList");
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

  // -------------------------------DELETE-----------------------------------
  const deleteAll = async () => {
    const userQuery = await db.collection("users").get();

    userQuery.forEach(async (user) => {
      const friendQuery = await db
        .collection("users")
        .doc(user.id)
        .collection("friends")
        .get();

      friendQuery.forEach((friend) => {
        db.collection("users")
          .doc(user.id)
          .collection("friends")
          .doc(friend.id)
          .delete();
      });
    });
  };

  // -------------------------------REMOVE-----------------------------------
  const removeFriend = async (user) => {
    const dec = firebase.functions().httpsCallable("removeFriend");
    const response = await dec({ user: currentUser, friend: user });
    console.log("response", response);
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    handleCurrentuser();
    handleFriends();
  }, []);

  return !friends ? (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        flex: 0.7,
        paddingTop: "7%",
        paddingLeft: "3%",
      }}
    >
      {/* <LottieView
        source={require("../../assets/loading.json")}
        autoPlay
        loop
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "13%",
          paddingLeft: "5%",
        }}
      /> */}
      <Text style={{ fontSize: 28, color: "#20365F", position: "relative" }}>
        LOADING
      </Text>
    </View>
  ) : (
    <View style={styles.container}>
      {/* <Text>Friends List</Text> */}
      {/* <Button title="TEST" onPress={() => props.navigation.navigate("Test")} /> */}
      {/* <Button title="Delete All" onPress={deleteAll} /> */}
      {friends.length > 0 ? (
        <SafeAreaView
          style={{
            paddingTop: "2%",
            // backgroundColor: "white",
            height: "55%",
            borderRadius: 30,
            width: "90%",
            marginLeft: "5%",
            // borderColor:'#20365F',
            // borderWidth:1
          }}
        >
          <ScrollView>
            <FlatList
              data={friends}
              keyExtractor={(item) => String(item.id)}
              style={{ borderWidth: 1, borderColor: "#20365F" }}
              //contentContainerStyle={{alignItems:'flex-start', justifyContent:'space-around'}}
              renderItem={({ item, index }) => (
                <ListItem
                  key={item.id}
                  leftAvatar={{ source: { uri: item.photoURL } }}
                  // leftAvatar={
                  //   <FontAwesome5
                  //     name="user-friends"
                  //     size={30}
                  //     color="#20365F"
                  //   />
                  //  <AntDesign name="adduser" size={35} color="#20365F" />
                  // }
                  rightElement={
                    <TouchableOpacity onPress={() => removeFriend(item)}>
                      <MaterialCommunityIcons
                        name="delete-forever-outline"
                        size={30}
                        color="#1B2D4F"
                      />
                      {/* <Feather name="x-circle" size={30} color="black" /> */}
                    </TouchableOpacity>
                  }
                  rightIcon={
                    <TouchableOpacity
                      onPress={() =>
                        props.navigation.navigate("FriendsChat", {
                          friend: item,
                        })
                      }
                    >
                      <FontAwesome5
                        name="rocketchat"
                        size={24}
                        color="#1B2D4F"
                      />
                      {/* <Ionicons name="ios-chatboxes" size={30} color="black" /> */}
                    </TouchableOpacity>
                    // <FontAwesome5 name="rocketchat" size={24} color="black" />
                  }
                  title={item.displayName}
                  titleStyle={{ fontSize: 20 }}
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
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "column",
          }}
        >
          <LottieView
            source={require("../../assets/17723-waitting.json")}
            autoPlay
            loop
            style={{ position: "relative", width: "55%", paddingTop: "5%" }}
          />
          <Text style={{ color: "grey", fontSize: 28, paddingTop: "10%" }}>
            Your friend list is empty
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={{
          backgroundColor: "#fff",
          height: 50,
          width: "60%",
          alignItems: "center",
          alignContent: "center",

          flexDirection: "row",
          justifyContent: "center",
          alignSelf: "center",
          // paddingLeft: 0,
          marginTop: 100,
          marginLeft: "20%",
          marginEnd: "20%",
          borderRadius: 10,
          marginBottom: 10,
        }}
        onPress={() => props.navigation.navigate("FriendsSearch")}
      >
        <Ionicons name="md-person-add" size={28} color="#20365F" />
        <Text style={{ color: "#20365F", fontSize: 22, paddingLeft: "5%" }}>
          Add Friends
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          backgroundColor: "#fff",
          height: 50,
          width: "60%",
          alignItems: "center",
          alignContent: "center",

          flexDirection: "row",
          justifyContent: "center",
          alignSelf: "center",
          // paddingLeft: 0,
          marginTop: 30,
          marginLeft: "20%",
          marginEnd: "20%",
          borderRadius: 10,
          marginBottom: 50,
        }}
        onPress={() => props.navigation.navigate("FriendsRequest")}
      >
        <FontAwesome name="users" size={24} color="#20365F" />
        {/* <Ionicons name="md-person-add" size={28} color="#20365F" /> */}
        <Text style={{ color: "#20365F", fontSize: 22, paddingLeft: "5%" }}>
          Friends Requests
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: "15%",
    backgroundColor: "#20365F",
  },
});
