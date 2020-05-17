//@refresh reset
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Authentication from "./mainpages/Authentication";
import Assets from "./comps/Assets/Assets";

console.disableYellowBox = true;
import firebase from "firebase/app";
import "firebase/auth";

import { createAppContainer } from "react-navigation";
import { createBottomTabNavigator } from "react-navigation-tabs";
import HomeStack from "./navigation/HomeStack";
<<<<<<< HEAD
=======
import ProfileStack from "./navigation/ProfileStack";
import FriendsStack from "./comps/Friends/FriendsScreen";
import { Icon } from "react-native-elements";
import { createStackNavigator } from "react-navigation-stack";
import NewsStack from "./navigation/NewsStack";
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
        style: { backgroundColor: "#20365F" },
      },
    }
  );
>>>>>>> master



<<<<<<< HEAD
=======
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
                <Image
                  source={require("./assets/qrcodetest.png")}
                  style={{ width: 50, height: 50 }}
                />
                <Text style={{ fontSize: 20 }}>{user && user.displayName}</Text>
              </View>
            </SafeAreaView>
          </View>
          <View>
            <Text>{user && user.email}</Text>
            <Text>{user && user.phone}</Text>
            {/* since its 0, added the titles to know which is which */}
            <Text>reputation: {user && user.reputation}</Text>
            <Text>points: {user && user.points}</Text>
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
>>>>>>> master

const TabNavigator = createBottomTabNavigator({
  Home: HomeStack,
});

const AppContainer = createAppContainer(TabNavigator);

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

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
    return <Assets />;
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