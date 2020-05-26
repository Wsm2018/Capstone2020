import React from "react";
import "firebase/auth";

import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";

import EmployeesCreate from "./EmployeesCreate";
import EmployeesCreateSuccess from "./EmployeesCreateSuccess";

const EmployeeHandlerStack = createAppContainer(
  createStackNavigator(
    {
      EmployeesCreate: EmployeesCreate,
      EmployeesCreateSuccess: EmployeesCreateSuccess,
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

export default function FriendsScreen(props) {
  return <EmployeeHandlerStack />;
}
