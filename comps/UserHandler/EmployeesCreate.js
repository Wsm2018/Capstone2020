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

import * as Print from "expo-print";
import CountryPicker from "react-native-country-picker-modal";
import DatePicker from "react-native-datepicker";

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
      {/* <Text>EmployeeHandlerCreate</Text> */}

      <ScrollView>
        {/* ----------------------------------NAME-------------------------------- */}
        <View
          style={{ flexDirection: "row", justifyContent: "space-between" }}
        ></View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {/* <TextInput
            onChangeText={(text) => setFirstName({ text, error: false })}
            value={firstName}
            style={{ width: "47.5%" }}
          /> */}
          <Input
            inputContainerStyle={{
              borderBottomWidth: 0,
            }}
            containerStyle={styles.Inputs}
            placeholder="First Name"
            onChangeText={(text) => setFirstName({ text, error: false })}
            value={firstName}
            placeholderTextColor="#20365F"
            inputStyle={{
              color: "#20365F",
              fontSize: 16,
            }}
          />
          <Input
            inputContainerStyle={{
              borderBottomWidth: 0,
            }}
            containerStyle={styles.Inputs}
            placeholder="First Name"
            onChangeText={(text) => setLastName({ text, error: false })}
            value={lastName}
            placeholderTextColor="#20365F"
            inputStyle={{
              color: "#20365F",
              fontSize: 16,
            }}
          />
          {/* <TextInput
            onChangeText={(text) => setLastName({ text, error: false })}
            value={lastName}
            style={{ width: "47.5%" }}
          /> */}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            style={
              firstName.error
                ? { color: "red", width: "47.5%" }
                : { color: "transparent" }
            }
          >
            * First Name is Required
          </Text>
          <Text
            style={
              lastName.error
                ? { color: "red", width: "47.5%" }
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
          containerStyle={styles.Inputs}
          placeholder="Display Name"
          onChangeText={(text) => setDisplayName({ text, error: false })}
          value={displayName}
          placeholderTextColor="#20365F"
          inputStyle={{
            color: "#20365F",
            fontSize: 16,
          }}
        />
        <Text
          style={
            displayName.error ? { color: "red" } : { color: "transparent" }
          }
        >
          * Invalid Display Name
        </Text>

        {/* ----------------------------------EMAIL-------------------------------- */}

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Input
            inputContainerStyle={{
              borderBottomWidth: 0,
            }}
            containerStyle={styles.Inputs}
            placeholder="Email"
            onChangeText={(text) => setEmail({ text, error: false })}
            value={email.text}
            placeholderTextColor="#20365F"
            inputStyle={{
              color: "#20365F",
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
            placeholderTextColor="#20365F"
            inputStyle={{
              color: "#20365F",
              fontSize: 16,
            }}
            disabled
          />
        </View>
        <Text style={email.error ? { color: "red" } : { color: "transparent" }}>
          * Invalid Email
        </Text>

        {/* ---------------------------------ROLE--------------------------------- */}

        <View
          style={{ borderColor: "lightgray", backgroundColor: "lightgray" }}
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
        </Text>

        {/* ---------------------------------COUNTRY--------------------------------- */}
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
              style={{ flex: 1, color: "transparent" }}
              onClose={() => setCountryPicker(false)}
            />
            <Text>▼</Text>
          </TouchableOpacity>
        </View>
        <Text
          style={country.error ? { color: "red" } : { color: "transparent" }}
        >
          * Select a Country
        </Text>

        {/* ---------------------------------DATE--------------------------------- */}
        <Text>Date of Birth</Text>
        <DatePicker
          // style={{ width: 200 }}
          style={{
            width: "100%",
            // backgroundColor: "lightgray",
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
              position: "absolute",
              left: 0,
            },
            dateInput: {},
          }}
          onDateChange={(date) => {
            setDateOfBirth({ value: date, error: false });
            // console.log(new Date(date));
          }}
        />
        <Text
          style={
            dateOfBirth.error ? { color: "red" } : { color: "transparent" }
          }
        >
          * Select a Date
        </Text>
      </ScrollView>

      {/* ---------------------------------SUBMIT--------------------------------- */}
      <Text></Text>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          width: "100%",
          height: "10%",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={handleCreate}
      >
        <Text>Create</Text>
      </TouchableOpacity>

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
              {/* ---------------------------------OK--------------------------------- */}
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
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // borderWidth: 1,
    flex: 1,
    margin: 20,
    // height: "100%",
  },
  Inputs: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#20365F",
    height: 50,
    width: "50%",
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
