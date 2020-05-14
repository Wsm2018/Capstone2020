import React from "react";
import { View, Text } from "react-native";
import { Icon } from "react-native-elements";

export default function DetailsScreen(props) {
  return (
    <View>
      <Icon
        name="car-sports"
        type="material-community"
        size={30}
        onPress={() => props.navigation.navigate("Car", { user: props.user })}
      />
      <Text>Cars Details</Text>

      <Icon
        name="credit-card"
        type="octicon"
        size={30}
        onPress={() =>
          props.navigation.navigate("Balance", { user: props.user })
        }
      />
      <Text>Balance Details</Text>
    </View>
  );
}
