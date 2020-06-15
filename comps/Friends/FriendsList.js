import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
  Image,
} from "react-native";
import LottieView from "lottie-react-native";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import {
  Ionicons,
  FontAwesome,
  AntDesign,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-navigation";
import {
  ListItem,
  Icon,
  Badge,
  SearchBar,
  Avatar,
} from "react-native-elements";
import moment from "moment";
import Octicons from "react-native-vector-icons/Octicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

import FriendsRequest from "./FriendsRequest";
import FriendsMap from "./FriendsMap";
import FriendsSerach from "./FriendsSearch";

import { RadioButton } from "react-native-paper";

import Swipeout from "react-native-swipeout";

export default function FriendsList(props) {
  const [users, setUsers] = useState(null);

  const [friends, setFriends] = useState(null);
  const [allFriends, setAllFriends] = useState(null);
  const [friendsNoQuery, setFriendsNoQuery] = useState(null);
  const [requests, setRequests] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState(null);

  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [chats, setChats] = useState(null);

  const [search, setSearch] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [modal, setModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const [deleteIds, setDeleteIds] = useState([]);

  const numOfChars = 30;

  const unsubUsers = useRef();
  // ------------------------------CURRENT USER------------------------------------
  const handleCurrentuser = async () => {
    const doc = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    setCurrentUser({ id: doc.id, ...doc.data() });
  };

  // --------------------------------FRIENDS----------------------------------
  const handleFriends = () => {
    const unsub = db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("friends")
      .onSnapshot((queryBySnapshot) => {
        // console.log(queryBySnapshot.size, "friends - FriendsList");
        if (queryBySnapshot.size > 0) {
          let tempFriends = [];
          let tempRequests = 0;
          queryBySnapshot.forEach((doc) => {
            if (doc.data().status === "accepted") {
              tempFriends.push({
                id: doc.id,
                ...doc.data(),
                notifications: 0,
                dateTime: new Date(0),
                status: "offline",
                lastMessage: "",
                location: null,
                locationP: false,
              });
            }
            if (doc.data().status === "requested") {
              tempRequests++;
            }
          });
          tempFriends = tempFriends.sort((a, b) =>
            a.displayName
              .toLowerCase()
              .localeCompare(b.displayName.toLowerCase())
          );
          setRequests(tempRequests);
          setAllFriends(tempFriends);
        } else {
          setAllFriends([]);
          setRequests(0);
        }
      });
    return unsub;
  };

  // --------------------------------USERS----------------------------------
  // Run when friends !== null and friends.length > 0
  const handleUsers = () => {
    if (allFriends.length > 0) {
      let tempFriendsId = allFriends.map((friend) => {
        return (friend = friend.id);
      });

      const unsub = db
        .collection("users")
        // .where(firebase.firestore.FieldPath.documentId(), "in", tempFriendsId)
        .onSnapshot((queryBySnapshot) => {
          let tempUsers = [];
          queryBySnapshot.forEach((doc) => {
            if (tempFriendsId.includes(doc.id)) {
              tempUsers.push({ id: doc.id, ...doc.data() });
            }
          });
          // console.log(tempUsers);
          setUsers(tempUsers);
        });
      unsubUsers.current = unsub;
    } else {
      setUsers([]);
      unsubUsers.current = null;
    }
  };

  // -------------------------------FROM-----------------------------------
  const handleFrom = () => {
    const unsub = db
      .collection("chats")
      .where("from", "==", firebase.auth().currentUser.uid)
      .onSnapshot((queryBySnapshot) => {
        let tempFrom = [];
        queryBySnapshot.forEach((doc) => {
          tempFrom.push({ id: doc.id, ...doc.data() });
        });
        setFrom(tempFrom);
      });
    return unsub;
  };

  // --------------------------------TO----------------------------------
  const handleTo = () => {
    const unsub = db
      .collection("chats")
      .where("to", "==", firebase.auth().currentUser.uid)
      .onSnapshot((queryBySnapshot) => {
        let tempFrom = [];
        queryBySnapshot.forEach((doc) => {
          tempFrom.push({ id: doc.id, ...doc.data() });
        });
        setTo(tempFrom);
      });
    return unsub;
  };

  // -------------------------------CHAT-----------------------------------
  const handleChat = () => {
    let tempChat = from.concat(to);
    tempChat = tempChat.sort(
      (a, b) => a.dateTime.toDate() - b.dateTime.toDate()
    );
    setChats(tempChat);
  };

  // -------------------------------NOTIFICATIONS AND STATUS-----------------------------------
  const handleFriendsMessages = () => {
    let tempFriends = JSON.parse(JSON.stringify(allFriends));

    if (users.length > 0) {
      tempFriends = tempFriends.map((friend, index) => {
        let user = users.filter((user) => user.id === friend.id)[0];
        // console.log(user);
        if (user.status !== undefined) {
          friend.status = user.status;
        }
        // console.log("--------------------", user.location);
        if (user.location !== null) {
          friend.location = user.location;
        }

        friend.locationP = user.privacy.locationP;
        // console.log(friend);

        return friend;
      });
    }

    if (chats.length > 0) {
      tempFriends = tempFriends.map((friend, index) => {
        let from = chats.filter((chat) => chat.from === friend.id);
        let to = chats.filter((chat) => chat.to === friend.id);
        let chat = from.concat(to);
        chat = chat.sort((a, b) => b.dateTime.toDate() - a.dateTime.toDate());

        if (chat.length > 0) {
          friend.dateTime = new Date(
            moment(chat[0].dateTime.toDate()).format()
          );
          friend.lastMessage = chat[0].text;
          let notifications = chat.filter(
            (c) =>
              c.status === "unread" &&
              c.from !== firebase.auth().currentUser.uid
          ).length;
          friend.notifications = notifications;
        } else {
          friend.dateTime = new Date(friend.dateTime);
        }
        return friend;
      });
    }

    tempFriends = tempFriends.sort((a, b) => b.dateTime - a.dateTime);
    // console.log(tempFriends);
    setFriendsNoQuery(tempFriends);
  };

  // ---------------------------------SEARCH---------------------------------
  // Searches for a user by displayName
  const handleSearch = (query) => {
    if (query.length > 0) {
      setSearch(query);
      let tempUsers = [...friendsNoQuery];
      let result = tempUsers.filter((user) =>
        user.displayName.toLowerCase().match(query.toLowerCase())
      );

      setFriends(result);
    } else {
      setSearch(query);
      setFriends(friendsNoQuery);
    }
  };

  // --------------------------------USE EFFECT----------------------------------
  // Runs at the beginning
  useEffect(() => {
    handleCurrentuser();
    const unsubFriends = handleFriends();
    const unsubFrom = handleFrom();
    const unsubTo = handleTo();

    return () => {
      unsubFriends();
      unsubFrom();
      unsubTo();
    };
  }, []);

  // --------------------------------USE EFFECT----------------------------------
  // Runs when all from and to messages of the user has been retrieved
  useEffect(() => {
    if (from && to) {
      handleChat();
    }
  }, [from, to]);

  // --------------------------------USE EFFECT----------------------------------
  // Runs when all friends have been retrieved
  useEffect(() => {
    if (allFriends) {
      handleUsers();
      return () => {
        if (unsubUsers.current !== null) {
          unsubUsers.current();
        }
      };
    }
  }, [allFriends]);

  // --------------------------------USE EFFECT----------------------------------
  // Runs when there are changes to the friends and chat
  useEffect(() => {
    if (allFriends && chats && users) {
      handleFriendsMessages();
    }
  }, [chats, users]);

  // ---------------------------------USE EFFECT---------------------------------
  // Runs when something is entered in the search bar
  useEffect(() => {
    handleSearch(search);
  }, [friendsNoQuery, search]);

  // -------------------------------DELETE-----------------------------------
  const deleteAll = async () => {
    const userQuery = await db.collection("users").get();
    userQuery.forEach(async (user) => {
      const friendQuery = await db
        .collection("users")
        .doc(user.id)
        .collection("friends")
        .get();
      friendQuery.forEach((friend) => {
        db.collection("users")
          .doc(user.id)
          .collection("friends")
          .doc(friend.id)
          .delete();
      });
    });
  };

  // -------------------------------REMOVE-----------------------------------
  const removeFriend = async (user) => {
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
  };

  // -------------------------------REMOVE ALL-----------------------------------
  const removeAllFriends = async () => {
    if (allFriends.length > 0) {
      let tempFriendsId = allFriends.map((friend) => {
        return (friend = friend.id);
      });

      tempFriendsId.forEach((id) => {
        db.collection("users")
          .doc(id)
          .collection("friends")
          .doc(firebase.auth().currentUser.uid)
          .delete();

        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .collection("friends")
          .doc(id)
          .delete();
      });
    }
  };

  //////////////////////////Front-End////////////////////////////////
  const [view, setView] = useState("friends");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (selectedUser !== null) {
      setSelectedFriend(selectedUser);
    }

    if (selectedUser === null && !modal) {
      setSelectedFriend(null);
    }
  }, [selectedUser]);

  var swipeoutBtns = [
    {
      text: "Remove",
      backgroundColor: "#bf1919",
      // type: "delete",
      // onPress: ()=> removeFriend(selectedUser),
      onPress: () => setModal(true),
      // (() => console.log("deleteeeeeeeeeeeeeeeeeeeeeeeeeeeee", selectedUser),
      // () => console.log("pppppppppppppppppppp")),
    },
  ];
  /////////////////////////////////////////////////////////////////////////

  // -------------------------------DELETE TOGGLE-----------------------------------
  const deleteToggle = async (id) => {
    if (deleteIds.includes(id)) {
      let tempArr = [...deleteIds];
      let index = tempArr.indexOf(id);
      tempArr.splice(index, 1);
      setDeleteIds(tempArr);
    } else {
      let tempArr = [...deleteIds];
      tempArr.push(id);
      setDeleteIds(tempArr);
    }
  };

  // -------------------------------REMOVE SELECTED-----------------------------------
  const removeSelectedFriends = async () => {
    if (deleteIds.length > 0) {
      deleteIds.forEach((id) => {
        db.collection("users")
          .doc(id)
          .collection("friends")
          .doc(firebase.auth().currentUser.uid)
          .delete();

        db.collection("users")
          .doc(firebase.auth().currentUser.uid)
          .collection("friends")
          .doc(id)
          .delete();
      });
    }
  };

  return !friends ? (
    // -------------------------------LOADING-----------------------------------
    <View
      style={{ flex: 1, justifyContent: "center", backgroundColor: "white" }}
    >
      <LottieView
        source={require("../../assets/loadingAnimations/890-loading-animation.json")}
        autoPlay
        loop
        style={{
          position: "relative",
          width: "50%",
          backgroundColor: "white",
          alignItems: "center",
          justifyContent: "center",
          alignContent: "center",
          alignSelf: "center",
        }}
      />
    </View>
  ) : (
    // -------------------------------CONTAINER-----------------------------------
    <View style={styles.container}>
      {/* -------------------------------NAV----------------------------------- */}
      <View
        style={{
          flex: 1,
          // backgroundColor: "red",
          justifyContent: "center",
          alignItems: "center",
          // borderBottomWidth: 1,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            // backgroundColor: "yellow",
            justifyContent: "center",
            // borderWidth: 1,
          }}
        >
          {/* -------------------------------FRIENDS NAV----------------------------------- */}
          <TouchableOpacity
            style={{
              width: "33%",
              height: "100%",
              // backgroundColor: "blue",
              alignItems: "center",
              justifyContent: "center",
              borderRightWidth: 2,
              borderColor: "white",
            }}
            onPress={() => setView("friends")}
          >
            {/* <Text>My Friends</Text> */}
            <FontAwesome5
              name="user-friends"
              // name={favoriteAssets.includes(l.id) ? "heart" : "plus"}
              size={30}
              color={view === "friends" ? "#185a9d" : "gray"}
            />
            <Text
              style={{
                color: view === "friends" ? "#185a9d" : "gray",
                fontSize: 12,
              }}
            >
              Friends
            </Text>
          </TouchableOpacity>

          {/* -------------------------------REQUESTS NAV----------------------------------- */}
          <TouchableOpacity
            style={{
              width: "33%",
              // backgroundColor: "blue",
              alignItems: "center",
              justifyContent: "center",
              borderRightWidth: 2,
              borderColor: "white",
            }}
            onPress={() => setView("requests")}
          >
            <FontAwesome5
              name="user-check"
              // name={favoriteAssets.includes(l.id) ? "heart" : "plus"}
              size={28}
              color={view === "requests" ? "#185a9d" : "gray"}
            />
            <Text
              style={{
                color: view === "requests" ? "#185a9d" : "gray",
                fontSize: 12,
              }}
            >
              Requests
            </Text>
            <Badge
              value={requests}
              containerStyle={{
                position: "absolute",
                top: 5,
                right: 30,
              }}
              badgeStyle={{
                backgroundColor: "#3ea3a3",
                display: requests === 0 ? "none" : "flex",
                // width: 25,
                // height: 25,
                borderColor: "#185a9d",
                borderWidth: 0,
              }}
            />
          </TouchableOpacity>

          {/* -------------------------------MAP NAV----------------------------------- */}
          <TouchableOpacity
            style={{
              width: "33%",
              // backgroundColor: "blue",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => setView("map")}
          >
            <FontAwesome5
              name="map-marked-alt"
              // name={favoriteAssets.includes(l.id) ? "heart" : "plus"}
              size={30}
              color={view === "map" ? "#185a9d" : "gray"}
            />
            <Text
              style={{
                color: view === "map" ? "#185a9d" : "gray",
                fontSize: 12,
              }}
            >
              Map
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 9 }}>
        {view === "friends" && (
          // -------------------------------SEARCH BAR-----------------------------------
          <View
            style={{
              height: 60,
              // backgroundColor: "yellow"
            }}
          >
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
                width: "100%",
                height: "100%",
                borderWidth: 0,
                // marginTop: 0,
              }}
              inputContainerStyle={{
                borderRadius: 20,
                borderWidth: 0,
                borderColor: "#fafafa",
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

            {/* <Button title="edit" onPress={() => {}} /> */}
          </View>
        )}

        {/* -------------------------------SCROLLVIEW----------------------------------- */}
        <ScrollView
          contentContainerStyle={{
            // backgroundColor: "red"
            // flex: 1,
            flexGrow: 1,
          }}
          // style={{ flex: 1 }}
        >
          {/* <View style={{flex:1}}></View> */}
          {
            // -------------------------------FRIENDS VIEW-----------------------------------
            view === "friends" ? (
              <View
                style={{
                  flex: 1,
                  // backgroundColor: "yellow"
                }}
              >
                {/* <TextInput
                style={
                  {
                    // backgroundColor: "white",
                    // fontSize: 18,
                    // paddingLeft: "2%",
                    // borderColor: "grey",
                    // borderWidth: 1,
                    // width: "80%",
                    // height: "80%",
                    // marginLeft: 7,
                    // marginRight: 7,
                  }
                }
                placeholderTextColor="#20365F"
                placeholder="Search Here"
                onChangeText={setSearch}
                value={search}
              /> */}
                {/* -------------------------------FRIENDS MAP----------------------------------- */}
                <View>
                  {friends.map((item, index) => (
                    <View
                      style={{
                        width: "100%",
                        // backgroundColor: "red",
                        // padding: "2%",
                        height: 85,
                        // marginBottom: 1,
                        borderBottomWidth: 1,
                        borderColor: "lightgray",
                      }}
                      key={index}
                    >
                      {/* -------------------------------SWIPEOUT----------------------------------- */}
                      <Swipeout
                        right={swipeoutBtns}
                        autoClose={true}
                        // left={swipeoutBtns}
                        onOpen={() => setSelectedUser(item)}
                        onClose={() => setSelectedUser(null)}
                        disabled={
                          editMode
                            ? true
                            : selectedUser === null
                            ? false
                            : selectedUser.id === item.id
                            ? false
                            : true
                        }
                        sensitivity={80}
                      >
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#f0f0f0",
                            height: "100%",
                            width: "100%",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                          onPress={
                            editMode
                              ? () => {
                                  deleteToggle(item.id);
                                }
                              : () =>
                                  props.navigation.navigate("FriendsChat", {
                                    friend: item,
                                  })
                          }
                          onLongPress={() => setEditMode(true)}
                        >
                          {/* -------------------------------DELETE TOGGLE----------------------------------- */}
                          {editMode && (
                            <View
                              style={{
                                backgroundColor: "#f0f0f0",
                                height: "100%",
                                width: "10%",
                                flexDirection: "row",
                                alignItems: "center",
                                paddingLeft: "1%",
                                // borderWidth: Platform.OS === "ios" ? 1 : 0,
                              }}
                            >
                              {/* <RadioButton
                              value="first"
                              status={
                                deleteIds.includes(item.id)
                                  ? "checked"
                                  : "unchecked"
                              }
                              // disabled
                              // color={deleteIds.includes(item.id) ? "red" : "blue"}
                              onPress={() => {
                                deleteToggle(item.id);
                              }}
                            /> */}
                              <TouchableOpacity
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                                onPress={() => {
                                  deleteToggle(item.id);
                                }}
                              >
                                <FontAwesome
                                  name={
                                    deleteIds.includes(item.id)
                                      ? "check-circle-o"
                                      : "circle-o"
                                  }
                                  // name={favoriteAssets.includes(l.id) ? "heart" : "plus"}
                                  size={25}
                                  color={
                                    deleteIds.includes(item.id)
                                      ? "#3ea3a3"
                                      : "gray"
                                  }
                                />
                              </TouchableOpacity>
                            </View>
                          )}
                          {/* -------------------------------ITEM BODY----------------------------------- */}
                          <View
                            style={{
                              backgroundColor: "#f0f0f0",
                              height: "100%",
                              width: editMode ? "90%" : "100%",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <View
                              style={{
                                width: "20%",
                                maxWidth: 100,
                                padding: 5,
                                // backgroundColor: "yellow"
                              }}
                            >
                              {/* <Text>1</Text> */}
                              {/* -------------------------------IMAGE----------------------------------- */}
                              <Image
                                source={{ uri: item.photoURL }}
                                style={{
                                  resizeMode: "contain",
                                  height: "100%",
                                  // width: "100%",
                                  // aspectRatio: 1 / 1,
                                  borderRadius: 1000,
                                }}
                              />
                              {/* -------------------------------BADGE----------------------------------- */}
                              <Badge
                                value={item.notifications}
                                containerStyle={{
                                  position: "absolute",
                                  top: 5,
                                  right: 10,
                                }}
                                badgeStyle={{
                                  backgroundColor: "#3ea3a3",
                                  display:
                                    item.notifications === 0 ? "none" : "flex",
                                  // width: 25,
                                  // height: 25,
                                  borderColor: "#185a9d",
                                  borderWidth: 0,
                                }}
                              />
                            </View>
                            {/* -------------------------------ITEM INFO----------------------------------- */}
                            <View
                              style={{
                                width: "70%",
                                // backgroundColor: "blue"
                                justifyContent: "center",
                              }}
                            >
                              {item.lastMessage ? (
                                <Text style={{ color: "#185a9d" }}>
                                  {item.lastMessage &&
                                    moment(item.dateTime).format("LLL")}
                                </Text>
                              ) : null}
                              <Text style={{ fontSize: 22 }}>
                                {item.displayName}
                              </Text>
                              <Text>
                                {item.lastMessage
                                  ? item.lastMessage.split("\n").length > 0
                                    ? // if first line more than 32 chars
                                      item.lastMessage.split("\n")[0].length >
                                      numOfChars
                                      ? // message limited to 32 chars with .....
                                        item.lastMessage
                                          .split("\n")[0]
                                          .substring(0, numOfChars) + "......"
                                      : // first line showed
                                        item.lastMessage.split("\n")[0]
                                    : // else
                                    // if message more than 32 chars
                                    item.lastMessage.length > numOfChars
                                    ? // message limited to 32 chars with .....
                                      item.lastMessage
                                        .trim()
                                        .substring(0, numOfChars) + "......"
                                    : // message showed
                                      item.lastMessage.trim()
                                  : "New Contact"}
                              </Text>
                            </View>

                            {/* -------------------------------STATUS----------------------------------- */}
                            <View
                              style={{
                                width: "10%",
                                // backgroundColor: "green"
                              }}
                            >
                              <Octicons
                                name="primitive-dot"
                                // name={favoriteAssets.includes(l.id) ? "heart" : "plus"}
                                size={30}
                                color={
                                  item.status === "offline" ? "gray" : "#3ea3a3"
                                }
                              />
                              {/* {!editMode ? (
                              <Octicons
                                name="primitive-dot"
                                // name={favoriteAssets.includes(l.id) ? "heart" : "plus"}
                                size={30}
                                color={
                                  item.status === "offline" ? "gray" : "#3ea3a3"
                                }
                              />
                            ) : (
                              <RadioButton
                                value="first"
                                status={"unchecked"}
                                onPress={() => {
                                  this.setState({ checked: "first" });
                                }}
                              />
                            )} */}
                            </View>
                          </View>
                        </TouchableOpacity>
                      </Swipeout>
                    </View>
                  ))}
                </View>
              </View>
            ) : view === "requests" ? (
              <View style={{ flex: 1 }}>
                {/* <Text>requests</Text> */}
                <FriendsRequest />
              </View>
            ) : (
              // <View style={{ flex: 1 }}>
              <FriendsMap friends={friends} />
              // </View>
            )
          }
        </ScrollView>

        {/* ---------------------------------FRIENDS SEARCH--------------------------------- */}
        {!editMode ? (
          <TouchableOpacity
            style={{
              backgroundColor: "#3ea3a3",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              bottom: "3%",
              right: "3%",
              borderRadius: 100,
              // height: "10%",
              width: "15%",
              aspectRatio: 1 / 1,
            }}
            onPress={() => props.navigation.navigate("FriendsSearch")}
          >
            <FontAwesome5
              name="user-plus"
              // name={favoriteAssets.includes(l.id) ? "heart" : "plus"}
              size={22}
              color={"white"}
            />
          </TouchableOpacity>
        ) : (
          // ---------------------------------DELETE SELECTED---------------------------------
          <TouchableOpacity
            style={{
              backgroundColor: "#901616",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              bottom: "3%",
              right: "3%",
              borderRadius: 100,
              // height: "10%",
              width: "15%",
              aspectRatio: 1 / 1,
            }}
            onPress={() => {
              // removeSelectedFriends();
              // setEditMode(false);
              setModal(true);
            }}
          >
            {/* <FontAwesome5
              name="user-plus"
              // name={favoriteAssets.includes(l.id) ? "heart" : "plus"}
              size={22}
              color={"white"}
            /> */}
            {/* <Text
              style={{
                color: view === "requests" ? "#185a9d" : "gray",
                fontSize: 12,
              }}
            >
              Requests
            </Text> */}
            <Text style={{ color: "white" }}>Delete</Text>
          </TouchableOpacity>
        )}

        {/* ---------------------------------CANCEL EDITMODE--------------------------------- */}
        {editMode && (
          <TouchableOpacity
            style={{
              backgroundColor: "#3ea3a3",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              bottom: "3%",
              left: "3%",
              borderRadius: 100,
              // height: "10%",
              width: "15%",
              aspectRatio: 1 / 1,
            }}
            onPress={() => {
              setEditMode(false);
              setDeleteIds([]);
            }}
          >
            <Text style={{ color: "white" }}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* ---------------------------------MODAL--------------------------------- */}
      <Modal
        transparent={true}
        visible={modal}
        animationType="slide"
        onRequestClose={() => setModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            // alignItems: "center",
            alignSelf: "center",
            marginTop: 22,
            // ---This is for Width---
            width: "80%",
            color: "grey",
          }}
        >
          <View
            style={{
              margin: 20,
              backgroundColor: "white",
              borderRadius: 20,
              padding: 35,
              alignItems: "center",
              alignSelf: "center",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              justifyContent: "center",
              // ---This is for Height---
              height: "30%",
              width: "100%",
            }}
          >
            {/* {selectedFriend === "ALL" ? (
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                Are you sure you want to{" "}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#901616",
                    textDecorationLine: "underline",
                  }}
                >
                  {" "}
                  DELETE ALL{" "}
                </Text>{" "}
                your friends?
              </Text>
            ) : (
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                Are you sure you want to{" "}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#901616",
                    textDecorationLine: "underline",
                  }}
                >
                  DELETE {selectedFriend && selectedFriend.displayName}
                </Text>{" "}
                from your friends?
              </Text>
            )} */}
            {selectedFriend && (
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                Are you sure you want to{" "}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#901616",
                    textDecorationLine: "underline",
                  }}
                >
                  DELETE {selectedFriend.displayName}
                </Text>{" "}
                from your friends?
              </Text>
            )}

            {deleteIds.length > 0 && (
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                Are you sure you want to{" "}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#901616",
                    textDecorationLine: "underline",
                  }}
                >
                  DELETE SELECTED
                </Text>{" "}
                friends?
              </Text>
            )}

            <Text>{"\n"}</Text>
            <View
              style={{
                //   borderWidth: 1,
                width: "100%",
                height: "20%",
                justifyContent: "space-around",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              {/* ---------------------------------CONFIRM--------------------------------- */}
              <TouchableOpacity
                style={{
                  borderWidth: 2,
                  borderColor: "#901616",
                  width: "35%",
                  height: "110%",
                  backgroundColor: "#901616",
                  borderRadius: 8,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => {
                  if (deleteIds.length > 0) {
                    // removeAllFriends();
                    removeSelectedFriends();
                    setDeleteIds([]);
                    setModal(false);
                    editMode(false);
                  } else {
                    removeFriend(selectedFriend);
                    setSelectedFriend(null);
                    setModal(false);
                  }
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}
                >
                  Confirm
                </Text>
              </TouchableOpacity>
              {/* ---------------------------------CANCEL--------------------------------- */}
              <TouchableOpacity
                style={{
                  borderWidth: 2,
                  borderColor: "#3ea3a3",
                  width: "35%",
                  height: "110%",
                  backgroundColor: "#3ea3a3",
                  borderRadius: 8,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => {
                  setModal(false);
                  if (selectedFriend) {
                    setSelectedFriend(null);
                  }
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //   paddingTop: "15%",
    // backgroundColor: "#185a9d",
  },
  passwordContainer: {
    // flexDirection: "row",
    // borderBottomWidth: 1,
    // borderColor: "#000",
    // paddingBottom: 10,
  },
  inputStyle: {
    flex: 1,
  },
});

FriendsList.navigationOptions = {
  //header: null,
  headerStyle: { backgroundColor: "#185a9d", paddingLeft: 15 },
  headerTintColor: "white",
  tabBarIcon: () => {
    <Icon name="news" type="font-awesome" size={24} color={"black"} />;
  },
};
