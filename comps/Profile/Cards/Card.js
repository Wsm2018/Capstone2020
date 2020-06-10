import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import Image from "react-native-scalable-image";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
} from "react-native-responsive-dimensions";
import * as Device from "expo-device";
const { width, height } = Dimensions.get("screen");

import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import { Divider, Card as Cards } from "react-native-elements";
import { Octicons } from "@expo/vector-icons";

export default function Card(props) {
  const [deviceType, setDeviceType] = useState(0);

  const cardInfo = props.card;
  const images = [
    require("../../../assets/images/creditcards/visa.png"),
    require("../../../assets/images/creditcards/mastercard.png"),
    require("../../../assets/images/creditcards/amex.png"),
    require("../../../assets/images/creditcards/discover.png"),
    require("../../../assets/images/creditcards/diners.png"),
    require("../../../assets/images/creditcards/jcb.png"),
  ];
  console.log(cardInfo);

  const handleDelete = async () => {
    const deleteCard = firebase.functions().httpsCallable("deleteCard");
    const response = await deleteCard({
      uid: firebase.auth().currentUser.uid,
      cardId: cardInfo.id,
    });
    if (response.data !== null) {
      alert("Card removed");
    }
  };
  const getDeviceType = async () => {
    const type = await Device.getDeviceTypeAsync();
    setDeviceType(type);
  };

  // ------------------------------------------------------ USE EFFECTS -------------------------------------------------
  useEffect(() => {
    getDeviceType();
  }, []);

  const handleDeleteAlert = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete ?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => handleDelete() },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.two}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "height" : "padding"}
          style={{ flex: 1 }}
        >
          <Cards
            width={Dimensions.get("window").width / 1.3}
            containerStyle={styles.card}
          >
            <View
              style={{
                marginBottom: 10,
                flexDirection: "row-reverse",
                justifyContent: "space-between",
              }}
            >
              {cardInfo && cardInfo.cardType === "visa" ? (
                <Image
                  source={images[0]}
                  width={Dimensions.get("window").width / 8}
                />
              ) : cardInfo && cardInfo.cardType === "master-card" ? (
                <Image
                  source={images[1]}
                  width={Dimensions.get("window").width / 8}
                />
              ) : cardInfo && cardInfo.cardType === "american-express" ? (
                <Image
                  source={images[2]}
                  width={Dimensions.get("window").width / 8}
                />
              ) : cardInfo && cardInfo.cardType === "discover" ? (
                <Image
                  source={images[3]}
                  width={Dimensions.get("window").width / 8}
                />
              ) : cardInfo && cardInfo.cardType === "diners-club" ? (
                <Image
                  source={images[4]}
                  width={Dimensions.get("window").width / 8}
                />
              ) : cardInfo && cardInfo.cardType === "jcb" ? (
                <Image source={images[5]} />
              ) : null}

              <TouchableOpacity onPress={() => handleDeleteAlert()}>
                <Octicons
                  name="trashcan"
                  size={deviceType === 1 ? 23 : 40}
                  color="#ede9eb"
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Image
                width={Dimensions.get("window").width / 9}
                source={require("../../../assets/images/chip.png")}
              />
              <Text style={styles.time}>{cardInfo && cardInfo.cardNumber}</Text>
            </View>

            <Divider
              style={{ backgroundColor: "#dfe6e9", marginVertical: 10 }}
            />

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.notes}>
                {cardInfo && cardInfo.holderName}
              </Text>
              <Text style={styles.notes}>
                {cardInfo && cardInfo.expiryDate}
              </Text>
            </View>
          </Cards>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#20365F",
    borderWidth: 0,
    borderRadius: 20,
  },

  time: {
    fontSize: responsiveScreenFontSize(2.5),
    color: "white",
  },
  notes: {
    fontSize: responsiveScreenFontSize(2),
    color: "white",
    textTransform: "capitalize",
  },
  two: {
    alignItems: "center",
    width: "100%",
  },
});

Card.navigationOptions = {
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
};
