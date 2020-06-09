import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import db from "../../../db";
import { Text } from "react-native-elements";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import Card from "./Card";
import LottieView from "lottie-react-native";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
} from "react-native-responsive-dimensions";

export default function CardsScreen(props) {
  const user = props.navigation.getParam("user", "No param");
  const [cards, setCards] = useState(null);

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
    <View style={{ flex: 1, backgroundColor: "#e3e3e3" }}>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 0.2,
        }}
      ></View>
      <View style={{ flex: 5 }}>
        <ScrollView>
          {cards && cards.length === 0 ? (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <LottieView
                source={require("../../../assets/17723-waitting.json")}
                autoPlay
                loop
                style={{
                  position: "relative",
                  width: "100%",
                }}
              />
              <Text
                style={{
                  // paddingTop: "15%",
                  fontSize: 20,
                  color: "gray",
                  fontWeight: "bold",
                }}
              >
                No Cards
              </Text>
            </View>
          ) : (
            <FlatList
              data={cards}
              renderItem={({ item }) => <Card card={item} />}
              keyExtractor={(item) => item.id}
            />
          )}
        </ScrollView>
      </View>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          // backgroundColor: "red",
          justifyContent: "center",
        }}
      >
        <TouchableOpacity
          style={{
            // flex: 0.2,
            backgroundColor: "#20365F",
            height: responsiveScreenHeight(7),
            width: responsiveScreenWidth(40),
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",

            borderRadius: 10,
            marginBottom: 10,
          }}
          onPress={() => props.navigation.navigate("AddCard", { user: user })}
        >
          <Text
            style={{
              // height: 60,
              // backgroundColor: "red",
              // width: "60%",
              textAlign: "center",
              fontSize: responsiveScreenFontSize(2),
              // fontWeight: "bold",
              color: "white",
            }}
          >
            + Add a New Card
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    // </View>
  );
}
CardsScreen.navigationOptions = {
  headerStyle: { backgroundColor: "#20365F" },
  headerTintColor: "white",
};
