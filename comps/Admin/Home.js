//@refresh reset
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import firebase from "firebase/app";
import { Feather, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import "firebase/auth";
import db from "../../db";
import { FlatGrid } from "react-native-super-grid";
import ActionButton from "react-native-action-button";
import * as Device from "expo-device";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

// import LottieView from "lottie-react-native";

// import { Item } from "react-native-paper/lib/typescript/src/components/List/List";

export default function Home(props) {
  const [deviceType, setDeviceType] = useState(0);
  const handleLogout = () => {
    firebase.auth().signOut();
  };
  const getDeviceType = async () => {
    const type = await Device.getDeviceTypeAsync();
    setDeviceType(type);
  };
  useEffect(() => {
    getDeviceType();
  }, []);
  const items = [
    {
      name: "Users",
      code: "#005c9d",
      nav: () => props.navigation.navigate("Users"),
      image: require("../../assets/images/adminpic/list.jpg"),
      // height: 120,
      // width: 200,
    },
    {
      name: "Statistics",
      code: "#005c9d",
      nav: () => props.navigation.navigate("Statistics"),
      image: require("../../assets/images/adminpic/charts.jpg"),
      // height: 120,
      // width: 200,
    },

    {
      name: "Booking",
      code: "#005c9d",
      nav: () => props.navigation.navigate("Types"),
      image: require("../../assets/images/adminpic/bookings.jpg"),
      // height: 120,
      // width: 200,
    },
    {
      name: "Make Admin",
      code: "#005c9d",
      nav: () => props.navigation.navigate("MakeAdmin"),
      image: require("../../assets/images/adminpic/admin.jpg"),
      // height: 120,
      // width: 200,
    },

    {
      name: "Promotion",
      code: "#005c9d",
      nav: () => props.navigation.navigate("Promotion"),
      image: require("../../assets/images/adminpic/promotion.jpg"),
      // height: 120,
      // width: 200,
    },
    {
      name: "News",
      code: "#005c9d",
      nav: () => props.navigation.navigate("News"),
      image: require("../../assets/images/adminpic/Newspaper.png"),
      // height: 120,
      // width: 200,
    },
    {
      name: "Requested Ads",
      code: "#005c9d",
      nav: () => props.navigation.navigate("Ad"),
      image: require("../../assets/images/adminpic/adrequest.png"),
      // height: 120,
      // width: 200,
    },
  ];

  const handleChangeRole = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({ activeRole: null });
  };

  return (
    // <View style={styles.container}>
    <View style={styles.container}>
      {/* <View style={{ flex: 1, margin: 10 }}>
        <View style={{ backgroundColor: "#e3e3e3", flex: 1, margin: 5 }}> */}
      <FlatGrid
        itemDimension={responsiveScreenWidth(40)}
        items={items}
        style={styles.gridView}
        renderItem={({ item, index }) => (
          <View style={[styles.itemContainer, { backgroundColor: item.code }]}>
            <TouchableOpacity onPress={item.nav}>
              <View style={{ height: "100%", width: "100%" }}>
                <Image
                  source={item.image}
                  style={{
                    flex: 1,
                    height: undefined,
                    width: undefined,
                  }}
                />

                <View
                  style={{
                    alignItems: "center",
                    flex: 0.2,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: responsiveScreenFontSize(1.8),
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />

      <ActionButton
        // buttonColor={"#3ea3a3"}
        // size={deviceType === 1 ? 60 : 80}
        buttonColor={"#3ea3a3"}
        size={responsiveScreenFontSize(8)}
        //  style={styles.actionButtonIcon2}
        // icon={responsiveScreenFontSize(10)}
        buttonTextStyle={{ fontSize: responsiveScreenFontSize(3) }}

        // position="left"
        //verticalOrientation="down"
      >
        <ActionButton.Item
          buttonColor="#185a9d"
          title="Change Role"
          onPress={handleChangeRole}
        >
          <SimpleLineIcons
            name="people"
            size={deviceType === 1 ? 60 : 80}
            style={styles.actionButtonIcon}
          />
        </ActionButton.Item>
        <ActionButton.Item
          buttonColor="#901616"
          title="Logout"
          onPress={() => {
            firebase.auth().signOut();
            console.log(firebase.auth().currentUser.uid);
          }}
        >
          <MaterialCommunityIcons
            name="logout"
            style={styles.actionButtonIcon}
          />
        </ActionButton.Item>
      </ActionButton>
      {/* </View>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",
  },
  gridView: {
    // marginTop: 20,
    flex: 1,
    // marginBottom: 100,
  },
  itemContainer: {
    justifyContent: "flex-end",
    borderRadius: 5,
    // flex: 2,
    height: responsiveScreenWidth(40),
  },
  itemName: {
    fontSize: responsiveScreenFontSize(1.9),
    fontWeight: "bold",
    color: "#fff",
    // fontWeight: "600",
  },
  itemCode: {
    fontWeight: "600",
    fontSize: 12,
    color: "#fff",
  },
  actionButtonIcon: {
    fontSize: responsiveFontSize(2.5),
    // height: 40,
    color: "white",
  },
  actionButtonIcon2: {
    //height: 22,
    // width: 22,
    fontSize: responsiveFontSize(2.5),
  },
});
Home.navigationOptions = {
  headerStyle: { backgroundColor: "#005c9d" },
  headerTintColor: "white",
};
