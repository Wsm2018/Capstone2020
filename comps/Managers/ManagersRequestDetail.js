import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  Modal,
} from "react-native";
import { ListItem } from "react-native-elements";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";
import db from "../../db";

import moment from "moment";

export default function ManagersRequestDetail(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [modal, setModal] = useState(false);
  const [modal2, setModal2] = useState(false);

  const user = props.navigation.getParam("user");

  // ------------------------------CURRENT USER------------------------------------
  const handleCurrentuser = async () => {
    const doc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    setCurrentUser({ id: doc.id, ...doc.data() });
  };

  // --------------------------------CONFIRM FOR ALLOW----------------------------------
  const handleConfirm = async () => {
    const allow = firebase.functions().httpsCallable("allowEmployeeCreation");
    const response = await allow({ user });
    console.log(response);
    // setModal(false);
    props.navigation.goBack();
  };

  // --------------------------------CONFIRM FOR DENY----------------------------------
  const handleConfirm2 = async () => {
    let remove = await fetch(
      `https://us-central1-capstone2020-b64fd.cloudfunctions.net/deleteUser?uid=${user.id}`
    );
    await db.collection("users").doc(user.id).delete();
    await firebase.storage().ref().child(`pdf/${user.id}`).delete();
    props.navigation.goBack();
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    handleCurrentuser();
  }, []);

  const test = () => {};

  return (
    <View style={styles.container}>
      <Text>ManagersRequestDetail</Text>
      <Text></Text>

      <Text>
        Name: {user.firstName} {user.lastName}
      </Text>
      <Text>Email: {user.email}</Text>
      <Text>Display Name: {user.displayName}</Text>
      <Text>
        Role:{" "}
        {user.role[0].toUpperCase() + user.role.slice(1, user.role.length - 10)}
      </Text>
      <Text>Nationality: {user.country}</Text>
      <Text>Date of Birth: {moment(user.dateOfBirth).format("LL")}</Text>
      <Text></Text>
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
        {/* ---------------------------------ALLOW--------------------------------- */}
        <TouchableOpacity
          style={{
            borderWidth: 1,
            width: "25%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setModal(true)}
        >
          <Text>Allow</Text>
        </TouchableOpacity>
        {/* ---------------------------------DENY--------------------------------- */}
        <TouchableOpacity
          style={{
            borderWidth: 1,
            width: "25%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setModal2(true)}
        >
          <Text>Deny</Text>
        </TouchableOpacity>
      </View>
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
              height: "30%",
            }}
          >
            <Text>
              Are you sure you want to ALLOW the creation of {user.firstName}{" "}
              {user.lastName}
              's account?
            </Text>
            <Text></Text>
            <Text></Text>
            <View
              style={{
                //   borderWidth: 1,
                width: "100%",
                height: "20%",
                justifyContent: "space-around",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              {/* ---------------------------------CONFIRM--------------------------------- */}
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  width: "30%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={handleConfirm}
              >
                <Text>Confirm</Text>
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
      {/* ---------------------------------MODAL2--------------------------------- */}
      <Modal transparent={true} visible={modal2} animationType="slide">
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
              height: "30%",
            }}
          >
            <Text>
              Are you sure you want to DENY the creation of {user.firsName}{" "}
              {user.lastName}
              's account?
            </Text>
            <Text></Text>
            <Text></Text>
            <View
              style={{
                //   borderWidth: 1,
                width: "100%",
                height: "20%",
                justifyContent: "space-around",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              {/* ---------------------------------CONFIRM--------------------------------- */}
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  width: "30%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={handleConfirm2}
              >
                <Text>Confirm</Text>
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
                onPress={() => setModal2(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
});

{
  /* ---------------------------------TEST--------------------------------- */
}
{
  /* <Text></Text>
<TouchableOpacity
  style={{
    borderWidth: 1,
    width: "100%",
    height: "10%",
    justifyContent: "center",
    alignItems: "center",
  }}
  onPress={test}
>
  <Text>Confirm</Text>
</TouchableOpacity> */
}
