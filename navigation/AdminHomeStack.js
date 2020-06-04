import { createStackNavigator } from "react-navigation-stack";
import AdminHome from "../comps/Admin/Home";
import Users from "../comps/Admin/Users";
import Statistiscs from "../comps/Admin/Statistics";
import NewsPage from "../comps/NewsPage";
const AdminHomeStack = createStackNavigator({
  Home: AdminHome,
  Users: Users,
  Statistiscs: Statistiscs,
  News: NewsPage,
});

export default AdminHomeStack;
