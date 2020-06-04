import React from "react";
import "firebase/auth";

import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";

import ManagersRequest from "./ManagersRequest";
import ManagersRequestDetail from "./ManagersRequestDetail";

import ManagersHome from "./ManagersHome";

const ManagersStack = createAppContainer(
  createStackNavigator(
    {
    //  ManagersHome: ManagersHome,
      ManagersRequest: ManagersRequest,
      ManagersRequestDetail: ManagersRequestDetail,
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
