import React from "react";
import { View, Text, Button } from "react-native";
import moment from "moment";
import db from "../../../db";
import firebase from "firebase";
import "firebase/functions";
export default function Code(props) {
  const promotion = props.item;
  // console.log("promotion ", new Date(promotion.expiryDate.toDate()));
  // console.log(new Date(promotion.expiryDate.toDate()) - new Date());

  // ---------------------------------- FUNCTIONS --------------------------------------------

  const handleDelete = async () => {
    if (new Date(promotion.expiryDate.toDate()) - new Date() < 0) {
      const deletePromotion = firebase
        .functions()
        .httpsCallable("deletePromotion");
      const response = await deletePromotion({ id: promotion.id });
      console.log(response);
      if (response.data) {
        alert("Promotion Removed");
      }
    } else {
      alert("Promotion still going on");
    }
  };

  // ---------------------------------- RETURN -----------------------------------------

  return (
    <View style={{ borderWidth: 1 }}>
      <Text>Code</Text>
      <Text>{promotion.code}</Text>

      <Text>Expiry Date</Text>
      <Text>{moment(promotion.expiryDate.toDate()).format("YYYY/MM/DD")}</Text>

      <Text>Percentage</Text>
      <Text>{promotion.percentage}</Text>

      <Button title="Delete" onPress={() => handleDelete()} />
    </View>
  );
}
