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
import Promotion from "../comps/Admin/Promotion/PromotionList";
import AddPromotion from "../comps/Admin/Promotion/AddPromotion";
// import NewsPage from "../comps/NewsPage";

import NewsPage from "../comps/NewsPage";
const AdminHomeStack = createStackNavigator({
  Home: AdminHome,
  Users: Users,
  MakeAdmin: MakeAdmin,
  Statistics: Statistiscs,
  Types: Types,
  Assets: Assets,
  Sections: Sections,
  List: List,
  Details: Details,
  Payment: Payment,
  CheckOut: CheckOut,
  Promotion: Promotion,
  AddPromotion: AddPromotion,
  News: NewsPage,
});

export default AdminHomeStack;
