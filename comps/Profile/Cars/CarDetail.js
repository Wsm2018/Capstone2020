import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";

export default function CarDetail({ navigation }) {
  return (
    <View>
      <Text> Selected Car </Text>

      <Button
        title="View All Cars"
        onPress={() =>
          navigation.navigate("AllCars", {
            user: navigation.getParam("user", "No params"),
          })
        }
      />

      <Button
        title="Add Car"
        onPress={() =>
          navigation.navigate("AddCars", {
            user: navigation.getParam("user", "No params"),
          })
        }
      />
    </View>
  );
}
