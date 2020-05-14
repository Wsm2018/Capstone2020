import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import { Button } from "react-native";

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
      <Text>Friends Search</Text>
      <TextInput
        placeholder="Search Here"
        onChangeText={setSearch}
        value={search}
      />
      {/* <Button title="test search" onPress={() => handleSearch()} /> */}
      {users &&
        friends &&
        users.map((user, index) => (
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
            key={user.id}
          >
            <Text>{user.displayName}</Text>
            {user.friendStatus === "pending" ? (
              <TouchableOpacity style={{ borderWidth: 1 }}>
                <Text>Pending</Text>
              </TouchableOpacity>
            ) : user.friendStatus === "accepted" ? (
              <TouchableOpacity style={{ borderWidth: 1 }}>
                <Text>Added</Text>
              </TouchableOpacity>
            ) : user.loading === true ? (
              <TouchableOpacity style={{ borderWidth: 1 }}>
                <Text>Loading</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{ borderWidth: 1 }}
                onPress={() => addFriend(user, index)}
              >
                <Text>Add Friend</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
