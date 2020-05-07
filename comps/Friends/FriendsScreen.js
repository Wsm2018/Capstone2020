import React from "react";
import "firebase/auth";

import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";

import FriendsList from "./FriendsList";
import FriendsSearch from "./FriendsSearch";

const FriendsStack = createAppContainer(
  createStackNavigator(
    {
      FriendsList: FriendsList,
      FriendsSearch: FriendsSearch,
    },
    {
      initialRouteName: "FriendsList",

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

export default function FriendsScreen(props) {
  return <FriendsStack />;
}
