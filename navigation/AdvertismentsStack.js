import { createStackNavigator } from "react-navigation-stack";
import AdvertismentsPage from "../comps/AdvertismentsPage";
import AdvertisementsForm from "../comps/Advertisements/AdvertisementsForm";
import AdvertisementsRequest from "../comps/Advertisements/AdvertisementsRequest";
import React, { useState, useEffect } from "react";
import { Icon } from "react-native-elements";

const AdvertismentsStack = createStackNavigator(
  {
    // Advertisments: AdvertismentsPage,
    AdvertisementsForm: AdvertisementsForm,
    AdvertisementsRequest: AdvertisementsRequest,
  },
  {
    defaultNavigationOptions: ({ navigation }) => {
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
    },
  }
);

export default AdvertismentsStack;
