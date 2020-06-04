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
} from "react-native";
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
import db from "./db";
import AdminHomeStack from "./navigation/AdminHomeStack";

import ManagersStack from "./comps/Managers/ManagersScreen";
import UserHandlerStack from "./comps/UserHandler/UserHandlerScreen";
import EmployeeAuthentication from "./mainpages/EmployeeAuthentication";
import ChooseRole from "./mainpages/ChooseRole";

import Theme from "react-native-themes";

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

      Profile: ProfileStack,
    },
    // {
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
        style: { backgroundColor: theme === "light" ? "#20365F" : "black" },
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
            backgroundColor: "#20365F",
          },
          headerTitle: "Friends List",
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
      .update({ activeRole: null });

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

  useEffect(() => {
    if (loggedIn) {
      getUser();
    }
  }, [loggedIn]);

  useEffect(() => {}, [user]);

  useEffect(() => {
    return firebase.auth().onAuthStateChanged(setLoggedIn);
  }, []);

  const adminTabNav = createBottomTabNavigator({
    Home: AdminHomeStack,
    Profile: ProfileStack,
  });
  const AdminAppContainer = createAppContainer(adminTabNav);

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
        // --------------------------------CUSTOMER/SERVICES EMPLOYEE----------------------------------
        // if user is customer or services employee go to <AppContainer/>
        else if (
          user.role === "customer" ||
          user.role === "services employee"
        ) {
          return <AppContainer />;
        }
        // --------------------------------EMPLOYEE AUTHENTICATION----------------------------------
        // If employee account is incomplete go to employeeAuthenticate
        else if (user.role.slice(-12) === "(incomplete)") {
          return <EmployeeAuthentication />;
        }
        // If employee is any OTHER role
        else {
          // --------------------------------CHOOSE ROLE----------------------------------
          // if big boi employee with null active roll THEN choose active role
          if (activeRole === null) {
            return <ChooseRole role={user.role} />;
          }
          // Which activeRole did you choose
          else {
            switch (activeRole) {
              case "admin":
                return <AdminAppContainer />;

              case "manager":
                return <ManagersStack />;

              case "user handler":
                return <UserHandlerStack />;

              case "asset handler":
                return <AppContainer />;

              case "customer support":
                return <AppContainer />;

              case "services employee":
                return <AppContainer />;

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
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>Loading...</Text>
          </View>
        );
      }
    }
  } else {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
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
