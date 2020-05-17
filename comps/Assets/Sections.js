//@refresh reset
import { Button } from "react-native-elements";
import React, { useState, useEffect } from "react";
import { createStackNavigator } from "react-navigation-stack";

import {
  Image,
  Platform,
  TextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Dimensions,
} from "react-native";
import { Surface } from "react-native-paper";
import DatePicker from "react-native-datepicker";
import { Card, Divider } from "react-native-elements";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db.js";
import { Snackbar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import List from "./List";
require("firebase/firestore");

export default function Sections(props) {
  const [assetSections, setAssetSections] = useState([]);

  //design testing variable
  const [assetSections2, setAssetSections2] = useState([
    { name: "c1" },
    { name: "c1" },
    { name: "c1" },
    { name: "c1" },
    { name: "c1" },
    { name: "c1" },
    { name: "c1" },
    { name: "c1" },
    { name: "c1" },
    { name: "c1" },
  ]);
  const [finalAssets2, setFinalAssets2] = useState([
    { code: "1" },
    { code: "1" },
    { code: "1" },
    { code: "1" },
    { code: "1" },
    { code: "1" },
    { code: "1" },
    { code: "1" },
    { code: "1" },
    { code: "1" },
    { code: "1" },
    { code: "1" },
  ]);

  //design view new variables
  const [listView, setListView] = useState(false);
  ///////////////////////////////////////////////////////////////////

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showSections, setShowSections] = useState(false);
  const [visibale, setVisible] = useState(false);

  const type = props.navigation.getParam("type", "failed").id;
  const tName = props.navigation.getParam("type", "failed").name;

  useEffect(() => {
    getSections();
  }, [type]);

  useEffect(() => {
    console.log(startDate);
  }, [startDate]);
  useEffect(() => {
    //Added by design team
    endDate && setShowSections(true);
    ////////////////////////////////
    console.log(endDate);
  }, [endDate]);

  const getSections = async () => {
    const temp = [];
    const sections = await db
      .collection("assetSections")
      .where("assetType", "==", type)
      .get();
    sections.forEach((doc) => {
      temp.push({ id: doc.id, ...doc.data() });
    });
    console.log(temp);
    setAssetSections(temp);
  };

  return (
<<<<<<< HEAD
    <View style={styles.container}>
      <TouchableOpacity style={{alignItems:"center",borderRadius:50,height:20,width:200,margin:5, backgroundColor:'pink'}} onPress={() => props.navigation.navigate("List",{startDate:'0000-00-00',endDate:'0000-00-00'})}><Text>Show All Assets</Text></TouchableOpacity>

      {startDate?
      <>
      {
        endDate?
        <>
        <Text>You are booking from {startDate} until {endDate} Now Choose a Section</Text>
        {assetSections.map((s,i)=>(
        <TouchableOpacity  onPress={() => props.navigation.navigate("List",{section:s,startDate:startDate,endDate:endDate})} key={i} style={{alignItems:"center",borderRadius:50,height:20,width:200,margin:5, backgroundColor:'pink'}}>
          <Text >{s.name}</Text>
        </TouchableOpacity>
        ))}
        </>
        :
        <>
=======
    <ScrollView contentContainerStyle={{ backgroundColor: "#e3e3e3" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            style={{
              // width: "100%",
              height: "100%",
              // position: "relative",
            }}
            source={require("../../assets/images/test.jpg")}
          />
          {/* <Text>Image</Text> */}
        </View>
        <View style={styles.one}>
          <Text style={styles.cardTitle}>Choose Date & Time</Text>
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                width: "45%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DatePicker
                style={{ width: "100%" }}
                date={startDate}
                mode="datetime"
                placeholder="Start Date"
                format="YYYY-MM-DD T h:mm:ss"
                minDate="2020-05-07"
                maxDate="2022-01-01"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                customStyles={{
                  dateIcon: {
                    // position: "absolute",
                    // left: 0,
                    // top: 4,
                    // marginLeft: 0,
                    width: 0,
                    height: 0,
                  },
                  dateInput: {
                    // marginLeft: 36,
                    // backgroundColor: "lightgray",
                    borderWidth: 0,
                  },
                  // ... You can check the source to find the other keys.
                }}
                onDateChange={setStartDate}
              />
            </View>
            <View
              style={{
                width: "10%",
                // alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="arrow-right" size={20} color="#20365F" />
            </View>
            <View
              style={{
                width: "45%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DatePicker
                style={{ width: "100%" }}
                date={endDate}
                mode="datetime"
                placeholder="End Date"
                format="YYYY-MM-DD T h:mm:ss"
                minDate={startDate}
                maxDate="2022-01-01"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                customStyles={{
                  dateIcon: {
                    // position: "absolute",
                    // left: 0,
                    // top: 4,
                    // marginLeft: 0,
                    width: 0,
                    height: 0,
                  },
                  dateInput: {
                    // marginLeft: 36,
                    borderWidth: 0,
                  },
                  // ... You can check the source to find the other keys.
                }}
                onDateChange={setEndDate}
                disabled={!startDate}
              />
            </View>
          </View>
        </View>
        <View style={styles.two}>
          <Text style={styles.cardTitle}>Sections</Text>
          {showSections === true ? (
            assetSections.map((s, i) => (
              <View style={{ width: "33%", alignItems: "center" }}>
                <TouchableOpacity
                  onPress={
                    // (
                    () => setListView(true)
                    //,
                    // () =>
                    //   props.navigation.navigate("List", {
                    //     tName: tName,
                    //     section: s,
                    //     startDate: startDate,
                    //     endDate: endDate,
                    //     assetTypeId: type,
                    //   }))
                  }
                  key={i}
                  style={{
                    backgroundColor: "#C6CBD0",
                    width: 100,
                    height: 100,
                    margin: 5,
                    alignItems: "center",
                    flexDirection: "row",
                    //elevation: 12,
                    borderWidth: 2,
                    borderColor: "#20365F",
                  }}
                >
                  <View
                    style={{
                      height: "20%",
                      width: "100%",
                      justifyContent: "center",
                      textAlign: "center",
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Icon name="map-marker" size={40} color="#20365F" />
                    <Text
                      style={{
                        textAlign: "center",
                        color: "#20365F",
                        fontSize: 20,
                      }}
                    >
                      {s.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text>Please choose a date to continue</Text>
          )}
        </View>
>>>>>>> master

        <View style={styles.three}>
          <Text style={styles.cardTitle}>List</Text>
          {listView === true ? (
            finalAssets2.length > 0 ? (
              finalAssets2.map((l, i) => (
                <View style={{ width: "20%", alignItems: "center" }}>
                  <TouchableOpacity
                    // onPress={() =>
                    //   props.navigation.navigate("Details", {
                    //     sName: sName,
                    //     tName: tName,
                    //     asset: l,
                    //     startDateTime: startDateTime,
                    //     endDateTime: endDateTime,
                    //     assetTypeId,
                    //   })
                    // }
                    key={i}
                    style={{
                      backgroundColor: "#C6CBD0",
                      width: 60,
                      height: 60,
                      margin: 5,
                      alignItems: "center",
                      flexDirection: "row",
                      //elevation: 12,
                      borderWidth: 2,
                      borderColor: "#20365F",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: "100%",
                        justifyContent: "center",
                        textAlign: "center",
                        alignContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Icon name="car" size={30} color="#20365F" />
                      <Text
                        style={{
                          textAlign: "center",
                          color: "#20365F",
                          fontSize: 18,
                        }}
                      >
                        {l.code}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text>Loading</Text>
            )
          ) : (
            <Text>Please choose a section to continue</Text>
          )}
        </View>
        <View style={styles.four}>
          <Text style={styles.cardTitle}>Checkout</Text>
          <Text>Please fill in all the information for checkout</Text>
        </View>
      </View>
      <View style={{ minHeight: 200 }}></View>
    </ScrollView>
  );
}
Sections.navigationOptions = (props) => ({
  title: "Sections",
  headerStyle: { backgroundColor: "#20365F" },
  headerTintColor: "white",
});

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: "#e3e3e3",
    width: Math.round(Dimensions.get("window").width),
    height: Math.round(Dimensions.get("window").height),
  },
  header: {
    // flex: 1,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    height: "25%",
  },
  one: {
    backgroundColor: "white",
    width: "100%",
    // marginTop: "3%",
    padding: "5%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
  },
  two: {
    backgroundColor: "white",
    width: "100%",
    marginTop: "3%",
    padding: "5%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
    flexDirection: "row",
    flexWrap: "wrap",

    // justifyContent: "space-between",
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
  four: {
    backgroundColor: "white",
    width: "100%",
    marginTop: "3%",
    padding: "5%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
  },
  cardTitle: {
    fontSize: 18,
    // backgroundColor: "red",
    width: "100%",
    height: 50,
    color: "gray",
  },
});
