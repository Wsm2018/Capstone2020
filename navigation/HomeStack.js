import { createStackNavigator } from "react-navigation-stack";
import { createBottomTabNavigator } from "react-navigation-tabs";
import { createDrawerNavigator, DrawerItems } from "react-navigation-drawer";
// import TabBarIcon from "../components/TabBarIcon";
import { Avatar, Icon } from "react-native-elements";

import HomePage from "../comps/HomePage";
// import ProfilePage from "../comps/Profile";
// import SettingsPage from "../comps/Settings";

// const Home = createStackNavigator({
//   Home: HomePage,

//   // tabStack: tabNavigator,
// });

// Home.navigationOptions = {
//   tabBarLabel: "Main",
//   // tabBarIcon: ({ focused }) => (
//   //   // <TabBarIcon
//   //   //   focused={focused}
//   //   //   name={Platform.OS === "ios" ? `md-home` : "md-home"}
//   //   // />
//   // ),
// };

// const Profile = createStackNavigator({
//   Profile: ProfilePage,
//   // tabStack: tabNavigator,
// });

// Profile.navigationOptions = {
//   tabBarLabel: "Profile",
//   // tabBarIcon: ({ focused }) => (
//   //   // <TabBarIcon
//   //   //   focused={focused}
//   //   //   name={Platform.OS === "ios" ? `md-home` : "md-home"}
//   //   // />
//   // ),
// };

// const Settings = createStackNavigator({
//   Settings: SettingsPage,
//   // tabStack: tabNavigator,
// });

// Settings.navigationOptions = {
//   tabBarLabel: "Settings",
//   // tabBarIcon: ({ focused }) => (
//   //   // <TabBarIcon
//   //   //   focused={focused}
//   //   //   name={Platform.OS === "ios" ? `md-home` : "md-home"}
//   //   // />
//   // ),
// };

// const tabNavigator = createBottomTabNavigator(
//   {
//     Home,
//     Profile,
//     Settings,

//     // AdminStack: AdminStack,
//   },
//   {
//     navigationOptions: ({ navigation }) => {
//       const { routeName, routes } = navigation.state.routes[
//         navigation.state.index
//       ];
//       return {
//         header: null,
//         headerTitle: routeName,
//       };
//     },
//     tabBarOptions: {
//       activeTintColor: "#edf3f8",
//       inactiveTintColor: "white",
//       style: {
//         backgroundColor: "#5a91bf",
//       },
//     },
//   }
// );

// tabNavigator.path = "";

// const HomeStk = createStackNavigator({
//   Home: tabNavigator,
//   // Home: Home,
// });

// const ProfileStk = createStackNavigator({
//   Profile: tabNavigator,
//   // Home: Home,
// });

// const SettingsStk = createStackNavigator({
//   Settings: tabNavigator,
//   // Home: Home,
// });

// const AppDrawerNavigator = createDrawerNavigator({
//   Home: {
//     screen: HomeStk,
//   },
//   Profile: {
//     screen: ProfileStk,
//   },
//   Settings: { screen: SettingsStk },
// });
//import { Icon } from "react-native-elements";
//const HomeStack = createStackNavigator(
 // {
    //Home: HomePage,
    // Friends: FriendsScreen,
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
