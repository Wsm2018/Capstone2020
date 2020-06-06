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
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";
import "firebase/storage";
import db from "../../db";
import { TextInput } from "react-native-paper";

import * as Print from "expo-print";
import CountryPicker from "react-native-country-picker-modal";
import DatePicker from "react-native-datepicker";
import { Input, Tooltip } from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  MaterialCommunityIcons,
  Fontisto,
  FontAwesome,
  Ionicons,
} from "@expo/vector-icons";
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

  const [role, setRole] = useState({ value: "-1", error: false });
  const [modal, setModal] = useState(false);
  const [countryPicker, setCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState(null);

  const [firstNameError, setfirstNameError] = useState("transparent");
  const [roleError, setRoleError] = useState("transparent");
  const [emailError, setEmailError] = useState("transparent");
  const [countryError, setCountryError] = useState("transparent");
  const [dateOfBirthError, setDateOfBirthError] = useState("transparent");
  const [displayNameError, setDisplayNameError] = useState("transparent");
  const [lastNameError, setLastNameError] = useState("transparent");
  const [marginVal, setMargin] = useState(0);

  const roles = [
    "asset handler",
    "customer support",
    "manager",
    "user handler",
    "services employee",
  ];

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
      // setEmailError("red");
      setEmail({ text: email.text, error: true });
    } else {
      console.log("email good");
      count++;
    }

    if (nameList.size > 0 || displayName.text === "") {
      console.log("displayName bad");
      //setDisplayNameError("red");
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
      // setfirstNameError("red");
      setFirstName({ text: firstName.text, error: true });
    } else {
      console.log("firstName good");
      count++;
    }

    if (lastName.text === "") {
      console.log("lastName bad");
      // setLastNameError("red");
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

      let page = `<View><Text>Email:${
        email.text + company
      }</Text><Text>Password:${response.data.password}</Text></View>`;
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
      <Text
        style={{
          fontSize: 20,
          color: "#20365F",
          justifyContent: "center",
          alignSelf: "center",
          marginTop: "5%",
          fontWeight: "bold",
        }}
      >
        Creating Employee Account
      </Text>
      <ScrollView>
        {/* ----------------------------------NAME-------------------------------- */}
        <View style={{ justifyContent: "space-between" }}></View>
        <View style={{ justifyContent: "space-between" }}>
          <Input
            inputContainerStyle={{
              borderBottomWidth: 0,
              // color: "white",
            }}
            // leftIcon={
            //   <Icon name="account-card-details" size={20} color="#20365F" />
            // }
            containerStyle={styles.Inputs}
            placeholder="First Name"
            onChangeText={(text) => setFirstName({ text, error: false })}
            value={firstName}
            placeholderTextColor="#20365F"
            inputStyle={{
              color: "#20365F",
              fontSize: 16,
            }}
            errorMessage="* Invalid First Name"
            errorStyle={{ color: firstNameError, marginTop: "4%" }}
            renderErrorMessage
          />
          <View style={{ marginTop: "2%" }}></View>

          <Input
            inputContainerStyle={{
              borderBottomWidth: 0,
              // color: "white",
            }}
            // leftIcon={
            //   <Icon name="account-card-details" size={20} color="#20365F" />
            // }
            containerStyle={styles.Inputs}
            placeholder="Last Name"
            onChangeText={(text) => setLastName({ text, error: false })}
            value={lastName}
            placeholderTextColor="#20365F"
            inputStyle={{
              color: "#20365F",
              fontSize: 16,
            }}
            errorMessage="* Invalid Last Name"
            errorStyle={{
              color: lastNameError,
              marginTop: "4%",
            }}
            renderErrorMessage
          />
          <View style={{ marginTop: "2%" }}></View>
          <Input
            inputContainerStyle={{
              borderBottomWidth: 0,
            }}
            // leftIcon={
            //   <Icon name="account-card-details" size={20} color="#20365F" />
            // }
            containerStyle={styles.Inputs}
            placeholder="Display Name"
            onChangeText={(text) => setDisplayName({ text, error: false })}
            value={lastName}
            placeholderTextColor="#20365F"
            inputStyle={{
              color: "#20365F",
              fontSize: 16,
            }}
            errorMessage="* Invalid Display Name"
            errorStyle={{ color: displayNameError, marginTop: "4%" }}
            renderErrorMessage
          />
          <View style={{ marginTop: "2%" }}></View>

          <Input
            inputContainerStyle={{
              borderBottomWidth: 0,
              // color: "white",
            }}
            // leftIcon={<Icon name="email-outline" size={20} color="#20365F" />}
            containerStyle={styles.Inputs}
            placeholder="E-mail"
            onChangeText={(text) => setEmail({ text, error: false })}
            value={lastName}
            placeholderTextColor="#20365F"
            inputStyle={{
              color: "#20365F",
              fontSize: 16,
            }}
            errorMessage="* Invalid E-mail"
            errorStyle={{ color: emailError, marginTop: "4%" }}
            renderErrorMessage
          />
          <View style={{ marginTop: "2%" }}></View>

          <View
            style={{
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#20365F",
              height: 50,
              width: "80%",
              alignSelf: "center",
              // opacity: 0.8,
              paddingLeft: 12,
              marginTop: 20,
              // flexDirection: "row-reverse",
              justifyContent: "space-between",
            }}
          >
            {/* <MaterialCommunityIcons name="worker" size={24} color="#20365F" /> */}
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
            <Text
              style={
                role.error
                  ? {
                      color: "red",
                      marginHorizontal: "14%",
                      fontSize: 12,
                      marginVertical: "1%",
                    }
                  : { color: "transparent" }
              }
            >
              * Select a Role
            </Text>
            <View style={{ marginTop: "1%" }}></View>
          </View>
          <View style={{ marginTop: "1%", flexDirection: "row" }}></View>

          <View
            style={{
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#20365F",
              height: 50,
              width: "80%",
              alignSelf: "center",
              opacity: 0.8,
              marginTop: 20,
              paddingLeft: 12,
              flexDirection: "row",
            }}
          >
            {/* <Fontisto name="world-o" size={24} color="#20365F" /> */}
            <TouchableOpacity
              style={{
                height: 50,
                width: "80%",
                alignSelf: "center",
                opacity: 0.8,
                marginTop: 20,
                paddingLeft: 12,
                flexDirection: "row",
                color: "#20365F",
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
                // style={{ flex: 1, color: "transparent" }}
                containerStyle={{ width: "90%" }}
                onClose={() => setCountryPicker(false)}
              />
              {/* <Ionicons name="md-arrow-dropdown" size={20} color="#5c5b5b" /> */}
            </TouchableOpacity>
          </View>
          <Text
            style={
              country.error
                ? {
                    color: "red",
                    marginHorizontal: "14%",
                    fontSize: 12,
                    marginVertical: "1%",
                  }
                : { color: "transparent" }
            }
          >
            * Select a Country
          </Text>
          <View style={{ marginTop: "1%" }}></View>

          <View
            style={{
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#20365F",
              height: 50,
              width: "80%",
              alignSelf: "center",
              opacity: 0.8,
              paddingLeft: 12,
              overflow: "hidden",
            }}
          >
            {/* <FontAwesome name="calendar" size={24} color="#20365F" /> */}
            <DatePicker
              style={{
                width: "100%",
              }}
              date={dateOfBirth.value}
              mode="date"
              placeholder="select date"
              format="YYYY-MM-DD"
              // minDate={new Date()}
              maxDate={new Date()}
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              customStyles={{
                dateIcon: {
                  width: 0,
                  height: 0,
                },
                dateInput: {
                  borderWidth: 0,
                },
              }}
              onDateChange={(date) => {
                setDateOfBirth({ value: date, error: false });
              }}
            />
          </View>
          <Text
            style={
              dateOfBirth.error
                ? {
                    color: "red",
                    marginHorizontal: "14%",
                    fontSize: 12,
                    marginVertical: "1%",
                  }
                : { color: "transparent" }
            }
          >
            * Select a Date
          </Text>
        </View>
        <TouchableOpacity style={styles.payButton} onPress={handleCreate}>
          <Text style={{ color: "white" }}>Create</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ---------------------------------SUBMIT--------------------------------- */}
      <Text></Text>
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
            <Text>
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
              {/* ---------------------------------CANCEL--------------------------------- */}
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => props.navigation.goBack()}
              >
                <Text style={{ color: "white" }}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* <Modal transparent={true} visible={modal} animationType="slide">
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
              Request to create {email.text + company} as a {role.value} has
              been sent.
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
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  width: "30%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => props.navigation.goBack()}
              >
                <Text>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> */}
    </View>
  );
}

EmployeeHandlerCreate.navigationOptions = {
  title: "Employee Handler Create",
  headerStyle: { backgroundColor: "#20365F" },
  headerTintColor: "white",
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  Inputs: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#20365F",
    height: 50,
    width: "80%",
    alignSelf: "center",
    opacity: 0.8,
    paddingLeft: 12,
    marginTop: 20,
  },
  payButton: {
    backgroundColor: "#327876",
    height: 40,
    width: "55%",
    alignSelf: "center",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 10,
    marginBottom: 10,
    marginTop: "5%",
    //flexDirection: "row",
  },
});

// {/* ----------------------------------PASSWORD-------------------------------- */}
// <Text>Password</Text>
// <TextInput
//   onChangeText={(text) => setPassword({ text, error: false })}
//   value={password}
// />
// <Text
//   style={password.error ? { color: "red" } : { color: "transparent" }}
// >
//   * Passwords do not match
// </Text>

// {/* ----------------------------------CONFIRM PASSWORD-------------------------------- */}
// <Text>Confirm Password</Text>
// <TextInput
//   onChangeText={(text) => setConfirmPassword({ text, error: false })}
//   value={confirmPassword}
// />
