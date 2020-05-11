import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import db from "../../db";

export default function CardsScreen(props) {
  const user = props.navigation.getParam("user");
  const [cards, setCards] = useState([]);

  useEffect(() => {
    getCards();
  }, []);

  const getCards = () => {
    db.collection("users")
      .doc(user.id)
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
