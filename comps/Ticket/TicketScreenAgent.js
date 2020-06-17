import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  Picker,
} from "react-native";

import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";

// import TicketCustomerSupport from "./TicketCustomerSupport"
import SupportChat from "./TicketSupportChat";
import TicketDetailScreen from "./TicketDetailScreen";
import TicketAgentScreen from "./TicketAgentScreen";
import TicketCustomerScreen from "./TicketCustomerScreen";
import { Icon, Divider } from "react-native-elements";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  FontAwesome,
  Entypo,
  Fontisto,
} from "@expo/vector-icons";
const TicketStack = createStackNavigator(
  {
    Agent: TicketAgentScreen,
    Chat: SupportChat,
    Details: TicketDetailScreen,
    Customer: TicketCustomerScreen,
  },
  {
    // initialRouteName: "Customer Support",

    defaultNavigationOptions: ({ navigation }) => {
      return {
        // headerLeft: (
        //   <Icon
        //     onPress={() => navigation.openDrawer()}
        //     name="md-menu"
        //     type="ionicon"
        //     color="white"
        //     size={30}
        //     containerStyle={{
        //       marginLeft: 15,
        //     }}
        //   />
        // ),
        headerStyle: {
          backgroundColor: "#185a9d",
        },
        // headerTitle: "FRIENDS",
        headerTintColor: "white",
      };
    },
  }
);

export default TicketStack;
