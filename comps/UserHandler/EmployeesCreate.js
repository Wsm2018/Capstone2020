import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  ScrollView,
  Picker,
  Modal,
} from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";
import "firebase/storage";
import db from "../../db";
import { TextInput } from "react-native-paper";
import { Input, Tooltip } from "react-native-elements";
import Spinner from "react-native-loading-spinner-overlay";
import { Feather, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

import * as Print from "expo-print";
import CountryPicker from "react-native-country-picker-modal";
import DatePicker from "react-native-datepicker";
import ReactNativePickerModule from "react-native-picker-module";
import { UserInterfaceIdiom } from "expo-constants";

export default function EmployeeHandlerCreate(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState({ text: "", error: false });
  const [displayName, setDisplayName] = useState({ text: "", error: false });
  const [phone, setPhone] = useState({ text: "", error: false });
  const [firstName, setFirstName] = useState({ text: "", error: false });
  const [lastName, setLastName] = useState({ text: "", error: false });
  const [country, setCountry] = useState({ value: null, error: false });
  const [dateOfBirth, setDateOfBirth] = useState({ value: null, error: false });
  const [spinner, setSpinner] = useState(false);
  const [role, setRole] = useState({ value: "-1", error: false });
  const [rolepicker, setRolePicker] = useState(null);

  const [modal, setModal] = useState(false);
  const [modal2, setModal2] = useState(false);

  const [countryPicker, setCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState(null);
  let pickerRef = null;
  const roles = [
    "asset handler",
    "customer support",
    "manager",
    "user handler",
    "services employee",
  ];
  const test = () => {
    setInterval(() => {
      setSpinner(!spinner);
    }, 3000);
  };
  // ------------------------------CURRENT USER------------------------------------
  const handleCurrentuser = async () => {
    const doc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    setCurrentUser({ id: doc.id, ...doc.data() });
  };

  // -------------------------------COMPANY DOMAIN-----------------------------------
  const handleCompany = async () => {
    let snapshot = await db.collection("company").get();
    let tempCompany = "";
    snapshot.forEach((doc) => (tempCompany = doc.data().domain));

    setCompany(tempCompany);
  };

  // -------------------------------VALIDATE INPUTS-----------------------------------
  const validated = async () => {
    let count = 0;

    let emailList = await db
      .collection("users")
      .where("email", "==", email.text + company)
      .get();

    let nameList = await db
      .collection("users")
      .where("displayName", "==", displayName.text)
      .get();

    if (emailList.size > 0 || email.text === "") {
      console.log("email bad");
      setEmail({ text: email.text, error: true });
    } else {
      console.log("email good");
      count++;
    }

    if (nameList.size > 0 || displayName.text === "") {
      console.log("displayName bad");
      setDisplayName({ text: displayName.text, error: true });
    } else {
      console.log("displayName good");
      count++;
    }

    if (role.value === "-1") {
      console.log("role bad");
      setRole({ value: role.value, error: true });
    } else {
      console.log("role good");
      count++;
    }

    if (firstName.text === "") {
      console.log("firstName bad");
      setFirstName({ text: firstName.text, error: true });
    } else {
      console.log("firstName good");
      count++;
    }

    if (lastName.text === "") {
      console.log("lastName bad");
      setLastName({ text: lastName.text, error: true });
    } else {
      console.log("lastName good");
      count++;
    }

    if (!country.value) {
      console.log("country bad");
      setCountry({ value: country.value, error: true });
    } else {
      console.log("country good");
      count++;
    }

    if (!dateOfBirth.value) {
      console.log("dateOfBirth bad");
      setDateOfBirth({ value: dateOfBirth.value, error: true });
    } else {
      console.log("dateOfBirth good");
      count++;
    }

    console.log(count);
    if (count === 7) {
      return true;
    } else {
      return false;
    }
  };

  // --------------------------------CREATE----------------------------------
  const handleCreate = async () => {
    if (await validated()) {
      // setInterval(() => {
      //   setSpinner(!spinner);
      // }, 3000);
      let create = firebase.functions().httpsCallable("createEmployee");
      let response = await create({
        firstName: firstName.text[0].toUpperCase() + firstName.text.slice(1),
        lastName: lastName.text[0].toUpperCase() + lastName.text.slice(1),
        displayName: displayName.text,
        email: email.text + company,
        role: role.value,
        country: country.value,
        dateOfBirth: dateOfBirth.value,
      });
      console.log("response", response.data);
      let page = `<!DOCTYPE html>

      <html>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
          }
      
          .body {
            background-color: #185a9d;
          }
          * {
            box-sizing: border-box;
          }
      
          button {
            background-color: #3ea3a3;
            color: white;
            padding: 14px 20px;
            margin: 8px 0;
            border: none;
            cursor: pointer;
            width: 100%;
            opacity: 0.9;
          }
      
          button:hover {
            opacity: 1;
          }
      
          .container {
            padding: 16px;
            border: 1px solid;
            width: 60%;
            margin-top: 120px;
            background-color: white;
          }
      
          /* Clear floats */
          .clearfix::after {
            content: "";
            clear: both;
            display: table;
          }
          .left {
            float: left;
          }
          .right {
            float: right;
          }
      
          table {
            font-family: arial, sans-serif;
            border-collapse: collapse;
            width: 100%;
          }
      
          td,
          th {
            border: 1px solid #dddddd;
            /* /* text-align: left; */
            padding: 8px;
            text-align: left;
            /* margin-left: auto;
            margin-right: auto; */
          }
          tr:nth-child(even) {
            background-color: white;
            margin-bottom: 100px;
            /* margin-left: auto;
            margin-right: auto;
            padding: 100px; */
          }
        </style>
        <body class="body">
          <center>
            <div class="container">
              <h4>Employess Reset Password PDF File</h4>
      
              <table>
                <tr>
                  <th>Email</th>
                  <th>Password</th>
                </tr>
                <tr>
                  <td>${email.text + company}</td>
                  <td>${response.data.password}</td>
                </tr>
              </table>
              <br />
              <div class="clearfixs">
                <a class="href" href="index.html"
                  ><button type="button" class="cancelbtn">OK</button></a
                >
              </div>
            </div>
          </center>
        </body>
      </html> `;
      // let page = `<View><Text>Email:${
      //   email.text + company
      // }</Text><Text>Password:${response.data.password}</Text></View>`;
      let pdf = await Print.printToFileAsync({ html: page });
      let uri = pdf.uri;
      const response2 = await fetch(uri);
      const blob = await response2.blob();
      const putResult = await firebase
        .storage()
        .ref()
        .child(`pdf/${response.data.id}`)
        .put(blob);

      if (role.value === "manager" || role.value.slice(-7) === "handler") {
        setModal(true);
      } else {
        props.navigation.navigate("EmployeesCreateSuccess", {
          id: response.data.id,
          email: email.text + company,
        });
      }
    }
  };

  // -------------------------------DELETE-----------------------------------
  const handleDelete = async () => {
    let query = await db
      .collection("users")
      .where("email", "==", "asd@company.com")
      .get();

    let uid;
    query.forEach((doc) => (uid = doc.id));
    console.log(uid);
    let remove = await fetch(
      `https://us-central1-capstone2020-b64fd.cloudfunctions.net/deleteUser?uid=${uid}`
    );

    await db.collection("users").doc(uid).delete();
    await firebase.storage().ref().child(`pdf/${uid}`).delete();
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    handleCurrentuser();
    handleCompany();
  }, []);

  useEffect(() => {
    console.log("dateofbirth", dateOfBirth.value);
  }, [dateOfBirth]);

  // ------------------------------------------------------------------
  // ---------------------------------VIEW---------------------------------
  // ------------------------------------------------------------------
  return (
    <View style={styles.container}>
      {/* <Text>EmployeeHandlerCreate</Text> */}
      <Text
        style={{
          fontSize: 20,
          color: "#185a9d",
          justifyContent: "center",
          alignSelf: "center",
          marginTop: "5%",
          fontWeight: "bold",
        }}
      >
        Creating Employee Account
      </Text>
      {/* ---------------------------------NAMES--------------------------------- */}
      <View
        style={{
          flexDirection: "row",
          //justifyContent: "space-between",
          justifyContent: "center",
        }}
      >
        {/* <TextInput
            onChangeText={(text) => setFirstName({ text, error: false })}
            value={firstName}
            style={{ width: "47.5%" }}
          /> */}
        {/* ---------------------------------FIRST NAME INPUT--------------------------------- */}
        <Input
          inputContainerStyle={{
            borderBottomWidth: 0,
          }}
          containerStyle={styles.Inputs}
          placeholder="First Name"
          onChangeText={(text) => setFirstName({ text, error: false })}
          value={firstName}
          placeholderTextColor="#185a9d"
          inputStyle={{
            color: "#185a9d",
            fontSize: 16,
          }}
        />

        {/* ---------------------------------LAST NAME INPUT--------------------------------- */}
        <Input
          inputContainerStyle={{
            borderBottomWidth: 0,
          }}
          containerStyle={styles.Inputs}
          placeholder="Last Name"
          onChangeText={(text) => setLastName({ text, error: false })}
          value={lastName}
          placeholderTextColor="#185a9d"
          inputStyle={{
            color: "#185a9d",
            fontSize: 16,
          }}
        />
        {/* <TextInput
            onChangeText={(text) => setLastName({ text, error: false })}
            value={lastName}
            style={{ width: "47.5%" }}
          /> */}
      </View>

      {/* ---------------------------------FIRST NAME ERROR--------------------------------- */}
      <View style={{ flexDirection: "row" }}>
        <Text
          style={
            firstName.error
              ? {
                  color: "red",
                  width: "43%",
                  justifyContent: "flex-start",
                  marginLeft: "9%",
                }
              : { color: "transparent" }
          }
        >
          * First Name is Required
        </Text>

        <Text
          style={
            lastName.error
              ? {
                  color: "red",
                  width: "43%",
                  justifyContent: "flex-start",
                  marginLeft: "-3%",
                }
              : { color: "transparent" }
          }
        >
          * Last Name is Required
        </Text>
      </View>

      {/* ---------------------------------DISPLAY NAME--------------------------------- */}

      <Input
        inputContainerStyle={{
          borderBottomWidth: 0,
        }}
        containerStyle={styles.Inputs2}
        placeholder="Display Name"
        onChangeText={(text) => setDisplayName({ text, error: false })}
        value={displayName}
        placeholderTextColor="#185a9d"
        inputStyle={{
          color: "#185a9d",
          fontSize: 16,
        }}
      />
      <Text
        style={
          displayName.error
            ? { color: "red", marginLeft: "10%" }
            : { color: "transparent" }
        }
      >
        * Invalid Display Name
      </Text>

      {/* ----------------------------------EMAIL-------------------------------- */}

      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        <Input
          inputContainerStyle={{
            borderBottomWidth: 0,
          }}
          containerStyle={styles.Inputs}
          placeholder="Email"
          onChangeText={(text) => setEmail({ text, error: false })}
          value={email.text}
          placeholderTextColor="#185a9d"
          inputStyle={{
            color: "#185a9d",
            fontSize: 16,
          }}
        />
        <Input
          inputContainerStyle={{
            borderBottomWidth: 0,
          }}
          containerStyle={styles.Inputs}
          placeholder="Company"
          value={company}
          placeholderTextColor="#185a9d"
          inputStyle={{
            color: "#185a9d",
            fontSize: 16,
          }}
          disabled
        />
      </View>
      <Text
        style={
          email.error
            ? { color: "red", marginLeft: "10%" }
            : { color: "transparent" }
        }
      >
        * Invalid Email
      </Text>

      {/* ---------------------------------ROLE--------------------------------- */}

      {/* <View
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#185a9d",
            height: 50,
            width: "99%",
            alignSelf: "center",
            // opacity: 0.8,
            paddingLeft: 12,
            marginTop: 20,
            // flexDirection: "row-reverse",
            justifyContent: "space-between",
          }}
        >
          <Picker
            // mode="dropdown"
            selectedValue={role.value}
            onValueChange={(itemValue, itemIndex) =>
              setRole({ value: itemValue, error: false })
            }
          >
            <Picker.Item
              label="Select a role"
              value="-1"
              itemStyle={{ textAlign: "center" }}
            />
            {roles.map((role, index) => (
              <Picker.Item label={role} value={role} key={index} />
            ))}
          </Picker>
        </View>
        <Text style={role.error ? { color: "red" } : { color: "transparent" }}>
          * Select a Role
        </Text> */}

      {/* ---------------------------------COUNTRY--------------------------------- */}

      {Platform.OS === "android" ? (
        <View
          style={{
            borderRadius: 8,
            borderWidth: 1,
            backgroundColor: "white",
            borderColor: "#185a9d",
            height: 50,
            width: "87%",
            alignSelf: "center",
            paddingLeft: 12,
            marginTop: 20,
            justifyContent: "space-between",
          }}
        >
          <Picker
            //mode="dropdown"
            //itemStyle={{ color: "red" }}
            selectedValue={role.value}
            style={styles.picker}
            onValueChange={(itemValue, itemIndex) =>
              setRole({ value: itemValue, error: false })
            }
            itemStyle={{
              color: "#698eb3",
            }}
          >
            <Picker.Item
              label="Select a role"
              value="-1"
              itemStyle={{ textAlign: "center", color: "#698eb3" }}
            />
            {roles.map((role, index) => (
              <Picker.Item label={role} value={role} key={index} />
            ))}
          </Picker>
          <Text
            style={role.error ? { color: "red" } : { color: "transparent" }}
          >
            * Select a Role
          </Text>
        </View>
      ) : (
        <View
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#185a9d",
            height: 50,
            width: "87%",
            alignSelf: "center",
            // opacity: 0.8,
            paddingLeft: 12,
            marginTop: 20,
            backgroundColor: "white",
            // flexDirection: "row-reverse",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              pickerRef.show();
            }}
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ fontSize: 17, color: "#667085" }}>
              {role.value === "-1" ? "Select a role" : role.value}
            </Text>
            <Ionicons
              name="md-arrow-dropdown"
              size={23}
              color="#333333"
              style={{
                marginRight: "5%",
              }}
            />
          </TouchableOpacity>
          <ReactNativePickerModule
            pickerRef={(e) => (pickerRef = e)}
            selectedValue={role.value}
            title={"Select role"}
            items={roles}
            onValueChange={(itemValue, itemIndex) =>
              setRole({ value: itemValue, error: false })
            }
          />
          <Text
            style={role.error ? { color: "red" } : { color: "transparent" }}
          >
            * Select a Role
          </Text>
        </View>
      )}
      <Text></Text>
      <View
        style={{
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#185a9d",
          height: 50,
          width: "87%",
          alignSelf: "center",
          opacity: 0.8,
          marginTop: 20,
          paddingLeft: 13,
          flexDirection: "row",
          justifyContent: "center",
          backgroundColor: "white",
          color: "#698eb3",
          // alignItems: "center",
          // alignSelf: "center",
          // alignContent: "center",
        }}
      >
        <TouchableOpacity
          style={{
            height: 50,
            width: "99%",
            alignSelf: "center",
            opacity: 0.8,
            marginTop: 20,
            // paddingLeft: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            //alignItems: "space-between",
            // alignSelf: "center",
            alignContent: "center",
            //color: "#185a9d",
            color: "#698eb3",
          }}
          onPress={() => setCountryPicker(true)}
        >
          <CountryPicker
            visible={countryPicker}
            withFilter
            withAlphaFilter
            withCountryNameButton
            countryCode={countryCode}
            onSelect={(country) => {
              setCountry({ value: country.name, error: false });
              setCountryCode(country.cca2);
            }}
            itemStyle={{
              backgroundColor: "lightgrey",
              marginLeft: 0,
              paddingLeft: 15,
              color: "#698eb3",
            }}
            //itemStyle={{ textAlign: "center", color: "#698eb3" }}
            itemTextStyle={{ fontSize: 18, color: "#698eb3" }}
            style={styles.picker}
            //    style={{ flex: 1, color: "#445870" }}
            onClose={() => setCountryPicker(false)}
          />
          <Ionicons
            name="md-arrow-dropdown"
            size={23}
            color="#333333"
            style={{
              marginRight: "5%",
            }}
          />
        </TouchableOpacity>
      </View>
      <Text
        style={
          country.error
            ? { color: "red", marginLeft: "10%" }
            : { color: "transparent" }
        }
      >
        * Select a Country
      </Text>
      {/* ---------------------------------DATE--------------------------------- */}
      <View
        style={{
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#185a9d",
          height: 50,
          width: "87%",
          alignSelf: "center",
          // opacity: 0.8,
          paddingLeft: "3%",
          marginTop: 20,
          // flexDirection: "row-reverse",
          // justifyContent: "space-between",
          backgroundColor: "white",
        }}
      >
        <DatePicker
          // style={{ width: 200 }}
          style={{
            width: "100%",
            color: "#667085",
            justifyContent: "flex-start",
            //backgroundColor: "lightgray",
          }}
          date={dateOfBirth.value}
          mode="date"
          placeholder="Select a Date"
          format="YYYY-MM-DD"
          // minDate={new Date()}
          maxDate={new Date()}
          confirmBtnText="Confirm"
          cancelBtnText="Cancel"
          customStyles={{
            dateIcon: {
              // // width: 1,
              // // height: 1,
              // left: true,
            },
            dateInput: {
              borderWidth: 0,
              color: "#698eb3",
              alignItems: "flex-start",
              fontSize: 12,
              // marginRight: "68%",
              backgroundColor: "white",
            },
            placeholderText: {
              fontSize: 16,
              color: "#698eb3",
              backgroundColor: "white",
            },
            dateText: {
              fontSize: 15,
              color: "#698eb3",
            },
          }}
          onDateChange={(date) => {
            setDateOfBirth({ value: date, error: false });
            // console.log(new Date(date));
          }}
        />
      </View>
      <Text
        style={
          dateOfBirth.error
            ? { color: "red", marginLeft: "10%" }
            : { color: "transparent" }
        }
      >
        * Select a Date
      </Text>
      <Text></Text>
      <TouchableOpacity
        style={styles.payButton}
        onPress={async () => {
          if (await validated()) {
            setModal2(true);
          }
        }}
      >
        <Text
          style={{
            fontSize: 17,
            color: "white",
          }}
        >
          Create
        </Text>
      </TouchableOpacity>
      <Spinner
        visible={spinner}
        textContent={"Loading..."}
        textStyle={styles.spinnerTextStyle}
      />

      {/* ---------------------------------SUBMIT--------------------------------- */}
      <Text></Text>

      {/* ---------------------------------DELETE--------------------------------- */}
      {/* <Text></Text>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          width: "100%",
          height: "15%",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={handleDelete}
      >
        <Text>DELETE</Text>
      </TouchableOpacity> */}

      {/* ---------------------------------MODAL--------------------------------- */}
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
                fontSize: 18,
                textAlign: "center",
              }}
            >
              Request to create {email.text + company} as a {role.value} has
              been sent.
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
              {/* ---------------------------------OK--------------------------------- */}
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => props.navigation.goBack()}
              >
                <Text style={{ color: "white" }}>OK</Text>
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
                fontSize: 16,
                textAlign: "center",
              }}
            >
              Are you sure you want to ALLOW the creation of this account?
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
                style={styles.greenButton}
                onPress={() => {
                  props.navigation.navigate("Loading");
                  handleCreate();
                  setModal2(false);
                }}
              >
                <Text style={{ color: "white" }}>Confirm</Text>
              </TouchableOpacity>
              {/* ---------------------------------CANCEL--------------------------------- */}
              <TouchableOpacity
                style={styles.redButton}
                onPress={() => setModal2(false)}
              >
                <Text style={{ color: "white" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
EmployeeHandlerCreate.navigationOptions = (props) => ({
  title: "Employee Handler Create",
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
});
const styles = StyleSheet.create({
  container: {
    // borderWidth: 1,
    flex: 1,
    //margin: 20,
    backgroundColor: "#e3e3e3",
    //height: "100%",
  },
  greenButton: {
    backgroundColor: "#3ea3a3",
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
  Inputs: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#185a9d",
    height: 50,
    width: "43%",
    alignSelf: "center",
    opacity: 0.8,
    paddingLeft: 12,
    marginTop: 20,
    marginLeft: "1%",
    backgroundColor: "white",
    // justifyContent:"center"
  },
  redButton: {
    backgroundColor: "#901616",
    height: 40,
    width: "38%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 5,
    marginBottom: 10,
  },
  Inputs2: {
    backgroundColor: "white",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#185a9d",
    height: 50,
    width: "87%",
    alignSelf: "center",
    opacity: 0.8,
    paddingLeft: 12,
    marginTop: 20,
    marginLeft: "1%",
  },
  spinnerTextStyle: {
    color: "#FFF",
  },
  picker: {
    height: 50,
    width: "99%",
    borderColor: "black",
    borderWidth: 1,
    color: "#698eb3",
    borderStyle: "solid",
  },
  payButton: {
    backgroundColor: "#3ea3a3",
    height: 40,
    width: "50%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 5,
    marginBottom: 10,
    //flexDirection: "row",
  },
});
