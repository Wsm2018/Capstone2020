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
import {
  FontAwesome5,
  MaterialCommunityIcons,
  AntDesign,
  Ionicons,
} from "@expo/vector-icons";
import * as Device from "expo-device";
import { Feather, SimpleLineIcons } from "@expo/vector-icons";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import ActionButton from "react-native-action-button";
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
  const [deviceType, setDeviceType] = useState(0);
  const handleLogout = () => {
    firebase.auth().signOut();
  };
  const getDeviceType = async () => {
    const type = await Device.getDeviceTypeAsync();
    setDeviceType(type);
  };
  useEffect(() => {
    getDeviceType();
  }, []);
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
          backgroundColor: "#185a9d",
          borderTopColor: "#185a9d",
          height: "10%",
          // width:'100%'
          //paddingTop:'2%',
        }}
      >
        {/* <Text>Employees Index</Text> */}
        {/* <AntDesign name="leftcircleo" size={30} color="#fff" /> */}
        {/* <TouchableOpacity onPress={handleChangeRole}> 
        <Ionicons name="ios-arrow-back" size={40} color="#fff" style={{paddingRight:'2%'}} />
        </TouchableOpacity> */}

        <TextInput
          style={{
            backgroundColor: "white",
            fontSize: 18,
            paddingLeft: "2%",
            borderColor: "#185a9d",
            borderWidth: 2,
            borderRadius: 4,
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

      <ScrollView style={{ paddingTop: "2%" }}>
        {users.map((user, i) => (
          <ListItem
            key={i}
            leftAvatar={
              <MaterialCommunityIcons
                name="account-circle"
                size={45}
                color="#185a9d"
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
            // rightAvatar={<MaterialCommunityIcons name="account-details" size={25} color="#185a9d" />}
            bottomDivider
            chevron
            onPress={() =>
              props.navigation.navigate("ManagersRequestDetail", { user })
            }
          />
        ))}
      </ScrollView>
      <ActionButton
        // buttonColor={"#3ea3a3"}
        // size={deviceType === 1 ? 60 : 80}
        buttonColor={"#3ea3a3"}
        size={responsiveScreenFontSize(8)}
        //  style={styles.actionButtonIcon2}
        // icon={responsiveScreenFontSize(10)}
        buttonTextStyle={{ fontSize: responsiveScreenFontSize(3) }}

        // position="left"
        //verticalOrientation="down"
      >
        <ActionButton.Item
          buttonColor="#185a9d"
          title="Change Role"
          onPress={handleChangeRole}
        >
          <SimpleLineIcons
            name="people"
            size={deviceType === 1 ? 60 : 80}
            style={styles.actionButtonIcon}
          />
        </ActionButton.Item>
        <ActionButton.Item
          buttonColor="#901616"
          title="Logout"
          onPress={() => {
            firebase.auth().signOut();
            console.log(firebase.auth().currentUser.uid);
          }}
        >
          <MaterialCommunityIcons
            name="logout"
            style={styles.actionButtonIcon}
          />
        </ActionButton.Item>
      </ActionButton>
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
  gridView: {
    // marginTop: 20,
    flex: 1,
    // marginBottom: 100,
  },
  itemContainer: {
    justifyContent: "flex-end",
    borderRadius: 5,
    // flex: 2,
    height: responsiveScreenWidth(40),
  },
  itemName: {
    fontSize: responsiveScreenFontSize(1.9),
    fontWeight: "bold",
    color: "#fff",
    // fontWeight: "600",
  },
  itemCode: {
    fontWeight: "600",
    fontSize: 12,
    color: "#fff",
  },
  actionButtonIcon: {
    fontSize: responsiveFontSize(2.5),
    // height: 40,
    color: "white",
  },
  actionButtonIcon2: {
    //height: 22,
    // width: 22,
    fontSize: responsiveFontSize(2.5),
  },
});
