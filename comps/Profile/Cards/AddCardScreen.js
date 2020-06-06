import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  Picker,
  Image,
  TouchableOpacity,
} from "react-native";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import db from "../../../db";
import { Text } from "react-native-elements";
import { Card } from "react-native-shadow-cards";

import { CreditCardInput } from "react-native-credit-card-input";
// import { TouchableOpacity } from "react-native-gesture-handler";
// import { ScrollView } from "react-native-gesture-handler";
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
    console.log(cardNumber, holderName, cardType, expiryDate, cvc);
    if (validateForm()) {
      const addCard = firebase.functions().httpsCallable("addCard");
      const response = await addCard({
        uid: firebase.auth().currentUser.uid,
        cardInfo: { cardNumber, holderName, cardType, expiryDate, cvc },
      });
      if (response.data !== null) {
        alert("Card Added");
        props.navigation.goBack();
      }
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

  return (
    <View
      style={{
        flex: 1,
        // backgroundColor: "lightgray",
        // flexDirection: "column",
        // flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        // marginTop: "5%",
        // marginBottom: "10%",
      }}
    >
      <View
        style={{
          flex: 3,
          marginTop: "35%",

          width: "90%",
        }}
      >
        <CreditCardInput
          // elevation={5}
          labels={labels}
          requiresName={true}
          onChange={handleCard}
          allowScroll={true}
          // labelStyle={{ textAlign: "center" }}
          inputStyle={{
            borderWidth: 1,
            backgroundColor: "white",
            height: 50,
            // marginStart: 2,
            // borderRadius: 5,
            textAlign: "center",
          }}
          inputContainerStyle={
            {
              // marginTop: 60,
            }
          }
          labelStyle={{ color: "gray" }}
          cardImageFront={require("../../../assets/images/dark1.jpg")}
          cardImageBack={require("../../../assets/images/dark2.png")}
        />
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: "#20365F",
          height: 40,
          width: "30%",
          alignSelf: "center",
          justifyContent: "center",
          alignItems: "center",

          borderRadius: 10,
          marginBottom: 10,
        }}
        onPress={handleAddCard}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 18,
            // fontWeight: "bold",
            color: "white",
          }}
        >
          Save
        </Text>
      </TouchableOpacity>
    </View>
  );
}
AddCard.navigationOptions = {
  headerStyle: { backgroundColor: "#20365F" },
  headerTintColor: "white",
};
