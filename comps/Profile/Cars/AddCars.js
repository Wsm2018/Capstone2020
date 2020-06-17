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
// import { Dimensions } from "react-native";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
} from "react-native-responsive-dimensions";
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
  // const [plate, setPlate] = useState("");
  const [showPlateErr, setShowPlateErr] = useState(false);
  const [plateErr, setPlateErr] = useState("");

  // const [model, setModel] = useState("");
  const [showModelErr, setShowModelErr] = useState(false);
  const [modelErr, setModelErr] = useState("");

  // const [brand, setBrand] = useState("");
  const [showBrandErr, setShowBrandErr] = useState(false);
  const [brandErr, setBrandErr] = useState("");

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
      setBrandErr("* Enter brand");
      setShowBrandErr(true);
    } else if (brand.charAt(0) === " ") {
      setBrandErr("* Invalid Brand");
      setShowBrandErr(true);
    }

    if (model === "") {
      setModelErr("* Enter Model");
      setShowModelErr(true);
    } else if (model.charAt(0) === " ") {
      setModelErr("* Enter Model");
      setShowModelErr(true);
    }

    if (plate === "") {
      setPlateErr("* Enter Plate Number");
      setShowPlateErr(true);
    } else {
      if (plate.length < 3) {
        setPlateErr("* Invalid Plate Number");
        setShowPlateErr(true);
      }
      if (plate.charAt(0) === " ") {
        setPlateErr("* Invalid Plate Number");
        setShowPlateErr(true);
      }
    }

    cars.map((item) => {
      if (
        item.plate === plate &&
        item.brand === brand &&
        item.model === model
      ) {
        setPlateErr("* Car already exists");
        setShowPlateErr(true);
        setModelErr("* Car already exists");
        setShowModelErr(true);
        setBrandErr("* Car already exists");
        setShowBrandErr(true);
      }
    });

    if (!showBrandErr && !showModelErr && !showPlateErr) {
      return false;
    } else {
      return true;
    }
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
      <View style={{ backgroundColor: "#185a9d", flex: 1, margin: 10 }}>
        <View style={{ backgroundColor: "#e3e3e3", flex: 1, margin: 10 }}>
          <View
            style={{
              flex: 1,

              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                flex: 1,

                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: responsiveScreenFontSize(2.2),
                  color: "#185a9d",
                  textAlign: "center",
                  fontWeight: "bold",
                  textTransform: "capitalize",
                }}
              >
                Fill in your car details
              </Text>
            </View>

            <View style={{ marginBottom: "5%" }}>
              <View
                style={{
                  backgroundColor: "white",
                  alignItems: "center",

                  flexDirection: "column",

                  borderColor: "black",
                  borderWidth: 1,
                  borderRadius: 5,
                  marginBottom: "5%",
                }}
              >
                <TextInput
                  width={Dimensions.get("window").width / 1.5}
                  style={{
                    height: responsiveScreenHeight(5),
                    paddingLeft: 6,
                    fontSize: responsiveScreenFontSize(2),
                  }}
                  placeholder="Enter Car Brand"
                  onChangeText={setBrand}
                  value={brand}
                />
              </View>
              {showBrandErr ? (
                <Text style={{ color: "red" }}>{brandErr}</Text>
              ) : null}
            </View>
            <View style={{ marginBottom: "5%" }}>
              <View
                style={{
                  backgroundColor: "white",
                  alignItems: "center",

                  flexDirection: "column",

                  borderColor: "black",
                  borderWidth: 1,
                  borderRadius: 5,
                  marginBottom: "5%",
                }}
              >
                <TextInput
                  width={Dimensions.get("window").width / 1.5}
                  style={{
                    height: responsiveScreenHeight(5),
                    paddingLeft: 6,
                    fontSize: responsiveScreenFontSize(2),
                  }}
                  placeholder="Enter Car Model"
                  onChangeText={setModel}
                  value={model}
                />
              </View>
              {showModelErr ? (
                <Text style={{ color: "red" }}>{modelErr}</Text>
              ) : null}
            </View>
            <View style={{ marginBottom: "5%" }}>
              <View
                style={{
                  backgroundColor: "white",
                  alignItems: "center",

                  flexDirection: "column",

                  borderColor: "black",
                  borderWidth: 1,
                  borderRadius: 5,
                  marginBottom: "5%",
                }}
              >
                <TextInput
                  width={Dimensions.get("window").width / 1.5}
                  style={{
                    height: responsiveScreenHeight(5),
                    paddingLeft: 6,
                    fontSize: responsiveScreenFontSize(2),
                  }}
                  placeholder="Enter Plate Number"
                  onChangeText={setPlate}
                  // label="Plate Number"
                  value={plate}
                  maxLength={6}
                  keyboardType="number-pad"
                />
              </View>
            </View>
            {showPlateErr ? (
              <Text style={{ color: "red" }}>{plateErr}</Text>
            ) : null}
          </View>

          <View
            style={{
              flex: 0.5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#2E9E9B",
                height: responsiveScreenHeight(5),
                width: responsiveScreenWidth(40),
                alignSelf: "center",
                justifyContent: "center",
                alignItems: "center",

                borderRadius: 10,
                marginBottom: 10,
              }}
              onPress={handleSubmit}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: responsiveScreenFontSize(2),
                  color: "white",
                }}
              >
                Submit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

AddCars.navigationOptions = {
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
};
const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#e3e3e3",
  },
});
