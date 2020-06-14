import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  FlatList,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import LottieView from "lottie-react-native";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import { Button } from "react-native";
import { Icon, ListItem, SearchBar } from "react-native-elements";
import {
  MaterialCommunityIcons,
  Feather,
  Ionicons,
  MaterialIcons,
  AntDesign,
} from "@expo/vector-icons";
import { BarCodeScanner } from "expo-barcode-scanner";
import FlashMessage, { showMessage } from "react-native-flash-message";

export default function FriendsList(props) {
  const [users, setUsers] = useState(null);
  const [allUsers, setAllUsers] = useState(null);
  const [usersNoQuery, setUsersNoQuery] = useState(null);
  const [friends, setFriends] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [scan, setScan] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [friendId, setFriendId] = useState("");

  const [marginVal, setMargin] = useState(0);

  useEffect(() => {
    Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
      Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
    };
  }, []);

  const _keyboardDidShow = () => {
    // console.log("keyyyyyyyyyyyyyyyShow");

    setMargin(-200);
  };

  const _keyboardDidHide = () => {
    // console.log("keyyyyyyyyyyyyyyyHide");
    setMargin(0);
  };

  // ------------------------------CURRENT USER------------------------------------
  const handleCurrentuser = async () => {
    const doc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    setCurrentUser({ id: doc.id, ...doc.data() });
  };

  // ---------------------------------USERS---------------------------------
  // Get all users
  const handleUsers = () => {
    db.collection("users").onSnapshot((queryBySnapshot) => {
      let tempUsers = [];

      queryBySnapshot.forEach((doc) => {
        if (
          doc.id !== firebase.auth().currentUser.uid &&
          doc.data().email !== "DELETED"
        ) {
          tempUsers.push({
            id: doc.id,
            ...doc.data(),
            friendStatus: null,
            loading: false,
          });
        }
      });
      tempUsers = tempUsers.sort((a, b) =>
        a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase())
      );

      // setUsers(tempUsers);
      setAllUsers([...tempUsers]);
    });
  };

  // ---------------------------------FRIENDS---------------------------------
  // Get all friends
  const handleFriends = async () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("friends")
      .onSnapshot((queryBySnapshot) => {
        if (queryBySnapshot.size > 0) {
          let tempFriends = [];
          queryBySnapshot.forEach((doc) => {
            tempFriends.push({ id: doc.id, ...doc.data() });
          });

          setFriends(tempFriends);
        } else {
          setFriends([]);
        }
      });
  };

  // ---------------------------------FRIENDS STATUS---------------------------------
  // Set user's friends status
  const handleFriendsStatus = async () => {
    let tempUsers = JSON.parse(JSON.stringify(allUsers));
    tempUsers = tempUsers.map((user, index) => {
      friends.map((friend) => {
        if (user.id === friend.id) {
          user.friendStatus = friend.status;
        }
      });
      return user;
    });
    // setUsers(tempUsers);
    setUsersNoQuery(tempUsers);
  };

  // -------------------------------ADD-----------------------------------
  // Sends a friend request to a user
  const addFriend = async (user, index) => {
    const result = friends.filter((item) => {
      return item.id === user.id;
    });

    if (result.length === 0) {
      db.collection("users")
        .doc(currentUser.id)
        .collection("friends")
        .doc(user.id)
        .set({
          displayName: user.displayName,
          status: "pending",
          photoURL: user.photoURL,
        });

      db.collection("users")
        .doc(user.id)
        .collection("friends")
        .doc(currentUser.id)
        .set({
          displayName: currentUser.displayName,
          status: "requested",
          photoURL: currentUser.photoURL,
        });
      showMessage({
        message: `Success!`,
        description: `Your friend request has been sent!`,
        // type: "success",
        backgroundColor: "#3ea3a3",
        // duration: 2300,
      });
    } else {
      // alert("already added");
      showMessage({
        message: `Already a Friend!`,
        description: `You already added/requested!`,
        // type: "success",
        backgroundColor: "#901616",
        // duration: 2300,
      });
    }
  };

  // -------------------------------REMOVE-----------------------------------
  // Removes your pending request
  const remove = async (user) => {
    db.collection("users")
      .doc(currentUser.id)
      .collection("friends")
      .doc(user.id)
      .delete();

    db.collection("users")
      .doc(user.id)
      .collection("friends")
      .doc(currentUser.id)
      .delete();
    showMessage({
      message: `Request Deleted!`,
      description: `Your friend request has been deleted!`,
      // type: "success",
      backgroundColor: "#901616",
      // duration: 2300,
    });
  };

  // -------------------------------ACCEPT-----------------------------------
  const accept = async (user) => {
    db.collection("users")
      .doc(currentUser.id)
      .collection("friends")
      .doc(user.id)
      .update({ status: "accepted" });

    db.collection("users")
      .doc(user.id)
      .collection("friends")
      .doc(currentUser.id)
      .update({ status: "accepted" });
  };

  // ---------------------------------SEARCH---------------------------------
  // Searches for a user by displayName
  const handleSearch = (query) => {
    if (query.length > 0) {
      setSearch(query);
      let tempUsers = [...usersNoQuery];
      let result = tempUsers.filter((user) =>
        user.displayName.toLowerCase().match(query.toLowerCase())
      );

      setUsers(result);
    } else {
      setSearch(query);
      setUsers(null);
    }
  };

  // ------------------------------ ADDING FRIEND USING SCANNED BARCODE -----------------------------
  const handleBarCodeScanned = ({ type, data }) => {
    if (data !== "") {
      allUsers.map(async (item, index) => {
        if (item.id === data) {
          addFriend(item, index);
          console.log(item);
          setScan(false);
        }
      });
    }
  };

  // --------------------------------USE EFFECT----------------------------------
  // Asks for camera permission
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // --------------------------------USE EFFECT----------------------------------
  // Runs at the beginning
  useEffect(() => {
    handleCurrentuser();
    handleUsers();
    handleFriends();
  }, []);

  // --------------------------------USE EFFECT----------------------------------
  // Runs when there are changes to the users or friends
  useEffect(() => {
    if (allUsers && friends) {
      handleFriendsStatus();
    }
  }, [allUsers, friends]);

  // ---------------------------------USE EFFECT---------------------------------
  // Runs when something is entered in the search bar
  useEffect(() => {
    handleSearch(search);
  }, [usersNoQuery, search]);

  // ------------------------------ USE EFFECT ----------------------------------
  // Runs when state of scan changes
  useEffect(() => {}, [scan]);

  // ------------------------------- CONDITIONS ---------------------------------
  // Runs if camera permission is denied
  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return !scan ? (
    <View style={styles.container} onPress={() => Keyboard.dismiss}>
      {/* <Text>Friends Search</Text> */}
      <View
        style={{
          flexDirection: "row",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "space-evenly",
          backgroundColor: "#f0f0f0",
          // borderTopColor: "#185a9d",
          borderBottomWidth: 1,
          height: 65,
          borderColor: "lightgray",
          //paddingTop:'2%',
        }}
      >
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={30}
            color="#185a9d"
            // style={{ paddingTop: "2%", marginBottom: 10 }}
          />
        </TouchableOpacity>

        {/* <TextInput
          style={{
            backgroundColor: "white",
            fontSize: 18,
            paddingLeft: "2%",
            borderColor: "#185a9d",
            borderWidth: 2,
            width: "70%",
            height: "80%",
            marginLeft: 10,
            marginRight: 10,
          }}
          placeholderTextColor="#20365F"
          placeholder="Search Here"
          onChangeText={setSearch}
          value={search}
        /> */}
        <SearchBar
          placeholderTextColor="#e3e3e3"
          placeholder="Search Here"
          onChangeText={setSearch}
          lightTheme
          //showLoading={true}
          searchIcon={true}
          value={search}
          containerStyle={{
            backgroundColor: "transparent",
            // borderBottomColor: "#185a9d",
            // borderTopColor: "#185a9d",
            width: "80%",
            height: "100%",
            borderWidth: 0,
            // marginTop: 0,
          }}
          inputContainerStyle={{
            borderRadius: 20,
            borderWidth: 0,
            borderColor: "#185a9d",
            backgroundColor: "#fafafa",
            height: "100%",
          }}
          // style={{
          //   //backgroundColor: "white",
          //   fontSize: 18,
          //   paddingLeft: "2%",
          //   // borderColor: "#185a9d",
          //   // borderWidth: 2,
          //   width: "85%",
          //   // height: 50,
          //   marginLeft: 10,
          //   marginRight: 10,
          //   elevation: 20,
          // }}
        />

        {/* <MaterialIcons
          name="cancel"
          size={25}
          color="#fff"
          onPress={() => props.navigation.goBack()}
        /> */}
        <TouchableOpacity onPress={() => setScan(true)}>
          <Icon
            name="qrcode-scan"
            type="material-community"
            size={28}
            color="#185a9d"
          />
        </TouchableOpacity>
      </View>
      {/* <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          flex: 0.7,
          paddingTop: "55%",
          paddingLeft: "3%",
        }}
      >
        <Feather name="search" size={80} color="grey" />
        <Text
          style={{
          fontSize:26,
          alignSelf:'center',
          justifyContent:'center',
          width:'70%',
          color:'grey',
          paddingTop:'5%'
          }}
        >
        {'     '} add friends to your QuickbookinQ friends list
        </Text>
      </View> */}
      {/* <Button title="test search" onPress={() => handleSearch()} /> */}
      {
        users && users.length > 0 ? (
          friends && (
            <SafeAreaView>
              <ScrollView>
                <FlatList
                  data={users}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item, index }) => (
                    <ListItem
                      key={item.id}
                      leftAvatar={{ source: { uri: item.photoURL } }}
                      rightIcon={
                        item.friendStatus === "requested" && (
                          <TouchableOpacity
                            style={{
                              borderWidth: 1,
                              borderColor: "#3ea3a3",
                              backgroundColor: "#3ea3a3",
                              padding: "2%",
                              borderRadius: 8,
                              alignItems: "center",
                              minWidth: "20%",
                              maxWidth: "20%",
                            }}
                            onPress={() => accept(item)}
                          >
                            <Text style={{ color: "white", fontWeight: "600" }}>
                              Accept
                            </Text>
                          </TouchableOpacity>
                        )
                      }
                      rightElement={
                        item.friendStatus === "pending" ? (
                          <TouchableOpacity
                            style={{
                              borderWidth: 2,
                              borderColor: "#547BA3",
                              backgroundColor: "#547BA3",
                              padding: "2%",
                              borderRadius: 12,
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: "27%",
                              maxWidth: "27%",
                            }}
                            onPress={() => remove(item)}
                          >
                            <Feather name="loader" size={18} color="white" />
                            <Text
                              style={{
                                color: "white",
                                fontWeight: "600",
                                paddingLeft: "1%",
                              }}
                            >
                              {" "}
                              Pending
                            </Text>
                          </TouchableOpacity>
                        ) : item.friendStatus === "accepted" ? (
                          <TouchableOpacity
                            style={{
                              borderWidth: 2,
                              borderColor: "#3ea3a3",
                              backgroundColor: "#3ea3a3",
                              padding: "2%",
                              borderRadius: 12,
                              minWidth: "27%",
                              maxWidth: "27%",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <AntDesign name="check" size={18} color="white" />
                            <Text
                              style={{
                                color: "white",
                                fontWeight: "600",
                                paddingRight: "10%",
                              }}
                            >
                              Added
                            </Text>
                          </TouchableOpacity>
                        ) : item.friendStatus === "requested" ? (
                          <TouchableOpacity
                            style={{
                              borderWidth: 1,
                              borderColor: "#901616",
                              backgroundColor: "#901616",
                              padding: "2%",
                              borderRadius: 8,
                              alignItems: "center",
                              minWidth: "20%",
                              maxWidth: "20%",
                            }}
                            onPress={() => remove(item)}
                          >
                            <Text style={{ color: "white", fontWeight: "600" }}>
                              Decline
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={{
                              borderWidth: 2,
                              borderColor: "#3ea3a3",
                              padding: "2%",
                              borderRadius: 12,
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: "27%",
                              maxWidth: "27%",
                            }}
                            onPress={() => addFriend(item, index)}
                          >
                            <Ionicons name="md-add" size={18} color="#3ea3a3" />
                            <Text
                              style={{ color: "#3ea3a3", fontWeight: "600" }}
                            >
                              {" "}
                              Add Friend
                            </Text>
                          </TouchableOpacity>
                        )
                      }
                      title={item.displayName}
                      titleStyle={{ fontSize: 18 }}
                      subtitle={item.email}
                      subtitleStyle={{ fontSize: 12, color: "grey" }}
                      bottomDivider
                    />
                  )}
                />
              </ScrollView>
            </SafeAreaView>
          )
        ) : (
          <View
            style={{
              flex: 1,
              //  paddingTop: "10%",
              alignContent: "center",
              alignItems: "center",
              flexDirection: "column",
              // marginTop: marginVal === 0 ? 0 : -70,
            }}
          >
            {search.length > 0 ? (
              <Text style={{ color: "grey", fontSize: 20, paddingTop: 20 }}>
                User not found
              </Text>
            ) : null}
            <LottieView
              source={require("../../assets/17723-waitting.json")}
              autoPlay
              loop
              style={{
                position: "relative",
                width: "100%",
                // justifyContent: "center",
                // alignSelf: "center",
                paddingTop: "5%",
              }}
            />
            {search.length > 0 ? null : (
              <Text style={{ color: "grey", fontSize: 20 }}>Add a Friend</Text>
            )}
          </View>
        )
        // users.map((user, index) => (
        //   <View
        //     style={{ flexDirection: "row", justifyContent: "space-between" }}
        //     key={user.id}
        //   >
        //     <Text>{user.displayName}</Text>
        //     {user.friendStatus === "pending" ? (
        //       <TouchableOpacity style={{ borderWidth: 1 }}>
        //         <Text>Pending</Text>
        //       </TouchableOpacity>
        //     ) : user.friendStatus === "accepted" ? (
        //       <TouchableOpacity style={{ borderWidth: 1 }}>
        //         <Text>Added</Text>
        //       </TouchableOpacity>
        //     ) : user.loading === true ? (
        //       <TouchableOpacity style={{ borderWidth: 1 }}>
        //         <Text>Loading</Text>
        //       </TouchableOpacity>
        //     ) : (
        //       <TouchableOpacity
        //         style={{ borderWidth: 1 }}
        //         onPress={() => addFriend(user, index)}
        //       >
        //         <Text>Add Friend</Text>
        //       </TouchableOpacity>
        //     )}
        //   </View>
        // ))
      }
    </View>
  ) : (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        paddingBottom: "10%",
        backgroundColor: "#e3e3e3",
      }}
    >
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        // style={StyleSheet.absoluteFillObject}
        style={{ width: "100%", height: "100%" }}
      />

      {/* <Button title="Cancel" onPress={() => setScan(false)} /> */}
      <TouchableOpacity
        onPress={() => setScan(false)}
        style={{
          backgroundColor: "#3ea3a3",
          alignSelf: "center",
          width: 100,
          height: 50,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white" }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",
  },
  searchSection: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",
  },
  searchIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    backgroundColor: "#fff",
    color: "#424242",
  },
});
