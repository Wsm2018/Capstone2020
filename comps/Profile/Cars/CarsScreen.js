import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";
import LottieView from "lottie-react-native";

import {
  Feather,
  AntDesign,
  Fontisto,
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import db from "../../../db";
import firebase from "firebase";
import "firebase/auth";
import Car from "./Car";
// import { ScrollView } from "react-native-gesture-handler";
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
      <SafeAreaView style={styles.centeredView}>
        <View elevation={5} style={styles.modalView}>
          <TouchableOpacity
            style={{
              justifyContent: "center",
              alignItems: "flex-end",
              marginEnd: 15,
              marginTop: 15,
            }}
            onPress={() => props.setCarsModal(false)}
          >
            <AntDesign name="close" size={25} style={{ color: "#224229" }} />
          </TouchableOpacity>

          <View
            style={{
              flex: 5,
              // borderColor: "black",
              // borderBottomWidth: 2,
            }}
          >
            <ScrollView>
              {cars.length === 0 ? (
                <View style={styles.header}>
                  <LottieView
                    source={require("../../../assets/17723-waitting.json")}
                    autoPlay
                    loop
                    style={{
                      position: "relative",
                      width: "80%",
                      justifyContent: "center",
                      alignSelf: "center",
                      // paddingTop: "30%",
                    }}
                  />
                  <Text
                    style={{
                      // paddingTop: "15%",
                      fontSize: 20,
                      color: "darkgray",
                      fontWeight: "bold",
                    }}
                  >
                    No vehicles
                  </Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.title}> My Vehicles</Text>

                  <FlatList
                    data={cars}
                    renderItem={({ item }) => <Car car={item} />}
                    keyExtractor={(item) => item.id}
                  />
                </View>
              )}
            </ScrollView>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              // backgroundColor: "red",
              justifyContent: "center",
            }}
          >
            {/* <TouchableOpacity
              style={{
                flex: 0.4,
              }}
              onPress={handleNavigate}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "gray",
                }}
              >
                + Add a New Vehicle
              </Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={{
                // flex: 0.2,
                backgroundColor: "#20365F",
                height: 40,
                width: "50%",
                alignSelf: "center",
                justifyContent: "center",
                alignItems: "center",
                // marginStart: "2%",
                // marginEnd: "2%",
                borderRadius: 10,
                marginBottom: 10,
              }}
              // style={{ alignItems: "center", justifyContent: "center" }}
              onPress={handleNavigate}
            >
              {/* <Image
            source={require("../../../assets/images/addcard.png")}
            style={{ height: 60, width: 60 }}
          /> */}
              <Text
                style={{
                  // height: 60,
                  // backgroundColor: "red",
                  // width: "60%",
                  textAlign: "center",
                  fontSize: 18,
                  // fontWeight: "bold",
                  color: "white",
                }}
              >
                + New Vehicle
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  modalView: {
    // flexDirection:
    // flex: 1,
    // margin: 20,
    height: height / 1.5,
    width: width / 1.2,
    backgroundColor: "#fff",
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    borderRadius: 20,
    // padding: 35,
    // justifyContent: "center",
    // alignItems: "center",
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
  header: {
    justifyContent: "center",
    alignItems: "center",
    // flex: 0.7,
    paddingTop: "15%",
  },
  title: {
    // alignItems: "flex-end",
    fontSize: 20,
    color: "#229277",
    textAlign: "center",
    fontWeight: "bold",
    textTransform: "capitalize",
  },
});
