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
} from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db.js";
require("firebase/firestore");

export default function List(props) {
  const [assetList, setAssetList] = useState([]);
  const [finalAssets, setFinalAssets] = useState([]);
  const section = props.navigation.getParam("section", "failed").id;
  const assetTypeId = props.navigation.getParam("assetTypeId", "failed");
  const tName = props.navigation.getParam("tName", "failed");
  const sName = props.navigation.getParam("section", "failed").name;
  const startDateTime = props.navigation.getParam("startDate", "failed");
  const endDateTime = props.navigation.getParam("endDate", "failed");

  useEffect(() => {
    getList();
  }, [section]);

  useEffect(() => {
    checkTime();
  }, [assetList.length > 0 && finalAssets.length == 0]);

  const getList = () => {
    const temp = [];
    db.collection("assets")
      .orderBy("code")
      .where("assetSection", "==", section)
      .onSnapshot((snapshot) => {
        snapshot.forEach(async (doc) => {
          //console.log(section)
          let bookingTemp = [];
          let bookings = await db
            .collection("assets")
            .doc(doc.id)
            .collection("assetBookings")
            .get();
          if (bookings) {
            bookings.forEach((b) => {
              bookingTemp.push(b.data());
            });
          }
          temp.push({ id: doc.id, assetBookings: bookingTemp, ...doc.data() });

          if (temp.length === snapshot.docs.length) {
            //console.log('assets',temp)
            setAssetList(temp);
          }
        });
      });
  };

  const checkTime = () => {
    console.log("hii");
    let assetsToShow = assetList;

    assetsToShow = assetsToShow.filter(
      (asset) =>
        asset.assetBookings.filter((assetBooking) => {
          return !(
            (startDateTime <= assetBooking.startDateTime &&
              endDateTime <= assetBooking.startDateTime) ||
            (startDateTime >= assetBooking.endDateTime &&
              endDateTime >= assetBooking.endDateTime)
          );
        }).length === 0
    );

    console.log("after checking time", assetsToShow);
    setFinalAssets(assetsToShow);
  };

  return (
    <View style={styles.container}>
      {/* {console.log('inside return',assetList)} */}
      {finalAssets.length > 0 ? (
        finalAssets.map((l, i) => (
          <TouchableOpacity
            onPress={() =>
              props.navigation.navigate("Details", {
                sName: sName,
                tName: tName,
                asset: l,
                startDateTime: startDateTime,
                endDateTime: endDateTime,
                assetTypeId,
              })
            }
            key={i}
            style={{
              alignItems: "center",
              borderRadius: 50,
              height: 20,
              width: 200,
              margin: 5,
              backgroundColor: "pink",
            }}
          >
            <Text>{l.code}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text>Loading</Text>
      )}
    </View>
  );
}

List.navigationOptions = (props) => ({
  title: "List",
  headerStyle: { backgroundColor: "white" },
  headerTintColor: "black",
  headerTintStyle: { fontWeight: "bold" },
});

function DevelopmentModeNotice() {
  if (__DEV__) {
    const learnMoreButton = (
      <Text onPress={handleLearnMorePress} style={styles.helpLinkText}>
        Learn more
      </Text>
    );

    return (
      <Text style={styles.developmentModeText}>
        Development mode is enabled: your app will be slower but you can use
        useful development tools. {learnMoreButton}
      </Text>
    );
  } else {
    return (
      <Text style={styles.developmentModeText}>
        You are not in development mode: your app will run at full speed.
      </Text>
    );
  }
}

function handleLearnMorePress() {
  WebBrowser.openBrowserAsync(
    "https://docs.expo.io/versions/latest/workflow/development-mode/"
  );
}

function handleHelpPress() {
  WebBrowser.openBrowserAsync(
    "https://docs.expo.io/versions/latest/workflow/up-and-running/#cant-see-your-changes"
  );
}

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
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
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
