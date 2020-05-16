import React from "react";
import { View, Text } from "react-native";

export default function Car({ car }) {
  return <Text>{car.plate}</Text>;
}
