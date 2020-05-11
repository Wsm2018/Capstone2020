import React, { useState } from "react";
import { View, Text, TextInput, Button, Picker } from "react-native";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
export default function AddCard(props) {
  const user = props.navigation.getParam("user");
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [cardType, setCardType] = useState("");
  const [expiryDate, setExpiryDate] = useState(moment().format("MM/YY"));
  const [cvc, setCVC] = useState("");

  const validateForm = () => {
    let validate = true;
    if (cardNumber === "") {
      alert("Enter Card Number");
      validate = false;
      return validate;
    } else {
      if (cardNumber.length < 16) {
        alert("Enter a valid card number");
        validate = false;
        return validate;
      }
    }

    if (holderName === "") {
      alert("Enter Name");
      validate = false;
      return validate;
    }

    if (cardType === "") {
      alert("Select Card Type");
      validate = false;
      return validate;
    }

    if (expiryDate === moment().format("MM/YY")) {
      alert("Enter Card Expiry Date");
      validate = false;
      return validate;
    }

    if (cvc === "") {
      alert("Enter CVC Number");
      validate = false;
      return validate;
    } else {
      if (cvc.length < 3) {
        alert("Enter a valid CVC number");
        validate = false;
        return validate;
      }
    }

    return validate;
  };

  const handleAddCard = async () => {
    if (validateForm()) {
      alert("entered");
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
