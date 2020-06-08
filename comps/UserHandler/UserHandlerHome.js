import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import { ButtonGroup, ListItem } from "react-native-elements";
// <Button title="" onPress={() => props.navigation.navigate("")} />
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ActionButton from "react-native-action-button";
import { FlatGrid } from "react-native-super-grid";
import Spinner from "react-native-loading-spinner-overlay";
import { Feather, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
export default function indexUH(props) {
  const buttons = ["Employees Function", "Customer Function"];
  const [view, setView] = useState(0);
  const [employees, setEmployees] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [spinner, setSpinner] = useState(false);

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
  const data = [employees, customers];
  const items = [
    {
      name: "Employees Index",
      code: "#185a9d",
      nav: () => props.navigation.navigate("EmployeesIndex"),
      image: require("../../assets/images/employees.png"),

      height: 120,
      width: 200,
    },
    {
      name: "Customers Index",
      code: "#185a9d",
      nav: () => props.navigation.navigate("CustomersIndex"),
      image: require("../../assets/images/users.png"),
      height: 120,
      width: 200,
    },
    {
      name: " Employees Create",
      code: "#185a9d",
      nav: () => props.navigation.navigate("EmployeesCreate"),
      image: require("../../assets/images/form.png"),
      height: 120,
      width: 200,
    },
    {
      name: "Employees Allowed",
      code: "#185a9d",
      nav: () => props.navigation.navigate("EmployeesAllowed"),
      image: require("../../assets/images/form.png"),
     // image: require("../../assets/images/emp.png"),
      height: 120,
      width: 200,
    },
    {
      name: "Employees Pending",
      code: "#185a9d",
      nav: () => props.navigation.navigate("EmployeesPending"),
      image: require("../../assets/images/p.jpg"),
      height: 120,
      width: 200,
    },

    // {
    //   name: "Employees Success",
    //   code: "#185a9d",
    //   nav: () => props.navigation.navigate("EmployeesCreateSuccess"),
    //   image: require("../../assets/images/success.png"),
    //   height: 120,
    //   width: 200,
    // },
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
  useEffect(() => {
    setInterval(() => {
      setSpinner(!spinner);
    }, 3000);
  }, []); // --------------------------------CUSTOMERS----------------------------------
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
      {/* <Text
        style={{
          fontWeight: "bold",
          fontSize: 25,
          color: "#185a9d",
          alignSelf: "center",
        }}
      >
        User Handler Panel
      </Text> */}
      <View style={styles.surface}>
        <TouchableOpacity
          style={{
            backgroundColor: "#185a9d",
            //backgroundColor: "#2EAAAA",
            width: "47%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            // borderRightColor: "#e3e3e3",
            // borderWidth: 6,
            // borderRadius: 0,
            // borderLeftColor: "#185a9d",
            // borderBottomColor: "#185a9d",
            // borderTopColor: "#185a9d",
          }}
          //onPress={}
        >
          <MaterialCommunityIcons name="worker" size={50} color="white" />
          <Text style={{ fontSize: 20, color: "white", marginBottom: "2%" }}>
            Total of Employees
          </Text>
          <Text
            style={{
              fontSize: 20,
              color: "white",
              marginBottom: "2%",
              fontWeight: "bold",
            }}
          >
            {employees}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            // backgroundColor: "#E74C3C",
            backgroundColor: "#185a9d",
            width: "47%",
            height: "100%",

            justifyContent: "center",
            alignItems: "center",
          }}
          //onPress={() => props.navigation.navigate("CustomersIndex")}
        >
          <Feather name="user" size={50} color="white" />
          <Text style={{ fontSize: 20, color: "white", marginBottom: "2%" }}>
            Total of Customers
          </Text>
          <Text
            style={{
              fontSize: 20,
              color: "white",
              marginBottom: "2%",
              fontWeight: "bold",
            }}
          >
            {customers}
          </Text>
        </TouchableOpacity>
      </View>
      {items ? (
        <FlatGrid
          itemDimension={150}
          items={items}
          style={styles.gridView}
          renderItem={({ item, index }) => (
            <View
              style={[styles.itemContainer, { backgroundColor: item.code }]}
            >
              <TouchableOpacity onPress={item.nav}>
                <View style={{ height: "100%", width: "100%" }}>
                  <Image
                    source={item.image}
                    style={{
                      flex: 1,
                      height: undefined,
                      width: undefined,
                    }}
                  />

                  <View
                    style={{
                      alignItems: "center",
                      flex: 0.3,
                      justifyContent: "center",
                    }}
                  >
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Spinner
          visible={spinner}
          textContent={"Loading..."}
          textStyle={styles.spinnerTextStyle}
        />
      )}
      {/* <View style={styles.surface}>
          <TouchableOpacity
            style={{
              backgroundColor: "#2EAAAA",
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => props.navigation.navigate("EmployeesIndex")}
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
            style={{
              backgroundColor: "#E74C3C",
              width: "100%",
              height: "100%",

              justifyContent: "center",
              alignItems: "center",

            }}
            onPress={() => props.navigation.navigate("CustomersIndex")}
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
        </View> */}

      {/* <View style={[styles.containerLogin]}>
        <ScrollView>
          <ButtonGroup
            onPress={(index) => setView(index)}
            selectedIndex={view}
            buttons={buttons}
            containerStyle={{
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
                onPress={() => props.navigation.navigate("EmployeesIndex")}
                bottomDivider
              />
              <ListItem
                rightAvatar={
                  <Ionicons name="ios-arrow-forward" size={24} color="black" />
                }
                titleStyle={{ fontSize: 16, marginLeft: "4%" }}
                title="Employees Allowed"
                onPress={() => props.navigation.navigate("EmployeesAllowed")}
                bottomDivider
              />
              <ListItem
                rightAvatar={
                  <Ionicons name="ios-arrow-forward" size={24} color="black" />
                }
                titleStyle={{ fontSize: 16, marginLeft: "4%" }}
                title="Employees Pending"
                onPress={() => props.navigation.navigate("EmployeesPending")}
                bottomDivider
              />
              <ListItem
                rightAvatar={
                  <Ionicons name="ios-arrow-forward" size={24} color="black" />
                }
                titleStyle={{ fontSize: 16, marginLeft: "4%" }}
                title="Employees Create"
                onPress={() => props.navigation.navigate("EmployeesCreate")}
                bottomDivider
              />
              <ListItem
                titleStyle={{ fontSize: 16, marginLeft: "4%" }}
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
        </ScrollView>
      </View> */}
      <ActionButton
        buttonColor={"#3ea3a3"}
        size={80}
        // position="left"
        //verticalOrientation="down"
      >
        <ActionButton.Item
          buttonColor="#9b59b6"
          title="Change Role"
          onPress={handleChangeRole}
        >
          <SimpleLineIcons
            name="people"
            size={20}
            style={styles.actionButtonIcon}
          />
        </ActionButton.Item>
        <ActionButton.Item
          buttonColor="#3498db"
          title="Logout"
          onPress={() => {
            firebase.auth().signOut();
            console.log(firebase.auth().currentUser.uid);
          }}
        >
          <MaterialCommunityIcons
            name="logout"
            size={20}
            style={styles.actionButtonIcon}
          />
        </ActionButton.Item>
      </ActionButton>
    </View>
  );
}
indexUH.navigationOptions = (props) => ({
  title: "User Handler Home",
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  containerLogin: {
    flex: 0.7,
    justifyContent: "flex-start",
    //marginTop: -50,
    width: "100%",
    //justifyContent: "center",
    // marginBottom: "4%",
    //alignSelf: "center",
    //backgroundColor: "#185a9d",
  },
  buttongroup: {
    flex: 0.1,

    justifyContent: "flex-start",
  },
  spinnerTextStyle: {
    color: "#FFF",
  },
  gridView: {
    // marginTop: 20,
    flex: 1,
  },
  itemContainer: {
    justifyContent: "flex-end",
    borderRadius: 5,
    height: 150,
  },
  itemName: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  itemCode: {
    fontWeight: "600",
    fontSize: 12,
    color: "#fff",
  },
  header: {
    flex: 0.25,
    justifyContent: "space-evenly",
    flexDirection: "row",
    alignItems: "center",
  },
  surface: {
    flex: 0.3,
    marginTop: "2%",
    //  backgroundColor: "blue",
    // width: "50%",
    // height: "100%",
    // alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    // alignItems: "center",
    justifyContent: "space-evenly",
  },
});
