import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  SafeAreaView,
  Button,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import LottieView from "lottie-react-native";

import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
} from "react-native-responsive-dimensions";

import db from "../../../db";
import Code from "./Code";
// import { TouchableOpacity } from "react-native-gesture-handler";
import { AntDesign } from "react-native-vector-icons";
import { ScrollView } from "react-native-gesture-handler";

export default function PromotionList(props) {
  const [promotionCodes, setPromotionCodes] = useState([]);

  // ------------------------------------------ USE EFFECTS ---------------------------------

  useEffect(() => {
    db.collection("promotionCodes").onSnapshot((query) => {
      let codes = [];
      query.forEach((doc) => {
        codes.push({ id: doc.id, ...doc.data() });
      });
      setPromotionCodes([...codes]);
    });
    return () => {
      console.log("eh");
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ backgroundColor: "#185a9d", flex: 1, margin: 15 }}>
        <View style={{ backgroundColor: "#e3e3e3", flex: 1, margin: 10 }}>
          <View
            style={{
              flex: 1,
              // backgroundColor: "#e3e3e3",

              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 5 }}>
              <ScrollView>
                {promotionCodes.length !== 0 ? (
                  <FlatList
                    data={promotionCodes}
                    renderItem={({ item }) => <Code item={item} />}
                    keyExtractor={(item) => item.id}
                  />
                ) : (
                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LottieView
                      width={Dimensions.get("window").width / 3}
                      source={require("../../../assets/loadingAnimations/890-loading-animation.json")}
                      autoPlay
                      loop
                      style={{
                        position: "relative",
                        width: "100%",
                      }}
                    />
                  </View>
                )}
              </ScrollView>
            </View>

            <View
              style={{
                // flex: 1,
                // marginLeft: "30%",
                // marginRight: "30%",
                // backgroundColor: "#2E9E9B",
                // justifyContent: "center",
                // alignItems: "center",
                // borderRadius: 10,
                // marginBottom: 10,
                flex: 0.7,
                alignItems: "center",
                // backgroundColor: "red",
                justifyContent: "center",
              }}
            >
              <TouchableOpacity
                style={{
                  // flex: 0.2,
                  backgroundColor: "#2E9E9B",
                  height: responsiveScreenHeight(5),
                  width: responsiveScreenWidth(40),
                  alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",

                  borderRadius: 10,
                  marginBottom: 10,
                }}
                onPress={() => props.navigation.navigate("AddPromotion")}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 18,
                    color: "white",
                  }}
                >
                  + Promotion Code
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
PromotionList.navigationOptions = {
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
};
