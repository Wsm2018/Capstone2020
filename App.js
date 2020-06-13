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
import TicketScreen from "./comps/Ticket/TicketScreen";

if (!global.btoa) {
  global.btoa = encode;
}
if (!global.atob) {
  global.atob = decode;
}
import { responsiveFontSize } from "react-native-responsive-dimensions";
import { createAppContainer } from "react-navigation";
import { createBottomTabNavigator } from "react-navigation-tabs";
import { createDrawerNavigator, DrawerItems } from "react-navigation-drawer";
import HomeStack from "./navigation/HomeStack";
import ProfileStack from "./navigation/ProfileStack";
import FriendsStack from "./comps/Friends/FriendsScreen";
import Guide from "./mainpages/Guide";
import { Icon, Divider } from "react-native-elements";
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
import FAQStack from "./comps/FAQ/FAQScreen";
import { createMaterialBottomTabNavigator } from "react-navigation-material-bottom-tabs";

import * as Location from "expo-location";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  FontAwesome,
  Entypo,
  Fontisto,
} from "@expo/vector-icons";

// import AsyncStorage from "@react-native-community/async-storage";

export default function App(props) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [firstLaunch, setFirstLaunch] = useState(false);
  const [guideView, setGuideView] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);

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

  const BookingStack = createAppContainer(
    createStackNavigator(
      { BookingHistory: BookingHistory },
      {
        defaultNavigationOptions: ({ navigation }) => {
          return {
            headerLeft: () => (
              <MaterialCommunityIcons
                // style={{ marginLeft: 20 }}
                onPress={() => navigation.openDrawer()}
                name="menu"
                color="white"
                // type="MaterialCommunityIcons"
                size={28}
              />
            ),
          };
        },
      }
    )
  );

  const DashboardTabNavigator = createMaterialBottomTabNavigator(
    {
      Home: {
        screen: HomeStack,
        navigationOptions: {
          tabBarIcon: ({ tintColor }) => {
            return <Ionicons name="ios-home" size={20} color={tintColor} />;
          },
        },
      },

      Profile: {
        screen: ProfileStack,
        navigationOptions: {
          tabBarIcon: ({ tintColor }) => {
            return (
              user && (
                <Image
                  // hereboi
                  source={{ uri: photoURL }}
                  style={{ height: 20, width: 20, borderRadius: 50 }}
                />
              )
            );
          },
        },
      },
      BookingHistory: {
        screen: BookingStack,

        navigationOptions: {
          tabBarIcon: ({ tintColor }) => {
            return (
              <MaterialCommunityIcons
                name="history"
                size={20}
                color={tintColor}
              />
            );
          },
        },
      },
    },
    {
      //swipeEnabled - Whether to allow swiping between tabs.
      swipeEnabled: true,
      //animationEnabled - Whether to animate when changing tabs.
      animationEnabled: true,
      //activeColor - Custom color for icon and label in the active tab.
      activeColor: "white",
      //inactiveColor - Custom color for icon and label in the inactive tab.
      inactiveColor: "gray",
      // barStyle - Style for the bottom navigation bar.
      barStyle: { backgroundColor: "#276b9c" },

      // tabBarOptions - Configure the tab bar
      tabBarOptions: {
        //activeTintColor - Label and icon color of the active tab
        activeTintColor: "white",
        //inactiveTintColor - Label and icon color of the inactive tab.
        inactiveTintColor: "gray",
        // to display the labels

        //style - Style object for the tab bar.
        style: {
          backgroundColor: "#276b9c",
          paddingTop: 4,
        },
        //labelStyle - Style object for the tab label.
        lableStyle: {
          textAlign: "center",
          fontSize: 19,
          fontWeight: "bold",
          color: "transparent",
        },
        //indicatorStyle - Style object for the tab indicator (line at the bottom of the tab).
        indicatorStyle: {
          borderBottomColor: "white",
          borderBottomWidth: 70,
        },
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
        navigationOptions: {
          drawerIcon: ({ tintColor }) => {
            return <Ionicons name="ios-home" size={20} color={tintColor} />;
          },
        },
      },
      Friends: {
        screen: FriendsStk,
        navigationOptions: {
          drawerIcon: ({ tintColor }) => {
            return (
              <FontAwesome5 name="user-friends" size={20} color={tintColor} />
            );
          },
        },
      },
      News: {
        screen: NewsStack,
        navigationOptions: {
          drawerIcon: ({ tintColor }) => {
            return <Entypo name="news" size={20} color={tintColor} />;
          },
          headerLeft: () => (
            <Icon
              style={{ paddingLeft: 10 }}
              onPress={() => navigation.openDrawer()}
              name="md-menu"
              color="white"
              type="ionicon"
              size={30}
            />
          ),
        },
      },
      Ticket: {
        screen: TicketScreen,
        navigationOptions: {
          drawerIcon: ({ tintColor }) => {
            return (
              <Image
                source={require("./assets/images/customerSupport.png")}
                style={{ height: 20, width: 20 }}
              />
            );
          },
          drawerLabel: "Contact Us",
          headerLeft: () => (
            <Icon
              style={{ paddingLeft: 10 }}
              onPress={() => navigation.openDrawer()}
              name="md-menu"
              color="white"
              type="ionicon"
              size={30}
            />
          ),
        },
      },
      FAQ: {
        screen: FAQStack,
        navigationOptions: {
          drawerLabel: "Ask Us",
          drawerIcon: ({ tinColor }) => {
            return (
              <Image
                source={require("./assets/images/faq.png")}
                style={{ height: 20, width: 20 }}
              />
            );
          },
          headerLeft: () => (
            <Icon
              style={{ paddingLeft: 10 }}
              onPress={() => navigation.openDrawer()}
              name="md-menu"
              color="white"
              type="ionicon"
              size={30}
            />
          ),
        },
      },
      Advertisment: {
        screen: AdvertismentsStack,
        navigationOptions: {
          headerLeft: () => (
            <Icon
              style={{ paddingLeft: 10 }}
              onPress={() => navigation.openDrawer()}
              name="md-menu"
              color="white"
              type="ionicon"
              size={30}
            />
          ),
          drawerLabel: "Advertise with us",
          drawerIcon: ({ tinColor }) => {
            return <FontAwesome5 name="adversal" size={20} color={tinColor} />;
          },
        },
      },
    },
    {
      // drawerBackgroundColor: "#F0F8FF",
      contentOptions: {
        activeTintColor: "black",
        inactiveTintColor: "gray",
      },
      contentComponent: (props) => (
        <SafeAreaView style={{ flex: 1, marginTop: "5%" }}>
          <View
            style={{
              flex: 1,
              justifyContent: "space-around",
            }}
          >
            <View
              style={{
                // height: 200,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {user && (
                <Image
                  source={{ uri: user.qrCode }}
                  style={{ width: 150, height: 150 }}
                />
              )}
            </View>
            <View style={{ flexDirection: "row" }}>
              <Image
                source={{ uri: photoURL }}
                style={{
                  height: 35,
                  width: 35,
                  borderRadius: 50,
                  marginLeft: "2%",
                  justifyContent: "center",
                }}
              />
              <View style={{ marginLeft: "5.5%", justifyContent: "center" }}>
                <Text
                  style={{
                    fontSize: responsiveFontSize(2),
                    fontWeight: "bold",
                  }}
                >
                  {user && user.displayName}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Fontisto
                name="email"
                size={25}
                color="black"
                style={{ marginLeft: "3%", justifyContent: "center" }}
              />
              <View style={{ marginLeft: "5.5%", justifyContent: "center" }}>
                <Text>{user && user.email}</Text>
              </View>
            </View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <FontAwesome
                  name="mobile-phone"
                  size={30}
                  color="black"
                  style={{ marginLeft: "5%", justifyContent: "center" }}
                />
                <View style={{ marginLeft: "7%", justifyContent: "center" }}>
                  <Text>{user && user.phone.substring(4)}</Text>
                </View>
              </View>
            </View>
            {user.role === "admin" ||
            user.role === "manager" ||
            user.role === "user handler" ||
            user.role === "asset handler" ||
            user.role === "customer" ? (
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <View>
                  <Image
                    source={require("./assets/images/roles.png")}
                    style={{ height: 40, width: 40 }}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleChangeRole}
                  style={{ justifyContent: "center", marginLeft: "2%" }}
                >
                  <View style={{ marginLeft: "2%" }}>
                    <Text>Swap Your Role</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
          <Divider style={{ backgroundColor: "black", height: "0.1%" }} />
          <ScrollView
            contentContainerStyle={{
              flex: 1,
              justifyContent: "space-evenly",
            }}
          >
            <DrawerItems {...props} />
          </ScrollView>
          {/* <Divider style={{ backgroundColor: "black", height: "0.1%" }} /> */}

          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="logout"
                size={25}
                style={{ justifyContent: "center" }}
                // style={styles.actionButtonIcon}
              />
              <View style={{ justifyContent: "center" }}>
                <Text style={{ fontWeight: "bold" }}>
                  Logout {user && user.displayName}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
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

    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((userRef) => {
        setPhotoURL(userRef.data().photoURL);
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

  // useEffect(() => {}, [user]);

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
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LottieView
              width={Dimensions.get("window").width / 3}
              source={require("./assets/loadingAnimations/890-loading-animation.json")}
              autoPlay
              loop
              style={{
                position: "relative",
                width: "100%",
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
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LottieView
          width={Dimensions.get("window").width / 3}
          source={require("./assets/loadingAnimations/890-loading-animation.json")}
          autoPlay
          loop
          style={{
            position: "relative",
            width: "100%",
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
