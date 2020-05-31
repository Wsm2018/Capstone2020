import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
// import { Octicons } from "@expo/vector-icons";

import { Dimensions } from "react-native";
import Image from "react-native-scalable-image";
import { Divider, Card as Cards } from "react-native-elements";
import { Octicons } from "@expo/vector-icons";
// import { ScrollView } from "react-native-gesture-handler";

export default function Car({ car }) {
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
            marginTop: "10%",
          }}
        >
          <View
            width={Dimensions.get("window").width / 1.41}
            height={Dimensions.get("window").height / 10}
            style={{
              flex: 1,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "flex-end",
              // marginTop: "-12%",
              // marginEnd: "-3%",
            }}
          >
            <TouchableOpacity>
              {/* <Text style={styles.notes}>X</Text> */}
              <Octicons name="trashcan" size={20} color="black" />
            </TouchableOpacity>
          </View>
          <View>
            <Text style={styles.plate}> {car.plate}</Text>
          </View>
        </View>
      </Cards>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderWidth: 0,
    borderRadius: 20,
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
