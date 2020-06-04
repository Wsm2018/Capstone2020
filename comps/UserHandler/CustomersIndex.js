import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";

import LottieView from "lottie-react-native";
import { ListItem, SearchBar } from "react-native-elements";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

import * as Linking from "expo-linking";
import * as Print from "expo-print";
import {
  MaterialCommunityIcons,
  Feather,
  Ionicons,
  FontAwesome,
  MaterialIcons,
} from "@expo/vector-icons";
export default function EmployeesRequest(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState(null);
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState("");
  const [marginVal, setMargin] = useState(0);

  const roles = [
    "asset handler",
    "customer support",
    "manager",
    "user handler",
    "services employee",
    "asset handler (incomplete)",
    "customer support (incomplete)",
    "manager (incomplete)",
    "user handler (incomplete)",
    "services employee (incomplete)",
  ];
  const roles2 = [
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
      .where("role", "==", "customer")
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

  return users ? (
    <KeyboardAvoidingView
      behavior="position"
      behavior="height"
      behavior="padding"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      contentContainerStyle={{ flex: 1 }}
      style={styles.container}
      // keyboardVerticalOffset={-100}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            styles.container,
            { marginTop: Platform.isPad ? 0 : marginVal },
          ]}
        >
          <View style={styles.header}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SearchBar
                placeholderTextColor="#20365F"
                placeholder="Search Here"
                onChangeText={setSearch}
                lightTheme
                //showLoading={true}
                searchIcon={true}
                value={search}
                containerStyle={{
                  backgroundColor: "#20365F",
                  borderBottomColor: "#20365F",
                  borderTopColor: "#20365F",
                  width: "100%",
                  height: "20%",
                }}
                inputContainerStyle={{
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#fafafa",
                  backgroundColor: "#fafafa",
                }}
                style={{
                  //backgroundColor: "white",
                  fontSize: 18,
                  paddingLeft: "2%",
                  // borderColor: "#20365F",
                  // borderWidth: 2,
                  width: "85%",
                  height: 50,
                  marginLeft: 10,
                  marginRight: 10,
                  elevation: 20,
                }}
              />
            </View>
          </View>
          <View
            style={
              Platform.isPad ? styles.containerLogin : styles.containerLogin2
            }
          >
            {users.length > 0 ? (
              <ScrollView
                style={{
                  flex: 0.9,
                }}
              >
                <ScrollView style={{}}>
                  {users.map((user, i) => (
                    <ListItem
                      key={i}
                      rightAvatar={
                        <Ionicons
                          name="ios-arrow-forward"
                          size={24}
                          color="black"
                        />
                      }
                      titleStyle={{ marginLeft: "4%" }}
                      subtitleStyle={{ marginLeft: "4%" }}
                      title={user.displayName}
                      subtitle={user.email}
                      bottomDivider
                      // chevron
                      onPress={() =>
                        props.navigation.navigate("CustomersDetail", { user })
                      }
                    />
                  ))}
                </ScrollView>
              </ScrollView>
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
                  style={{
                    position: "relative",
                    width: "100%",
                    justifyContent: "center",
                    alignSelf: "center",
                    paddingTop: "30%",
                  }}
                />
                <Text style={{ color: "grey", fontSize: 20 }}>
                  User not found
                </Text>
              </View>
            )}
          </View>
          {/* ---------------------------------DELETE--------------------------------- */}
          {/* <TouchableOpacity onPress={handleDelete} style={styles.payButton}>
        <Text style={{ color: "white" }}>Delete All Employees</Text>
      </TouchableOpacity> */}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  ) : (
    <View>
      <Text>LOADING...</Text>
    </View>
  );
}
EmployeesRequest.navigationOptions = (props) => ({
  title: "Customer Index ",
  headerStyle: { backgroundColor: "#20365F" },
  headerTintColor: "white",
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    marginTop: "-9%",
  },
  payButton: {
    backgroundColor: "#bd2f2f",
    height: 40,
    width: "90%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 10,
    marginBottom: 10,
  },
  containerLogin: {
    flex: 0.7,
    justifyContent: "flex-start",
    width: "90%",
    alignSelf: "center",
    marginTop: "-9%",
    // elevation: 20,
  },
  containerLogin2: {
    flex: 0.7,
    justifyContent: "flex-start",
    width: "90%",
    alignSelf: "center",
    marginTop: "-8%",
    // elevation: 20,
  },
  header: {
    padding: 15,
    flex: 0.2,
    justifyContent: "space-around",
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "center",
    backgroundColor: "#e3e3e3",
    // flex: 0.2,
    backgroundColor: "#20365F",
  },
  buttongroup: {
    justifyContent: "flex-start",
  },
});
