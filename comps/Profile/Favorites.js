//@refresh restart
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
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
    <Modal visible={favoritesModal} transparent={false}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <TouchableOpacity onPress={() => setFavoritesModal(false)}>
            <Text>X</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 10 }}>
          {favoriteAssets.length === 0 ? (
            <Text>No Fav</Text>
          ) : (
            favoriteAssets.map((item, index) => (
              <View key={index}>
                <Text>{item.asset.name}</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteAlert(item.asset.id)}
                >
                  <Text>X</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
