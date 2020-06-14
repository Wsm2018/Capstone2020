//@refresh restart
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Button,
  Dimensions,
} from "react-native";
import Image from "react-native-scalable-image";
import { Card } from "react-native-shadow-cards";
import * as Device from "expo-device";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
} from "react-native-responsive-dimensions";
import { AntDesign, FontAwesome } from "react-native-vector-icons";

import db from "../../db";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import LottieView from "lottie-react-native";
import DatePicker from "react-native-datepicker";
import { NavigationActions } from "react-navigation";
const { width, height } = Dimensions.get("window");
export default function Favorites({
  favoritesModal,
  setFavoritesModal,
  navigation,
  user,
}) {
  // ------------------------------------- USE STATES ---------------------------------------------
  // ------------------------------------- USE STATES ---------------------------------------------
  const [deviceType, setDeviceType] = useState(0);
  const [favoriteAssets, setFavoriteAssets] = useState([]);
  const [assetModal, setAssetModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [allBookings, setAllBookings] = useState([]);

  const [assetTypes, setAssetTypes] = useState([]);
  const [assetTypeIds, setAssetTypeIds] = useState([]);
  const [assetSections, setAssetSections] = useState([]);
  const [assetSectionIds, setAssetSectionIds] = useState([]);

  // ------------------------------------- FUNCTIONS ----------------------------------------------

  const getUserFavoriteAssets = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("favorites")
      .onSnapshot((querySnap) => {
        let assetArr = [];
        querySnap.forEach(async (doc) => {
          let assetBookings = [];
          const asset = await db.collection("assets").doc(doc.id).get();
          console.log(asset.data());
          const assets = await db
            .collection("assets")
            .doc(doc.id)
            .collection("assetBookings")
            .get();
          assets.forEach((assetBooking) => {
            assetBookings.push({ id: assetBooking.id, ...assetBooking.data() });
          });
          assetArr.push({
            id: asset.id,
            assetName: asset.data().name,
            assetSection: asset.data().assetSection,
            assetBookings: assetBookings,
          });
          if (assetArr.length === querySnap.size) {
            setFavoriteAssets([...assetArr]);
          }
        });
      });
  };
  const getDeviceType = async () => {
    const type = await Device.getDeviceTypeAsync();
    setDeviceType(type);
  };
  useEffect(() => {
    getDeviceType();
  }, []);

  const formatDate = (date) => {
    const splitDateTime = date.split("T");
    const splitTimes = splitDateTime[1].split(":");
    let hour = splitTimes[0];
    if (parseInt(hour) < 12) {
      hour = `0${hour}`;
    }
    const dateTime = `${splitDateTime[0]}T${hour}:${splitTimes[1]}:${splitTimes[2]}`;
    return new Date(dateTime);
  };

  const handleDeleteAlert = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Remove from Favorites?",
      [
        {
          text: "No",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "Yes", onPress: () => handleDeleteFavorite(id) },
      ],
      { cancelable: false }
    );
  };
  const handleDeleteFavorite = async (id) => {
    console.log("deleteddddddddddd ", id);
    const deleteFavorite = firebase.functions().httpsCallable("deleteFavorite");
    const response = await deleteFavorite({
      uid: firebase.auth().currentUser.uid,
      assetId: id,
    });
    if (response.data !== null) {
      // alert("Asset Deleteted");
      showMessage({
        message: `Favourite Deleted!`,
        description: `Item deleted from your favourites successfully!`,
        // type: "success",
        backgroundColor: "#3ea3a3",
        // duration: 2300,
      });
    }
  };

  const getAssetSections = async () => {
    db.collection("assetSections").onSnapshot((query) => {
      let assetSection = [];
      let ids = [];
      query.forEach((doc) => {
        ids.push(doc.id);
        assetSection.push({ id: doc.id, ...doc.data() });
      });
      setAssetSectionIds([...ids]);
      setAssetSections([...assetSection]);
    });
  };

  const getAssetTypes = async () => {
    db.collection("assetTypes").onSnapshot((query) => {
      let assetType = [];
      let ids = [];
      query.forEach((doc) => {
        ids.push(doc.id);
        assetType.push({ id: doc.id, ...doc.data() });
      });
      setAssetTypeIds([...ids]);
      setAssetTypes([...assetType]);
    });
  };

  const handleBooking = async () => {
    const sectionIndex = assetSectionIds.includes(selectedAsset.assetSection)
      ? assetSectionIds.indexOf(selectedAsset.assetSection)
      : -1;
    const selectedSection =
      sectionIndex !== -1 ? assetSections[sectionIndex] : null;

    const typeId = assetTypeIds.includes(selectedSection.assetType)
      ? assetTypeIds.indexOf(selectedSection.assetType)
      : -1;

    const assetType = typeId !== -1 ? assetTypes[typeId] : null;

    if (selectedAsset.assetBookings.length === 0) {
      setAssetModal(false);
      setFavoritesModal(false);
      navigation.navigate(
        "Home",
        {},
        NavigationActions.navigate({
          routeName: "Sections",
          params: {
            flag: true,
            startDate: startDate,
            endDate: endDate,
            asset: selectedAsset,
            selectedSection: selectedSection,
            assetType: assetType,
          },
        })
      );
    } else {
      const filteredArray = selectedAsset.assetBookings.filter(
        (item) =>
          formatDate(item.endDateTime.replace(/\s+/g, "")) -
            formatDate(startDate.replace(/\s+/g, "")) >
            0 &&
          formatDate(item.startDateTime.replace(/\s+/g, "")) -
            formatDate(endDate.replace(/\s+/g, "")) <
            0
      );
      if (filteredArray.length > 0) {
        alert("Asset booked within these times");
      } else {
        setAssetModal(false);
        setFavoritesModal(false);
        navigation.navigate(
          "Home",
          {},
          NavigationActions.navigate({
            routeName: "Sections",
            params: {
              flag: true,
              startDate: startDate,
              endDate: endDate,
              asset: selectedAsset,
              selectedSection: selectedSection,
              assetType: assetType,
            },
          })
        );
      }
    }
  };

  // ---------------------------------------- USE EFFECT -----------------------------------------

  useEffect(() => {
    getUserFavoriteAssets();
    getAssetSections();
    getAssetTypes();
  }, []);

  // ----------------------------------------- RETURN ---------------------------------------------

  return (
    <Modal visible={favoritesModal} transparent={true}>
      <View style={styles.centeredView2}>
        <View elevation={5} style={styles.modalView2}>
          <TouchableOpacity
            style={{
              justifyContent: "center",
              alignItems: "flex-end",
              marginEnd: 15,
              marginTop: 15,
            }}
            onPress={() => setFavoritesModal(false)}
          >
            <AntDesign
              name="close"
              size={deviceType === 1 ? 25 : 40}
              style={{ color: "#224229" }}
            />
          </TouchableOpacity>

          <View style={{ flex: 10, alignItems: "center" }}>
            {favoriteAssets.length === 0 ? (
              <View style={styles.header}>
                <LottieView
                  source={require("../../assets/17723-waitting.json")}
                  autoPlay
                  loop
                  style={{
                    position: "relative",
                    width: "80%",
                    justifyContent: "center",
                    alignSelf: "center",
                    // paddingTop: "30%",
                  }}
                />
                <Text
                  style={{
                    // paddingTop: "15%",
                    fontSize: responsiveScreenFontSize(2),
                    color: "darkgray",
                    fontWeight: "bold",
                  }}
                >
                  No Favorites
                </Text>
                <View
                  style={{
                    flex: 4,
                    // backgroundColor: "red",
                    // justifyContent: "flex-end",
                    alignItems: "flex-end",
                    flexDirection: "row-reverse",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#2E9E9B",
                      height: responsiveScreenHeight(5),
                      width: responsiveScreenWidth(40),
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 10,
                    }}
                    onPress={() => {
                      setFavoritesModal(false);
                      navigation.navigate(
                        "Home",
                        {},
                        NavigationActions.navigate("Types")
                      );
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: responsiveScreenFontSize(2),
                        color: "white",
                        // fontWeight: "bold",
                      }}
                    >
                      Add Favorites
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View
                style={{
                  // flex: 0.5,
                  flex: 0.5,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    // flex: 0.5,
                    flex: 0.2,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: "#185a9d",
                      fontWeight: "bold",
                    }}
                  >
                    My Favorites
                  </Text>
                </View>
                {favoriteAssets.map((item, index) => (
                  <View
                    width={Dimensions.get("window").width / 1.2}
                    style={{
                      flex: 1,
                      marginTop: "10%",
                      // backgroundColor: "red",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "row",
                    }}
                    key={index}
                  >
                    {/* <TouchableOpacity
                    onPress={() => handleDeleteAlert(item.asset.id)}
                  >
                    <Text>X</Text>
                  </TouchableOpacity> */}

                    {/* ================== */}

                    <Card
                      elevation={2}
                      style={{
                        // flex: 2,
                        height: 50,
                        // marginTop: "-1.5%",
                        width: "95%",
                        borderWidth: 0.5,
                        justifyContent: "center",
                        borderColor: "lightgray",
                        // flex: 0.95,
                      }}
                    >
                      {/* ============================================== */}
                      <View
                        style={{
                          // flex: 1,
                          justifyContent: "space-between",
                          alignItems: "stretch",
                          flexDirection: "row-reverse",
                          // // marginEnd: 15,
                          // backgroundColor: "yellow",

                          // marginTop: 15,
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            flexDirection: "row-reverse",
                          }}
                        >
                          <TouchableOpacity
                            style={{
                              flex: 0.2,
                              justifyContent: "center",
                              alignItems: "center",
                              marginEnd: 15,
                              // backgroundColor: "yellow",

                              // marginTop: 15,
                            }}
                            onPress={() => handleDeleteAlert(item.id)}
                          >
                            <FontAwesome
                              name="remove"
                              size={28}
                              color="#901616"
                            />
                          </TouchableOpacity>
                          {/* <Button
                    title="Book This"
                    onPress={() => {
                      setAssetModal(true);
                      setSelectedAsset(item.asset);
                    }}
                  /> */}
                          {/* -------------- */}
                          <TouchableOpacity
                            onPress={() => {
                              setAssetModal(true);
                              setSelectedAsset(item);
                            }}
                            style={{
                              backgroundColor: "#2E9E9B",
                              height: responsiveScreenHeight(4),
                              width: responsiveScreenWidth(25),
                              alignSelf: "center",
                              justifyContent: "center",
                              alignItems: "center",
                              marginEnd: 15,
                              borderRadius: 10,
                              // marginBottom: 10,
                            }}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                fontSize: responsiveScreenFontSize(2),
                                color: "white",
                              }}
                            >
                              Book Now
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <Text
                          style={{
                            fontSize: 20,
                            paddingStart: 10,
                            fontWeight: "bold",
                            color: "#185a9d",
                            // fontVariant: 4,
                            // backgroundColor: "green",
                            // backgroundColor: "blue",
                          }}
                        >
                          {item.assetName}
                        </Text>
                      </View>
                    </Card>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        <Modal transparent={true} visible={assetModal}>
          <View style={styles.centeredView1}>
            <View elevation={5} style={styles.modalView1}>
              {/* <TouchableOpacity onPress={() => setAssetModal(false)}>
                <Text>X</Text>
              </TouchableOpacity> */}

              <TouchableOpacity
                style={{
                  justifyContent: "center",
                  alignItems: "flex-end",
                  marginEnd: 15,
                  marginTop: 15,
                }}
                onPress={() => setAssetModal(false)}
              >
                <AntDesign
                  name="close"
                  size={25}
                  style={{ color: "#224229" }}
                />
              </TouchableOpacity>
              <View
                style={{
                  flex: 0.5,
                  // backgroundColor: "red",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <DatePicker
                  style={{ width: "90%" }}
                  date={startDate}
                  mode="datetime"
                  placeholder="Start Date"
                  format="YYYY-MM-DD T h:mm:ss"
                  minDate={new Date()}
                  maxDate="2022-01-01"
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  customStyles={{
                    dateInput: {
                      // marginLeft: 36,
                      // backgroundColor: "lightgray",
                      borderWidth: 1,
                    },
                    // ... You can check the source to find the other keys.
                  }}
                  onDateChange={setStartDate}
                />
              </View>
              <View
                style={{
                  flex: 0.5,
                  // backgroundColor: "green",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <DatePicker
                  style={{ width: "90%" }}
                  date={endDate}
                  mode="datetime"
                  placeholder="End Date"
                  format="YYYY-MM-DD T h:mm:ss"
                  minDate={new Date()}
                  maxDate="2022-01-01"
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  customStyles={{
                    dateInput: {
                      // marginLeft: 36,
                      // backgroundColor: "lightgray",
                      borderWidth: 1,
                    },
                  }}
                  onDateChange={setEndDate}
                />
              </View>
              <View
                style={{
                  flex: 0.4,
                  // backgroundColor: "red",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  // flexDirection: "row-reverse",
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: "#2E9E9B",
                    height: responsiveScreenHeight(4),
                    width: responsiveScreenWidth(25),
                    alignSelf: "center",
                    justifyContent: "center",
                    alignItems: "center",
                    marginEnd: 15,
                    borderRadius: 10,
                    // marginBottom: 10,
                  }}
                  // style={{ flex: 0.5, backgroundColor: "yellow" }}
                  onPress={() => handleBooking()}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 16,
                      color: "white",
                      // fontWeight: "bold",
                    }}
                  >
                    Book
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
  },

  modalView1: {
    // flex: 1,
    // margin: 20,
    height: height / 2.6,
    width: width / 1.5,
    backgroundColor: "#fff",
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    borderRadius: 20,
    // padding: 35,
    // justifyContent: "center",
    // alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  centeredView1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView2: {
    // flex: 1,
    // margin: 20,
    height: height / 1.6,
    width: width / 1.2,
    backgroundColor: "#fff",
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    borderRadius: 10,
    // padding: 35,
    // justifyContent: "center",
    // alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  centeredView2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 22,
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    // flex: 0.7,
    paddingTop: "15%",
  },
});
