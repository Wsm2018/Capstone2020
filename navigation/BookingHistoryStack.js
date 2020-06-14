import React from "react";
import { createStackNavigator } from "react-navigation-stack";
import BookingHistory from "../comps/BookingHistory/BookingHistory";
import ExtendServices from "../comps/BookingHistory/ExtendServices";
import Payment from "../comps/BookingHistory/ExtensionPayment";
import { MaterialCommunityIcons } from "@expo/vector-icons";
const BookingStack = createStackNavigator(
  {
    BookingHistory: BookingHistory,
    ExtendServices: ExtendServices,
    Payment: Payment,
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
            style={{ marginLeft: 15 }}
          />
        ),
      };
    },
  }
);

export default BookingStack;
