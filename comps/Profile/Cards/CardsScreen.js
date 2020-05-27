import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
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
    <View style={{ flex: 1, backgroundColor: "#f5f0f0" }}>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          // backgroundColor: "red",
          flex: 0.1,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
          }}
        >
          My Cards
        </Text>
      </View>
      <ScrollView style={{ flex: 5 }}>
        {cards.length === 0 ? (
          <Text>No Cards</Text>
        ) : (
          <FlatList
            data={cards}
            renderItem={({ item }) => <Card card={item} />}
            keyExtractor={(item) => item.id}
          />
        )}
      </ScrollView>
      {/* <View
        style={{
          flex: 0.2,
          // backgroundColor: "red",
          // height: 50,
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      > */}
      <TouchableOpacity
        style={{
          flex: 0.2,
          // backgroundColor: "red",
          // height: 50,
          justifyContent: "flex-end",
          alignItems: "center",
        }}
        // style={{ alignItems: "center", justifyContent: "center" }}
        onPress={() => props.navigation.navigate("AddCard", { user: user })}
      >
        {/* <Image
            source={require("../../../assets/images/addcard.png")}
            style={{ height: 60, width: 60 }}
          /> */}
        <Text
          style={{
            height: 60,
            // backgroundColor: "red",
            width: "60%",
            textAlign: "center",
            fontSize: 18,
            fontWeight: "bold",
            color: "gray",
          }}
        >
          + Add a New Card
        </Text>
      </TouchableOpacity>
    </View>
    // </View>
  );
}
CardsScreen.navigationOptions = {
  headerStyle: { backgroundColor: "#20365F" },
  headerTintColor: "white",
};
