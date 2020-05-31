import React from "react";
import "firebase/auth";

import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";
import { Icon } from "react-native-elements";

import FriendsList from "./FriendsList";
import FriendsSearch from "./FriendsSearch";
import FriendsChat from "./FriendsChat";
import FriendsRequest from "./FriendsRequest";

const FriendsStack = createAppContainer(
  createStackNavigator(
    {
      FriendsList: FriendsList,
      FriendsSearch: FriendsSearch,
      FriendsChat: FriendsChat,
      FriendsRequest: FriendsRequest,
    },
    {
      // headerMode: null,
      defaultNavigationOptions: ({ navigation }) => {
        // const { routeName } = navigation.state.routes[navigation.state.index];
        return {
        
          headerLeft: (
            <Icon
              style={{ paddingRight: 10 }}
              onPress={() => navigation.FriendsList}
              name="md-menu"
              type="ionicon"
              color='white'
              size={30}
            />
          )
        ,
         headerStyle:{
           backgroundColor:'#20365F'
         },
         headerTitle:"FriendsList",
         headerTintColor:'white'
        };
      },
    }
  )
);

export default function FriendsScreen(props) {
  return <FriendsStack />;
}
