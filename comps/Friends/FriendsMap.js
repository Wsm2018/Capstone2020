import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Button,
  Switch,
} from "react-native";

import db from "../../db";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";

import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

export default function FriendsMap(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  // const [friends, setFriends] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const unsubFriends = useRef();
  const friends = props.friends;

  // ------------------------------CURRENT USER------------------------------------
  const handleCurrentuser = async () => {
    const doc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    setCurrentUser({ id: doc.id, ...doc.data() });
    setIsEnabled(doc.data().privacy.locationP);
  };

  // ------------------------------FRIENDS------------------------------------
  const handleFriends = async () => {
    let friendsQuery = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("friends")
      .get();

    if (friendsQuery.size > 0) {
      let tempFriendsId = [];

      friendsQuery.forEach((doc) => tempFriendsId.push(doc.id));
      // console.log(tempFriendsId);

      const unsubscribe = db
        .collection("users")
        .where(firebase.firestore.FieldPath.documentId(), "in", tempFriendsId)
        .onSnapshot((queryBySnapshot) => {
          let tempFriends = [];

          queryBySnapshot.forEach((doc) => {
            if (doc.data().privacy.locationP === true) {
              tempFriends.push({ id: doc.id, ...doc.data() });
            }
          });
          // console.log(tempFriends);
          setFriends(tempFriends);
        });
      // unsubFriends.current = unsubscribe;
    } else {
      setFriends([]);
      // unsubFriends.current = null;
    }
  };

  // ------------------------------CURRENT LOCATION------------------------------------
  const getCurrentLocation = async () => {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);

    // db.collection("users")
    //   .doc(firebase.auth().currentUser.uid)
    //   .update({
    //     location: {
    //       latitude: location.coords.latitude,
    //       longitude: location.coords.longitude,
    //     },
    //   });
  };

  // ------------------------------TOGGLE LOCATION------------------------------------
  const toggleLocation = (value) => {
    setIsEnabled(value);
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({ privacy: { locationP: value } });
  };

  // ------------------------------USE EFFECT------------------------------------
  useEffect(() => {
    handleCurrentuser();
    // handleFriends();
    getCurrentLocation();

    // return () => {
    //   if (unsubFriends.current !== null) {
    //     unsubFriends.current();
    //   }
    // };
    console.log(friends.length);
  }, []);

  return location ? (
    friends && (
      <View style={styles.container}>
        <MapView
          showsUserLocation
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          style={{ flex: 1 }}
        >
          {friends.map(
            (friend) =>
              friend.location &&
              friend.locationP === true && (
                <Marker
                  key={friend.id}
                  coordinate={friend.location && friend.location}
                  //try pls <----------------------------------------------------------------------------------------
                  title={friend.displayName}
                  //  image={friend.photoURL}
                  //   description={marker.description}
                >
                  <View>
                    <Image
                      source={{ uri: friend.photoURL }}
                      style={{
                        width: 30,
                        height: 30,
                        //   right: -20,
                        borderRadius: 50,
                      }}
                    />
                  </View>
                </Marker>
              )
          )}
          {/* <View
            style={{
              flexDirection: "row-reverse",
              backgroundColor: null,
              height: "8%",
            }}
          >
            <Switch
              trackColor={{ false: "#767577", true: "#185a9d" }}
              thumbColor={isEnabled ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value) => toggleLocation(value)}
              value={isEnabled}
              style={{ marginTop: "5%", marginRight: "5%" }}
            />
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <Text
                style={{
                  paddingRight: "58%",
                  paddingTop: "3.5%",
                  color: "#185a9d",
                  fontSize: 26,
                }}
              >
                {" "}
                Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <Ionicons
                name="md-arrow-round-back"
                size={35}
                color="#185a9d"
                style={{ paddingLeft: "1%", paddingTop: "3%" }}
              />
            </TouchableOpacity>
          </View> */}
        </MapView>
        <View
          style={{
            position: "absolute",
            top: "2%",
            right: "2%",
            alignItems: "center",
            // backgroundColor: "red",
          }}
        >
          <Switch
            trackColor={{ false: "#767577", true: "#185a9d" }}
            thumbColor={isEnabled ? "#fff" : "#f4f3f4"}
            // ios_backgroundColor="transparent"
            onValueChange={(value) => toggleLocation(value)}
            value={isEnabled}
          />
          <Text style={{ fontSize: 8 }}>Location</Text>
        </View>
      </View>
    )
  ) : (
    <View
      style={{ flex: 1, justifyContent: "center", backgroundColor: "white" }}
    >
      <LottieView
        source={require("../../assets/loadingAnimations/890-loading-animation.json")}
        autoPlay
        loop
        style={{
          position: "relative",
          width: "50%",
          backgroundColor: "white",
          alignItems: "center",
          justifyContent: "center",
          alignContent: "center",
          alignSelf: "center",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // borderWidth: 1,
  },
});
