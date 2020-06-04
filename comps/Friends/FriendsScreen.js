import React from "react";
import "firebase/auth";

import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";
import { Icon } from "react-native-elements";

import FriendsList from "./FriendsList";
import FriendsSearch from "./FriendsSearch";
import FriendsChat from "./FriendsChat";
import FriendsRequest from "./FriendsRequest";
import FriendsMap from "./FriendsMap";

const FriendsStack = createAppContainer(
  createStackNavigator(
    {
      FriendsList: FriendsList,
      FriendsSearch: FriendsSearch,
      FriendsChat: FriendsChat,
      FriendsRequest: FriendsRequest,
      FriendsMap: FriendsMap,
    },
    {
      // headerMode: null,
      defaultNavigationOptions: ({ navigation }) => {
        if (navigation.state.routeName === "FriendsList") {
          return {
            headerLeft: () => (
              <Icon
                style={{ paddingLeft: 10 }}
                onPress={() => navigation.openDrawer()}
                name="md-menu"
                color="black"
                type="ionicon"
                size={30}
              />
            ),
          };
        }
      },
    }
  )
);

export default function FriendsScreen(props) {
  return <FriendsStack />;
}
