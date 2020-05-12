import React, { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
import db from "../../db";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";

export default function BalanceScreen({ user, navigation }) {
  return (
    <View>
      <Text>Current Balance</Text>
      <Text>{user.balance}QR</Text>
      <Button
        title="Add Credit Card"
        onPress={() => navigation.navigate("AddCard", { user: user })}
      />

      <Button
        title="My Credit Cards"
        onPress={() => navigation.navigate("Cards", { user: user })}
      />
    </View>
  );
}
