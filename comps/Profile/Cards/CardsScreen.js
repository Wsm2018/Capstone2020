import React, { useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import db from "../../../db";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import Card from "./Card";

export default function CardsScreen(props) {
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
        // console.log(cards);
        setCards([...cards]);
      });
  };

  return (
    <View>
      <Text>My Credit Cards</Text>
      <FlatList
        data={cards}
        renderItem={({ item }) => <Card card={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
