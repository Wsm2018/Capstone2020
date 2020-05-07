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
import { createAppContainer } from "react-navigation";
import { createBottomTabNavigator } from "react-navigation-tabs";
import { createDrawerNavigator, DrawerItems } from "react-navigation-drawer";
import HomeStack from "./navigation/HomeStack";
import ProfileStack from "./comps/Profile/ProfileScreen";
import FriendsStack from "./comps/Friends/FriendsScreen";
import { Icon } from "react-native-elements";
import { createStackNavigator } from "react-navigation-stack";
import db from "./db";

export default function App(props) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    firebase.auth().signOut();
  };

  useEffect(() => {
    async function getUser() {
      console.log(1, loggedIn);

      console.log("auth ", firebase.auth().currentUser.uid);
      const userRef = await db
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .get();
      const user = userRef.data();
      setUser(user);
    }

    if (!loggedIn) {
      getUser();
    }
  }, []);

  useEffect(() => {
    console.log("user", user);
  }, [user]);

  const TabNavigator = createBottomTabNavigator(
    {
      Home: HomeStack,
      Profile: ProfileStack,
    },
    {
      navigationOptions: ({ navigation }) => {
        const { routeName, routes } = navigation.state.routes[
          navigation.state.index
        ];
        return {
          header: null,
          headerTitle: routeName,
        };
      },
    }
  );
  TabNavigator.path = "";

  const DrawerStack = createStackNavigator({
    HomeDrawerStk: TabNavigator,
  });

  const AppDrawerNavigator = createDrawerNavigator(
    {
      Home: {
        screen: DrawerStack,
        contentOptions: {
          activeTintColor: "red",
          inactiveTintColor: "blue",
        },
        navigationOptions: {
          drawerLabel: "Home",
          // drawerIcon: (
          //   <Image
          //     source={require("../assets/images/home.png")}
          //     style={{ width: 22, height: 22 }}
          //   />
          // ),
        },
      },
      Friends: {
        screen: FriendsStack,
        navigationOptions: {
          drawerLabel: "Friends",
          drawerIcon: (
            <Icon
              name="people-outline"
              type="material"
              style={{ width: 24, height: 24 }}
            />
          ),
        },
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

  const AppContainer = createAppContainer(AppDrawerNavigator);

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
