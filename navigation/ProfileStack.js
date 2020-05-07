import { createStackNavigator } from "react-navigation-stack";
import ProfileScreen from "../comps/Profile/ProfileScreen";

const ProfileStack = createStackNavigator({
  ProfileScreen: ProfileScreen,
});

export default ProfileStack;
