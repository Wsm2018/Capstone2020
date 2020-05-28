//@refresh reset
import { Button,Rating } from "react-native-elements";
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
  const [assetList, setAssetList] = useState([]);
  const [finalAssets, setFinalAssets] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  // const tName = props.navigation.getParam("tName", "failed");
  // const sName = props.navigation.getParam("section", "failed").name;
  // const startDateTime = props.navigation.getParam("startDate", "failed");
  // const endDateTime = props.navigation.getParam("endDate", "failed");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    //console.log(selectedSection);
    if (selectedSection !== null) {
      getList();
    }
  }, [selectedSection]);

  useEffect(() => {
    // console.log("asset list is :", assetList.length);
    // console.log("finalAssets is :", finalAssets.length);

    if (assetList.length > 0 && finalAssets.length == 0) {
      checkTime();
    }
  }, [assetList]);

  const getAllList =  () => {
    setEndDate('00-00-0000')
    setStartDate('00-00-0000')

    const temp = [];
    db.collection('assets').orderBy("assetSection").orderBy('code').onSnapshot((snapshot) => {
      snapshot.forEach(async doc => {
        //console.log(section)
          let bookingTemp = [];
          let bookings = await db.collection('assets').doc(doc.id).collection('assetBookings').get()
          if(bookings){
              bookings.forEach(b => {
              bookingTemp.push(b.data())
            })
          }

          let ratingTemp = 0;
          let ratingAvg = 0;
          let rating = await db.collection('assets').doc(doc.id).collection('reviews').get()
          if(rating){
            
            let count = 0;
            rating.forEach(r => {
              ratingTemp+=r.data().rating;
              //console.log('sum',ratingTemp)
              count++;
              // console.log(count)
            })
            ratingAvg = parseFloat(ratingTemp)/parseFloat(count);

            if(!isNaN(ratingAvg)){
              //console.log('avg is a number',ratingAvg)
            }else{
              ratingAvg = 0;
              //console.log('avg is not a number',ratingAvg);
            }
            
          }

          temp.push({id:doc.id, rr:ratingAvg,assetBookings:bookingTemp,...doc.data()})

          if(temp.length === snapshot.docs.length){
            //console.log('assets',temp)
            setAssetList(temp)
          }
      });
    }
    )
  } 

  const getList = () => {
    
    // console.log("section rn", selectedSection);
    const temp = [];

    db.collection("assets")
      .orderBy("code")
      .where("assetSection", "==", selectedSection.id)
      .onSnapshot((snapshot) => {
        snapshot.forEach(async (doc) => {
          //console.log(section)
          let bookingTemp = [];
          let bookings = await db
            .collection("assets")
            .doc(doc.id)
            .collection("assetBookings")
            .get();
          if (bookings) {
            bookings.forEach((b) => {
              bookingTemp.push(b.data());
            });
          }
          temp.push({ id: doc.id, assetBookings: bookingTemp, ...doc.data() });
          if (temp.length === snapshot.docs.length) {
            //console.log("assets", temp);
            setAssetList(temp);
          }
        });
      });
  };

  const checkTime = () => {
    // console.log("hii");
    let assetsToShow = assetList;

    assetsToShow = assetsToShow.filter(
      (asset) =>
        asset.assetBookings.filter((assetBooking) => {
          return !(
            (startDate <= assetBooking.startDateTime &&
              endDate <= assetBooking.startDateTime) ||
            (startDate >= assetBooking.endDateTime &&
              endDate >= assetBooking.endDateTime)
          );
        }).length === 0
    );

    //console.log("after checking time", assetsToShow);
    setFinalAssets(assetsToShow);
  };

 
  //design view new variables
  const [listView, setListView] = useState(false);
  ///////////////////////////////////////////////////////////////////

  const [showSections, setShowSections] = useState(false);
  const [visibale, setVisible] = useState(false);

  const type = props.navigation.getParam("type", "failed").id;
  const tName = props.navigation.getParam("type", "failed").name;

  useEffect(() => {
    getSections();
  }, [type]);

  useEffect(() => {
    if (finalAssets.length > 0) {
      setListView(true);
    }
  }, [finalAssets]);

  useEffect(() => {
    // console.log(startDate);
  }, [startDate]);
  useEffect(() => {
    //Added by design team
    endDate && setShowSections(true);
    ////////////////////////////////
    // console.log(endDate);
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
    // console.log(temp);
    setAssetSections(temp);
  };

  return (
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
          <Button title='Show all assets' onPress={getAllList}></Button>
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
                    () => setSelectedSection(s)
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

        <View style={styles.three}>
          <Text style={styles.cardTitle}>List</Text>
          {listView === true ? (
            finalAssets.length > 0 ? (
              finalAssets.map((l, i) => (
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
                      <Rating
                        type='star'
                        ratingCount={5}
                        startingValue={l.rr}
                        imageSize={5}
                        readonly
                      />
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
