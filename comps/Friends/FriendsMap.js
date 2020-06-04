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

export default function FriendsMap() {
  const [currentUser, setCurrentUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [friends, setFriends] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const unsubFriends = useRef();

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
      unsubFriends.current = unsubscribe;
    } else {
      setFriends([]);
      unsubFriends.current = null;
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
    handleFriends();
    getCurrentLocation();

    return () => {
      if (unsubFriends.current !== null) {
        unsubFriends.current();
      }
    };
  }, []);

  return (
    location &&
    friends && (
      <View style={styles.container}>
        <View style={{ flexDirection: "row-reverse" }}>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={(value) => toggleLocation(value)}
            value={isEnabled}
          />
        </View>
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
          {friends.map((friend) => (
            <Marker
              key={friend.id}
              coordinate={friend.location}
              title={friend.displayName}
              //   image={friend.photoURL}
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
          ))}
        </MapView>
      </View>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
  },
});
