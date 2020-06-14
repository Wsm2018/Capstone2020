import React, { useState, useEffect } from "react";

import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";
import { Icon } from "react-native-elements";
import ViewScreen from "./FAQViewScreen";
import CreateScreen from "./FAQCreate";
import UpdateScreen from "./FAQUpdate";

const FAQStack = createStackNavigator(
  { View: ViewScreen, Create: CreateScreen, Update: UpdateScreen },
  {
    defaultNavigationOptions: ({ navigation }) => {
      return {
        headerLeft: (
          <Icon
            onPress={() => navigation.openDrawer()}
            name="md-menu"
            type="ionicon"
            color="white"
            size={30}
            containerStyle={{
              marginLeft: 15,
            }}
          />
        ),
        headerStyle: {
          backgroundColor: "#185a9d",
        },
        headerTitle: "FAQ",
        headerTintColor: "white",
      };
    },
  }
);

export default FAQStack;
