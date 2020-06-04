import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  Modal,
  ScrollView,
} from "react-native";
import { ListItem } from "react-native-elements";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";
import db from "../../db";

import moment from "moment";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
      <View
        style={{
          // paddingTop: "1%",
          paddingLeft: "15%",
          borderWidth: 2,
          borderRadius: 5,
          borderColor: "#006cab",
          width: "105%",
          height: "100%",
          //   alignContent: 'flex-start',
          alignItems: "flex-start",
          justifyContent: "space-evenly",
          flexDirection: "column",
          alignSelf: "center",
        }}
      >
        <MaterialCommunityIcons
          name="account-card-details"
          size={80}
          color="#006cab"
          style={{ alignSelf: "center" }}
        />
        <Text style={{ alignSelf: "center", fontSize: 22, fontWeight: "600" }}>
          Request Detail
        </Text>

        <Text style={{ fontSize: 20, fontWeight: "600" }}>Full Name:</Text>

        <Text
          style={{
            fontSize: 20,
            paddingLeft: "2%",
            paddingTop: "1.5%",
            borderRadius: 8,
            borderWidth: 1.5,
            borderColor: "#20365F",
            height: "6%",
            width: "80%",
            color: "grey",

            // borderColor: "darkgrey",
          }}
        >
          {user.firstName} {user.lastName}
        </Text>

        {/* <Text>{"\n"}</Text> */}

        <Text style={{ fontSize: 20, fontWeight: "600" }}>Email:</Text>
        <Text
          style={{
            fontSize: 20,
            paddingLeft: "2%",
            paddingTop: "1.5%",
            borderRadius: 8,
            borderWidth: 1.5,
            borderColor: "#20365F",
            height: "6%",
            width: "80%",
            color: "grey",
            // borderColor: "darkgrey",
          }}
        >
          {user.email}
        </Text>

        {/* <Text>{"\n"}</Text> */}

        <Text style={{ fontSize: 20, fontWeight: "600" }}>Display Name: </Text>
        <Text
          style={{
            fontSize: 20,
            paddingLeft: "2%",
            paddingTop: "1.5%",
            borderRadius: 8,
            borderWidth: 1.5,
            borderColor: "#20365F",
            height: "6%",
            width: "80%",
            color: "grey",
            // borderColor: "darkgrey",
          }}
        >
          {" "}
          {user.displayName}
        </Text>

        {/* <Text>{"\n"}</Text> */}

        <Text style={{ fontSize: 20, fontWeight: "600" }}>Role: </Text>
        <Text
          style={{
            fontSize: 20,
            paddingLeft: "2%",
            paddingTop: "1.5%",
            borderRadius: 8,
            borderWidth: 1.5,
            borderColor: "#20365F",
            height: "6%",
            width: "80%",
            color: "grey",
            // borderColor: "darkgrey",
          }}
        >
          {" "}
          {user.role[0].toUpperCase() +
            user.role.slice(1, user.role.length - 10)}
        </Text>

        {/* <Text>{"\n"}</Text> */}

        <Text style={{ fontSize: 20, fontWeight: "600" }}>Nationality: </Text>
        <Text
          style={{
            fontSize: 20,
            paddingLeft: "2%",
            paddingTop: "1.5%",
            borderRadius: 8,
            borderWidth: 1.5,
            borderColor: "#20365F",
            height: "6%",
            width: "80%",
            color: "grey",
            // borderColor: "darkgrey",
          }}
        >
          {" "}
          {user.country}
        </Text>

        {/* <Text>{"\n"}</Text>
         */}
        <Text style={{ fontSize: 20, fontWeight: "600" }}>Date of Birth:</Text>

        <Text
          style={{
            fontSize: 20,
            paddingLeft: "2%",
            paddingTop: "1.5%",
            borderRadius: 8,
            borderWidth: 1.5,
            borderColor: "#20365F",
            height: "6%",
            width: "80%",
            color: "grey",
            // borderColor: "darkgrey",
          }}
        >
          {" "}
          {moment(user.dateOfBirth).format("LL")}{" "}
        </Text>

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
          {/* ---------------------------------ALLOW--------------------------------- */}
          <TouchableOpacity
            style={{
              borderWidth: 2,
              borderColor: "#20365F",
              width: "25%",
              height: "60%",
              backgroundColor: "#3E7C9F",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setModal(true)}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "500" }}>
              Allow
            </Text>
          </TouchableOpacity>
          {/* ---------------------------------DENY--------------------------------- */}
          <TouchableOpacity
            style={{
              borderWidth: 2,
              borderColor: "#7A8B96",
              width: "25%",
              height: "60%",
              backgroundColor: "#A5B1B9",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setModal2(true)}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "500" }}>
              Deny
            </Text>
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
              color: "grey",
            }}
          >
            <View
              style={{
                margin: 20,
                backgroundColor: "white",
                borderRadius: 20,
                padding: 35,
                alignItems: "center",
                alignSelf: "center",
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
                width: "100%",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                Are you sure you want to ALLOW the creation of
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {" "}
                  {user.firstName} {user.lastName}{" "}
                </Text>
                's account?
              </Text>
              <Text>{"\n"}</Text>
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
                    borderWidth: 2,
                    borderColor: "#125D30",
                    width: "35%",
                    height: "110%",
                    backgroundColor: "#20A756",
                    borderRadius: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={handleConfirm}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}
                  >
                    Confirm
                  </Text>
                </TouchableOpacity>
                {/* ---------------------------------CANCEL--------------------------------- */}
                <TouchableOpacity
                  style={{
                    borderWidth: 2,
                    borderColor: "#901E10",
                    width: "35%",
                    height: "110%",
                    backgroundColor: "#EC6757",
                    borderRadius: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => setModal(false)}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}
                  >
                    Cancel
                  </Text>
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
              color: "grey",
            }}
          >
            <View
              style={{
                margin: 20,
                backgroundColor: "white",
                borderRadius: 20,
                padding: 35,
                alignItems: "center",
                alignSelf: "center",
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
                width: "100%",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                Are you sure you want to DENY the creation of{" "}
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  {user.firstName} {user.lastName}
                </Text>
                's account?
              </Text>
              <Text>{"\n"}</Text>
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
                    borderWidth: 2,
                    borderColor: "#125D30",
                    width: "35%",
                    height: "110%",
                    backgroundColor: "#20A756",
                    borderRadius: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={handleConfirm2}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}
                  >
                    Confirm
                  </Text>
                </TouchableOpacity>
                {/* ---------------------------------CANCEL--------------------------------- */}
                <TouchableOpacity
                  style={{
                    borderWidth: 2,
                    borderColor: "#901E10",
                    width: "35%",
                    height: "110%",
                    backgroundColor: "#EC6757",
                    borderRadius: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => setModal2(false)}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
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
