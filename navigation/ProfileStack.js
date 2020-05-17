import React from "react";
import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";
import ProfileScreen from "../comps/Profile/ProfileScreen";
import BalanceScreen from "../comps/Profile/Cards/BalanceScreen";
import ReferralScreen from "../comps/Profile/ReferralScreen";
import GiftScreen from "../comps/Profile/GiftScreen";
import AddCard from "../comps/Profile/Cards/AddCardScreen";
import CardsScreen from "../comps/Profile/Cards/CardsScreen";
import DetailsScreen from "../comps/Profile/DetailsScreen";
import AddCars from "../comps/Profile/Cars/AddCars";
import CarsScreen from "../comps/Profile/Cars/CarsScreen";
import CarDetail from "../comps/Profile/Cars/CarDetail";

import { Icon } from "react-native-elements";
const ProfileStack = createStackNavigator(
  {
    Profile: ProfileScreen,
    Details: DetailsScreen,
    Balance: BalanceScreen,
    Referral: ReferralScreen,
    Gift: GiftScreen,
    AddCard: AddCard,
    Cards: CardsScreen,
    Car: CarDetail,
    AddCars: AddCars,
    AllCars: CarsScreen,
  },
  {
    // headerMode: null,
    defaultNavigationOptions: ({ navigation }) => {
      if (navigation.state.routeName === "Profile") {
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
      }
    },
  }
);

export default ProfileStack;
