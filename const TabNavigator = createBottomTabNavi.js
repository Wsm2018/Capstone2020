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
    tabBarOptions: {
      activeTintColor: "#edf3f8",
      inactiveTintColor: "white",
      style: {
        backgroundColor: "#5a91bf",
      },
    },
  }
);
TabNavigator.path = "";

const DrawerStack = createStackNavigator({
  HomeDrawerStk: TabNavigator,
  HomeStk: HomeStack,
  // FriendsStk: FriendsStack,
});

const FriendsStk = createStackNavigator({
  HomeDrawerStk: TabNavigator,
  FriendsStk: FriendsStack,
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
        drawerIcon: (
          <Icon name="home" type="material" style={{ width: 24, height: 24 }} />
        ),
      },
    },
    Friends: {
      screen: FriendsStk,
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
