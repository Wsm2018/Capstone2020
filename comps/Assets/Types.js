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
} from "react-native";
import { Card, Divider } from "react-native-elements";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db.js";
import { ceil } from "react-native-reanimated";
import LottieView from "lottie-react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

require("firebase/firestore");

export default function Types(props) {
  const [assetTypes, setAssetTypes] = useState([]);

  const [assetTypes2, setAssetTypes2] = useState([
    { id: "1", name: "Parking" },
    { id: "2", name: "Parking" },
    { id: "3", name: "Parking" },
    { id: "4", name: "Parking" },
  ]);
  const [titles] = useState([
    "Book a Parking",
    "Book a Classroom",
    "Book a Classroom",
    "Book a Classroom",
  ]);
  const [bookImage] = useState([
    "https://image.flaticon.com/icons/png/512/1845/1845213.png",
    "https://cdn4.iconfinder.com/data/icons/office-workplace-2/50/82-512.png",
    "https://image.flaticon.com/icons/png/512/1845/1845213.png",
    "https://cdn4.iconfinder.com/data/icons/office-workplace-2/50/82-512.png",
  ]);

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
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/bg.jpg")}
        style={{ width: "100%", height: "100%" }}
      >
        <View style={styles.headerView}>
          <Image
            style={{
              width: "80%",
              height: "30%",
              marginLeft: 15,
            }}
            source={require("../../assets/images/title.png")}
          />
        </View>
        <ScrollView>
          <View
            style={{
              flexDirection: "row",
              // alignItems: "center",
              // justifyContent: "center",
              // marginLeft: "3%",
              // margin: 5,
              flexWrap: "wrap",
              // backgroundColor: "gray",
              // height: "100%",
              // flex: 2,
            }}
          >
            {assetTypes.map((t, i) => (
              <View
                style={{
                  width: "50%",
                  // backgroundColor: "red",
                  alignItems: "center",
                  marginBottom: "5%",
                }}
              >
                {/* <Card
                title={titles[i]}
                style={{
                  height: "10%",
                  width: "95%",
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    props.navigation.navigate("Sections", { type: t })
                  }
                  key={i}
                  style={styles.buttonStyle}
                >
                  <Text style={styles.textStyle}>Book</Text>
                </TouchableOpacity>
              </Card> */}
                {/* ------------ */}
                {/* <Card
            title={titles[i]}
            style={{
              height: "10%",
              width: "95%",
            }}
          >
            
            <TouchableOpacity
              onPress={() => props.navigation.navigate("Sections", { type: t })}
              key={i}
              style={styles.buttonStyle}
            >
              <Text style={styles.textStyle}>Book</Text>
            </TouchableOpacity>
          </Card> */}
                <TouchableOpacity
                  onPress={() =>
                    props.navigation.navigate("Sections", { type: t })
                  }
                  key={i}
                  style={{
                    backgroundColor: "#20365F",
                    width: 190,
                    height: 190,
                    margin: 5,
                    // justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    // borderRadius: 5,
                    borderColor: "#20365F",
                    // borderTopRightRadius: 10,
                    // borderTopLeftRadius: 10,
                  }}
                >
                  {/* <Text style={{ textAlign: "center", color: "white" }}>
                {titles[i]}
              </Text> */}
                  <View
                    style={{
                      height: "80%",
                      // backgroundColor: "red",
                      justifyContent: "center",
                    }}
                  >
                    {/* <MaterialCommunityIcons
                    name="google-classroom"
                    size={80}
                    color="white"
                  /> */}

                    <Image
                      style={{
                        width: 125,
                        height: 125,
                        // marginLeft: 15,
                      }}
                      // source={require("../../assets/trialimages/" +
                      //   "parking" +
                      //   ".png")}
                      source={{ uri: bookImage[i] }}
                    />
                  </View>
                  <View
                    style={{
                      height: "20%",
                      // width:"100%",
                      // backgroundColor: "yellow",
                      backgroundColor: "#e3e3e3",
                      width: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        color: "#266394",
                        fontSize: 15,
                        // fontSize: 18,
                      }}
                    >
                      {titles[i]}
                      {/* Classroom */}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

Types.navigationOptions = (props) => ({
  title: "Assets Types",
  headerStyle: { backgroundColor: "#20365F" },
  headerTintColor: "white",
  // headerTintStyle: { textAlign: "center" },
});

// function DevelopmentModeNotice() {
//   if (__DEV__) {
//     const learnMoreButton = (
//       <Text onPress={handleLearnMorePress} style={styles.helpLinkText}>
//         Learn more
//       </Text>
//     );

//     return (
//       <Text style={styles.developmentModeText}>
//         Development mode is enabled: your app will be slower but you can use
//         useful development tools. {learnMoreButton}
//       </Text>
//     );
//   } else {
//     return (
//       <Text style={styles.developmentModeText}>
//         You are not in development mode: your app will run at full speed.
//       </Text>
//     );
//   }
// }

// function handleLearnMorePress() {
//   WebBrowser.openBrowserAsync(
//     "https://docs.expo.io/versions/latest/workflow/development-mode/"
//   );
// }

// function handleHelpPress() {
//   WebBrowser.openBrowserAsync(
//     "https://docs.expo.io/versions/latest/workflow/up-and-running/#cant-see-your-changes"
//   );
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },
  contentContainer: {
    paddingTop: 30,
  },
  textStyle: {
    color: "white",
  },
  header: {
    textAlign: "center",
    fontSize: 20,
  },
  headerView: {
    flex: 1,
    justifyContent: "center",
    textAlign: "center",
    marginLeft: 50,
    //backgroundColor: "red",
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonStyle: {
    backgroundColor: "#0066AB",
    height: 40,
    width: "60%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 18,
    // marginRight:8,
    // marginStart: "2%",
    // marginEnd: "2%",
    borderRadius: 10,
    // marginBottom: 10,
    color: "white",
    // position: "relative",
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50,
  },
  TypesFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: "rgba(96,100,109, 0.8)",
  },
  codeHighlightContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 24,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center",
  },
  tabBarInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: "center",
    backgroundColor: "#fbfbfb",
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    textAlign: "center",
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
