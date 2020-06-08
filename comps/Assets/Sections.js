//@refresh-rest
import { Button } from "react-native-elements";
import React, { useState, useEffect, useRef } from "react";
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
  Modal,
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
import { Marker } from "react-native-maps";
import MapView from "react-native-maps";

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

  ////////////check with amal & fahd
  // const [tempstartDate, settempStartDate] = useState("");
  // const [tempendDate, settempEndDate] = useState("");

  const [focus, setFocus] = useState(false);
  const [mapGridFlag, setMapGridFlag] = useState(false);
  const [showInMap, setShowInMap] = useState(false);
  // const tName = props.navigation.getParam("tName", "failed");
  // const sName = props.navigation.getParam("section", "failed").name;
  // const startDateTime = props.navigation.getParam("startDate", "failed");
  // const endDateTime = props.navigation.getParam("endDate", "failed");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [startTimeModal, setStartTimeModal] = useState(false);
  const [endTimeModal, setEndTimeModal] = useState(false);
  const [tempStartDate, setTempStartDate] = useState();
  const [tempEndDate, setTempEndDate] = useState();
  const displayList = useRef();
  const [listView, setListView] = useState(false);
  const [detailsView, setDetailsView] = useState(false);
  const [selectedList, setSelectedList] = useState("");

  const [favoriteAssets, setFavoriteAssets] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [timesList, setTimesList] = useState([
    "12:00 AM",
    "1:00 AM",
    "2:00 AM",
    "3:00 AM",
    "4:00 AM",
    "5:00 AM",
    "6:00 AM",
    "7:00 AM",
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
    "9:00 PM",
    "10:00 PM",
    "11:00 PM",
  ]);
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
    if (selectedSection !== null) {
      var temp = [];
      setAssetList(temp);
      getList();
    }
  }, [selectedSection]);

  useEffect(() => {
    if (assetList.length > 0) {
      checkTime();
    }
  }, [assetList]);

  useEffect(() => {
    if (selectedSection) {
      setSelectedList("");
    }
  }, [selectedSection]);

  const getList = () => {
    //console.log("section rn", selectedSection);
    db.collection("assets")
      .orderBy("code")
      .where("assetSection", "==", selectedSection.id)
      .onSnapshot((snapshot) => {
        const temp = [];
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
          // console.log("temp.length",temp.length)
          // console.log("snapshot.docs.length",snapshot.docs.length)
          if (temp.length === snapshot.docs.length) {
            //console.log("assets", temp);
            console.log("Oui Oui");
            setAssetList(temp);
          }
        });
      });
  };

  const checkTime = () => {
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

    setFinalAssets(assetsToShow);
  };

  useEffect(() => {
    getUserFavoriteAssets();
  }, []);

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

  const type = props.navigation.getParam("type", "failed").id;
  const tName = props.navigation.getParam("type", "failed").name;
  const sectionIcon = props.navigation.getParam("type", "failed").sectionIcon;
  const assetIcon = props.navigation.getParam("type", "failed").assetIcon;

  useEffect(() => {
    getSections();
  }, [type]);

  useEffect(() => {
    if (finalAssets.length > 0) {
      setListView(true);
    }
  }, [finalAssets]);

  /////////////Tracker and Security Code/////////////////////////

  const reduceViewer = async (a) => {
    //console.log('unfocus', a)
    //console.log("adios",assetList.filter(a => a.id === selectedList.id)[0]);
    const lessViewers = firebase.functions().httpsCallable("lessViewers");
    const result = await lessViewers({
      asset: a,
    });
  };

  const timeListener = () => {
    let timerId = setInterval(() => {
      if (!props.navigation.isFocused()) {
        // console.log("timer stoooooooooooooooooooped")
        //console.log("adiiiiiiiiiiios",assetList.filter(a => a.id === selectedList.id)[0]);
        reduceViewer(assetList.filter((a) => a.id === selectedList.id)[0]);
        clearInterval(timerId);
        // flag = false;
      }
    }, 1000);
  };

  useEffect(() => {
    timeListener();
  }, []);

  const increaseViewer = async (a) => {
    const moreViewers = firebase.functions().httpsCallable("moreViewers");
    const result = await moreViewers({
      asset: a,
    });
  };

  const assetFocus = (a) => {
    if (selectedList === a) {
      return;
    } else {
      console.log("focus", a);
      if (selectedList !== "") {
        console.log("selectedlist is", selectedList);
        reduceViewer(assetList.filter((a) => a.id === selectedList.id)[0]);
      }
      console.log(`asset ${a.code} is focussed from details`);
      increaseViewer(a);
      setSelectedList(a);
    }
  };

  const flipSecurity = async (a) => {
    const updateAssetSecurity = firebase
      .functions()
      .httpsCallable("updateAssetSecurity");
    const result = await updateAssetSecurity({
      asset: a,
    });
  };

  ////////////////////////////////////////////////////////////////
  useEffect(() => {
    setShowSections(false);
    setSelectedList("");
    setAssetList([]);
    setSelectedSection(null);
  }, [startDate, endDate]);

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
    console.log("fav preseddddddddddddddddddd ");
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
    console.log(response);
    if (response.data !== "Exists") {
      alert("Asset Added");
      // getUserFavoriteAssets();
    } else {
      console.log("deleteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
      handleDeleteFavorite(item.id);
    }
  };

  const handleDeleteFavorite = async (id) => {
    console.log("deleteddddddddddd ", id);
    const deleteFavorite = firebase.functions().httpsCallable("deleteFavorite");
    const response = await deleteFavorite({
      uid: firebase.auth().currentUser.uid,
      assetId: id,
    });
    if (response.data !== null) {
      alert("Asset Deleteted");
    }
  };

  useEffect(() => {
    if (tempStartDate) {
      if (tempStartDate.split(" ")[0] == moment().format("YYYY-MM-DD")) {
        var temp = [];
        var found = false;
        console.log("temp Start", tempStartDate);
        for (let i = 0; i < timesList.length; i++) {
          if (found) {
            temp.push(timesList[i]);
          }
          console.log(timesList[i], moment().format("h:00 A"));
          if (timesList[i] == moment().format("h:00 A")) {
            found = true;
            console.log("here", moment().format("h:00 A"));
          }
        }
        displayList.current = temp;
        setStartTimeModal(true);
      } else {
        displayList.current = timesList;
        setStartTimeModal(true);
      }
    }
  }, [tempStartDate]);

  useEffect(() => {
    if (tempEndDate) {
      var temp = [];
      var found = false;
      console.log("started", startDate.split(" ")[2]);
      if (tempEndDate.split(" ")[0] === startDate.split(" ")[0]) {
        var s = startDate.split(" ")[2] + " " + startDate.split(" ")[3];
        for (let i = 0; i < timesList.length; i++) {
          if (found) {
            temp.push(timesList[i]);
          }
          if (timesList[i] == s) {
            found = true;
            console.log("here");
          }
        }
        displayList.current = temp;
      } else {
        displayList.current = timesList;
      }

      setEndTimeModal(true);
    }
  }, [tempEndDate]);

  useEffect(() => {
    if (endDate) {
      setShowSections(true);
    }
  }, [endDate]);

  useEffect(() => {
    if (startTime) {
      setStartDate(tempStartDate.split(" ")[0] + " T " + startTime);
      // console.log(
      //   "whyyyyyyyyyyyyyyyyyyyyyyy",
      //   moment(startDate).add(1, "hour").format(),
      //   new Date(startDate)
      // );
      setEndDate();
    }
  }, [startTime]);

  useEffect(() => {
    if (endTime) {
      setEndDate(tempEndDate.split(" ")[0] + " T " + endTime);
    }
  }, [endTime]);
  const selectAndCheck = async (s) => {
    console.log("joined");
    setSelectedSection(s);
    let checkInfo = await db.collection("assetTypes").doc(s.assetType).get();
    if (checkInfo.data().showInMap === true) {
      setShowInMap(true);
    } else {
      setShowInMap(false);
    }
    console.log(checkInfo.data().showInMap);
  };

  const changeStartDate = async (d) => {
    setTempStartDate(d);
    startTimeModal === false && setStartTimeModal(true);
  };

  const changeEndDate = async (d) => {
    setTempEndDate(d);
    endTimeModal === false && setEndTimeModal(true);
  };

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
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: "47%",
                alignItems: "center",
                justifyContent: "center",
                // borderWidth: 1,
              }}
            >
              {/* date */}
              {Platform.OS === "ios" ? (
                <DatePicker
                  style={{ width: "100%" }}
                  date={startDate}
                  mode="datetime"
                  placeholder="Choose A Start Date"
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
                      backgroundColor: startDate ? "transparent" : "#f0f0f0",
                      borderWidth: 0,
                      borderColor: "#185a9d",
                    },
                    // ... You can check the source to find the other keys.
                  }}
                  onDateChange={setStartDate}
                />
              ) : (
                <DatePicker
                  style={{ width: "100%" }}
                  //is24Hour
                  date={startDate}
                  mode="date"
                  placeholder="Choose A Start Date"
                  format="YYYY-MM-DD T h:mm A"
                  minDate={moment()}
                  maxDate={moment().add(3, "month")}
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
                      backgroundColor: startDate ? "transparent" : "#f0f0f0",
                      borderWidth: 0,
                      borderColor: "#185a9d",
                      // color: "white",
                    },
                    // ... You can check the source to find the other keys.
                  }}
                  // onDateChange={setTempStartDate}
                  onDateChange={(d) => changeStartDate(d)}
                />
              )}
            </View>
            <View
              style={{
                width: "10%",
                alignItems: "center",
                justifyContent: "center",
                paddingRight: "2%",
              }}
            >
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color="#3ea3a3"
              />
            </View>
            <View
              style={{
                width: "47%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Date 2 */}
              {Platform.OS === "ios" ? (
                <DatePicker
                  style={{ width: "100%" }}
                  date={endDate}
                  mode="datetime"
                  placeholder="Choose An End Date"
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
                      backgroundColor: endDate ? "transparent" : "#f0f0f0",

                      borderWidth: 0,
                      borderColor: "#185a9d",
                    },
                    // ... You can check the source to find the other keys.
                  }}
                  onDateChange={setEndDate}
                  disabled={!startDate}
                />
              ) : (
                <DatePicker
                  style={{ width: "100%" }}
                  date={endDate}
                  mode="date"
                  placeholder="Choose An End Date"
                  format="YYYY-MM-DD T h:mm A"
                  // minDate={startDate}
                  //maxDate={moment(startDate).add(2,"day")}
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
                      backgroundColor: endDate ? "transparent" : "#f0f0f0",

                      borderWidth: 0,
                      borderColor: "#185a9d",
                    },
                    // ... You can check the source to find the other keys.
                  }}
                  // onDateChange={setTempEndDate}
                  onDateChange={(d) => changeEndDate(d)}
                  disabled={!startDate}
                  minDate={
                    startTime == "11:00 PM"
                      ? moment(startDate.split(" ")[0] + "T00:00:00")
                          .add(1, "day")
                          .format()
                      : startDate
                  }
                />
              )}
            </View>
          </View>
        </View>
        {startTimeModal || endTimeModal ? (
          <Modal
            animationType="slide"
            transparent={true}
            //visible={addServices}
            // onRequestClose={() => {
            //   Alert.alert("Modal has been closed.");
            // }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View
                  style={{
                    // backgroundColor: "yellow",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    padding: 5,
                  }}
                >
                  {displayList.current.length > 0 ? (
                    displayList.current.map((t) => (
                      <View
                        style={{
                          // backgroundColor: "red",
                          width: "25%",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <TouchableOpacity
                          onPress={() =>
                            startTimeModal
                              ? setStartTime(t) || setStartTimeModal(false)
                              : setEndTime(t) || setEndTimeModal(false)
                          }
                          style={{
                            margin: 3,
                            // backgroundColor: "#185a9d",
                            borderWidth: 2,
                            borderColor: "#185a9d",
                            backgroundColor: "white",
                            width: "90%",
                            aspectRatio: 2 / 1,
                            borderRadius: 5,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "#185a9d",
                              fontSize: 13,
                              textAlign: "center",
                              // fontWeight: "bold",
                            }}
                          >
                            {t}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        width: "80%",
                      }}
                    >
                      <Text>
                        Sorry, there are no timings available for the chosen
                        date
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setStartTimeModal(false) || setEndTimeModal(false)
                        }
                        style={{
                          marginTop: 30,
                          // backgroundColor: "green",
                          // borderWidth: 2,
                          borderColor: "#3ea3a3",
                          backgroundColor: "#3ea3a3",
                          width: "25%",
                          aspectRatio: 2 / 1,
                          borderRadius: 5,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            // fontSize: 13,
                            textAlign: "center",
                          }}
                        >
                          Back
                        </Text>
                      </TouchableOpacity>
                      {/* <Button
                      title="Exit"
                      onPress={() =>
                        setStartTimeModal(false) || setEndTimeModal(false)
                      }
                    /> */}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Modal>
        ) : null}
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
                      selectedSection === s ? "#185a9d" : "white",
                    width: 100,
                    height: 100,
                    margin: 5,
                    alignItems: "center",
                    flexDirection: "row",
                    //elevation: 12,
                    borderWidth: 2,
                    borderColor: "#185a9d",
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
                      // name="map-marker"
                      name={sectionIcon}
                      size={40}
                      color={selectedSection === s ? "white" : "#3ea3a3"}
                    />
                    <Text
                      style={{
                        textAlign: "center",
                        color: selectedSection === s ? "white" : "#185a9d",
                        fontSize: 20,
                        textTransform: "capitalize",
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
          {showInMap ? (
            <View style={{ flexDirection: "row", width: "100%" }}>
              <TouchableOpacity
                // style={styles.cardTitle}
                onPress={() => setMapGridFlag(false)}
              >
                <Text
                  style={
                    !mapGridFlag ? styles.cardTitle : styles.cardTitleInactive
                  }
                >
                  List
                </Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18, color: "lightgray" }}> | </Text>
              <TouchableOpacity
                // style={styles.cardTitle}
                onPress={() => setMapGridFlag(true)}
              >
                <Text
                  style={
                    mapGridFlag ? styles.cardTitle : styles.cardTitleInactive
                  }
                >
                  Map
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.cardTitle}>List</Text>
          )}

          {listView === true ? (
            finalAssets.length > 0 ? (
              mapGridFlag === false ? (
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
                          selectedList === l ? "#185a9d" : "white",
                        width: 60,
                        height: 60,
                        margin: 5,
                        alignItems: "center",
                        flexDirection: "row",
                        //elevation: 12,
                        borderWidth: 2,
                        borderColor: "#185a9d",
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
                          color={selectedList === l ? "white" : "#3ea3a3"}
                        />
                        <Text
                          style={{
                            textAlign: "center",
                            color: selectedList === l ? "white" : "#185a9d",
                            fontSize: 18,
                          }}
                        >
                          {l.code}
                        </Text>
                        <Badge
                          value={
                            <MaterialCommunityIcons
                              name={
                                favoriteIds.includes(l.id)
                                  ? "heart"
                                  : "heart-outline"
                              }
                              // name={favoriteAssets.includes(l.id) ? "heart" : "plus"}
                              size={18}
                              color={
                                favoriteIds.includes(l.id)
                                  ? "#c44949"
                                  : "lightgray"
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
                            backgroundColor:
                              selectedList === l ? "#185a9d" : "white",
                            width: 25,
                            height: 25,
                            borderColor: "#185a9d",
                            borderWidth: 0,
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
                ))
              ) : showInMap === true ? (
                <MapView
                  style={{ height: 250, width: "100%" }}
                  showsUserLocation={true}
                  followsUserLocation={focus}
                  region={{
                    latitude: selectedSection.location.latitude,
                    longitude: selectedSection.location.longitude,
                    latitudeDelta: 0.002,
                    longitudeDelta: 0.002,
                  }}
                  mapType={"satellite"}
                >
                  <TouchableOpacity onPress={() => setFocus(!focus)}>
                    <Text style={{ color: "white" }}>
                      Focus is {focus ? "On" : "Off"}
                    </Text>
                  </TouchableOpacity>
                  {finalAssets.length > 0 ? (
                    finalAssets.map((l, i) => (
                      <Marker
                        onPress={() =>
                          setSelectedList(l) || setDetailsView(true)
                        }
                        key={i}
                        style={{ width: 20, height: 20 }}
                        image={
                          l.status === true
                            ? require("../../assets/images/green.jpg")
                            : require("../../assets/images/red.jpg")
                        }
                        coordinate={l.location}
                        title={`parking No.${l.name}`}
                        description={`Press here to reserve parking number ${l.description}`}
                      />
                    ))
                  ) : (
                    <Text>Loading</Text>
                  )}
                </MapView>
              ) : (
                <Text>there is no map for this item</Text>
              )
            ) : (
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
                      assetIcon={assetIcon}
                      sectionIcon={sectionIcon}
                    />

                    <Details
                      sName={selectedSection.name}
                      tName={tName}
                      asset={selectedList}
                      startDateTime={startDate}
                      endDateTime={endDate}
                      type={type}
                      navigation={props.navigation}
                      assetIcon={assetIcon}
                      sectionIcon={sectionIcon}
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

        {/* <View style={{ height: 15 }}></View> */}
      </ScrollView>
    </View>
  );
}
Sections.navigationOptions = (props) => ({
  title: "Sections",
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",
    width: Dimensions.get("window").width,
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
    // paddingBottom: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
  },
  cardTitle: {
    fontSize: 18,
    // backgroundColor: "red",
    width: "100%",
    height: 50,
    color: "#185a9d",
    fontWeight: "bold",
  },
  cardTitleInactive: {
    fontSize: 18,
    // backgroundColor: "red",
    width: "100%",
    height: 50,
    color: "#6b6b6b",
    // fontWeight: "bold",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
