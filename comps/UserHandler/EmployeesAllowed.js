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
import {
  MaterialCommunityIcons,
  Feather,
  Ionicons,
  FontAwesome,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as Print from "expo-print";

export default function EmployeesAllowed(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState(null);
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState("");

  const [marginVal, setMargin] = useState(0);

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
                <ScrollView
                  style={{
                    flex: 0.9,
                    borderRadius: 50,
                    borderWidth: 1,
                    borderColor: "#e3e3e3",
                  }}
                >
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
                      // leftAvatar={{ source: { uri: l.avatar_url } }}
                      titleStyle={{ marginLeft: "4%" }}
                      subtitleStyle={{ marginLeft: "4%" }}
                      // leftAvatar={user.photoURL}
                      title={user.displayName}
                      subtitle={user.email}
                      bottomDivider
                      // chevron
                      onPress={() => handleCreate(user)}
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
                  No Empolyees!
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
  );
}
EmployeesAllowed.navigationOptions = (props) => ({
  title: "Employees Allowed ",
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",
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
