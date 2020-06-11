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
import BookingHistory from "../comps/Profile/BookingHistory";
import Payment from "../comps/Profile/ExtensionPayment";
import Subscription from "../comps/SubscriptionsScreen";

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
    BookingHistory: BookingHistory,
    Payment: Payment,
    Subscription: Subscription,
  },
  {
    defaultNavigationOptions: ({ navigation }) => {
      if (navigation.state.routeName === "Profile") {
        return {
          headerLeft: () => (
            <Icon
              // style={{ marginLeft: 20 }}
              onPress={() => navigation.openDrawer()}
              name="menu"
              color="white"
              type="MaterialCommunityIcons"
              size={28}
            />
          ),
        };
      }
    },
  }
);

export default ProfileStack;
