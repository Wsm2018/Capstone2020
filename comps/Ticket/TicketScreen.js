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

const TicketStack = createAppContainer(
  createStackNavigator(
    {
      Customer: TicketCustomerScreen,
      Agent: TicketAgentScreen,
      Chat: SupportChat,
      Details: TicketDetailScreen,
    },
    {
      // initialRouteName: "Customer Support",

      defaultNavigationOptions: {
        headerStyle: {
          backgroundColor: "#006cab",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "normal",
        },
      },
    }
  )
);

export default function TicketScreen(props) {
  return <TicketStack />;
}
