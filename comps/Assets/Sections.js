//@refresh-rest
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
  Picker,
  ImageBackground,
  Dimensions,
} from "react-native";

import DatePicker from "react-native-datepicker";
import moment from "moment";
// import { Divider } from "react-native-elements";
import { Surface } from "react-native-paper";
import { Divider, Badge } from "react-native-elements";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db.js";
import { Snackbar } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import List from "./List";
require("firebase/firestore");
import {Marker} from 'react-native-maps';
import MapView from 'react-native-maps';

import Details from "./Details";
import Review from "./Review";

import { set } from "react-native-reanimated";
import { Avatar, Card, Title, Paragraph } from "react-native-paper";

export default function Sections(props) {
  // const [fromFav, setFromFav] = useState(false);
  const [assetSections, setAssetSections] = useState([]);
  const [assetList, setAssetList] = useState([]);
  const [finalAssets, setFinalAssets] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [tempstartDate, settempStartDate] = useState("");
  const [tempendDate, settempEndDate] = useState("");
  const [focus,setFocus] = useState(false);
  const [mapGridFlag, setMapGridFlag] = useState(true)
  const [showInMap, setShowInMap] = useState(false);
  // const tName = props.navigation.getParam("tName", "failed");
  // const sName = props.navigation.getParam("section", "failed").name;
  // const startDateTime = props.navigation.getParam("startDate", "failed");
  // const endDateTime = props.navigation.getParam("endDate", "failed");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const fav = props.navigation.getParam("flag", false);
  console.log(fav);
  useEffect(() => {
    if (fav) {
      console.log("hello");
      // console.log(props.navigation.getParam("startDate", ""));
      setStartDate(props.navigation.getParam("startDate", ""));
      setEndDate(props.navigation.getParam("startDate", ""));
      console.log(props.navigation.getParam("asset", null).type);
      type = props.navigation.getParam("asset", null).type;
      tName = props.navigation.getParam("asset", null).tName;
      console.log(props.navigation.getParam("asset", null).assetSection);
      setSelectedSection(props.navigation.getParam("asset", null).assetSection);
      console.log("asset", props.navigation.getParam("asset", null));
      setSelectedList(props.navigation.getParam("asset", null));
      setDetailsView(true);
    }
  }, []);

  useEffect(() => {
    // console.log(
    //   "iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii0",
    //   selectedSection
    // );
    if (selectedSection !== null) {
      var temp = [];
      setAssetList(temp);
      // console.log("-----------------", assetList);
      getList();
      for (let i = 0; i < assetList.length; i++) {
        console.log(" ppppppppppppppppp", assetList[i].code);
      }
    }
  }, [selectedSection]);

  useEffect(() => {
    //console.log("asset list is :", assetList.length);
    //console.log("finalAssets is :", finalAssets.length);

    // console.log(
    //   " it should work heeeeeeeeeeeeeeeeerrrrrrrrrrrrrrrrraaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    //   assetList
    // );
    if (assetList.length > 0) {
      checkTime();
    }
  }, [assetList]);

  const getList = () => {
    //console.log("section rn", selectedSection);
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
              // console.log(
              //   " here the push!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
              // );
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
    //console.log("hii");
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
  const [detailsView, setDetailsView] = useState(false);
  const [selectedList, setSelectedList] = useState("");

  // const getDetails = async (l) => {
  //   setSelectedList(l);
  //   setDetailsView(true);
  //   //setSelectedList(l) || setDetailsView(true)
  // };

  const [favoriteAssets, setFavoriteAssets] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    getUserFavoriteAssets();
    // console.log(favoriteAssets);
  }, []);

  // const getUserFavoriteAssets = () => {
  //   db.collection("users")
  //     .doc(firebase.auth().currentUser.uid)
  //     .onSnapshot((querySnap) => {
  //       const data = querySnap.data();
  //       const favorites = data.favorite;
  //       // let assetArr = [];
  //       // favorites.map(async (item) => {
  //       //   db.collection("assets")
  //       //     .doc(item)
  //       //     .onSnapshot((doc) => {
  //       //       assetArr.push({ id: doc.id, ...doc.data() });
  //       //       if (favorites.length === assetArr.length) {
  //       //         setFavoriteAssets([...assetArr]);
  //       //       }
  //       //     });
  //       // });
  //       // console.log("------------------------", favorites);
  //       setFavoriteAssets(favorites);
  //     });
  // };

  const getUserFavoriteAssets = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("favorites")
      .onSnapshot((querySnap) => {
        let favorites = [];
        let favoritesId = [];

        querySnap.forEach((document) => {
          favorites.push({ id: document.id, ...document.data() });
          favoritesId.push(document.id);
        });
        setFavoriteAssets([...favorites]);
        setFavoriteIds([...favoritesId]);
      });
  };

  ///////////////////////////////////////////////////////////////////

  const [showSections, setShowSections] = useState(false);
  const [visible, setVisible] = useState(false);

  let type = props.navigation.getParam("type", "failed").id;
  let tName = props.navigation.getParam("type", "failed").name;

  useEffect(() => {
    //console.log("++++++++++++++++++++++", type);
    getSections();
  }, [type]);

  useEffect(() => {
    if (tempstartDate) {
      var dateTime = tempstartDate.split(" ");
      var update =
        dateTime[0] +
        " " +
        dateTime[1] +
        " " +
        dateTime[2].split(":")[0] +
        ":00 " +
        dateTime[3];
      setStartDate(update);
    }
  }, [tempstartDate]);

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
    console.log("getSections ", type);
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

  // const checkFavorites = async (id) => {
  //   const favorites = await db
  //     .collection("users")
  //     .doc(firebase.auth().currentUser.uid)
  //     .collection("favorites")
  //     .get();
  //   const ids = [];
  //   favorites.forEach((doc) => {
  //     ids.push(doc.id);
  //   });
  //   return ids.includes(id);
  // };

  const handleAddFavorite = async (item) => {
    // console.log(item);
    // if (!(await checkFavorites(item.id))) {
    //   db.collection("users")
    //     .doc(firebase.auth().currentUser.uid)
    //     .collection("favorites")
    //     .doc(item.id)
    //     .set({ asset: item });
    // } else {
    //   alert("Already exists");
    // }
    // alert("item", item);

    const addFavorite = firebase.functions().httpsCallable("addFavorite");
    const response = await addFavorite({
      uid: firebase.auth().currentUser.uid,
      asset: item,
    });
    // console.log(response);
    if (response.data !== "Exists") {
      alert("Asset Added");
      // getUserFavoriteAssets();
    } else {
      handleDeleteFavorite(item.id);
    }
  };

  const handleDeleteFavorite = async (id) => {
    // console.log(id);
    const deleteFavorite = firebase.functions().httpsCallable("deleteFavorite");
    const response = await deleteFavorite({
      uid: firebase.auth().currentUser.uid,
      assetId: id,
    });
    if (response.data !== null) {
      // alert("Asset Deleteted");
    }
  };

  const selectAndCheck = async(s) =>{
    console.log("joined")
    setSelectedSection(s)
    let checkInfo = await db.collection("assetTypes").doc(s.assetType).get()
    if(checkInfo.data().showInMap === true){
      setShowInMap(true)
    }else{
      setShowInMap(false)
    }
    console.log(checkInfo.data().showInMap)
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          {/* <Image
            style={{
              // width: "100%",
              // height: "100%",
              // position: "relative",
              flex: 1,
            }}
            source={require("../../assets/images/test.jpg")}
          /> */}
          <Card.Cover
            // source={{ uri: "https://picsum.photos/700" }}
            source={require("../../assets/images/bookingcover1.jpg")}
            style={{ width: "100%" }}
          />
        </View>
        <View style={styles.one}>
          <Text style={styles.cardTitle}>Choose Date & Time</Text>
          <View
            style={{
              flexDirection: "row",
              // backgroundColor: "red",
              minHeight: 50,
            }}
          >
            <View
              style={{
                width: "45%",
                alignItems: "center",
                justifyContent: "center",
                // borderWidth: 1,
              }}
            >
              <DatePicker
                style={{ width: "100%" }}
                date={startDate}
                mode="datetime"
                placeholder="Start Date"
                format="YYYY-MM-DD T h:mm:ss"
                minDate={new Date()}
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
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color="#20365F"
              />
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
              <View style={{ width: "33%", alignItems: "center" }} key={i}>
                <TouchableOpacity
                  onPress={
                    // (
                    () => selectAndCheck(s)
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
                  style={{
                    backgroundColor:
                      selectedSection === s ? "#20365F" : "#e3e3e3",
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
                      // height: "20%",
                      width: "100%",
                      justifyContent: "center",
                      textAlign: "center",
                      alignContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={40}
                      color={selectedSection === s ? "white" : "#20365F"}
                    />
                    <Text
                      style={{
                        textAlign: "center",
                        color: selectedSection === s ? "white" : "#20365F",
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
          <TouchableOpacity style={styles.cardTitle}
          onPress={() => setMapGridFlag(!mapGridFlag) }>
          <Text>List</Text>
          </TouchableOpacity>
          {listView === true ? (
            finalAssets.length > 0 ? (
              mapGridFlag === true ? (
              finalAssets.map((l, i) => (
                <View
                  style={{
                    width: "20%",
                    alignItems: "center",
                    marginBottom: 15,
                    // backgroundColor: "red",
                  }}
                >
                  <TouchableOpacity
                    // onPress={() =>
                    //   props.navigation.navigate("Details", {
                    //     sName: selectedSection.name,
                    //     tName: tName,
                    //     asset: l,
                    //     startDateTime: startDate,
                    //     endDateTime: endDate,
                    //     type,
                    //   })
                    // }
                    onPress={() => setSelectedList(l) || setDetailsView(true)}
                    key={i}
                    style={{
                      backgroundColor:
                        selectedList === l ? "#20365F" : "#e3e3e3",
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
                      <MaterialCommunityIcons
                        name="car"
                        size={30}
                        color={selectedList === l ? "white" : "#20365F"}
                      />
                      <Text
                        style={{
                          textAlign: "center",
                          color: selectedList === l ? "white" : "#20365F",
                          fontSize: 18,
                        }}
                      >
                        {l.code}
                      </Text>
                      <Badge
                        value={
                          <MaterialCommunityIcons
                            name="heart"
                            // name={favoriteAssets.includes(l.id) ? "heart" : "plus"}
                            size={18}
                            color={
                              favoriteIds.includes(l.id) ? "#c44949" : "white"
                            }
                            // onPress={
                            //   favoriteAssets.includes(l.id)
                            //     ? null
                            //     : () => handleAddFavorite(l)
                            // }
                            disabled
                            // style={{ borderColor: "blue", borderWidth: 1 }}
                          />
                        }
                        containerStyle={{
                          position: "absolute",
                          top: -12,
                          right: -10,
                        }}
                        badgeStyle={{
                          backgroundColor: "#20365F",
                          width: 25,
                          height: 25,
                          borderColor: "transparent",
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                  {/* <Text>
                    {l.price} QR
                  </Text> */}
                  {/* <TouchableOpacity onPress={() => handleAddFavorite(l)}>
                    <Text>Add to Favorite</Text>
                  </TouchableOpacity> */}
                </View>
              ))) : showInMap === true ?
              <MapView
        style={{height:250, width: 300}}
        showsUserLocation={true}
        followsUserLocation={focus}
        region={{
          latitude: selectedSection.location.latitude,
          longitude: selectedSection.location.longitude,
          latitudeDelta:0.0020,
          longitudeDelta:0.0020
        }}
        mapType={'satellite'}
        
      >
        <TouchableOpacity onPress={() => setFocus(!focus)}><Text style={{color:'white'}}>Focus is {focus?'On':'Off'}</Text></TouchableOpacity>
            {finalAssets.length > 0 ? (
              finalAssets.map((l, i) => (
                <Marker
                onPress={() => setSelectedList(l) || setDetailsView(true)}
                key={i}
                style={{width:20,height:20}}
                image={l.status === true ? require('../../assets/images/green.jpg')
                :require('../../assets/images/red.jpg')}
                coordinate={l.location}
                title={`parking No.${l.name}`}
                description={`Press here to reserve parking number ${l.description}`}
                />
              ))
            ) : (
              <Text>Loading</Text>
            )}
            </MapView>
            : <Text>there is no map for this item</Text>) : (
              <Text>Loading</Text>
            )
          ) : (
            <Text>Please choose a section to continue</Text>
          )}
        </View>
        {selectedList ? (
          <View style={styles.four}>
            <Text style={styles.cardTitle}>Details</Text>
            {/* <Text>Price {selectedList.price}</Text>
            <Text>add what ever u want</Text> */}
            {detailsView === true ? (
              <View>
                {/* <TouchableOpacity>
                <Text>click2</Text>
              </TouchableOpacity> */}
                {selectedSection === null ? null : (
                  <View>
                    <Review
                      // sName={selectedSection.name}
                      // tName={tName}
                      asset={selectedList}
                      startDateTime={startDate}
                      // endDateTime={endDate}
                      // type={type}
                      navigation={props.navigation}
                      handleAddFavorite={handleAddFavorite}
                      favoriteAssets={favoriteIds}
                    />

                    <Details
                      sName={selectedSection.name}
                      tName={tName}
                      asset={selectedList}
                      startDateTime={startDate}
                      endDateTime={endDate}
                      type={type}
                      navigation={props.navigation}
                    />
                  </View>
                )}
              </View>
            ) : (
              <View>
                <Text>Please choose a list to continue</Text>
                {/* <TouchableOpacity>
                <Text>click</Text>
              </TouchableOpacity> */}
              </View>
            )}
          </View>
        ) : null}

        <View style={{ height: 15 }}></View>
      </ScrollView>
    </View>
  );
}
Sections.navigationOptions = (props) => ({
  title: "Sections",
  headerStyle: { backgroundColor: "#20365F" },
  headerTintColor: "white",
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",
    width: Math.round(Dimensions.get("window").width),
    // height: Math.round(Dimensions.get("window").height),
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    // height: "25%",
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
