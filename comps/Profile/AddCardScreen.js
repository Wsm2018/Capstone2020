import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Picker } from "react-native";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import db from "../../db";
export default function AddCard(props) {
  const user = props.navigation.getParam("user");
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [cardType, setCardType] = useState("");
  const [expiryDate, setExpiryDate] = useState(moment().format("MM/YY"));
  const [cvc, setCVC] = useState("");
  const [cards, setCards] = useState([]);

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

  return (
    <View>
      <Text>Add Credit Card</Text>

      <TextInput
        placeholder="Card Number"
        value={cardNumber}
        maxLength={16}
        keyboardType="number-pad"
        onChangeText={setCardNumber}
      />
      <TextInput
        placeholder="Holder Name"
        value={holderName}
        onChangeText={setHolderName}
      />
      <Picker
        selectedValue={cardType}
        style={{ width: 200 }}
        onValueChange={(itemValue) => setCardType(itemValue)}
      >
        <Picker.Item label="Select Card Type" value="" />
        <Picker.Item label="Visa" value="visa" />
        <Picker.Item label="Amex" value="amex" />
        <Picker.Item label="Mastercard" value="mastercard" />
      </Picker>

      <DatePicker
        date={expiryDate}
        mode="date"
        androidMode="spinner"
        format="MM/YY"
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        onDateChange={(date) => setExpiryDate(date)}
      />
      <TextInput
        placeholder="CVC"
        value={cvc}
        maxLength={3}
        keyboardType="number-pad"
        onChangeText={setCVC}
      />

      <Button onPress={handleAddCard} title="Add Card" />
    </View>
  );
}
