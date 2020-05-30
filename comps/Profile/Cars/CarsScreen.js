import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from "react-native";
import db from "../../../db";
import firebase from "firebase";
import "firebase/auth";
import Car from "./Car";
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
    <Modal transparent={false} visible={props.carsModal}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <TouchableOpacity onPress={() => props.setCarsModal(false)}>
            <Text>X</Text>
          </TouchableOpacity>
        </View>
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
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <TouchableOpacity onPress={handleNavigate}>
            <Text>Add Car</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
