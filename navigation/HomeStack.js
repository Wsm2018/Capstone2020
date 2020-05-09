import { createStackNavigator } from "react-navigation-stack";
import HomePage from "../comps/HomePage";
import Payment from "../comps/Payment"
import CheckOut from "../comps/CheckOut"
const HomeStack = createStackNavigator({
  Home: HomePage,
  Payment: Payment,
  CheckOut: CheckOut
});

export default HomeStack;
