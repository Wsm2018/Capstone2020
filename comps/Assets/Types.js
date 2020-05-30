//@refresh reset
import { Button } from "react-native-elements";
import React, { useState, useEffect } from "react";
import { createStackNavigator } from "react-navigation-stack";

import {
  Image,
  Platform,
  TextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Dimensions,
} from "react-native";
import { Card, Divider } from "react-native-elements";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db.js";
import { ceil } from "react-native-reanimated";
import LottieView from "lottie-react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import TimedSlideshow from "react-native-timed-slideshow";
import { Surface } from "react-native-paper";

require("firebase/firestore");

export default function Types(props) {
  const [assetTypes, setAssetTypes] = useState([]);

  //////////////////////  design ////////////////////////////////
  const [assetTypes2, setAssetTypes2] = useState([
    { id: "1", name: "Parking" },
    { id: "2", name: "Parking" },
    { id: "3", name: "Parking" },
    { id: "4", name: "Parking" },
  ]);
  const [titles] = useState([
    "Book a Parking",
    "Book a Parking",
    "Book a Classroom",
    "Book a Classroom",
  ]);
  const [bookImage] = useState([
    "https://image.flaticon.com/icons/png/512/1845/1845213.png",
    "https://cdn4.iconfinder.com/data/icons/office-workplace-2/50/82-512.png",
    "https://image.flaticon.com/icons/png/512/1845/1845213.png",
    "https://cdn4.iconfinder.com/data/icons/office-workplace-2/50/82-512.png",
  ]);
  const [items] = useState([
    {
      uri:
        "http://www.lovethemountains.co.uk/wp-content/uploads/2017/05/New-Outdoor-Sports-and-Music-Festival-For-Wales-4.jpg",
      title: "Michael Malik",
      text: "Minnesota, USA",
    },
    {
      uri:
        "http://blog.adrenaline-hunter.com/wp-content/uploads/2018/05/bungee-jumping-barcelona-1680x980.jpg",
      title: "Victor Fallon",
      text: "Val di Sole, Italy",
      duration: 3000,
    },
    {
      uri: "https://greatist.com/sites/default/files/Running_Mountain.jpg",
      title: "Mary Gomes",
      text: "Alps",
      fullWidth: true,
    },
  ]);
  ////////////////////////////////////////////////////////////////////////

  const [images] = useState(["../../assets/images/parking.png"]);
  useEffect(() => {
    getTypes();
  }, []);

  const getTypes = async () => {
    const temp = [];
    const types = await db.collection("assetTypes").get();
    types.forEach((doc) => {
      temp.push({ id: doc.id, ...doc.data() });
    });
    setAssetTypes(temp);
    console.log("-------------------", temp);
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.advertisement}>
          <TimedSlideshow items={items} progressBarDirection="fromLeft" />
        </View>
        <View style={styles.logo}>
          <Text style={styles.logoText}>QuickbookinQ</Text>
        </View>
        <View style={styles.assets}>
          {assetTypes.map((t, i) => (
            <View style={styles.surface}>
              <TouchableOpacity
                onPress={() =>
                  props.navigation.navigate("Sections", { type: t })
                }
                key={i}
                style={{
                  backgroundColor: "#7893b3",
                  width: "90%",
                  height: "45%",
                  margin: 5,
                  justifyContent: "center",
                  alignItems: "center",
                  elevation: 20,
                  shadowOpacity: 0.6,
                  // shadowRadius: 3,
                  shadowOffset: {
                    // height: 2,
                    // width: 2,
                  },
                  borderWidth: 2,
                  borderColor: "black",
                }}
              >
                <Image
                  style={{
                    width: "92%",
                    height: "90%",
                  }}
                  source={{
                    uri: bookImage[i],
                  }}
                />
                <Text
                  style={{ fontSize: 20, color: "white", marginBottom: "5%" }}
                >
                  {titles[i]}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.footer}></View>
      </View>
    </ScrollView>
  );
}

Types.navigationOptions = (props) => ({
  title: "QuickBookinQ",
  // headerStyle: { backgroundColor: "#3771b3" },
  headerStyle: { backgroundColor: "#20365F" },

  headerTintColor: "white",
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    width: Math.round(Dimensions.get("window").width),
    height: Math.round(Dimensions.get("window").height),
  },
  advertisement: {
    flex: 0.5,
    //backgroundColor: "red",
  },
  logo: {
    flex: 0.1,
    //backgroundColor: "yellow",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 30,
  },
  assets: {
    flex: 1,
    //backgroundColor: "blue",
    flexDirection: "row",
    // flexWrap: "wrap",
    // justifyContent: "space-between",
    // alignItems: "flex-start",
    // alignContent: "flex-start",
  },
  surface: {
    width: "50%",
    height: "100%",
    // alignSelf: "center",
    // elevation: 20,
    // backgroundColor: "white",
    alignItems: "center",
  },
  footer: {
    flex: 0.2,
    backgroundColor: "purple",
  },
});
