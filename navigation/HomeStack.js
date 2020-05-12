import { createStackNavigator } from "react-navigation-stack";
import HomePage from "../comps/HomePage";
import Payment from "../comps/Assets/Payment"
import CheckOut from "../comps/Assets/CheckOut"
import Assets from "../comps/Assets/Assets"
import Details from "../comps/Assets/Details"
import Sections from "../comps/Assets/Sections"
import List from "../comps/Assets/List"
import Types from "../comps/Assets/Types"

const HomeStack = createStackNavigator({
  
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
