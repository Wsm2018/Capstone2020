import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Picker, Image } from "react-native";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import db from "../../../db";
import { Text } from "react-native-elements";
import { Card } from "react-native-shadow-cards";

import { CreditCardInput } from "react-native-credit-card-input";
import { ScrollView } from "react-native-gesture-handler";
export default function AddCard(props) {
  const user = props.navigation.getParam("user");
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [cardType, setCardType] = useState("");
  const [expiryDate, setExpiryDate] = useState(moment().format("MM/YY"));
  const [cvc, setCVC] = useState("");
  const [cards, setCards] = useState([]);
  const labels = {
    number: "CARD NUMBER",
    expiry: "EXPIRY",
    name: "NAME",
    cvc: "CVC",
  };
  const placeHolders = {
    number: "1234 5678 1234 5678",
    name: "NAME",
    expiry: "MM/YY",
    cvc: "CVC",
  };

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
          let data = doc.data();
          cards.push(data.cardNumber);
        });
        setCards([...cards]);
      });
  };

  const validateForm = () => {
    if (cardNumber === "") {
      alert("Enter Card Number");
      return false;
    } else {
      if (cardNumber.length < 16) {
        alert("Enter a valid card number");
        return false;
      }
    }

    if (holderName === "") {
      alert("Enter Name");
      return false;
    }

    if (cardType === "") {
      alert("Select Card Type");
      return false;
    }

    if (expiryDate === moment().format("MM/YY")) {
      alert("Enter Card Expiry Date");
      return false;
    }

    if (cvc === "") {
      alert("Enter CVC Number");
      validate = false;
      return false;
    } else {
      if (cvc.length < 3) {
        alert("Enter a valid CVC number");
        return false;
      }
    }

    if (cards.includes(cardNumber)) {
      alert("Card already exists");
      return false;
    }

    return true;
  };

  const handleAddCard = async () => {
    if (validateForm()) {
      const addCard = firebase.functions().httpsCallable("addCard");
      const response = await addCard({
        uid: firebase.auth().currentUser.uid,
        cardInfo: { cardNumber, holderName, cardType, expiryDate, cvc },
      });
    }
  };

  const handleCard = (form) => {
    console.log(form);
    if (
      form.status.cvc === "valid" &&
      form.status.expiry === "valid" &&
      form.status.name === "valid" &&
      form.status.number === "valid"
    ) {
      setCVC(form.values.cvc);
      setCardNumber(form.values.number);
      setHolderName(form.values.name);
      setExpiryDate(form.values.expiry);
      setCardType(form.values.type);
    }
  };
  //4025559100622727

  return (
    <View style={{ flex: 1, flexDirection: "column", flexWrap: "wrap" }}>
      <Text h4 style={{ alignItems: "center" }}>
        Add Credit Card
      </Text>
      <ScrollView
        style={{
          flex: 3,
          // backgroundColor: "red",
          // width: "90%",
        }}
      >
        <CreditCardInput
          labels={labels}
          requiresName={true}
          onChange={handleCard}
          allowScroll={true}
          labelStyle={{ textAlign: "center" }}
          inputStyle={{
            borderBottomWidth: 2,
            borderRadius: 5,
            textAlign: "center",
          }}
          inputContainerStyle={{
            marginTop: 20,
          }}
          labelStyle={{ color: "gray" }}
          cardImageFront={require("../../../assets/images/dark1.jpg")}
          cardImageBack={require("../../../assets/images/dark2.png")}
        />
      </ScrollView>

      <Button onPress={handleAddCard} title="Add Card" />
    </View>
  );
}
