//@refresh reset
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  AsyncStorage,
  AppState,
  Dimensions,
} from "react-native";

import LottieView from "lottie-react-native";
import Authentication from "./mainpages/Authentication";
console.disableYellowBox = true;
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";
import { encode, decode } from "base-64";

if (!global.btoa) {
  global.btoa = encode;
}
if (!global.atob) {
  global.atob = decode;
}

import { createAppContainer } from "react-navigation";
import { createBottomTabNavigator } from "react-navigation-tabs";
import { createDrawerNavigator, DrawerItems } from "react-navigation-drawer";
import HomeStack from "./navigation/HomeStack";
import ProfileStack from "./navigation/ProfileStack";
import FriendsStack from "./comps/Friends/FriendsScreen";
import Guide from "./mainpages/Guide";
import { Icon } from "react-native-elements";
import { createStackNavigator } from "react-navigation-stack";
import NewsStack from "./navigation/NewsStack";
import ScheduleStack from "./navigation/ScheduleStack";
import AdvertismentsStack from "./navigation/AdvertismentsStack";
import db from "./db";
import AdminHomeStack from "./navigation/AdminHomeStack";
import BookingHistory from "./comps/Profile/BookingHistory";
import ManagersStack from "./comps/Managers/ManagersScreen";
import UserHandlerStack from "./comps/UserHandler/UserHandlerScreen";
import EmployeeAuthentication from "./mainpages/EmployeeAuthentication";
import ChooseRole from "./mainpages/ChooseRole";

import * as Location from "expo-location";

// import AsyncStorage from "@react-native-community/async-storage";

export default function App(props) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [firstLaunch, setFirstLaunch] = useState(false);
  const [guideView, setGuideView] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [activeRole, setActiveRole] = useState(null);

  const handleLogout = async () => {
    const userInfo = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    if (userInfo.data().role === "guest") {
      await fetch(
        `https://us-central1-capstone2020-b64fd.cloudfunctions.net/deleteGuestUser?uid=${
          firebase.auth().currentUser.uid
        }`
      );
      firebase.auth().signOut();
    } else {
      db.collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({ status: "offline" });
      firebase.auth().signOut();
    }
  };

  //////////////////////Themes////////////////////////////////////
  const [theme, setTheme] = useState(null);

  async function getTheme() {
    let value = await AsyncStorage.getItem("theme");
    if (value === null) {
      await AsyncStorage.setItem("theme", "light");
      value = await AsyncStorage.getItem("theme");
      setTheme(value);
      console.log(value, "111111111111111111111");
    } else {
      setTheme(value);
      console.log(value, "222222222222222222222");
    }
    // AsyncStorage.clear();
  }

  // useEffect(() => {
  //   getTheme();
  // }, []);

  ///////////////////////////////////////////////////////////////////

  const Test = () => {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Test</Text>
      </View>
    );
  };

  const DashboardTabNavigator = createBottomTabNavigator(
    {
      Home: HomeStack,

      News: NewsStack,
      BookingHistory: BookingHistory,
      Advertisments: AdvertismentsStack,

      Profile: ProfileStack,
    },
    //   navigationOptions: ({ navigation }) => {
    //     const { routeName } = navigation.state.routes[navigation.state.index];
    //     return {
    //       headerShown: true,
    //       headerTitle: routeName,
    //     };
    //   },
    // },
    {
      tabBarOptions: {
        activeTintColor: "white",
        inactiveTintColor: "gray",
        // style: { backgroundColor: theme === "light" ? "#185a9d" : "black" },
        style: { backgroundColor: "#185a9d" },
      },
    }
  );

  const DashboardStackNavigator = createStackNavigator(
    {
      DashboardTabNavigator: DashboardTabNavigator,
    },
    {
      // defaultNavigationOptions: ({ navigation }) => {
      //   return {
      //     headerLeft: (
      //       <Icon
      //         style={{ paddingLeft: 10 }}
      //         onPress={() => navigation.openDrawer()}
      //         name="md-menu"
      //         type="ionicon"
      //         size={30}
      //       />
      //     ),
      //   };
      // },
      headerMode: null,
    }
  );

  const FriendsStk = createStackNavigator(
    { Friends: FriendsStack },
    {
      // initialRouteName: "FriendsList",

      defaultNavigationOptions: ({ navigation }) => {
        return {
          headerLeft: (
            <Icon
              style={{ paddingRight: 10 }}
              onPress={() => navigation.FriendsList}
              name="md-menu"
              type="ionicon"
              color="white"
              size={30}
            />
          ),
          headerStyle: {
            backgroundColor: "#185a9d",
          },
          headerTitle: "FRIENDS",
          headerTintColor: "white",
        };
      },
    }
  );

  const AppDrawerNavigator = createDrawerNavigator(
    {
      Home: {
        screen: DashboardStackNavigator,
      },
      Friends: {
        screen: FriendsStk,
      },
    },
    {
      drawerBackgroundColor: "#F0F8FF",
      contentOptions: {
        activeTintColor: "black",
        inactiveTintColor: "black",
      },
      contentComponent: (props) => (
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              height: 200,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SafeAreaView style={{ marginTop: "19%" }}>
              <View style={{ flexDirection: "row" }}>
                {user && (
                  <Image
                    source={{ uri: user.qrCode }}
                    style={{ width: 150, height: 150 }}
                  />
                )}
                <Text style={{ fontSize: 20 }}>{user && user.displayName}</Text>
              </View>
            </SafeAreaView>
          </View>
          <View>
            <Text>{user && user.email}</Text>
            <Text>{user && user.phone}</Text>
          </View>

          <ScrollView>
            <DrawerItems {...props} />
          </ScrollView>
          <View>
            <TouchableOpacity onPress={handleLogout}>
              <Text>Logout {user && user.displayName}</Text>
            </TouchableOpacity>
          </View>
          {user.role === "admin" ||
          user.role === "manager" ||
          user.role === "user handler" ||
          user.role === "asset handler" ||
          user.role === "customer" ? (
            <View>
              <TouchableOpacity onPress={handleChangeRole}>
                <Text>Change Role {user && user.displayName}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </SafeAreaView>
      ),
    }
  );

  const AppContainer = createAppContainer(AppDrawerNavigator);

  async function getUser() {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((userRef) => {
        console.log("userRef", userRef.data().activeRole);
        setActiveRole(userRef.data().activeRole);
      });

    const userRef = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    const getAdmin = firebase.functions().httpsCallable("getAdmin");
    const response = await getAdmin({
      email: firebase.auth().currentUser.email,
    });

    const admin = response.data.result !== undefined ? true : false;

    const user = { ...userRef.data(), admin };

    await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({ activeRole: user.role });

    console.log("userRole", user.role);
    console.log("userActiveRole", user.activeRole);
    setUser(user);
  }

  async function getFirstLaunch() {
    const value = await AsyncStorage.getItem("alreadyLaunched");
    // console.log("valueeeeeeeeeeeee", value);
    if (value === null) {
      await AsyncStorage.setItem("alreadyLaunched", "true");
      // console.log("trueeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
      setFirstLaunch(true);
    } else {
      // console.log("falseeeeeeeeeeeeeeeeeeeeeee");
      setFirstLaunch(false);
    }
  }

  const handleChangeRole = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({ activeRole: null });
  };

  useEffect(() => {
    getFirstLaunch();
    getTheme();
  }, []);

  const handleAppState = (nextAppState) => {
    if (nextAppState === "active") {
      db.collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({ status: "online" });
    } else {
      db.collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({ status: "offline" });
    }
  };

  const getCurrentLocation = async () => {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    console.log(location);
  };

  const updateLocation = async () => {
    let location = await Location.getCurrentPositionAsync({});
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      });
  };

  // --------------------------------LOCATION TRACKER----------------------------------
  // User Location gets updated when logged in then every 10 seconds while logged in
  const locationTracker = () => {
    const timerId = setInterval(async () => {
      // code here
      let location = await Location.getCurrentPositionAsync({});
      db.collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        });
      console.log("update location");
    }, 1000 * 10);
    return timerId;
  };

  // --------------------------------USE EFFECT----------------------------------
  // Runs when user logs in or out
  // Adds user status listener
  // Adds location tracker
  useEffect(() => {
    if (loggedIn) {
      AppState.addEventListener("change", handleAppState);
      db.collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({ status: "online" });

      updateLocation();
      getUser();
      // const trackerId = locationTracker();

      return () => {
        // clearInterval(trackerId);
        AppState.removeEventListener("change", handleAppState);
        setUser(null);
        setActiveRole(null);
        console.log("Logging Out");
      };
    }
  }, [loggedIn]);

  useEffect(() => {}, [user]);

  useEffect(() => {
    return firebase.auth().onAuthStateChanged(setLoggedIn);
  }, []);

  const adminTabNav = createBottomTabNavigator(
    {
      Home: AdminHomeStack,
      Profile: ProfileStack,
      BookingHistory: BookingHistory,
    },
    {
      tabBarOptions: {
        activeTintColor: "white",
        inactiveTintColor: "gray",
        style: { backgroundColor: "#005c9d" },
      },
    }
  );

  const AdminAppContainer = createAppContainer(adminTabNav);

  const serviceEmployeeTabNav = createBottomTabNavigator({
    Schedule: ScheduleStack,
    Home: HomeStack,

    News: NewsStack,

    Profile: ProfileStack,
  });
  const ServiceEmployeeAppContainer = createAppContainer(serviceEmployeeTabNav);

  const guideSkip = () => {
    // console.log("Skipppped");
    setGuideView(false);
  };

  if (loggedIn !== false) {
    if (!loggedIn) {
      return (
        <View style={styles.container}>
          <Authentication />
        </View>
      );
    } else {
      // if user info already retrieved
      if (user) {
        // if users first launch show guideView
        // if (guideView) {
        if (firstLaunch && guideView) {
          return <Guide guideSkip={guideSkip} />;
        }
        // --------------------------------CUSTOMER----------------------------------
        // if user is customer or service employee go to <AppContainer/>
        else if (user.role === "customer") {
          return <AppContainer />;
        }
        // --------------------------------SERVICE EMPLOYEE----------------------------------
        // if user is customer or service employee go to <AppContainer/>
        else if (user.role === "services employee") {
          return <ServiceEmployeeAppContainer />;
        }
        // --------------------------------EMPLOYEE AUTHENTICATION----------------------------------
        // If employee account is incomplete go to employeeAuthenticate
        else if (user.role.slice(-12) === "(incomplete)") {
          return <EmployeeAuthentication user={user} setUser={setUser} />;
        }
        // If employee is any OTHER role
        else {
          // --------------------------------CHOOSE ROLE----------------------------------
          // if big boi employee with null active roll THEN choose active role
          if (activeRole === null) {
            return <ChooseRole role={user.role} />;
            // return <ManagersStack />;
          }
          // Which activeRole did you choose
          else {
            switch (activeRole) {
              case "admin":
                return <AdminAppContainer />;
              // return <FriendsStack />;

              case "manager":
                return <ManagersStack />;

              case "user handler":
                return <UserHandlerStack />;

              case "asset handler":
                return <AppContainer />;

              case "customer support":
                return <AppContainer />;

              case "services employee":
                return <ServiceEmployeeAppContainer />;

              case "customer":
                return <AppContainer />;

              default:
                // ---We dun goofed---
                return (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text>THERES A NEW ROLE?</Text>
                  </View>
                );
            }
          }
        }
      } else {
        return (
          <View
            style={{
              flex: 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              width={Dimensions.get("window").width / 6}
              source={require("./assets/images/mylogo.png")}
              autoPlay
              loop
              style={{
                position: "relative",
                width: "50%",
                height: "30%",
              }}
            />
            <LottieView
              width={Dimensions.get("window").width / 2}
              source={require("./assets/loadingAnimations/890-loading-animation.json")}
              autoPlay
              loop
              style={{
                position: "relative",
                width: "50%",
              }}
            />
          </View>
        );
      }
    }
  } else {
    return (
      <View
        style={{
          flex: 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          width={Dimensions.get("window").width / 6}
          source={require("./assets/images/mylogo.png")}
          autoPlay
          loop
          style={{
            position: "relative",
            width: "50%",
            height: "30%",
          }}
        />
        <LottieView
          width={Dimensions.get("window").width / 2}
          source={require("./assets/loadingAnimations/890-loading-animation.json")}
          autoPlay
          loop
          style={{
            position: "relative",
            width: "50%",
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
