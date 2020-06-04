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
import { FontAwesome5, MaterialCommunityIcons, AntDesign, Ionicons } from "@expo/vector-icons";

export default function EmployeesAllowed(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState(null);
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState("");
  const roles = [
    "asset handler (request)",
    "manager (request)",
    "user handler (request)",
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

  // ------------------------------------------------------------------
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
    let word = "employee handler (incomplete)";
    console.log(word.slice(-12));
  };
  const handleChangeRole = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({ activeRole: null });
  };

  return users ? (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#006cab",
          borderTopColor: "#006cab",
          height: "10%",
          // width:'100%'
          //paddingTop:'2%',
        }}
      >
        {/* <Text>Employees Index</Text> */}
        {/* <AntDesign name="leftcircleo" size={30} color="#fff" /> */}
        <TouchableOpacity onPress={handleChangeRole}> 
        <Ionicons name="ios-arrow-back" size={40} color="#fff" style={{paddingRight:'2%'}} />
        </TouchableOpacity>
        
        <TextInput
          style={{
            backgroundColor: "white",
            fontSize: 18,
            paddingLeft: "2%",
            borderColor: "#20365F",
            borderWidth: 2,
            borderRadius:4,
            width: "75%",
            height: "50%",
            marginLeft: 10,
            marginRight: 10,
          }}
          placeholder="Search for Employees Here"
          onChangeText={setSearch}
          value={search}
        />
        <FontAwesome5 name="search" size={25} color="#fff" />
      </View>

      <ScrollView style={{paddingTop:'2%'}}>
        {users.map((user, i) => (
          <ListItem
            key={i}
            leftAvatar={
              <MaterialCommunityIcons
                name="account-circle"
                size={45}
                color="#006cab"
              />
            }
            title={user.firstName + " " + user.lastName}
            titleStyle={{ fontSize: 20 }}
            subtitle={
              user.role[0].toUpperCase() +
              user.role.slice(1, user.role.length - 10)
            }
            subtitleStyle={{ color: "darkgrey" }}
            topDivider
            // rightAvatar={<MaterialCommunityIcons name="account-details" size={25} color="#006cab" />}
            bottomDivider
            chevron
            onPress={() =>
              props.navigation.navigate("ManagersRequestDetail", { user })
            }
          />
        ))}
      </ScrollView>
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
    //   margin: 20,
  },
});
