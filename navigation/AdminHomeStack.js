import { createStackNavigator } from "react-navigation-stack";
import AdminHome from "../comps/Admin/Home";
import Users from "../comps/Admin/Users";

const AdminHomeStack = createStackNavigator({
  Home: AdminHome,
  Users: Users,
});

export default AdminHomeStack;
