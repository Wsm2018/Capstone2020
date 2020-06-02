import { createStackNavigator } from "react-navigation-stack";
import HomePage from "../comps/HomePage";
import Payment from "../comps/Assets/Payment"
import CheckOut from "../comps/Assets/CheckOut"
import Assets from "../comps/Assets/Assets"
import Details from "../comps/Assets/Details"
import Sections from "../comps/Assets/Sections"
import List from "../comps/Assets/List"
import Types from "../comps/Assets/Types"
import AssetManager from "../comps/Assets/AssetManagement"
import ServiceManagement from "../comps/Assets/ServiceManagement"
import BookingHistory from "../comps/Profile/BookingHistory"
import ExtendServices from "../comps/Profile/ExtendServices"

const HomeStack = createStackNavigator({
// BookingHistory: BookingHistory,
AssetManager: AssetManager,
  //ExtendServices: ExtendServices,
  ServiceManagement:ServiceManagement,
  Types: Types,
  Assets: Assets,
  Home: HomePage,
  Sections: Sections,
  List: List,
  Details: Details,
  Payment: Payment,
  CheckOut: CheckOut

},  {
  navigationOptions: ({ navigation }) => {
    header: null;
  },
});

export default HomeStack;
