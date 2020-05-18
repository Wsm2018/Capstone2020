import { createStackNavigator } from "react-navigation-stack";
import NewsPage from "../comps/NewsPage";

const NewsStack = createStackNavigator({
  News: NewsPage,
});

export default NewsStack;
