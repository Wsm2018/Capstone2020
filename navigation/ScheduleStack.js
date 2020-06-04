import { createStackNavigator } from "react-navigation-stack";
import Schedule from "../comps/Profile/Schedule";
import ScheduleMap from "../comps/Profile/ScheduleMap";
import ScheduleCompleted from "../comps/Profile/ScheduleCompleted";

const ScheduleStack = createStackNavigator({
  Schedule: Schedule,
  ScheduleMap: ScheduleMap,
  ScheduleCompleted: ScheduleCompleted,
});

export default ScheduleStack;
