import React from "react";
import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";
import ProfileScreen from "../comps/Profile/ProfileScreen";
import BalanceScreen from "../comps/Profile/BalanceScreen";
import ReferralScreen from "../comps/Profile/ReferralScreen";
import GiftScreen from "../comps/Profile/GiftScreen";
import AddCard from "../comps/Profile/AddCardScreen";
import CardsScreen from "../comps/Profile/CardsScreen";
import { Icon } from "react-native-elements";
const ProfileStack = createStackNavigator(
  {
    ProfileScreen: ProfileScreen,
    BalanceScreen: BalanceScreen,
    ReferralScreen: ReferralScreen,
    GiftScreen: GiftScreen,
    AddCard: AddCard,
    CardsScreen: CardsScreen,
  },
  {
    // headerMode: null,
    defaultNavigationOptions: ({ navigation }) => {
      if (navigation.state.routeName === "ProfileScreen") {
        return {
          headerLeft: () => (
            <Icon
              style={{ paddingLeft: 10 }}
              onPress={() => navigation.openDrawer()}
              name="md-menu"
              type="ionicon"
              size={30}
            />
          ),
        };
      }
    },
  }
);

export default ProfileStack;
