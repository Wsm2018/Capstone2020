import { createStackNavigator } from "react-navigation-stack";
import AdvertismentsPage from "../comps/AdvertismentsPage";
import AdvertisementsForm from "../comps/Advertisements/AdvertisementsForm";
import AdvertisementsRequest from "../comps/Advertisements/AdvertisementsRequest";

const AdvertismentsStack = createStackNavigator({
  // Advertisments: AdvertismentsPage,
  AdvertisementsForm: AdvertisementsForm,
  AdvertisementsRequest: AdvertisementsRequest,
});

export default AdvertismentsStack;
