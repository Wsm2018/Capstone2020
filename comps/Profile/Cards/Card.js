import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";

// import { Icon } from "react-native-elements";

export default function Card(props) {
  const cardInfo = props.card;

  const handleDelete = async () => {
    const deleteCard = firebase.functions().httpsCallable("deleteCard");
    const response = await deleteCard({
      uid: firebase.auth().currentUser.uid,
      cardId: cardInfo.id,
    });
  };

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text>{cardInfo.cardNumber}</Text>
      <TouchableOpacity onPress={() => handleDelete()}>
        <Text>X</Text>
      </TouchableOpacity>
    </View>
  );
}
