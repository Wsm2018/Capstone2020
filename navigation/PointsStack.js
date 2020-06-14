import { createStackNavigator } from "react-navigation-stack";
import PointsChartManagement from "../comps/Assets/PointsChartManagement";

const PointsStack = createStackNavigator(
  {
    Points: PointsChartManagement,
  },
  {
    // headerMode: null,
    headerStyle: { backgroundColor: "#185a9d" },
    headerTintColor: "white",
    // defaultNavigationOptions: ({ navigation }) => {
    //   if (navigation.state.routeName === "FriendsList") {
    //     return {
    //       headerLeft: () => (
    //         <Icon
    //           style={{ paddingLeft: 10 }}
    //           onPress={() => navigation.openDrawer()}
    //           name="md-menu"
    //           color="black"
    //           type="ionicon"
    //           size={30}
    //         />
    //       ),
    //     };
    //   }
    // },
  }
);
export default PointsStack;
