import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Input, Button } from "react-native-elements";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import db from "../../../db";

export default function AddCars(props) {
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [brand, setBrand] = useState("");
  const [selectedCar, setSelectedCar] = useState([]);

  const getSelectedCar = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("cars")
      .where("isSelected", "==", true)
      .onSnapshot((query) => {
        let cars = [];
        query.forEach((doc) => {
          cars.push({ id: doc.id, ...doc.data() });
        });
        setSelectedCar([...cars]);
      });
  };

  const validateForm = () => {
    if (plate === "") {
      alert("Enter Plate Number");
      return false;
    }

    if (model === "") {
      alert("Enter Car Model");
      return false;
    }

    if (brand === "") {
      alert("Enter Car Brand");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const addCar = firebase.functions().httpsCallable("addCar");
      const response = await addCar({
        uid: firebase.auth().currentUser.uid,
        plate: plate,
        model: model,
        brand: brand,
        selectedCar: selectedCar.length,
      });
    }
  };

  return (
    <View>
      <Text>Add Car</Text>
      <Input placeholder="Car Brand" onChangeText={setBrand} value={brand} />
      <Input placeholder="Car Model" onChangeText={setModel} value={model} />
      <Input
        placeholder="Plate Number"
        onChangeText={setPlate}
        value={plate}
        keyboardType="number-pad"
      />

      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}
