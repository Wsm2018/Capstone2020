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
  AsyncStorage,
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

let theme2 = "";
function tryTheme(props) {
  const changeTheme = async (x) => {
    theme2 = await AsyncStorage.getItem("theme");
  };
  changeTheme();
}
tryTheme();

export default function Types(props) {
  const [assetTypes, setAssetTypes] = useState([]);

  ///////////////////Theme Code/////////////////////////////////
  const [theme, setTheme] = useState();
  const getTheme = async () => {
    const theme = await AsyncStorage.getItem("theme");

    setTheme(theme);
    theme2 = theme;
  };

  useEffect(() => {
    getTheme();
  }, []);

  const changeTheme = async (x) => {
    const theme = await AsyncStorage.setItem("theme", x);
    getTheme();
  };

  // <Button title="theme dark" onPress={() => changeTheme("dark")} />
  //         <Button title="theme light" onPress={() => changeTheme("light")} />
  //         <Button title="theme other" onPress={() => changeTheme("other")} />

  ///////////////////////////////////////////////////////////////////

  //////////////////////  design ////////////////////////////////
  const [assetTypes2, setAssetTypes2] = useState([
    { id: "1", name: "Parking" },
    { id: "2", name: "Parking" },
    { id: "3", name: "Parking" },
    { id: "4", name: "Parking" },
  ]);
  const [titles] = useState([
    "Book a Parking",
    // "Book a Parking",
    "Book a Classroom",
    // "Book a Classroom",
  ]);
  const [bookImage] = useState([
    "https://image.flaticon.com/icons/png/512/1845/1845213.png",
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
      // duration: 3000,
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
    // console.log("----------45654654654654---------", temp);
  };

  return (
    <View style={theme === "light" ? styles.container : styles.container2}>
      <ScrollView>
        <View style={{ height: Dimensions.get("window").height / 4 }}>
          <TouchableOpacity
            style={{ height: "100%" }}
            onPress={() => console.log("ad clicked")}
          >
            <TimedSlideshow
              items={items}
              progressBarDirection="middle"
              progressBarColor="#3ea3a3"
              // renderCloseIcon=
              // onPress={() => console.log("Close Clickedddddd")}
              // renderCloseIcon={null}
              renderCloseIcon={() => null}
              // imageStyle={{ backgroundColor: "black", width: 20 }}
              // renderIcon
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            height: "60%",
            // padding: "1%",
            // backgroundColor: "red",
            // flexDirection: "row",
            // flexWrap: "wrap",
            // justifyContent: "center",
            // alignItems: "center",
            padding: "1%",
            marginTop: "3%",
          }}
        >
          {/* <View
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              // backgroundColor: "red",
            }}
          >
            <Text style={{ color: "gray", fontSize: 25 }}>
              What would you like to book?
            </Text>
          </View> */}
          {/* <View>
            <Button title="theme dark" onPress={() => changeTheme("dark")} />
            <Button title="theme light" onPress={() => changeTheme("light")} />
            <Button title="theme other" onPress={() => changeTheme("other")} />
          </View> */}
          <View
            style={{
              // backgroundColor: "yellow",
              width: "100%",
              flexWrap: "wrap",
              flexDirection: "row",
            }}
          >
            {assetTypes.map((t, i) => (
              <View
                style={{
                  width: "50%",
                  justifyContent: "center",
                  alignItems: "center",
                  // backgroundColor: "blue",
                  // margin: "1%",
                  marginBottom: "3%",
                  // aspectRatio: 1 / 1,
                }}
                key={i}
              >
                <TouchableOpacity
                  onPress={() =>
                    props.navigation.navigate("Sections", { type: t })
                  }
                  key={i}
                  style={{
                    backgroundColor: "white",
                    width: "95%",
                    // height: "50%",
                    // height: Dimensions.get("window").height / 4,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 4,
                    borderColor: "#185a9d",
                    aspectRatio: 1 / 1,
                  }}
                >
                  <View
                    style={{
                      height: "85%",
                      width: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      // backgroundColor: "red",
                      // marginTop: "10%",
                    }}
                  >
                    <Image
                      style={{
                        // width: Platform.isPad ? "70%" : "80%",
                        // height: Platform.isPad ? "100%" : "80%",
                        aspectRatio: 1 / 1,
                        width: "80%",
                      }}
                      source={{
                        uri: bookImage[i],
                        // uri: t.image,
                      }}
                    />
                  </View>

                  <View
                    style={{
                      height: "16%",
                      width: "100%",
                      backgroundColor: "#185a9d",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        color: "white",
                        // marginBottom: "5%",
                        // backgroundColor: "gray",
                        // width: "100%",
                        textAlign: "center",
                        fontWeight: "bold",
                        // height: "20%",
                        textTransform: "capitalize",
                      }}
                    >
                      {/* Book a
                      {t.name.charAt(0).toLowerCase() === "a" ||
                      "e" ||
                      "i" ||
                      "o" ||
                      "u"
                        ? " "
                        : "n "} */}
                      {t.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        {/* <View></View> */}
        {/* <View style={styles.footer}></View> */}
      </ScrollView>
    </View>
  );
}

Types.navigationOptions = (props) => ({
  title: "QuickbookinQ",
  // headerStyle: { backgroundColor: "#3771b3" },
  headerStyle: { backgroundColor: theme2 === "light" ? "#185a9d" : "black" },
  headerTintColor: "white",
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    width: Dimensions.get("window").width,
    // width: "100%",
    // height: Math.round(Dimensions.get("window").height),
  },
  container2: {
    flex: 1,
    backgroundColor: "gray",
    width: Dimensions.get("window").width,
    // width: "100%",
    // height: Math.round(Dimensions.get("window").height),
  },

  advertisement: {
    // flex: 0.5,
    //backgroundColor: "red",
  },
  logo: {
    // flex: 0.1,
    //backgroundColor: "yellow",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 30,
  },
  assets: {
    // flex: 1,
    //backgroundColor: "blue",
    flexDirection: "row",
    flexWrap: "wrap",
    // justifyContent: "space-between",
    // alignItems: "flex-start",
    // alignContent: "flex-start",
  },
  surface: {
    // width: "50%",
    // height: "100%",
    // // alignSelf: "center",
    // // elevation: 20,
    // // backgroundColor: "white",
    // alignItems: "center",
    // flexWrap: "wrap",

    backgroundColor: "yellow",
    // flexDirection: "row",
  },
  footer: {
    // flex: 0.2,
    backgroundColor: "purple",
  },
});
