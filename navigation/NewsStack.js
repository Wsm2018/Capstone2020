import { createStackNavigator } from "react-navigation-stack";
import NewsPage from "../comps/NewsPage";

const NewsStack = createStackNavigator({
  News: NewsPage,
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
})
;

export default NewsStack;
