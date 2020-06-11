import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  Picker,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import db from "../../../db";
import { Text } from "react-native-elements";
import { Card } from "react-native-shadow-cards";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
} from "react-native-responsive-dimensions";

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ backgroundColor: "#185a9d", flex: 1, margin: 10 }}>
        <View style={{ backgroundColor: "white", flex: 1, margin: 10 }}>
          <View
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            <View
              style={{
                flex: 3,
                width: "90%",
                marginTop: "15%",
                justifyContent: "center",
              }}
            >
              <CreditCardInput
                elevation={5}
                labels={labels}
                requiresName={true}
                onChange={handleCard}
                allowScroll={true}
                // labelStyle={{ fontSize: responsiveScreenFontSize(2) }}
                inputStyle={{
                  //
                  borderBottomWidth: 1,
                  backgroundColor: "white",
                  height: responsiveScreenHeight(5.5),
                  width: responsiveScreenWidth(70),

                  fontSize: responsiveScreenFontSize(1.5),
                  paddingStart: 10,
                  // marginStart: 2,
                  // borderRadius: 5,
                  // 4796416651443066177
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
            <View
              width={Dimensions.get("screen").width}
              style={{
                flex: 1,
                // width: "30%",
                // backgroundColor: "red",

                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#2E9E9B",
                  // height: 40,
                  // width: "30%",
                  height: responsiveScreenHeight(5),
                  width: responsiveScreenWidth(30),
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
                    fontSize: responsiveScreenFontSize(2),
                    // fontWeight: "bold",
                    color: "white",
                  }}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
AddCard.navigationOptions = {
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
};
