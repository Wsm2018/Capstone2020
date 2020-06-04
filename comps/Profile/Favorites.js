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

  const [favoriteAssets, setFavoriteAssets] = useState([]);
  const [assetModal, setAssetModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [allBookings, setAllBookings] = useState([]);

  // ------------------------------------- FUNCTIONS ----------------------------------------------

  const getUserFavoriteAssets = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("favorites")
      .onSnapshot((querySnap) => {
        let favorites = [];
        querySnap.forEach((document) => {
          favorites.push({ id: document.id, ...document.data() });
        });
        setFavoriteAssets([...favorites]);
      });
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
    // console.log(id);
    const deleteFavorite = firebase.functions().httpsCallable("deleteFavorite");
    const response = await deleteFavorite({
      uid: firebase.auth().currentUser.uid,
      assetId: id,
    });
    if (response.data !== null) {
      alert("Asset Deleteted");
    }
  };

  // const getAssetBookings = () => {
  //   db.collection("asset")
  //     .doc(selectedAsset.id)
  //     .collection("assetBookings")
  //     .onSnapshot((querySnap) => {
  //       let bookings = [];
  //       querySnap.forEach((doc) => {
  //         bookings.push({ id: doc.id, ...doc.data() });
  //       });
  //       setAllBookings([...bookings]);
  //     });
  // };

  const handleBooking = () => {
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
          },
        })
      );
    }
  };

  // ---------------------------------------- USE EFFECT -----------------------------------------

  useEffect(() => {
    getUserFavoriteAssets();
  }, []);

  // useEffect(() => {
  //   if (selectedAsset) {
  //     getAssetBookings();
  //   }
  // }, [selectedAsset]);

  // ----------------------------------------- RETURN ---------------------------------------------

  return (
    <Modal visible={favoritesModal} transparent={true}>
      {/* <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <TouchableOpacity onPress={() => setFavoritesModal(false)}>
            <Text>X</Text>
          </TouchableOpacity> */}

      <View style={styles.centeredView2}>
        <View elevation={5} style={styles.modalView2}>
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
            onPress={() => setFavoritesModal(false)}
          >
            <AntDesign name="close" size={25} style={{ color: "#224229" }} />
          </TouchableOpacity>

          <View style={{ flex: 10, alignItems: "center" }}>
            <Text
              style={{
                // paddingTop: "15%",

                fontSize: 20,
                color: "darkred",
                fontWeight: "bold",
              }}
            >
              My Favorites
            </Text>
            {favoriteAssets.length === 0 ? (
              <View style={styles.header}>
                <LottieView
                  source={require("../../assets/872-empty-list.json")}
                  autoPlay
                  loop
                  style={{
                    position: "relative",
                    width: "100%",
                  }}
                />
                <Text
                  style={{
                    // paddingTop: "15%",
                    fontSize: 20,
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
                      backgroundColor: "#20365F",
                      // borderWidth: 4,
                      height: 40,
                      width: "40%",
                      // alignSelf: "center",
                      justifyContent: "center",
                      alignItems: "center",
                      //marginStart: "2%",
                      //marginEnd: "2%",
                      borderRadius: 15,
                      //marginBottom: 10,
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
                        fontSize: 16,
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
              favoriteAssets.map((item, index) => (
                <View
                  width={Dimensions.get("window").width / 1.2}
                  style={{
                    flex: 0.1,
                    marginTop: "5%",
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
                            // marginEnd: 15,
                            // backgroundColor: "yellow",

                            // marginTop: 15,
                          }}
                          onPress={() => handleDeleteAlert(item.asset.id)}
                        >
                          <FontAwesome
                            name="remove"
                            size={24}
                            color="darkgray"
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
                            setSelectedAsset(item.asset);
                          }}
                          style={{
                            flex: 0.4,

                            // position: "relative",
                            // width: "100%",
                            // flex: 1,
                            // height: "100%",
                            // backgroundColor: "blue",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Image
                            width={Dimensions.get("window").width / 5}
                            source={require("../../assets/images/bookit2.png")}
                            autoPlay
                            // onPress={() => setCarsModal(true)}
                            // loop
                            style={
                              {
                                // position: "relative",
                                // width: "70%",
                                // height: "75%",
                                // flex: 1,
                                // backgroundColor: "blue",
                                // justifyContent: "center",
                                // alignItems: "center",
                                // paddingTop: "5%",
                              }
                            }
                          />
                        </TouchableOpacity>
                      </View>
                      <Text
                        style={{
                          fontSize: 20,
                          paddingStart: 10,
                          fontWeight: "bold",
                          color: "#20365F",
                          // fontVariant: 4,
                          // backgroundColor: "green",
                          // backgroundColor: "blue",
                        }}
                      >
                        {item.asset.name}
                      </Text>
                    </View>
                  </Card>
                </View>
              ))
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
                    flex: 0.5,
                    backgroundColor: "#20365F",
                    // borderWidth: 4,
                    // height: 20,
                    width: "40%",
                    // alignSelf: "center",
                    justifyContent: "center",
                    alignItems: "center",
                    //marginStart: "2%",
                    //marginEnd: "2%",
                    borderRadius: 10,
                    //marginBottom: 10,
                  }}
                  // style={{ flex: 0.5, backgroundColor: "yellow" }}
                  onPress={() => handleBooking()}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 16,
                      color: "white",
                      fontWeight: "bold",
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
    height: height / 1.3,
    width: width / 1.2,
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
