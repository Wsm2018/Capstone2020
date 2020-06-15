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
import AppIntroSlider from "react-native-app-intro-slider";

import * as Animatable from "react-native-animatable";

function Guide(props) {
  const [guideIndex, setGuideIndex] = useState(0);

  const [items] = useState([
    {
      key: 1,
      title: "Booking Type",
      text:
        "Choose a booking type from many available types in order to start off.",
      // image: "https://mraeroe.com/recursos/img/banner.png",
      image: require("../assets/guideImages/guide1.png"),
      backgroundColor: "#185a9d",
    },
    {
      key: 2,
      title: "Date & Time",
      text:
        "Select the date & time in order to specify the duration of your booking.",
      image: require("../assets/guideImages/datetime.png"),
      backgroundColor: "#47bfbf",
    },
    {
      key: 3,
      title: "Options",
      text:
        "Choose your preffered option from a variety of listed options for the chosen booking type.",
      image: require("../assets/guideImages/choose1.png"),
      backgroundColor: "#185a9d",
    },
    {
      key: 4,
      title: "Favourites",
      text:
        "Add your most preferred and loved booking options to your favourites.",
      image: require("../assets/guideImages/fav.png"),
      backgroundColor: "#47bfbf",
    },
    {
      key: 5,
      title: "Services",
      text:
        "Extra services are available as add-ons for you to add to your booking.",
      image: require("../assets/guideImages/service.png"),
      backgroundColor: "#185a9d",
    },
    {
      key: 6,
      title: "Checkout",
      text:
        "Summary of your booking showing the total amount and services, and pay.",
      image: require("../assets/guideImages/checkout1.png"),
      backgroundColor: "#47bfbf",
    },
    {
      key: 7,
      title: "Enjoy!",
      text: "Click on 'Done' to start booking.",
      image: require("../assets/guideImages/book1.png"),
      backgroundColor: "#185a9d",
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

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <View
          style={{
            flex: 0.8,
            // backgroundColor: "red",
            justifyContent: "flex-end",
          }}
        >
          <Text style={styles.title}>{item.title}</Text>
        </View>
        <Animatable.View
          animation="pulse"
          iterationCount={"infinite"}
          iterationDelay={1500}
          style={{
            flex: 3,
            // backgroundColor: "blue",
            justifyContent: "center",
          }}
        >
          <Image
            style={{
              width: "90%",
              height: "85%",
              aspectRatio: 1 / 1,
              maxWidth: 450,
              maxHeight: 450,
            }}
            // source={{ uri: item.image }}
            source={item.image}
          />
        </Animatable.View>

        <View
          style={{
            flex: 1.5,
            // backgroundColor: "green",
            // justifyContent: "center",
            padding: "5%",
          }}
        >
          <Text style={styles.text}>{item.text}</Text>
        </View>
      </View>
    );
  };
  return (
    <AppIntroSlider
      renderItem={renderItem}
      data={items}
      onDone={() => props.guideSkip()}
      onSkip={() => props.guideSkip()}
      bottomButton={false}
      showSkipButton
      // showPrevButton
    />
  );
}

export default Guide;

const styles = StyleSheet.create({
  slide: {
    width: "100%",
    height: "100%",
    // justifyContent: "space-around",
    alignItems: "center",
  },
  title: { color: "white", fontSize: 25, fontWeight: "bold" },
  text: { color: "white", fontSize: 18, textAlign: "center" },
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
