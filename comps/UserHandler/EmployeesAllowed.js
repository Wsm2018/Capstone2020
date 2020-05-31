import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  TextInput,
  ScrollView,
} from "react-native";

import { ListItem } from "react-native-elements";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

import * as Linking from "expo-linking";
import * as Print from "expo-print";

export default function EmployeesAllowed(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState(null);
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState("");
  const roles = [
    "asset handler (allowed)",
    "manager (allowed)",
    "user handler (allowed)",
  ];

  // ------------------------------CURRENT USER------------------------------------
  const handleCurrentuser = async () => {
    const doc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    setCurrentUser({ id: doc.id, ...doc.data() });
  };

  // --------------------------------USERS----------------------------------
  const handleUsers = () => {
    db.collection("users")
      .where("role", "in", roles)
      .onSnapshot((queryBySnapshot) => {
        let tempUsers = [];
        queryBySnapshot.forEach((doc) =>
          tempUsers.push({ id: doc.id, ...doc.data() })
        );

        tempUsers = tempUsers.sort((a, b) =>
          a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase())
        );

        // console.log(tempUsers);
        setAllUsers(tempUsers);
      });
  };

  // ---------------------------------DOWNLOAD---------------------------------
  const handleDownload = async (user) => {
    // ---------------------------------
    const reset = firebase.functions().httpsCallable("resetEmployeePassword");
    const response = await reset({ user });
    console.log("response", response);

    // ---------------------------------
    let page = `<View><Text>Email:${user.email}</Text>
    <Text>Password:${response.data.password}</Text></View>`;
    let pdf = await Print.printToFileAsync({ html: page });
    let uri = pdf.uri;
    const response2 = await fetch(uri);
    const blob = await response2.blob();
    const putResult = await firebase
      .storage()
      .ref()
      .child(`pdf/${user.id}`)
      .put(blob);

    // ---------------------------------
    const url = await firebase
      .storage()
      .ref()
      .child(`pdf/${user.id}`)
      .getDownloadURL();

    console.log("url", url);

    Linking.openURL(url);
  };

  // ---------------------------------SEARCH---------------------------------
  // Searches for a user by displayName
  const handleSearch = (query) => {
    if (query.length > 0) {
      setSearch(query);
      let tempUsers = [...allUsers];
      let result = tempUsers.filter((user) =>
        user.displayName.toLowerCase().match(query.toLowerCase())
      );

      setUsers(result);
    } else {
      setSearch(query);
      setUsers(allUsers);
    }
  };

  // --------------------------------CREATE----------------------------------
  const handleCreate = async (user) => {
    let create = firebase.functions().httpsCallable("roleToIncomplete");
    let response = await create({ user });

    props.navigation.navigate("EmployeesCreateSuccess", {
      id: user.id,
      email: user.email,
    });
  };

  // ---------------------------------USE EFFECT---------------------------------
  useEffect(() => {
    handleCurrentuser();
    handleUsers();
  }, []);

  // ---------------------------------USE EFFECT---------------------------------
  // Runs when something is entered in the search bar
  useEffect(() => {
    handleSearch(search);
  }, [allUsers, search]);

  const test = () => {
    let word = "employee handler1(allowed)";
    console.log(word.slice(0, word.length - 10));
  };

  return users ? (
    <View style={styles.container}>
      <Text>Employees Index</Text>
      <TextInput
        placeholder="Search Here"
        onChangeText={setSearch}
        value={search}
        style={{ borderWidth: 1, padding: 1 }}
      />
      <Text></Text>
      <ScrollView>
        {users.map((user, i) => (
          <ListItem
            key={i}
            // leftAvatar={{ source: { uri: l.avatar_url } }}
            title={user.displayName}
            subtitle={user.email}
            bottomDivider
            // chevron
            rightElement={
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  width: "25%",
                  height: "80%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => handleCreate(user)}
              >
                <Text>Create</Text>
              </TouchableOpacity>
            }
          />
        ))}
      </ScrollView>
      <Button title="test" onPress={test} />
    </View>
  ) : (
    <View>
      <Text>LOADING...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
});
