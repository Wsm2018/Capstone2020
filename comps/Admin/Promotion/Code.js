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
      <View style={styles.two}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "height" : "padding"}
          style={{ flex: 1 }}
        >
          <ScrollView>
            <Cards
              width={Dimensions.get("window").width / 1.3}
              containerStyle={styles.card}
            >
              <View
                style={{
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <View>
                  <Text>{promotion.percentage}</Text>
                </View>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  <Image
                    width={Dimensions.get("window").width / 3}
                    source={require("../../../assets/images/discountt.png")}
                  />
                  <View>
                    <Text>Code{promotion.code}</Text>

                    {/* <Text></Text> */}
                    <Text>
                      Expiry Date{" "}
                      {moment(promotion.expiryDate.toDate()).format(
                        "YYYY/MM/DD"
                      )}
                    </Text>
                  </View>
                </View>

                {/* <Text style={styles.time}>{cardInfo && cardInfo.cardNumber}</Text> */}
              </View>

              <View style={{}}>
                {/* <Text></Text> */}

                {/* <Text></Text> */}

                {/* <Button title="Delete" onPress={() => handleDelete()} /> */}
              </View>
            </Cards>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "gray",
    borderWidth: 0,
    borderRadius: 20,
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
