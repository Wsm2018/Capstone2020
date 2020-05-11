import { createStackNavigator } from "react-navigation-stack";
import HomePage from "../comps/HomePage";
import Payment from "../comps/Assets/Payment"
import CheckOut from "../comps/Assets/CheckOut"
import Assets from "../comps/Assets/Assets"
const HomeStack = createStackNavigator({
  Assets: Assets,
  Home: HomePage,
 
  
});

export default HomeStack;
