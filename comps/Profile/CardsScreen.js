import React, { useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import db from "../../db";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";

export default function CardsScreen(props) {
  const user = props.navigation.getParam("user");
  const [cards, setCards] = useState([]);

  useEffect(() => {
    getCards();
  }, []);

  const getCards = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("cards")
      .onSnapshot((querySnapshot) => {
        const cards = [];
        querySnapshot.forEach((doc) => {
          cards.push({ id: doc.id, ...doc.data() });
        });
        setCards([...cards]);
      });
  };

  return (
    <View>
      <Text>Cards Screen</Text>
    </View>
  );
}