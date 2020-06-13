import React from "react";
import { createStackNavigator } from "react-navigation-stack";
import { createBottomTabNavigator } from "react-navigation-tabs";
import { createDrawerNavigator, DrawerItems } from "react-navigation-drawer";
// import TabBarIcon from "../components/TabBarIcon";
import { Avatar, Icon } from "react-native-elements";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import HomePage from "../comps/HomePage";
import Payment from "../comps/Assets/Payment";
import CheckOut from "../comps/Assets/CheckOut";
import Assets from "../comps/Assets/Assets";
import Details from "../comps/Assets/Details";
import Sections from "../comps/Assets/Sections";
import List from "../comps/Assets/List";
import Types from "../comps/Assets/Types";

const HomeStack = createStackNavigator(
  {
    Types: Types,
    Assets: Assets,
    Home: HomePage,
    Sections: Sections,
    List: List,
    Details: Details,
    Payment: Payment,
    CheckOut: CheckOut,
  },
  {
    defaultNavigationOptions: ({ navigation }) => {
      return {
        headerLeft: () => (
          <MaterialCommunityIcons
            // style={{ marginLeft: 20 }}
            onPress={() => navigation.openDrawer()}
            name="menu"
            color="white"
            // type="MaterialCommunityIcons"
            size={28}
          />
        ),
      };
    },
  }
);

export default HomeStack;
