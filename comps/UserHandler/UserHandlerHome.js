import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  ScrollView,
} from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import { ButtonGroup, ListItem } from "react-native-elements";
// <Button title="" onPress={() => props.navigation.navigate("")} />
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { Feather, Ionicons } from "@expo/vector-icons";
export default function indexUH(props) {
  const buttons = ["Employees Function", "Customer Function"];
  const [view, setView] = useState(0);
  const [employees, setEmployees] = useState(0);
  const [customers, setCustomers] = useState(0);
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

  // --------------------------------EMPLOYEES----------------------------------
  const handleEmployees = () => {
    const unsub = db
      .collection("users")
      .where("role", "in", roles)
      .onSnapshot((queryBySnapshot) => {
        setEmployees(queryBySnapshot.size);
      });
    return unsub;
  };

  // --------------------------------CUSTOMERS----------------------------------
  const handleCustomers = () => {
    const unsub = db
      .collection("users")
      .where("role", "==", "customer")
      .onSnapshot((queryBySnapshot) => {
        setCustomers(queryBySnapshot.size);
      });
    return unsub;
  };

  const handleChangeRole = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({ activeRole: null });
  };

  useEffect(() => {
    const unsubscribeEmployees = handleEmployees();
    const unsubscribeCustomers = handleCustomers();
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.surface}>
          <TouchableOpacity
            // onPress={() => props.navigation.navigate("Sections", { type: t })}
            style={{
              backgroundColor: "#2EAAAA",
              width: "100%",
              height: "100%",
              //margin: "1%",
              justifyContent: "center",
              alignItems: "center",

              borderWidth: 0,
              // borderRadius: 10,
              //borderColor: "black",
            }}
          >
            <MaterialCommunityIcons name="worker" size={50} color="#2e7351" />
            <Text
              style={{ fontSize: 20, color: "#fafafa", marginBottom: "2%" }}
            >
              Total of Employees
            </Text>
            <Text
              style={{
                fontSize: 20,
                color: "#ebebeb",
                marginBottom: "2%",
                fontWeight: "bold",
              }}
            >
              {employees}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            // onPress={() => props.navigation.navigate("Sections", { type: t })}
            style={{
              backgroundColor: "#FE4D3B",
              width: "100%",
              // margin: "1%",
              height: "100%",

              justifyContent: "center",
              alignItems: "center",

              // borderWidth: 0,
              // borderRadius: 10,
              //borderColor: "black",
            }}
          >
            <Feather name="user" size={50} color="#FED8C4" />
            <Text
              style={{ fontSize: 20, color: "#fafafa", marginBottom: "2%" }}
            >
              Total of Customers
            </Text>
            <Text
              style={{
                fontSize: 20,
                color: "#fafafa",
                marginBottom: "2%",
                fontWeight: "bold",
              }}
            >
              {customers}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.containerLogin]}>
        <ScrollView>
          <ButtonGroup
            onPress={(index) => setView(index)}
            selectedIndex={view}
            buttons={buttons}
            containerStyle={{
              // backgroundColor: "lightgray",
              // borderWidth: 1,
              width: "102%",
              alignContent: "center",
              alignItems: "center",
              alignSelf: "center",
              backgroundColor: "lightgray",
            }}
            selectedButtonStyle={{
              backgroundColor: "white",
              color: "red",
              borderBottomWidth: 0,
            }}
            selectedTextStyle={{
              color: "black",
              //fontWeight: "bold",
            }}
            textStyle={{ color: "darkgray", fontSize: 17 }}
          />
          {view === 0 ? (
            <View style={{ marginTop: -6 }}>
              <ListItem
                rightAvatar={
                  <Ionicons name="ios-arrow-forward" size={24} color="black" />
                }
                title="Employees Index"
                titleStyle={{ fontSize: 16, marginLeft: "4%" }}
                //containerStyle={{ backgroundColor: "#f0eded" }}
                onPress={() => props.navigation.navigate("EmployeesIndex")}
                bottomDivider
              />
              <ListItem
                rightAvatar={
                  <Ionicons name="ios-arrow-forward" size={24} color="black" />
                }
                titleStyle={{ fontSize: 16, marginLeft: "4%" }}
                //containerStyle={{ backgroundColor: "#f0eded" }}
                title="Employees Allowed"
                onPress={() => props.navigation.navigate("EmployeesAllowed")}
                bottomDivider
              />
              <ListItem
                rightAvatar={
                  <Ionicons name="ios-arrow-forward" size={24} color="black" />
                }
                titleStyle={{ fontSize: 16, marginLeft: "4%" }}
                //containerStyle={{ backgroundColor: "#f0eded" }}
                title="Employees Pending"
                onPress={() => props.navigation.navigate("EmployeesPending")}
                bottomDivider
              />
              <ListItem
                rightAvatar={
                  <Ionicons name="ios-arrow-forward" size={24} color="black" />
                }
                titleStyle={{ fontSize: 16, marginLeft: "4%" }}
                //containerStyle={{ backgroundColor: "#f0eded" }}
                title="Employees Create"
                onPress={() => props.navigation.navigate("EmployeesCreate")}
                bottomDivider
              />
              <ListItem
                titleStyle={{ fontSize: 16, marginLeft: "4%" }}
                //containerStyle={{ backgroundColor: "#f0eded" }}
                rightAvatar={
                  <Ionicons name="ios-arrow-forward" size={24} color="black" />
                }
                title="Employees Create Success"
                onPress={() =>
                  props.navigation.navigate("EmployeesCreateSuccess")
                }
                bottomDivider
              />
            </View>
          ) : view === 1 ? (
            <View style={{ marginTop: -6 }}>
              <ListItem
                rightAvatar={
                  <Ionicons name="ios-arrow-forward" size={24} color="black" />
                }
                titleStyle={{ fontSize: 15, marginLeft: "4%" }}
                title="Customers Index"
                onPress={() => props.navigation.navigate("CustomersIndex")}
                bottomDivider
              />
            </View>
          ) : null}
          <Text style={{ fontSize: 15, color: "black", marginBottom: "2%" }}>
            Logins
          </Text>

          <TouchableOpacity
            onPress={handleChangeRole}
            style={
              {
                // borderRadius: 10,
                //borderColor: "black",
              }
            }
          >
            <Text style={{ fontSize: 15, color: "black", marginBottom: "2%" }}>
              Change Role
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              firebase.auth().signOut();
              console.log(firebase.auth().currentUser.uid);
            }}
            style={
              {
                // borderRadius: 10,
                //borderColor: "black",
              }
            }
          >
            <Text style={{ fontSize: 16, color: "black", marginBottom: "2%" }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}
indexUH.navigationOptions = (props) => ({
  title: "User Handler Home",
  headerStyle: { backgroundColor: "#20365F" },
  headerTintColor: "white",
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  containerLogin: {
    flex: 0.7,
    justifyContent: "flex-start",
    //marginTop: -50,
    width: "100%",
    //justifyContent: "center",
    // marginBottom: "4%",
    //alignSelf: "center",
    //backgroundColor: "#20365F",
  },
  buttongroup: {
    flex: 0.1,

    justifyContent: "flex-start",
  },
  header: {
    flex: 0.3,
    justifyContent: "space-evenly",
    flexDirection: "row",
    alignItems: "center",
  },
  surface: {
    width: "50%",
    height: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    // alignItems: "center",
    // justifyContent: "space-evenly",
  },
});
