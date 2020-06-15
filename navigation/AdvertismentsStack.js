import { createStackNavigator } from "react-navigation-stack";
import AdvertismentsPage from "../comps/AdvertismentsPage";
import AdvertisementsForm from "../comps/Advertisements/AdvertisementsForm";
import AdvertisementsRequest from "../comps/Advertisements/AdvertisementsRequest";
import Payment from "../comps/Advertisements/AdvertisementsPayment";

import React, { useState, useEffect } from "react";
import { Icon } from "react-native-elements";
import MyAdvertisements from "../comps/Advertisements/MyAdvertisements";

const AdvertismentsStack = createStackNavigator(
  {
    // Advertisments: AdvertismentsPage,
    MyAdvertisements: MyAdvertisements,
    AdvertisementsForm: AdvertisementsForm,
    AdvertisementsRequest: AdvertisementsRequest,
    AdvertisementsPayment: Payment,
  },
  {
    defaultNavigationOptions: ({ navigation }) => {
      if (navigation.state.routeName === "MyAdvertisements") {
        return {
          headerLeft: (
            <Icon
              onPress={() => navigation.openDrawer()}
              name="md-menu"
              type="ionicon"
              color="white"
              size={30}
              containerStyle={{
                marginLeft: 15,
              }}
            />
          ),
          headerStyle: {
            backgroundColor: "#185a9d",
          },
          // headerTitle: "FRIENDS",
          headerTintColor: "white",
        };
      }
    },
  }
);

export default AdvertismentsStack;
