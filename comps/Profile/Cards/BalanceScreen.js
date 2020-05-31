import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import GradientButton from "react-native-gradient-buttons";
import { Text } from "react-native-elements";

import db from "../../../db";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import { isMoment } from "moment";

export default function BalanceScreen({ navigation }) {
  const [user, setUser] = useState(null);

  const getUser = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((querySnap) => {
        setUser({ id: querySnap.id, ...querySnap.data() });
      });
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 1,
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#0D2C6A" }}>
            Current Balance
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              // backgroundColor: "green",

              // borderBottomWidth: 2,
            }}
          >
            {/* <Image
              source={require("../../../assets/images/cash2.png")}
              style={{ height: 40, width: 40 }}
              onPress={() =>
                props.navigation.navigate("Balance", { user: props.user })
              }
            /> */}
            <Text style={{ fontSize: 20, fontWeight: "bold", marginEnd: 5 }}>
              {user && user.balance}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>QR</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          {/* <View
            style={{
              // backgroundColor: "#20365F",
              // height: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() => navigation.navigate("AddCard", { user: user })}
            >
              <Image
                source={require("../../../assets/images/addcard.png")}
                style={{ height: 60, width: 60 }}
              />
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#20365F",
                }}
              >
                Add Credit Card
              </Text>
            </TouchableOpacity>
          </View> */}
          <View
            style={{
              // backgroundColor: "#20365F",
              // height: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() => navigation.navigate("Cards", { user: user })}
            >
              <Image
                source={require("../../../assets/images/listcards2.png")}
                style={{ height: 60, width: 60 }}
              />
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#20365F",
                }}
              >
                My Credit Cards
              </Text>
            </TouchableOpacity>
          </View>

          {/* <TouchableOpacity
            style={{
              backgroundColor: "#20365F",
              height: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => navigation.navigate("Cards", { user: user })}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 16,
                color: "white",
              }}
            >
              My Credit Cards
            </Text>
          </TouchableOpacity> */}
          {/* <GradientButton
            text="My Credit Cards"
            width="30%"
            height="50%"
            deepBlue
            impact
            textStyle={{
              fontSize: 15,
            }}
          /> */}

          {/* <Button
          title="My Credit Cards"
          onPress={() => navigation.navigate("Cards", { user: user })}
        /> */}
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "yellow",
    // justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#f5f0f0",
  },
});
