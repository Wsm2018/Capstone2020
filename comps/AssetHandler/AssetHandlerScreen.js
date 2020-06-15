import React from "react";

import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";
import AssetManagement from "./AssetManagement";
import ServiceManagement from "./ServiceManagement";

const AppContainer = createAppContainer(
  createStackNavigator({
    AssetManagement: AssetManagement,
    ServiceManagement: ServiceManagement,
  })
);

export default function AssetHandlerStack() {
  return <AppContainer />;
}
