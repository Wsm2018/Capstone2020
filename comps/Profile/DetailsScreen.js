import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import {
  FontAwesome5,
  Fontisto,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";

export default function DetailsScreen(props) {
  return (
    <View style={styles.container}>
      <View
        style={{
          marginTop: "5%",
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FontAwesome5
            name="car-side"
            size={35}
            color="black"
            onPress={() =>
              props.navigation.navigate("Car", { user: props.user })
            }
          />
          {/* <FontAwesome5 name="car-side" size={50} color="black" /> */}
          <Text
            style={{
              color: "black",
              fontWeight: "bold",
              // textShadowColor: "rgba(0, 0, 0, 0.75)",
              // // textShadowOffset: { width: -1, height: 1 },
              // // textShadowRadius: 10,
              fontSize: 16,
            }}
          >
            Cars Details
          </Text>
        </View>
        <View
          style={{
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Fontisto
            name="wallet"
            color="black"
            size={35}
            onPress={() =>
              props.navigation.navigate("Balance", { user: props.user })
            }
          />
          <Text
            style={{
              color: "black",
              fontWeight: "bold",
              // textShadowColor: "black",
              // // textShadowOffset: { width: -1, height: 1 },
              // // textShadowRadius: 10,
              fontSize: 16,
            }}
          >
            Balance Details
          </Text>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
