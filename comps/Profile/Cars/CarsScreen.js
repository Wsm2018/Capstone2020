import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import db from "../../../db";
import firebase from "firebase";
import "firebase/auth";
import Car from "./Car";
const { width, height } = Dimensions.get("screen");

export default function CarsScreen(props) {
  const [cars, setCars] = useState([]);

  const getUserCars = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("cars")
      .onSnapshot((querySnapshot) => {
        const vehicles = [];
        querySnapshot.forEach((doc) => {
          vehicles.push({ id: doc.id, ...doc.data() });
        });
        setCars([...vehicles]);
      });
  };

  useEffect(() => {
    getUserCars();
  }, []);

  const handleNavigate = () => {
    props.setCarsModal(false);
    props.navigation.navigate("AddCars");
  };

  return (
    <Modal transparent={true} visible={props.carsModal}>
      {/* <View style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: "flex-end" }}> */}
      <View style={styles.centeredView}>
        <View elevation={5} style={styles.modalView}>
          <TouchableOpacity onPress={() => props.setCarsModal(false)}>
            <Text>X</Text>
          </TouchableOpacity>

          <View style={{ flex: 15 }}>
            {cars.length === 0 ? (
              <Text>No cars added</Text>
            ) : (
              <FlatList
                data={cars}
                renderItem={({ item }) => <Car car={item} />}
                keyExtractor={(item) => item.id}
              />
            )}
          </View>
          <View>
            <TouchableOpacity onPress={handleNavigate}>
              <Text>Add Car</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  modalView: {
    margin: 20,
    height: height / 1.5,
    width: width / 1.3,
    backgroundColor: "#fff",
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    borderRadius: 20,
    padding: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
});
