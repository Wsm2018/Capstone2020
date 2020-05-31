import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from "react-native";
import Image from "react-native-scalable-image";
import { AntDesign, MaterialCommunityIcons } from "react-native-vector-icons";

import { Button, Text, Divider } from "react-native-elements";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
// import { Divider } from "react-native-elements";

import db from "../../../db";
// import { TextInput } from "react-native-gesture-handler";
const LottieView = require("lottie-react-native");

const { width, height } = Dimensions.get("screen");

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
    <View style={styles.container}>
      <View
        style={{
          flex: 1,
          marginTop: "-30%",
          // backgroundColor: "blue",
        }}
      >
        <LottieView
          width={Dimensions.get("window").width}
          source={require("../../../assets/cars.json")}
          autoPlay
        />
      </View>
      <View
        style={{
          marginTop: "-40%",
          // backgroundColor: "red",
          flex: 0.5,
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {/* <Text style={{ fontSize: 22, marginTop: "-30%" }}>
          Register your Car
        </Text> */}
        <View
          style={{
            // backgroundColor: "white",
            alignItems: "center",

            flexDirection: "row",
            paddingLeft: 6,
            width: "60%",
            borderColor: "black",
            borderWidth: 1,
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <MaterialCommunityIcons name="email" size={20} color="gray" />
          <TextInput
            style={{ height: 40, width: "80%", paddingLeft: 6 }}
            placeholder="Enter Car Brand"
            onChangeText={setBrand}
            value={brand}
          />
        </View>
        <View
          style={{
            // backgroundColor: "white",
            alignItems: "center",

            flexDirection: "row",
            paddingLeft: 6,
            width: "60%",
            borderColor: "black",
            borderWidth: 1,
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <MaterialCommunityIcons name="email" size={20} color="gray" />
          <TextInput
            style={{ height: 40, width: "80%", paddingLeft: 6 }}
            placeholder="Enter Car Model"
            // label="Car Model"
            onChangeText={setModel}
            value={model}
          />
        </View>
        <View
          style={{
            // backgroundColor: "white",
            alignItems: "center",

            flexDirection: "row",
            paddingLeft: 6,
            width: "60%",
            borderColor: "black",
            borderWidth: 1,
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <MaterialCommunityIcons name="email" size={20} color="gray" />
          <TextInput
            style={{ height: 40, width: "80%", paddingLeft: 6 }}
            placeholder="Enter Plate Number"
            onChangeText={setPlate}
            // label="Plate Number"
            value={plate}
            keyboardType="number-pad"
          />
        </View>
        {/* <TextInput
          placeholder="Enter Car Brand"
          // label="Car Brand"
          onChangeText={setBrand}
          value={brand}
        /> */}
        {/* <TextInput
          placeholder="Enter Car Model"
          // label="Car Model"
          onChangeText={setModel}
          value={model}
        /> */}
        {/* <TextInput
          placeholder="Enter Plate Number"
          onChangeText={setPlate}
          // label="Plate Number"
          value={plate}
          keyboardType="number-pad"
        /> */}
      </View>

      {/* <View
        style={{
          // backgroundColor: "blue",
          flex: 0.5,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button title="Submit" onPress={handleSubmit} />
      </View> */}

      <View
        style={{
          flex: 0.2,
          justifyContent: "center",
          alignItems: "center",
          // backgroundColor: "red",
          justifyContent: "flex-start",

          // marginVertical: 5,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#20365F",
            height: 40,
            width: "40%",
            // alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            //marginStart: "2%",
            //marginEnd: "2%",
            borderRadius: 30,
            //marginBottom: 10,
          }}
          onPress={handleSubmit}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 16,
              color: "white",
            }}
          >
            Submit
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

AddCars.navigationOptions = {
  headerStyle: { backgroundColor: "#20365F" },
  headerTintColor: "white",
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
