import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, Alert } from "react-native";
import db from "../../db";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
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
    <Modal visible={favoritesModal} transparent={false}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <TouchableOpacity onPress={() => setFavoritesModal(false)}>
            <Text>X</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 10 }}>
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
    </Modal>
  );
}
