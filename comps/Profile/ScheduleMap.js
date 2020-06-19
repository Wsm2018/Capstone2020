import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  TextInput,
  Platform,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
//import { showLocation } from "react-native-map-link";
import { Feather } from "react-native-vector-icons";
import db from "../../db";

import firebase from "firebase/app";
import "firebase/auth";

import * as Permissions from "expo-permissions";

export default function ScheduleMap(props) {
  // the current latitude and longitude of the user
  const [region, setRegion] = useState();
  // the latitude and longitude of the parking spot
  const [destination, setDestination] = useState();
  const [fitStatus, setFitStatus] = useState(true);
  const [startStatus, setStartStatus] = useState(false);
  const assetDestination = props.navigation.getParam(
    "assetDestination",
    "not found"
  );

  const GOOGLE_MAPS_APIKEY = "AIzaSyCNgNO3plGbuqqepOxMbldcI_k-sHStZ0c";

  useEffect(() => {
    setDestination(assetDestination);
    console.log("assetDestination", assetDestination);
  }, []);

  // getting the current user location using navigator.geolocation.watchPosition its a listener
  // that will keep changing the current user loction if the location changed
  const getUserLocation = async () => {
    let currentPos = { latitude: 1, longitude: 1 };
    const location = await Location.getCurrentPositionAsync({});
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
    currentPos = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    // try {
    //   navigator.geolocation.watchPosition(
    //     (position) => {
    //       setRegion({
    //         latitude: position.coords.latitude,
    //         longitude: position.coords.longitude,
    //         latitudeDelta: 0.005,
    //         longitudeDelta: 0.005,
    //       });
    //       currentPos = {
    //         latitude: position.coords.latitude,
    //         longitude: position.coords.longitude,
    //       };
    //     },
    //     (error) => {
    //       // it will check if there is an error with the permission and display an
    //       // instructions on how to enable it based on which OS you device uses
    //       // or it will display the error if it couldn't detect the location for
    //       // another resaon
    //       switch (error.code) {
    //         case 1:
    //           if (Platform.OS === "ios") {
    //             alert(
    //               "To locate your location enable permission for the application in Settings - Privacy - Location"
    //             );
    //           } else {
    //             alert(
    //               "To locate your location enable permission for the application in Settings - Apps - ExampleApp - Location"
    //             );
    //           }
    //           break;
    //         default:
    //           alert("Error detecting your location");
    //           // alert(error);
    //           console.log(error);
    //       }
    //     }
    //   );
    // } catch (e) {
    //   alert(e.message || "");
    // }

    // I used the setInterval from the provided thesimulator and it will update the user
    // location on database every 10 sec to avoid firebase limitation
    setInterval(async () => {
      // it will create a firebase GeoPoint and store the latitude and longitude inside it
      db.collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({
          location: new firebase.firestore.GeoPoint(
            currentPos.latitude,
            currentPos.longitude
          ),
        });
    }, 100000);
  };

  const askPermission = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status === "granted") {
      getUserLocation();
    }
  };

  // it will call getUserLocation only once since it has a listener and a setInterval method
  useEffect(() => {
    askPermission();
  }, []);

  const handleStart = () => {
    setStartStatus(true);
  };

  let mapView = null;

  const onReady = (result) => {
    if (mapView) {
      mapView.fitToCoordinates(result.coordinates, {
        edgePadding: {
          right: 20,
          bottom: 20,
          left: 20,
          top: 20,
        },
      });
      setFitStatus(false);
    }
  };

  const onError = (errorMessage) => {
    alert(errorMessage);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={{ position: "absolute", flex: 1, width: "100%", height: "100%" }}
        showsUserLocation={true}
        followsUserLocation={startStatus ? true : false}
        enableHighAccuracy={true}
        ref={(c) => (mapView = c)}
        initialRegion={region}
      >
        {destination ? (
          <MapView.Marker
            coordinate={{
              latitude: destination.coords.latitude,
              longitude: destination.coords.longitude,
            }}
          />
        ) : null}
        {region && destination && (
          <MapViewDirections
            origin={region}
            destination={{
              latitude: destination.coords.latitude,
              longitude: destination.coords.longitude,
            }}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={3}
            strokeColor="#872575"
            onReady={fitStatus ? onReady : null}
            onError={onError}
            resetOnChange={false}
          />
        )}
      </MapView>
      {/* <View style={{ flex: 1, justifyContent: "flex-end", marginBottom: 20 }}>
        <TouchableOpacity
          style={{
            width: 70,
            height: 70,
            backgroundColor: "#872575",
            borderRadius: 63,
            alignItems: "center",
            justifyContent: "center",
            display: startStatus ? "none" : "flex",
          }}
          onPress={() => handleStart()}
        >
          <Feather name="navigation-2" size={40} color="#ffffff" />
        </TouchableOpacity>
      </View> */}
    </View>
  );
}
ScheduleMap.navigationOptions = (props) => ({
  title: "Map",
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
