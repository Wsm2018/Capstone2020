import React from "react";
import "firebase/auth";

import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";

import EmployeesCreate from "./EmployeesCreate";
import EmployeesCreateSuccess from "./EmployeesCreateSuccess";
import EmployeesIndex from "./EmployeesIndex";
import EmployeesDetail from "./EmployeesDetail";
import EmployeesPending from "./EmployeesPending";
import EmployeesAllowed from "./EmployeesAllowed";

import CustomersIndex from "./CustomersIndex";
import CustomersDetail from "./CustomersDetail";

import UserHandlerHome from "./UserHandlerHome";

import Loading from "./Loading";

const EmployeeHandlerStack = createAppContainer(
  createStackNavigator(
    {
      UserHandlerHome: UserHandlerHome,

      EmployeesIndex: EmployeesIndex,
      EmployeesCreate: EmployeesCreate,
      EmployeesCreateSuccess: EmployeesCreateSuccess,
      EmployeesDetail: EmployeesDetail,
      EmployeesPending: EmployeesPending,
      EmployeesAllowed: EmployeesAllowed,

      CustomersIndex: CustomersIndex,
      CustomersDetail: CustomersDetail,

      Loading: Loading,
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
