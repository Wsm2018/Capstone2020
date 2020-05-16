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
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(0);

  const getCars = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("cars")
      .onSnapshot((query) => {
        let car = [];
        query.forEach((doc) => {
          car.push({ id: doc.id, ...doc.data() });
        });
        setCars([...car]);
      });
  };

  const getSelectedCar = async () => {
    const carRef = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("cars")
      .where("isSelected", "==", true)
      .get();
    const carSelected = carRef.docs.length;
    setSelectedCar(carSelected);
  };

  useEffect(() => {
    getCars();
    getSelectedCar();
  }, []);

  const validateForm = () => {
    if (brand === "") {
      alert("Enter Car Brand");
      return false;
    }
    if (model === "") {
      alert("Enter Car Model");
      return false;
    }
    if (plate === "") {
      alert("Enter Plate Number");
      return false;
    }

    cars.map((item) => {
      if (
        item.plate === plate &&
        item.brand === brand &&
        item.model === model
      ) {
        alert("Car already exists");
        return false;
      }
    });

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
        selectedCar: selectedCar,
      });
      if (response) {
        alert("Successfully Added");
        props.navigation.goBack();
      }
    } else {
      alert("Fix the fields");
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
