import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import BalanceScreen from "./Cards/BalanceScreen";
import { Icon } from "react-native-elements";
import { Card } from "react-native-shadow-cards";

import {
  FontAwesome5,
  Fontisto,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";

export default function DetailsScreen(props) {
  return (
    <View style={styles.container}>
      <View style={{ flex: 2 }}>
        <Card
          elevation={2}
          style={{
            width: "100%",
            flex: 1,
            // backgroundColor: "red",
            // flexDirection: "column",
            // justifyContent: "center",
            // alignItems: "center",
            borderWidth: 1,
            borderTopWidth: 0,

            borderColor: "darkgray",
          }}
        >
          <BalanceScreen navigation={props.navigation} />
        </Card>
      </View>

      <Card
        elevation={2}
        style={{
          marginTop: "5%",
          width: "100%",
          borderWidth: 1,
          borderColor: "darkgray",
          flex: 0.8,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <FontAwesome5
            name="heart"
            size={35}
            color="black"
            onPress={() =>
              props.navigation.navigate("Car", { user: props.user })
            }
          />

          <Image
            source={require("../../assets/images/caricon4.png")}
            style={{ height: 38, width: 85 }}
            onPress={() =>
              props.navigation.navigate("Car", { user: props.user })
            }
          />
          <Image
            source={require("../../assets/images/bookingicon.png")}
            style={{ height: 48, width: 48 }}
            onPress={() =>
              props.navigation.navigate("Car", { user: props.user })
            }
          />
        </View>
      </Card>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f0f0",
  },
});
