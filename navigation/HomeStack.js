import { createStackNavigator } from "react-navigation-stack";
import HomePage from "../comps/HomePage";

const HomeStack = createStackNavigator({
  Home: HomePage,
});

export default HomeStack;
