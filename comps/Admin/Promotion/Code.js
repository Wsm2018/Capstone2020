import React from "react";
// import { View, Text, Button } from "react-native";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";

import Image from "react-native-scalable-image";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
  responsiveFontSize,
  useResponsiveScreenHeight,
} from "react-native-responsive-dimensions";
import { Divider, Card as Cards } from "react-native-elements";
import { Octicons } from "@expo/vector-icons";
import * as Device from "expo-device";
import moment from "moment";
import db from "../../../db";
import firebase from "firebase";
import "firebase/functions";
export default function Code(props) {
  const promotion = props.item;
  // console.log("promotion ", new Date(promotion.expiryDate.toDate()));
  // console.log(new Date(promotion.expiryDate.toDate()) - new Date());

  // ---------------------------------- FUNCTIONS --------------------------------------------

  const handleDelete = async () => {
    if (new Date(promotion.expiryDate.toDate()) - new Date() < 0) {
      const deletePromotion = firebase
        .functions()
        .httpsCallable("deletePromotion");
      const response = await deletePromotion({ id: promotion.id });
      console.log(response);
      if (response.data) {
        alert("Promotion Removed");
      }
    } else {
      alert("Promotion still going on");
    }
  };

  // ---------------------------------- RETURN -----------------------------------------

  return (
    <View style={styles.container}>
      <ScrollView>
        <Cards
          width={Dimensions.get("window").width / 1.4}
          containerStyle={styles.card}
        >
          <View
            style={{
              alignItems: "flex-end",
            }}
          >
            <View
              style={{
                marginEnd: "20%",
                // marginTop: -10,
              }}
            >
              <Text style={{ fontSize: responsiveScreenFontSize(1.5) }}>
                You Get
              </Text>
            </View>

            <View
              style={{
                backgroundColor: "#185a9d",
                height: responsiveScreenHeight(6),
                width: responsiveScreenHeight(6),
                borderRadius: 90,
                justifyContent: "center",
                position: "absolute",
                top: -25,
                right: -25,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: responsiveScreenFontSize(2),
                    color: "white",
                  }}
                >
                  {promotion.percentage}%
                </Text>
              </View>
            </View>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                // backgroundColor: "red",
              }}
            >
              <Image
                width={Dimensions.get("window").width / 3.5}
                source={require("../../../assets/images/discountt.png")}
              />
              <View style={{ flex: 1, justifyContent: "space-between" }}>
                <View style={{ flex: 0.1, alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(3),
                      color: "#185a9d",
                      fontWeight: "bold",
                    }}
                  >
                    {promotion.code}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 0.1,
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 0.5 }}>
                    <Text
                      style={{
                        fontSize: responsiveFontSize(1.5),
                        fontWeight: "bold",
                        color: "gray",
                      }}
                    >
                      Valid Through:
                    </Text>
                  </View>
                  <Text
                    style={{
                      // fontSize: 15,
                      color: "#5c5c5c",
                      fontSize: responsiveFontSize(2),
                      fontWeight: "bold",
                    }}
                  >
                    {moment(promotion.expiryDate.toDate()).format("YYYY/MM/DD")}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Cards>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e3e3e3",
  },
  card: {
    borderWidth: 0,
    borderRadius: 10,
  },

  time: {
    fontSize: responsiveScreenFontSize(2.5),
    color: "white",
  },
  notes: {
    fontSize: responsiveScreenFontSize(2),
    color: "white",
    textTransform: "capitalize",
  },
  two: {
    alignItems: "center",
    width: "100%",
  },
});
