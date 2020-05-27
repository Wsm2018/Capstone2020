import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
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
      .onSnapshot((querySnap) => {
        const data = querySnap.data();
        const favorites = data.favorite;
        let assetArr = [];
        favorites.map(async (item) => {
          db.collection("assets")
            .doc(item)
            .onSnapshot((doc) => {
              assetArr.push({ id: doc.id, ...doc.data() });
              if (favorites.length === assetArr.length) {
                setFavoriteAssets([...assetArr]);
              }
            });
        });
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
      <View style={styles.centeredView}>
        <View elevation={5} style={styles.modalView}>
          <TouchableOpacity onPress={() => setFavoritesModal(false)}>
            <Text>X</Text>
          </TouchableOpacity>

          <View>
            {favoriteAssets.map((item) => (
              <View>
                <Text>{item.name}</Text>
                <TouchableOpacity onPress={() => handleDeleteAlert(item.id)}>
                  <Text>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  modalView: {
    margin: 20,
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
    padding: 35,
    justifyContent: "center",
    alignItems: "center",
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
    marginTop: 22,
  },
});
