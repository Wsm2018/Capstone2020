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

export default function App(props) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [firstLaunch, setFirstLaunch] = useState(false);
  const [guideView, setGuideView] = useState(true);
  const [admin, setAdmin] = useState(null);

  const handleLogout = () => {
    firebase.auth().signOut();
  };

  const DashboardTabNavigator = createBottomTabNavigator(
    {
      Home: HomeStack,
      // News: NewsStack,
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
        style: { backgroundColor: "#20365F" },
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
              <Text>Logout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      ),
    }
  );

  const AppContainer = createAppContainer(AppDrawerNavigator);

  async function getUser() {
    const userRef = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    const user = userRef.data();
    setUser(user);
  }

  const getFirstLaunch = async () => {
    try {
      const value = await AsyncStorage.getItem("alreadyLaunched");
      console.log("valueeeeeeeeeeeee", value);
      if (!value) {
        await AsyncStorage.setItem("alreadyLaunched", "true");
        console.log("trueeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
        setFirstLaunch(true);
      } else {
        console.log("falseeeeeeeeeeeeeeeeeeeeeee");
        setFirstLaunch(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getFirstLaunch();
  }, []);

  useEffect(() => {
    if (loggedIn) {
      getUser();
      getAdminUser();
    } else {
      setAdmin(null);
    }
  }, [loggedIn]);

  useEffect(() => {}, [user]);

  useEffect(() => {
    return firebase.auth().onAuthStateChanged(setLoggedIn);
  }, []);

  const guideSkip = () => {
    console.log("Skipppped");
    setGuideView(false);
  };

  const getAdminUser = async () => {
    const getAdmin = firebase.functions().httpsCallable("getAdmin");
    const response = await getAdmin({
      email: firebase.auth().currentUser.email,
    });

    // console.log("hello !!", response.data.result === undefined ? false : true);
    const result = response.data.result !== undefined ? true : false;
    setAdmin(result);

    // console.log("res", result);
  };

  useEffect(() => {
    console.log("this is admin stuff", admin);
  }, [admin]);

  const adminTabNav = createBottomTabNavigator({
    Home: AdminHomeStack,
    Profile: ProfileStack,
  });
  const AdminAppContainer = createAppContainer(adminTabNav);

  if (!loggedIn) {
    return (
      <View style={styles.container}>
        <Authentication />
      </View>
    );
  } else {
    return admin !== null && (admin ? <AdminAppContainer /> : <AppContainer />);
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
