import { createStackNavigator } from "react-navigation-stack";
import ServicePage from "../comps/ServicePage";

const ServiceStack = createStackNavigator({
  Service: ServicePage,
});

export default ServiceStack;
