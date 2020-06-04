import { createStackNavigator } from "react-navigation-stack";
import AdvertismentsPage from "../comps/AdvertismentsPage";

const AdvertismentsStack = createStackNavigator({
    Advertisments: AdvertismentsPage,
});

export default AdvertismentsStack;
