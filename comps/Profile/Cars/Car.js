// import React from "react";
import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Alert,
  PixelRatio,
} from "react-native";
// import { Octicons } from "@expo/vector-icons";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import { Dimensions } from "react-native";
import Image from "react-native-scalable-image";
import { Divider, Card as Cards } from "react-native-elements";
import { AntDesign } from "@expo/vector-icons";
// import { ScrollView } from "react-native-gesture-handler";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
} from "react-native-responsive-dimensions";

export default function Car({ car }) {
  const [deviceType, setDeviceType] = useState(0);
  const size = PixelRatio.getPixelSizeForLayoutSize(140);
  const handleConfirmation = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to remove this car? ",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => handleRemoveCar() },
      ],
      { cancelable: false }
    );
  };
  const handleRemoveCar = async () => {
    const deleteCar = firebase.functions().httpsCallable("deleteCar");
    const response = await deleteCar({
      uid: firebase.auth().currentUser.uid,
      carId: car.id,
    });
  };
  const getDeviceType = async () => {
    const type = await Device.getDeviceTypeAsync();
    setDeviceType(type);
  };
  useEffect(() => {
    getDeviceType();
  }, []);
  return (
    <View style={styles.container}>
      <Cards containerStyle={styles.card}>
        <Image
          width={Dimensions.get("window").width / 1.5}
          source={require("../../../assets/images/Qatar.png")}
        />

        <View
          style={{
            flex: 1,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            // marginTop: "10%",
          }}
        >
          <View
            width={Dimensions.get("window").width / 1.5}
            style={{
              flex: 1,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              // justifyContent: "center",
              // alignItems: "flex-end",
              // marginTop: "-12%",
              // marginEnd: "-3%",
            }}
          >
            <TouchableOpacity
              style={{ alignItems: "flex-end" }}
              onPress={handleConfirmation}
            >
              {/* <Text style={styles.notes}>X</Text> */}

              {deviceType === 1 ? (
                <AntDesign
                  name="closesquare"
                  size={30}
                  style={{ color: "black" }}
                />
              ) : (
                <AntDesign
                  name="closesquare"
                  size={50}
                  style={{ color: "black" }}
                />
              )}
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: "15%", alignItems: "center" }}>
            <Text
              style={
                deviceType === 1
                  ? { ...styles.plate, fontSize: responsiveScreenFontSize(2) }
                  : {
                      ...styles.plate,
                      fontSize: responsiveScreenFontSize(3.5),
                    }
              }
            >
              {car.plate}
            </Text>
          </View>
        </View>
      </Cards>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  card: {
    borderWidth: 0,
    borderRadius: 20,
    // width: "100%",
  },

  notes: {
    fontSize: 18,
    color: "black",
    textTransform: "capitalize",
  },
  notes2: {
    fontSize: 20,
    color: "black",
    textAlign: "center",
    textTransform: "capitalize",
  },
  plate: {
    fontSize: 40,
    color: "black",
    textAlign: "center",
    fontWeight: "bold",
    textTransform: "capitalize",
  },
});
