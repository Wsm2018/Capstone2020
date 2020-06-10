import React, { useState, useEffect } from "react";
import { View, FlatList, Text, SafeAreaView, Button } from "react-native";
import db from "../../../db";
import Code from "./Code";
export default function PromotionList(props) {
  const [promotionCodes, setPromotionCodes] = useState([]);

  // ------------------------------------------ USE EFFECTS ---------------------------------

  useEffect(() => {
    db.collection("promotionCodes").onSnapshot((query) => {
      let codes = [];
      query.forEach((doc) => {
        codes.push({ id: doc.id, ...doc.data() });
      });
      setPromotionCodes([...codes]);
    });
    return () => {
      console.log("eh");
    };
  }, []);

  // ------------------------------------------- FUNCTION  ----------------------------------

  // --------------------------------------------- RETURN -----------------------------------
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        <Text>Promotion Codes</Text>
      </View>
      {promotionCodes.length !== 0 ? (
        <FlatList
          data={promotionCodes}
          renderItem={({ item }) => <Code item={item} />}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text>Loading...</Text>
        </View>
      )}

      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Button
          title="Add New Promotion"
          onPress={() => props.navigation.navigate("AddPromotion")}
        />
      </View>
    </SafeAreaView>
  );
}
