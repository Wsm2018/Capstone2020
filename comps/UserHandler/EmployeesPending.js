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

import { ListItem, SearchBar } from "react-native-elements";
import {
  MaterialCommunityIcons,
  Feather,
  Ionicons,
  FontAwesome,
  MaterialIcons,
} from "@expo/vector-icons";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

import * as Linking from "expo-linking";
import * as Print from "expo-print";
import LottieView from "lottie-react-native";

export default function EmployeesRequest(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState(null);
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState("");
  const [marginVal, setMargin] = useState(0);

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
                placeholderTextColor="#185a9d"
                placeholder="Search Here"
                onChangeText={setSearch}
                lightTheme
                //showLoading={true}
                searchIcon={true}
                value={search}
                containerStyle={{
                  backgroundColor: "#185a9d",
                  borderBottomColor: "#185a9d",
                  borderTopColor: "#185a9d",
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
                  // borderColor: "#185a9d",
                  // borderWidth: 2,
                  width: "85%",
                  height: 50,
                  marginLeft: 10,
                  marginRight: 10,
                  elevation: 20,
                }}
              />
            </View>
            {/* onPress={() =>
              props.navigation.navigate("EmployeesDetail", { user })
            } */}
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
                <ScrollView
                  style={{
                    flex: 0.9,
                    // borderRadius: 50,
                    //borderWidth: 1,
                    //borderColor: "#e3e3e3",
                  }}
                >
                  {users.map((user, i) => (
                    <ListItem
                      style={{}}
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
                      // leftAvatar={user.photoURL}
                      title={user.displayName}
                      subtitle={user.email}
                      bottomDivider
                      // chevron
                      onPress={() =>
                        props.navigation.navigate("EmployeesDetail", { user })
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
    <LottieView
      source={require("../../assets/images/loading.json")}
      autoPlay
      loop
      style={{
        position: "relative",
        width: "30%",
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
        alignContent: "center",
        alignSelf: "center",
      }}
    />
  );
}
EmployeesRequest.navigationOptions = (props) => ({
  title: "Employees Pending",
  headerStyle: { backgroundColor: "#185a9d" },
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
    marginTop: "-10%",
  },
  containerLogin2: {
    flex: 0.7,
    justifyContent: "flex-start",
    width: "90%",
    alignSelf: "center",
    marginTop: "-8%",
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
    backgroundColor: "#185a9d",
  },
  buttongroup: {
    justifyContent: "flex-start",
  },
});
