//@refresh restart
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  SafeAreaView
} from "react-native";
import LottieView from "lottie-react-native";

import {
  Feather,
  AntDesign,
  Fontisto,
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import db from "../../db";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
const { width, height } = Dimensions.get("screen");

export default function Favorites({
  favoritesModal,
  setFavoritesModal,
  navigation,
  user,
}) {
  const [favoriteAssets, setFavoriteAssets] = useState([]);

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

  useEffect(() => {
    getUserFavoriteAssets();
  }, []);

  return (
    <Modal visible={favoritesModal} transparent={true}>
      {/* <View style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: "flex-end" }}> */}
      <SafeAreaView style={styles.centeredView}>
        <View elevation={5} style={styles.modalView}>
          <TouchableOpacity
            style={{
              // backgroundColor: "red",
              justifyContent: "center",
              alignItems: "flex-end",
              marginEnd: 15,
              marginTop: 15,
            }}
            onPress={() => setFavoritesModal(false)}
          >
            {/* <Text>X</Text> */}
            <AntDesign name="close" size={25} style={{ color: "#224229" }} />
          </TouchableOpacity>

          <View>
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
              favoriteAssets.map((item) => (
                <View>
                  <Text>{item.name} </Text>
                  <TouchableOpacity onPress={() => handleDeleteAlert(item.id)}>
                    <Text>X</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  container: {
    // flex: 1,
  },

  modalView: {
    // flex: 1,
    // margin: 20,
    height: height / 1.5,
    width: width / 1.3,
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
