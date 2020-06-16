import React from "react";

import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";
import AssetManagement from "./AssetManagement";
import ServiceManagement from "./ServiceManagement";
import { Icon } from "react-native-elements";

const AppContainer = createAppContainer(
  createStackNavigator(
    {
      AssetManagement: AssetManagement,
      ServiceManagement: ServiceManagement,
    },
    {
      defaultNavigationOptions: ({ navigation }) => {
        if (navigation.state.routeName === "AssetManagement") {
          return {
            // headerLeft: (
            //   <Icon
            //     onPress={() => navigation.openDrawer()}
            //     name="md-menu"
            //     type="ionicon"
            //     color="white"
            //     size={30}
            //     containerStyle={{
            //       marginLeft: 15,
            //     }}
            //   />
            // ),
            headerStyle: {
              backgroundColor: "#185a9d",
            },
            // headerTitleStyle={{color:"white"}}
            // headerTitle: "FRIENDS",
            headerTintColor: "white",
          };
        }
      },
    }
  )
);

export default function AssetHandlerStack() {
  return <AppContainer />;
}
