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
} from "react-native";
import LottieView from "lottie-react-native";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import {
  FontAwesome5,
  Ionicons,
  FontAwesome,
  AntDesign,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-navigation";
import { ListItem, Icon, Badge } from "react-native-elements";
import moment from "moment";
export default function FriendsList(props) {
  const [users, setUsers] = useState(null);

  const [friends, setFriends] = useState(null);
  const [allFriends, setAllFriends] = useState(null);
  const [friendsNoQuery, setFriendsNoQuery] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState(null);

  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [chats, setChats] = useState(null);

  const [search, setSearch] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [modal, setModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
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
          queryBySnapshot.forEach((doc) => {
            if (doc.data().status === "accepted") {
              tempFriends.push({
                id: doc.id,
                ...doc.data(),
                notifications: 0,
                dateTime: new Date(0),
                status: "offline",
                lastMessage: "",
              });
            }
          });
          tempFriends = tempFriends.sort((a, b) =>
            a.displayName
              .toLowerCase()
              .localeCompare(b.displayName.toLowerCase())
          );

          setAllFriends(tempFriends);
        } else {
          setAllFriends([]);
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
        .where(firebase.firestore.FieldPath.documentId(), "in", tempFriendsId)
        .onSnapshot((queryBySnapshot) => {
          let tempUsers = [];
          queryBySnapshot.forEach((doc) =>
            tempUsers.push({ id: doc.id, ...doc.data() })
          );
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
        if (user.status !== undefined) {
          friend.status = user.status;
        }

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

  return !friends ? (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        flex: 0.7,
        paddingTop: "7%",
        paddingLeft: "3%",
      }}
    >
      {/* <LottieView
        source={require("../../assets/loading.json")}
        autoPlay
        loop
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "13%",
          paddingLeft: "5%",
        }}
      /> */}
      <Text style={{ fontSize: 28, color: "#20365F", position: "relative" }}>
        LOADING
      </Text>
    </View>
  ) : (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#185a9d",
          borderTopColor: "#185a9d",
          //paddingTop:'2%',
        }}
      >
        <MaterialCommunityIcons
          name="account-search"
          size={40}
          color="#fff"
          style={{ paddingTop: "2%", marginBottom: 10 }}
        />
        <TextInput
          style={{
            backgroundColor: "white",
            fontSize: 18,
            paddingLeft: "2%",
            borderColor: "grey",
            borderWidth: 1,
            width: "80%",
            height: "80%",
            marginLeft: 7,
            marginRight: 7,
          }}
          placeholderTextColor="#20365F"
          placeholder="Search Here"
          onChangeText={setSearch}
          value={search}
        />
        <TouchableOpacity
          onPress={() => props.navigation.navigate("FriendsMap")}
        >
          <FontAwesome5 name="map-marker-alt" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: "column",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#e3e3e3",
          borderTopColor: "#185a9d",
          height: "20%",
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "white",
            borderRadius: 8,
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 0,
            paddingLeft: "2%",
            borderColor: "grey",
            borderWidth: 1,
            width: "95%",
            height: "40%",
            marginLeft: 7,
            marginRight: 7,
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={() => props.navigation.navigate("FriendsSearch")}
        >
          <Ionicons name="md-person-add" size={28} color="#185a9d" />
          <Text
            style={{
              color: "#185a9d",
              fontSize: 18,
              paddingLeft: "5%",
              fontWeight: "500",
            }}
          >
            ADD FRIENDS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "white",
            borderRadius: 8,
            borderTopRightRadius: 0,
            borderTopLeftRadius: 0,
            paddingLeft: "2%",
            borderColor: "grey",
            borderWidth: 1,
            width: "95%",
            height: "40%",
            marginLeft: 7,
            marginRight: 7,
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={() => props.navigation.navigate("FriendsRequest")}
        >
          <FontAwesome name="users" size={28} color="#185a9d" />
          {/* <Ionicons name="md-person-add" size={28} color="#20365F" /> */}
          <Text
            style={{
              color: "#185a9d",
              fontSize: 18,
              paddingLeft: "5%",
              fontWeight: "500",
            }}
          >
            FRIENDS REQUESTS
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#185a9d",
          borderTopColor: "#185a9d",
          height: "5%",
        }}
      >
        {!editMode ? (
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              paddingLeft: "5%",
              fontWeight: "500",
            }}
          >
            MY FRIENDS
          </Text>
        ) : (
          //   <Text
          //   style={{
          //     color: "#fff",
          //     fontSize: 18,
          //     paddingLeft: "5%",
          //     fontWeight: "500",
          //   }}
          // >
          //   DELETE FRIENDS
          // </Text>//#endregion
          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                paddingLeft: "5%",
                fontWeight: "500",
                paddingTop: "2%",
              }}
            >
              MY FRIENDS
            </Text>
            <TouchableOpacity
              style={{
                //width: "15%",
                //  height:'15%',
                borderWidth: 1,
                borderRadius: 8,
                borderColor: "#901616",
                //marginLeft: "39%",
                // justifyContent: 'flex-end',
                alignItems: "flex-end",
                // paddingTop: "1%",
                backgroundColor: "#901616",
              }}
              onPress={() => {
                setSelectedFriend("ALL");
                setModal(true);
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  // paddingLeft: "2%",
                  // paddingRight:'2%',
                  // paddingBottom:'1%',
                  padding: "0.5%",
                  fontWeight: "500",
                }}
              >
                <MaterialCommunityIcons
                  name="delete-circle-outline"
                  size={24}
                  color="#fff"
                />
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {editMode ? (
          <TouchableOpacity
            style={{
              width: "15%",
              //  height:'15%',
              borderWidth: 1,
              borderRadius: 8,
              borderColor: "#3ea3a3",
              marginLeft: "40%",
              // justifyContent: 'flex-end',
              alignItems: "center",
              paddingTop: "1%",
              backgroundColor: "#3ea3a3",
            }}
            onPress={() => setEditMode(false)}
          >
            {/* <AntDesign name="checkcircle" size={24} color="#3ea3a3" /> */}
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "500",
                alignSelf: "center",
                paddingBottom: "2%",
                paddingLeft: "3%",
              }}
            >
              DONE
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              width: "15%",
              //  height:'15%',
              borderWidth: 1,
              borderRadius: 8,
              borderColor: "#3ea3a3",
              marginLeft: "50%",
              // justifyContent: 'flex-end',
              alignItems: "center",
              paddingTop: "1%",
              backgroundColor: "#3ea3a3",
            }}
            onPress={() => setEditMode(true)}
          >
            {/* <FontAwesome5 name="edit" size={24} color="#fff" /> */}
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "500",
                alignSelf: "center",
                paddingBottom: "2%",
                paddingLeft: "3%",
              }}
            >
              EDIT
            </Text>
          </TouchableOpacity>
        )}
        {/* {editMode && (
        <Button
          title="Delete All"
          onPress={() => {
            setSelectedFriend("ALL");
            setModal(true);
          }}
          color="red"
        />
      )} */}
      </View>
      {friends.length > 0 ? (
        <SafeAreaView
          style={{
            paddingTop: "2%",
            backgroundColor: "#e3e3e3",
            height: "55%",
            // borderRadius: 30,
            width: "100%",
            flex: 1,
           // marginLeft: "1%",

            // borderColor:'#20365F',
            // borderWidth:1
          }}
        >
          <ScrollView>
            <FlatList
              data={friends}
              keyExtractor={(item) => String(item.id)}
              style={{
                borderWidth: 1,
                borderColor: "#185a9d",
                width: "98%",
                marginLeft: "1%",
              }}
              //contentContainerStyle={{alignItems:'flex-start', justifyContent:'space-around'}}
              renderItem={({ item, index }) => (
                <TouchableOpacity>
                  <ListItem
                    key={item.id}
                    leftAvatar={{ source: { uri: item.photoURL } }}
                    leftIcon={
                      <Badge
                        status="warning"
                        containerStyle={{
                          position: "absolute",
                          bottom: "78%",
                          right: "62%",
                          width: "2%",
                        }}
                        value={item.notifications}
                      />
                    }
                    // leftAvatar={
                    //   <FontAwesome5
                    //     name="user-friends"
                    //     size={30}
                    //     color="#20365F"
                    //   />
                    //  <AntDesign name="adduser" size={35} color="#20365F" />
                    // }
                    rightElement={
                      editMode && (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedFriend(item);
                            setModal(true);
                          }}
                        >
                          <MaterialCommunityIcons
                            name="delete-forever-outline"
                            size={30}
                            color="#901616"
                          />
                          {/* <Feather name="x-circle" size={30} color="black" /> */}
                        </TouchableOpacity>
                      )
                    }
                    // rightIcon={
                    //   // <TouchableOpacity
                    //   //   onPress={() =>
                    //   //     props.navigation.navigate("FriendsChat", {
                    //   //       friend: item,
                    //   //     })
                    //   //   }
                    //   // >
                    //   //   <FontAwesome5
                    //   //     name="rocketchat"
                    //   //     size={24}
                    //   //     color="#1B2D4F"
                    //   //   />
                    //   //   {/* <Ionicons name="ios-chatboxes" size={30} color="black" /> */}
                    //   // </TouchableOpacity>

                    //   // <FontAwesome5 name="rocketchat" size={24} color="black" />

                    //   <View>
                    //     {item.status === "offline" ? (
                    //       <Text style={{ color: "darkgrey", fontWeight: "600" ,marginRight:'10%'}}>
                    //         {item.status}
                    //       </Text>
                    //     ) : (
                    //       <Text style={{ color: "green", fontWeight: "600" }}>
                    //         {item.status}
                    //       </Text>
                    //     )}
                    //   </View>
                    // }
                    title={item.displayName}
                    titleStyle={{ fontSize: 20 }}
                    rightSubtitle={item.status}
                    rightSubtitleStyle={
                      item.status === "offline"
                        ? { color: "darkgrey", fontWeight: "600" }
                        : { color: "green", fontWeight: "600" }
                    }
                    subtitle={
                      // if more than 1 \n
                      item.lastMessage.split("\n").length > 0
                        ? // if first line more than 32 chars
                          item.lastMessage.split("\n")[0].length > numOfChars
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
                          item.lastMessage.trim().substring(0, numOfChars) +
                          "......"
                        : // message showed
                          item.lastMessage.trim()
                    }
                    //subtitle={item.status + " to add you"}
                    subtitleStyle={{ fontSize: 12, color: "grey" }}
                    bottomDivider
                    onPress={
                      editMode
                        ? false
                        : () =>
                            props.navigation.navigate("FriendsChat", {
                              friend: item,
                            })
                    }
                  />
                </TouchableOpacity>
              )}
            />
          </ScrollView>
        </SafeAreaView>
      ) : (
        <View
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "column",
          }}
        >
          <LottieView
            source={require("../../assets/17723-waitting.json")}
            autoPlay
            loop
            style={{ position: "relative", width: "55%", paddingTop: "5%" }}
          />
          <Text style={{ color: "grey", fontSize: 28, paddingTop: "10%" }}>
            Your friend list is empty
          </Text>
        </View>
      )}

      {/* ---------------------------------MODAL--------------------------------- */}
      <Modal transparent={true} visible={modal} animationType="slide">
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
            {selectedFriend === "ALL" ? (
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
                  if (selectedFriend === "ALL") {
                    removeAllFriends();
                    setModal(false);
                  } else {
                    removeFriend(selectedFriend);
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
                onPress={() => setModal(false)}
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
    backgroundColor: "#185a9d",
  },
  passwordContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    paddingBottom: 10,
  },
  inputStyle: {
    flex: 1,
  },
});

FriendsList.navigationOptions = {
  //header: null,
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
  tabBarIcon: () => {
    <Icon name="news" type="font-awesome" size={24} color={"black"} />;
  },
};
