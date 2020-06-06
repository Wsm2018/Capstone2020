import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Picker,
  Modal,
  Platform,
} from "react-native";

import { Image, Avatar, Divider } from "react-native-elements";
// import { Card } from "react-native-shadow-cards";
import { Card } from "react-native-shadow-cards";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import { Feather, Ionicons, SimpleLineIcons } from "@expo/vector-icons";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ActionButton from "react-native-action-button";
import * as Linking from "expo-linking";
import * as Print from "expo-print";
import moment from "moment";

export default function EmployeesRequest(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [modal, setModal] = useState(false);
  const [phone, setPhone] = useState(null);

  const [heightVal, setHeightVal] = useState("85%");

  const user = props.navigation.getParam("user");
  const roles = [
    "asset handler",
    "customer support",
    "manager",
    "user handler",
    "asset handler (incomplete)",
    "customer support (incomplete)",
    "manager (incomplete)",
    "user handler (incomplete)",
  ];

  // ------------------------------CURRENT USER------------------------------------
  const handleCurrentuser = async () => {
    const doc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    setCurrentUser({ id: doc.id, ...doc.data() });
  };

  // ---------------------------------DOWNLOAD---------------------------------
  const handleDownload = async () => {
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

  // ------------------------------------------------------------------
  const handleCancel = () => {
    setEditMode(false);
    setSelectedRole(user.role);
    setHeightVal("85%");
  };

  // ------------------------------------------------------------------
  const handleSave = () => {
    db.collection("users").doc(user.id).update({ role: selectedRole });
    props.navigation.goBack();
    setHeightVal("85%");
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    handleCurrentuser();
    setSelectedRole(user.role);
  }, []);

  const test = () => {
    let word = "employee handler (incomplete)";
    console.log(word.slice(-12));
  };

  return (
    <View style={styles.container}>
      <View style={styles.one}>
        <View
          style={{
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "flex-start",
            // borderWidth: 1,
            // borderColor: "blue",

            //backgroundColor: "red",
          }}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: heightVal,
              ////
              // borderWidth: 1,
              // borderColor: "green",
            }}
          >
            <Avatar
              rounded
              source={{ uri: user.photoURL }}
              style={
                Platform.OS === "android"
                  ? {
                      height: "90%",
                      width: "28%",

                      // borderWidth: 1,
                    }
                  : {
                      height: "90%",
                      width: "35%",

                      // borderWidth: 1,
                    }
              }
            />
            <Text
              style={{
                alignSelf: "center",
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              {user.displayName}
            </Text>
          </View>
          {editMode ? (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                // borderWidth: 1,
                // paddingBottom:20
              }}
            >
              <Text style={{ fontSize: 15 }}>Change Role: </Text>

              <View
                style={{
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#185a9d",
                  height: 40,
                  marginTop: "1%",
                  width: "50%",
                  marginBottom: "2%",
                  // alignSelf: "center",
                }}
              >
                <Picker
                  // mode="dropdown"
                  selectedValue={selectedRole}
                  onValueChange={(itemValue, itemIndex) =>
                    setSelectedRole(itemValue)
                  }
                  itemStyle={{
                    color: "red",
                    textAlign: "right",
                  }}
                >
                  {roles.map((role, index) => (
                    <Picker.Item label={role} value={role} key={index} />
                  ))}
                </Picker>
              </View>
            </View>
          ) : (
            <Text
              style={{
                alignSelf: "center",
                fontWeight: "bold",
                fontSize: 16,
                marginBottom: "2%",
              }}
            >
              Role: {user.role}
            </Text>
          )}
        </View>
        <View
          style={{
            width: "10%",
            // alignItems: "center",
            justifyContent: "center",
          }}
        ></View>
        <View
          style={{
            width: "45%",
            alignItems: "center",
            justifyContent: "center",
          }}
        ></View>
      </View>
      <View style={styles.two}>
        <Text style={styles.cardTitle}> Employees Details</Text>

        <View style={styles.text}>
          <Text style={{ fontSize: 16, color: "black", marginTop: "1%" }}>
            Role
          </Text>
          <Text style={{ fontSize: 16, marginTop: "1%" }}>{user.role}</Text>
        </View>
        <View style={styles.text}>
          <Text style={{ fontSize: 16, color: "black" }}>Email</Text>
          <Text style={{ fontSize: 16, marginBottom: "5%" }}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.two2}>
        <Text style={styles.cardTitle}> Personal Informatioon</Text>

        <View style={styles.text}>
          <Text style={{ fontSize: 16, color: "black", marginTop: "1%" }}>
            Name
          </Text>
          <Text style={{ fontSize: 16, marginTop: "1%" }}>
            {user.firstName} {user.lastName}
          </Text>
        </View>

        <View style={styles.text}>
          <Text style={{ fontSize: 16, color: "black" }}>Date of Birth</Text>
          <Text style={{ fontSize: 16 }}>
            {moment(user.dateOfBirth).format("LL")}
          </Text>
        </View>
        <View style={styles.text}>
          <Text style={{ fontSize: 16, color: "black" }}>Nationality</Text>
          <Text style={{ fontSize: 16 }}> {user.country}</Text>
        </View>
      </View>
      <View
        style={{
          width: "95%",
        }}
      >
        {/* <Text
              style={{
                alignSelf: "flex-start",
                fontSize: 16,
                color: "black",
                marginBottom: "1%",
                marginLeft: "3%",

                fontWeight: "bold",
              }}
            > */}

        <Modal transparent={true} visible={modal} animationType="slide">
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignContent: "center",
              alignSelf: "center",
              alignItems: "center",
              marginTop: 22,
              // ---This is for Width---
              width: "80%",
            }}
          >
            <View
              style={{
                margin: 20,
                backgroundColor: "white",
                borderRadius: 20,
                padding: 35,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                justifyContent: "center",
                alignContent: "center",
                alignSelf: "center",
                alignItems: "center",
                // ---This is for Height---
                height: "50%",
              }}
            >
              <Text
                style={{
                  fontSize: 19,
                  textAlign: "center",
                }}
              >
                Are you sure you want to reset {user.displayName}'s password?
              </Text>
              <Text></Text>
              <Text
                style={{
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                This will give the account a new random password and will
                download a pdf after the change
              </Text>
              <Text></Text>
              <Text></Text>
              <View
                style={{
                  width: "100%",
                  height: "5%",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  alignSelf: "center",
                  flexDirection: "row",
                }}
              >
                {/* ---------------------------------CONFIRM--------------------------------- */}
                <TouchableOpacity
                  onPress={handleDownload}
                  style={styles.payButton}
                >
                  <Text style={{ color: "white" }}> Confirm</Text>
                </TouchableOpacity>
                {/* ---------------------------------CANCEL--------------------------------- */}
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => setModal(false)}
                >
                  <Text style={{ color: "white" }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      {editMode ? (
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.payButton} onPress={handleSave}>
            <Text style={{ color: "white" }}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.payButton} onPress={handleCancel}>
            <Text style={{ color: "white" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ActionButton buttonColor={"#3ea3a3"} size={80}>
          <ActionButton.Item
            buttonColor="#9b59b6"
            title="Reset Password"
            onPress={() => setModal(true)}
          >
            <SimpleLineIcons
              name="people"
              size={20}
              style={styles.actionButtonIcon}
            />
          </ActionButton.Item>
          <ActionButton.Item
            buttonColor="#3498db"
            title="Edit"
            onPress={() => {
              setEditMode(true);
              setHeightVal("75%");
            }}
          >
            <MaterialCommunityIcons
              name="logout"
              size={20}
              style={styles.actionButtonIcon}
            />
          </ActionButton.Item>
        </ActionButton>
      )}
    </View>
  );
}
EmployeesRequest.navigationOptions = (props) => ({
  title: "Employee Details",
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",
    //width: Math.round(Dimensions.get("window").width),
    // height: Math.round(Dimensions.get("window").height),
  },
  header: {
    flex: 1,
    alignItems: "center",
    //backgroundColor: "blue",
  },
  body: {
    flex: 0,
    backgroundColor: "#e3e3e3",
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: "white",
  },
  actionButtonIcon2: {
    height: 22,
    width: 22,
  },
  footer: {
    flex: 0,
    backgroundColor: "#e3e3e3",
  },
  payButton: {
    backgroundColor: "#519153",
    height: 40,
    width: "80%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    // marginStart: "2%",
    // marginEnd: "2%",
    borderRadius: 10,
    marginBottom: 10,

    flexDirection: "row",
  },
  text: {
    fontSize: 80,
    marginLeft: "4%",
    marginRight: "5%",
    marginBottom: "1%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  payButton: {
    backgroundColor: "#185a9d",
    height: 40,
    width: "38%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 5,
    marginBottom: 10,

    //flexDirection: "row",
  },
  text2: {
    fontSize: 80,
    marginLeft: "4%",
    marginBottom: "1%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  arrowPhone: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 375,
  },
  arrowIpad: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 100,
  },
  avatarPhone: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "85%",
    borderWidth: 1,
    borderColor: "red",
  },
  avatarIpad: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "85%",
    borderWidth: 1,
    borderColor: "green",
  },
  one: {
    backgroundColor: "white",
    width: "100%",
    // marginTop: "3%",
    // padding: "2%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    // height: "100%",
    borderColor: "lightgray",
    height: "25%",
  },
  one2: {
    backgroundColor: "white",
    width: "100%",
    // marginTop: "3%",
    // padding: "2%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    // height: "100%",
    borderColor: "lightgray",
  },
  buttons: {
    width: "100%",
    flexDirection: "row",
    // marginTop: "5%",
    alignSelf: "center",
    justifyContent: "space-evenly",
    // alignItems: "center",
    // textAlign: "center",
    // marginStart: "6%",
    // marginBottom: "5%",
    backgroundColor: "white",
  },
  two: {
    backgroundColor: "white",
    width: "100%",
    marginTop: "3%",
    padding: "5%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
    // flexDirection: "row",
    //flexWrap: "wrap",

    // justifyContent: "space-between",
  },
  two2: {
    backgroundColor: "white",
    width: "100%",
    marginTop: "3%",
    padding: "5%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
    // flexDirection: "row",
    //flexWrap: "wrap",
    borderBottomColor: "white",
    // justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 18,
    // backgroundColor: "red",
    width: "100%",
    height: 30,
    color: "black",
    fontWeight: "bold",
  },
  three: {
    backgroundColor: "white",
    width: "100%",
    marginTop: "3%",
    padding: "5%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
