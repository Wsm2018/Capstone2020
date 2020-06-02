import { createStackNavigator } from "react-navigation-stack";
import AdminHome from "../comps/Admin/Home";
import Users from "../comps/Admin/Users";
import Statistiscs from "../comps/Admin/Statistics";
import MakeAdmin from "../comps/Admin/MakeAdmin";
// import HomeStack from "./HomeStack";
import HomePage from "../comps/HomePage";
import Payment from "../comps/Assets/Payment";
import CheckOut from "../comps/Assets/CheckOut";
import Assets from "../comps/Assets/Assets";
import Details from "../comps/Assets/Details";
import Sections from "../comps/Assets/Sections";
import List from "../comps/Assets/List";
import Types from "../comps/Assets/Types";
const AdminHomeStack = createStackNavigator({
  Home: AdminHome,
  Users: Users,
  MakeAdmin: MakeAdmin,
  Statistics: Statistiscs,
  Types: Types,
  Assets: Assets,
  // Home: HomePage,
  Sections: Sections,
  List: List,
  Details: Details,
  Payment: Payment,
  CheckOut: CheckOut,
});

export default AdminHomeStack;
