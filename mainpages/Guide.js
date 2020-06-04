//@refresh reset
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import { Icon } from "react-native-elements";
import AdminHome from "../comps/Admin/HomeScreen";
import LottieView from "lottie-react-native";
import GestureRecognizer, {
  swipeDirections,
} from "react-native-swipe-gestures";
import Entypo from "react-native-vector-icons/Entypo";
import Ionicons from "react-native-vector-icons/Ionicons";

function Guide(props) {
  const [guideIndex, setGuideIndex] = useState(0);

  const [items] = useState([
    {
      index: 1,
      uri: "https://mraeroe.com/recursos/img/banner.png",
      title: "Book a Parking",
      text:
        " Book Prepay for your spot and get a parking pass instantly via text, email, or the app Book Prepay for your spot and get a parking pass instantly via text",
    },
    {
      index: 2,
      uri:
        "https://cdn4.iconfinder.com/data/icons/office-workplace-1/50/31-512.png",
      title: "Book a Classroom",
      text:
        " Book Prepay for your spot and get a parking pass instantly via text, email, or the app Book Prepay for your spot and get a parking pass instantly via text",
      //   duration: 3000,
    },
    {
      index: 3,
      uri:
        "https://pngriver.com/wp-content/uploads/2018/04/Download-Advertising-PNG-Picture.png",
      title: "Advertise with us",
      text:
        "Book Prepay for your spot and get a parking pass instantly via text, email, or the app Book Prepay for your spot and get a parking pass instantly via text",
      //   fullWidth: true,
    },
    {
      index: 4,
      uri: "https://miro.medium.com/max/3840/1*D8D29EgnssiaaIA6crhcbA.png",
      title: "News",
      text:
        "Book Prepay for your spot and get a parking pass instantly via text, email, or the app Book Prepay for your spot and get a parking pass instantly via text",
      //   fullWidth: true,
    },
  ]);
  const [view, setView] = useState(0);

  const handleNext = (i) => {
    if (i === items.length - 1) {
      props.guideSkip();
    } else {
      setGuideIndex(i + 1);
      setView(i + 1);
    }
  };
  const goBack = (i) => {
    if (i > 0) {
      setGuideIndex(i - 1);
      setView(i - 1);
    }
  };
  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };
  return (
    <View style={styles.container}>
      <GestureRecognizer
        // onSwipe={(direction, state) => this.onSwipe(direction, state)}
        // onSwipeUp={(state) => this.onSwipeUp(state)}
        // onSwipeDown={(state) => this.onSwipeDown(state)}
        onSwipeLeft={() => handleNext(guideIndex)}
        onSwipeRight={() => goBack(guideIndex)}
        config={config}
        style={{
          flex: 1,
          //   backgroundColor: this.state.backgroundColor,
        }}
      >
        {items.map((t, i) =>
          view === i ? (
            <View style={styles.container}>
              <View style={styles.headerView}>
                <View
                  style={{
                    height: "100%",
                    flexDirection: "row",
                    // justifyContent: "center",
                    // alignItems: "center",
                    // width:"80%"
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "20%",
                      // backgroundColor: "red",
                    }}
                  >
                    <TouchableOpacity onPress={() => goBack(guideIndex)}>
                      {/* <Text>{i >= 1 ? "Back" : null}</Text> */}
                      <Text>{guideIndex >= 1 ? "Back" : null}</Text>

                      {/* {console.log("-----", i)} */}
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      height: "100%",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      width: "60%",
                      //backgroundColor: "red",
                    }}
                  ></View>
                  <View
                    style={{
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "20%",
                      // backgroundColor: "blue",
                    }}
                  >
                    <TouchableOpacity onPress={() => props.guideSkip()}>
                      <Text>Skip</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.bodyView}>
                <View
                  style={{
                    // marginLeft: "10%",
                    height: "70%",
                    justifyContent: "center",
                    alignItems: "center",
                    // alignSelf: "center",
                    alignContent: "center",
                    // borderWidth: 1,
                    // backgroundColor: "#CCDBEA",
                  }}
                >
                  <Image
                    style={{
                      width: "90%",
                      height: "80%",
                      // backgroundColor: "#CCDBEA",
                    }}
                    //source={require("../assets/trialimages/parking4.png")}
                    //   source={`${t.uri}`}
                    //   source={require((uri = t.uri))}
                    source={{ uri: t.uri }}
                  />
                </View>
                <View
                  style={{
                    justifyContent: "flex-start",
                    alignItems: "center",
                    alignContent: "center",
                    //borderWidth: 1,
                    // backgroundColor: "#CCDBEA",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                    }}
                  >
                    {t.title}
                  </Text>
                </View>
                <View
                  style={{
                    height: "30%",
                    justifyContent: "flex-start",
                    alignItems: "center",

                    alignContent: "center",
                    //borderWidth: 1,
                    //backgroundColor: "#CCDBEA",
                  }}
                >
                  <Text
                    style={{
                      marginTop: "7%",
                      justifyContent: "center",
                      alignItems: "center",
                      alignContent: "center",
                      width: "75%",
                      color: "gray",
                    }}
                  >
                    {t.text}
                  </Text>
                </View>
              </View>
              <View style={styles.footerView}>
                <View
                  style={{
                    // backgroundColor: "green",
                    height: "50%",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  {items.map((item, i) => (
                    <Entypo
                      name="dot-single"
                      size={20}
                      color={i === guideIndex ? "black" : "gray"}
                    />
                  ))}
                </View>
                <View style={{ height: "50%" }}>
                  <TouchableOpacity
                    onPress={() => handleNext(guideIndex)}
                    style={{
                      width: "100%",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#20365F",
                    }}
                  >
                    {/* <Text style={{ color: "white" }}>
                      {i === items.length - 1 ? "Get Started" : "Next"}
                    </Text> */}
                    <Text style={{ color: "white" }}>
                      {guideIndex === items.length - 1 ? "Get Started" : "Next"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null
        )}
      </GestureRecognizer>
    </View>
  );
}

export default Guide;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",

    // alignItems: "center",
    // justifyContent: "center",
  },
  headerView: {
    flex: 1,
    //backgroundColor: "#CCDBEA",
    //borderWidth: 1,
  },
  bodyView: {
    flex: 6,
    //backgroundColor: "#CCDBEA",
    //borderWidth: 1,
  },
  footerView: {
    flex: 1,
    //backgroundColor: "red",
    //borderWidth: 1,
  },
});
