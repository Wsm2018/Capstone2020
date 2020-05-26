import React from "react";
import "firebase/auth";

import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";

import ManagersRequest from "./ManagersRequest";

const ManagersStack = createAppContainer(
  createStackNavigator(
    {
      ManagersRequest: ManagersRequest,
    },
    {
      // initialRouteName: "FriendsList",

      defaultNavigationOptions: {
        // header: null,
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

export default function ManagersScreen(props) {
  return <ManagersStack />;
}
