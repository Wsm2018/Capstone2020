import { createStackNavigator } from "react-navigation-stack";
import AdminHome from "../comps/Admin/Home";
import Users from "../comps/Admin/Users";
import Statistiscs from "../comps/Admin/Statistics";
const AdminHomeStack = createStackNavigator({
  Home: AdminHome,
  Users: Users,
  Statistiscs: Statistiscs,
});

export default AdminHomeStack;
