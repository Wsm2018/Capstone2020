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
} from "react-native";
import Authentication from "./mainpages/Authentication";
console.disableYellowBox = true;
import firebase from "firebase/app";
import "firebase/auth";
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
import db from "./db";

export default function App(props) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    firebase.auth().signOut();
  };

  const DashboardTabNavigator = createBottomTabNavigator(
    {
      Home: HomeStack,
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
      defaultNavigationOptions: ({ navigation }) => {
        return {
          headerLeft: (
            <Icon
              style={{ paddingLeft: 10 }}
              onPress={() => navigation.openDrawer()}
              name="md-menu"
              type="ionicon"
              size={30}
            />
          ),
        };
      },
    }
  );

  const AppDrawerNavigator = createDrawerNavigator({
    Home: {
      screen: DashboardStackNavigator,
    },
    Friends: {
      screen: FriendsStk,
    },
  });

  const AppContainer = createAppContainer(AppDrawerNavigator);

  async function getUser() {
    const userRef = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    const user = userRef.data();
    setUser(user);
  }

  useEffect(() => {
    if (!loggedIn) {
      getUser();
    }
  }, []);

  useEffect(() => {
    console.log("user", user);
  }, [user]);

  useEffect(() => {
    return firebase.auth().onAuthStateChanged(setLoggedIn);
  }, []);

  if (!loggedIn) {
    return (
      <View style={styles.container}>
        <Authentication />
      </View>
    );
  } else {
    // return <Guide />;
    return <AppContainer />;
  }

  // return (
  //   // <View style={styles.container}>
  //   //   {!loggedIn ? (

  //   //   ) : (
  //   //     // <View style={styles.container}>
  //   //       <AppContainer />
  //   //       {/* <HomePage /> */}
  //   //     // </View>
  //   //   )}
  //   // </View>
  // );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
