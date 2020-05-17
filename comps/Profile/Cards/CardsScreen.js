import React, { useState, useEffect } from "react";
import { View, FlatList, TouchableOpacity, Image } from "react-native";
import db from "../../../db";
import { Text } from "react-native-elements";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import Card from "./Card";

export default function CardsScreen(props) {
  const user = props.navigation.getParam("user", "No param");
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
  // 5190767138616175

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{ alignItems: "center", justifyContent: "center", flex: 0.3 }}
      >
        <Text h4>My Credit Cards</Text>
      </View>

      {cards.length === 0 ? (
        <Text>No Cards</Text>
      ) : (
        <FlatList
          data={cards}
          renderItem={({ item }) => <Card card={item} />}
          keyExtractor={(item) => item.id}
        />
      )}
      <View
        style={{
          flex: 1,
          // backgroundColor: "#20365F",
          // height: 50,
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={() => props.navigation.navigate("AddCard", { user: user })}
        >
          <Image
            source={require("../../../assets/images/addcard.png")}
            style={{ height: 60, width: 60 }}
          />
          <Text
            style={{
              textAlign: "center",
              fontSize: 16,
              fontWeight: "bold",
              color: "#20365F",
            }}
          >
            Add Credit Card
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
