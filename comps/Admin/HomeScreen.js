//@refresh reset
import React from "react";
import AdminHomeStack from "../../navigation/AdminHomeStack";
import { createAppContainer } from "react-navigation";

export default function HomeScreen() {
  const AppContainer = createAppContainer(AdminHomeStack);

  return <AppContainer />;
}
