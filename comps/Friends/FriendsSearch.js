import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  FlatList,
  ScrollView,
} from "react-native";
import LottieView from "lottie-react-native";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import { Button } from "react-native";
import { Icon, ListItem } from "react-native-elements";
import {
  MaterialCommunityIcons,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

export default function FriendsList(props) {
  const [users, setUsers] = useState(null);
  const [allUsers, setAllUsers] = useState(null);
  const [usersNoQuery, setUsersNoQuery] = useState(null);
  const [friends, setFriends] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");

  // ------------------------------CURRENT USER------------------------------------
  const handleCurrentuser = async () => {
    const doc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    setCurrentUser({ id: doc.id, ...doc.data() });
  };

  // ---------------------------------USERS---------------------------------
  // Get all users
  const handleUsers = () => {
    db.collection("users").onSnapshot((queryBySnapshot) => {
      let tempUsers = [];

      queryBySnapshot.forEach((doc) => {
        if (doc.id !== firebase.auth().currentUser.uid) {
          tempUsers.push({
            id: doc.id,
            ...doc.data(),
            friendStatus: null,
            loading: false,
          });
        }
      });
      tempUsers = tempUsers.sort((a, b) =>
        a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase())
      );

      // setUsers(tempUsers);
      setAllUsers(tempUsers);
    });
  };

  // ---------------------------------FRIENDS---------------------------------
  // Get all friends
  const handleFriends = async () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("friends")
      .onSnapshot((queryBySnapshot) => {
        if (queryBySnapshot.size > 0) {
          let tempFriends = [];
          queryBySnapshot.forEach((doc) => {
            tempFriends.push({ id: doc.id, ...doc.data() });
          });

          setFriends(tempFriends);
        } else {
          setFriends([]);
        }
      });
  };

  // ---------------------------------FRIENDS STATUS---------------------------------
  // Set user's friends status
  const handleFriendsStatus = async () => {
    let tempUsers = JSON.parse(JSON.stringify(allUsers));
    tempUsers = tempUsers.map((user, index) => {
      friends.map((friend) => {
        if (user.id === friend.id) {
          user.friendStatus = friend.status;
        }
      });
      return user;
    });
    // setUsers(tempUsers);
    setUsersNoQuery(tempUsers);
  };

  // -------------------------------ADD-----------------------------------
  // Sends a friend request to a user
  const addFriend = async (user, index) => {
    users[index].loading = true;
    const add = firebase.functions().httpsCallable("addFriend");
    const response = await add({ user: currentUser, friend: user });
    console.log("response", response);
    users[index].loading = false;
  };

  // ---------------------------------SEARCH---------------------------------
  // Searches for a user by displayName
  const handleSearch = (query) => {
    if (query.length > 0) {
      setSearch(query);
      let tempUsers = [...usersNoQuery];
      let result = tempUsers.filter((user) =>
        user.displayName.toLowerCase().match(query.toLowerCase())
      );

      setUsers(result);
    } else {
      setSearch(query);
      setUsers(null);
    }
  };

  // --------------------------------USE EFFECT----------------------------------
  // Runs at the beginning
  useEffect(() => {
    handleCurrentuser();
    handleUsers();
    handleFriends();
  }, []);

  // --------------------------------USE EFFECT----------------------------------
  // Runs when there are changes to the users or friends
  useEffect(() => {
    if (allUsers && friends) {
      handleFriendsStatus();
    }
  }, [allUsers, friends]);

  // ---------------------------------USE EFFECT---------------------------------
  // Runs when something is entered in the search bar
  useEffect(() => {
    handleSearch(search);
  }, [usersNoQuery, search]);

  return (
    <View style={styles.container}>
      {/* <Text>Friends Search</Text> */}
      <View
        style={{
          flexDirection: "row",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#20365F",
          borderTopColor: "#20365F",
          //paddingTop:'2%',
        }}
      >
        <MaterialCommunityIcons
          name="account-search"
          size={40}
          color="white"
          style={{ paddingTop: "2%", marginBottom: 10 }}
        />

        <TextInput
          style={{
            backgroundColor: "white",
            fontSize: 18,
            paddingLeft: "2%",
            borderColor: "#20365F",
            borderWidth: 2,
            width: "70%",
            height: "80%",
            marginLeft: 10,
            marginRight: 10,
          }}
          placeholderTextColor="#20365F"
          placeholder="Search Here"
          onChangeText={setSearch}
          value={search}
        />
        <MaterialIcons
          name="cancel"
          size={25}
          color="#fff"
          onPress={() => props.navigation.goBack()}
        />
      </View>
      {/* <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          flex: 0.7,
          paddingTop: "55%",
          paddingLeft: "3%",
        }}
      >
        <Feather name="search" size={80} color="grey" />
        <Text
          style={{
          fontSize:26,
          alignSelf:'center',
          justifyContent:'center',
          width:'70%',
          color:'grey',
          paddingTop:'5%'
          }}
        >
        {'     '} add friends to your QuickbookinQ friends list
        </Text>
      </View> */}
      {/* <Button title="test search" onPress={() => handleSearch()} /> */}
      {
        users && friends && (
          <SafeAreaView>
            <ScrollView>
              <FlatList
                data={users}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item, index }) => (
                  <ListItem
                    key={item.id}
                    leftAvatar={{ source: { uri: item.photoURL } }}
                    rightElement={
                      item.friendStatus === "pending" ? (
                        <TouchableOpacity
                          style={{
                            borderWidth: 2,
                            borderColor: "#344C7A",
                            backgroundColor: "#9AA5B6",
                            padding: "2%",
                            borderRadius: 12,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "27%",
                            maxWidth: "27%",
                          }}
                          disabled={true}
                        >
                          <Feather name="loader" size={18} color="white" />
                          <Text
                            style={{
                              color: "white",
                              fontWeight: "600",
                              paddingLeft: "1%",
                            }}
                          >
                            {" "}
                            Pending
                          </Text>
                        </TouchableOpacity>
                      ) : item.friendStatus === "accepted" ? (
                        <TouchableOpacity
                          style={{
                            borderWidth: 2,
                            borderColor: "#20365F",
                            backgroundColor: "#344C7A",
                            padding: "2%",
                            borderRadius: 12,
                            minWidth: "27%",
                            maxWidth: "27%",
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: "white", fontWeight: "600" }}>
                            Added
                          </Text>
                        </TouchableOpacity>
                      ) : item.loading === true ? (
                        <TouchableOpacity
                          style={{
                            borderWidth: 2,
                            borderColor: "#20365F",
                            padding: "2%",
                            borderRadius: 12,
                            minWidth: "27%",
                            maxWidth: "27%",
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: "#20365F", fontWeight: "600" }}>
                            Loading
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={{
                            borderWidth: 2,
                            borderColor: "#20365F",
                            padding: "2%",
                            borderRadius: 12,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "27%",
                            maxWidth: "27%",
                          }}
                          onPress={() => addFriend(item, index)}
                        >
                          <Ionicons name="md-add" size={18} color="black" />
                          <Text style={{ color: "#20365F", fontWeight: "600" }}>
                            {" "}
                            Add Friend
                          </Text>
                        </TouchableOpacity>
                      )
                    }
                    title={item.displayName}
                    titleStyle={{ fontSize: 18 }}
                    subtitle={item.email}
                    subtitleStyle={{ fontSize: 12, color: "grey" }}
                    bottomDivider
                  />
                )}
              />
            </ScrollView>
          </SafeAreaView>
        )
        // users.map((user, index) => (
        //   <View
        //     style={{ flexDirection: "row", justifyContent: "space-between" }}
        //     key={user.id}
        //   >
        //     <Text>{user.displayName}</Text>
        //     {user.friendStatus === "pending" ? (
        //       <TouchableOpacity style={{ borderWidth: 1 }}>
        //         <Text>Pending</Text>
        //       </TouchableOpacity>
        //     ) : user.friendStatus === "accepted" ? (
        //       <TouchableOpacity style={{ borderWidth: 1 }}>
        //         <Text>Added</Text>
        //       </TouchableOpacity>
        //     ) : user.loading === true ? (
        //       <TouchableOpacity style={{ borderWidth: 1 }}>
        //         <Text>Loading</Text>
        //       </TouchableOpacity>
        //     ) : (
        //       <TouchableOpacity
        //         style={{ borderWidth: 1 }}
        //         onPress={() => addFriend(user, index)}
        //       >
        //         <Text>Add Friend</Text>
        //       </TouchableOpacity>
        //     )}
        //   </View>
        // ))
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchSection: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",
  },
  searchIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    backgroundColor: "#fff",
    color: "#424242",
  },
});
