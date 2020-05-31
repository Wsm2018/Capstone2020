//@refresh restart
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  Button,
  Dimensions,
} from "react-native";
import { AntDesign, MaterialCommunityIcons } from "react-native-vector-icons";

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
      "Are you sure you want to remove this asset ?",
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

          <View style={{ flex: 10 }}>
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
                    paddingTop: "15%",
                    fontSize: 20,
                    color: "darkred",
                    fontWeight: "bold",
                  }}
                >
                  No Favorites
                </Text>
              </View>
            ) : (
              favoriteAssets.map((item, index) => (
                <View key={index}>
                  <Text>{item.asset.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteAlert(item.asset.id)}
                  >
                    <Text>X</Text>
                  </TouchableOpacity>
                  <Button
                    title="Book This"
                    onPress={() => {
                      setAssetModal(true);
                      setSelectedAsset(item.asset);
                    }}
                  />
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
              <View>
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
              <View>
                <DatePicker
                  style={{ width: "100%" }}
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
                      borderWidth: 0,
                    },
                  }}
                  onDateChange={setEndDate}
                />
              </View>
              <Button title="Book" onPress={handleBooking} />
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
    height: height / 1.2,
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
