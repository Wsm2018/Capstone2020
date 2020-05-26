import React from "react";
import "firebase/auth";

import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";

import EmployeesCreate from "./EmployeesCreate";
import EmployeesCreateSuccess from "./EmployeesCreateSuccess";
import test from "./test";

const EmployeeHandlerStack = createAppContainer(
  createStackNavigator(
    {
      EmployeesCreate: EmployeesCreate,
      EmployeesCreateSuccess: EmployeesCreateSuccess,
      test: test,
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
