import { createStackNavigator } from "react-navigation-stack";
import HomePage from "../comps/HomePage";
import { Icon } from "react-native-elements";
const HomeStack = createStackNavigator(
  {
    Home: HomePage,
    // Friends: FriendsScreen,
  },
  {
    navigationOptions: ({ navigation }) => {
      header: null;
    },
  }
);

export default HomeStack;
