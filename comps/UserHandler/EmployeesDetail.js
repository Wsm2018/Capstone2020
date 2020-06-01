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
} from "react-native";

import { Image, Avatar } from "react-native-elements";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";

import * as Linking from "expo-linking";
import * as Print from "expo-print";
import moment from "moment";

export default function EmployeesRequest(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [modal, setModal] = useState(false);
  const [phone, setPhone] = useState(null);

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
  };

  // ------------------------------------------------------------------
  const handleSave = () => {
    db.collection("users").doc(user.id).update({ role: selectedRole });
    props.navigation.goBack();
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
      <Text>Employees Detail</Text>
      {/* ---------------------------------MODAL--------------------------------- */}
      <Modal transparent={true} visible={modal} animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            // alignItems: "center",
            alignSelf: "center",
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
              // ---This is for Height---
              height: "50%",
            }}
          >
            <Text>
              Are you sure you want to reset {user.displayName}'s password?
            </Text>
            <Text></Text>
            <Text>
              This will give the account a new random password and will download
              a pdf after the change
            </Text>
            <Text></Text>
            <Text></Text>
            <View
              style={{
                //   borderWidth: 1,
                width: "100%",
                height: "10%",
                justifyContent: "space-around",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              {/* ---------------------------------CONFIRM--------------------------------- */}
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  width: "25%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={handleDownload}
              >
                <Text>CONFIRM</Text>
              </TouchableOpacity>
              {/* ---------------------------------CANCEL--------------------------------- */}
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  width: "25%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => setModal(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        {/* ---------------------------------RESET PASSWORD--------------------------------- */}
        <TouchableOpacity
          style={{ borderWidth: 1 }}
          onPress={() => setModal(true)}
        >
          <Text>Reset Password</Text>
        </TouchableOpacity>
        <Text> | </Text>
        {/* ---------------------------------EDIT--------------------------------- */}
        <TouchableOpacity
          style={{ borderWidth: 1 }}
          onPress={() => setEditMode(true)}
        >
          <Text>Edit</Text>
        </TouchableOpacity>
      </View>
      {/* ---------------------------------ACCOUNT INFO--------------------------------- */}
      <Avatar rounded source={{ uri: user.photoURL }} size="xlarge" />
      <Text></Text>
      <Text>Account Info</Text>
      <Text>Email: {user.email}</Text>
      <Text>Display Name: {user.displayName}</Text>

      {/* ---------------------------------PICKER--------------------------------- */}
      {editMode ? (
        <View>
          <Text>Role:</Text>

          <View
            style={{ borderColor: "lightgray", backgroundColor: "lightgray" }}
          >
            <Picker
              // mode="dropdown"
              selectedValue={selectedRole}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedRole(itemValue)
              }
            >
              {roles.map((role, index) => (
                <Picker.Item label={role} value={role} key={index} />
              ))}
            </Picker>
          </View>
        </View>
      ) : (
        <Text>Role: {user.role}</Text>
      )}
      <Text>Phone: {user.phone}</Text>

      <Text></Text>

      {/* ---------------------------------PERSONAL INFO--------------------------------- */}
      <Text>Personal Info</Text>
      <Text>First Name: {user.firstName}</Text>
      <Text>Last Name: {user.lastName}</Text>
      <Text>Date of Birth: {moment(user.dateOfBirth).format("LL")}</Text>
      <Text>Nationality: {user.country}</Text>

      {editMode && (
        <View
          style={{
            //   borderWidth: 1,
            width: "100%",
            height: "5%",
            justifyContent: "space-around",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          {/* ---------------------------------SAVE--------------------------------- */}
          <TouchableOpacity
            style={{
              borderWidth: 1,
              width: "25%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={handleSave}
          >
            <Text>Save</Text>
          </TouchableOpacity>
          {/* ---------------------------------CANCEL--------------------------------- */}
          <TouchableOpacity
            style={{
              borderWidth: 1,
              width: "25%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={handleCancel}
          >
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
});
