import { createStackNavigator } from "react-navigation-stack";
import HomePage from "../comps/HomePage";
import Payment from "../comps/Payment"

const HomeStack = createStackNavigator({
  Payment: Payment,
  Home: HomePage,
  
});

export default HomeStack;
