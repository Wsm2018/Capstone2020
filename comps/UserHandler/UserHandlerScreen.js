import React from "react";
import "firebase/auth";

import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";

import EmployeesCreate from "./EmployeesCreate";
import EmployeesCreateSuccess from "./EmployeesCreateSuccess";
import UsersIndex from "./UsersIndex";
import EmployeesIndex from "./EmployeesIndex";
import EmployeesDetail from "./EmployeesDetail";

import indexUH from "./indexUH";
import test from "./test";

const EmployeeHandlerStack = createAppContainer(
  createStackNavigator(
    {
      indexUH: indexUH,
      EmployeesIndex: EmployeesIndex,
      UsersIndex: UsersIndex,
      EmployeesCreate: EmployeesCreate,
      EmployeesCreateSuccess: EmployeesCreateSuccess,
      EmployeesDetail: EmployeesDetail,

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
