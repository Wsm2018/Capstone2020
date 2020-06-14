import React from "react";
import { createStackNavigator } from "react-navigation-stack";
import NewsPage from "../comps/NewsPage";
import { Icon } from "react-native-elements";
const NewsStack = createStackNavigator(
  {
    News: NewsPage,
  },
  {
    // headerMode: null,
    headerStyle: { backgroundColor: "#185a9d" },
    headerTintColor: "white",
    defaultNavigationOptions: ({ navigation }) => {
      return {
        headerLeft: () => (
          <Icon
            style={{ paddingLeft: 10 }}
            onPress={() => navigation.openDrawer()}
            name="md-menu"
            color="white"
            type="ionicon"
            size={30}
          />
        ),
      };
    },
  }
);
export default NewsStack;
