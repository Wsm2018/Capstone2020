import React, { useState, useEffect } from "react";

import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";

import ViewScreen from "./FAQViewScreen";
import CreateScreen from "./FAQCreate";
import UpdateScreen from "./FAQScreen";

const FAQStack = createAppContainer(
  createStackNavigator(
    { View: ViewScreen, Create: CreateScreen, Update: UpdateScreen },
    {
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

export default function FAQScreen(props) {
  return <FAQStack />;
}
