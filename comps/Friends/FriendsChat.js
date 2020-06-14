import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  KeyboardEvent,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import {
  MaterialIcons,
  Ionicons,
  MaterialCommunityIcons,
  Octicons,
  FontAwesome5,
  FontAwesome,
} from "@expo/vector-icons";
import { Divider, Avatar, Tooltip } from "react-native-elements";
// import Octicons from "react-native-vector-icons/Octicons";

import moment from "moment";

export default function FriendsList(props) {
  const friend = props.navigation.getParam("friend");
  const [user, setUser] = useState(null);

  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [chats, setChats] = useState(null);
  const [text, setText] = useState("");
  const [onPresent, setOnPresent] = useState(true);
  const [textCheck, setTextCheck] = useState(false);
  const [popUp, setPopUp] = useState(false);
  const [popUpIndex, setPopUpIndex] = useState(false);
  const [modal, setModal] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  const chatView = useRef();

  // const [unsubscribe, setUnsubscribe] = useState(null);
  // const [unsubscribe2, setUnsubscribe2] = useState(null);

  // -------------------------------USER-----------------------------------
  const handleUser = () => {
    const unsubscribe = db
      .collection("users")
      .doc(friend.id)
      .onSnapshot((doc) => {
        console.log(doc.data());
        setUser({ id: doc.id, ...doc.data() });
      });
    return unsubscribe;
  };

  // -------------------------------FROM-----------------------------------
  const handleFrom = () => {
    const unsubscribe = db
      .collection("chats")
      .where("from", "==", firebase.auth().currentUser.uid)
      .where("to", "==", friend.id)
      .onSnapshot((queryBySnapshot) => {
        let tempFrom = [];
        tempFrom.fil;
        queryBySnapshot.forEach((doc) => {
          tempFrom.push({ id: doc.id, ...doc.data(), from: true, flag: false });
        });
        // console.log(tempFrom);
        setFrom(tempFrom);
      });
    return unsubscribe;
  };

  // --------------------------------TO----------------------------------
  const handleTo = () => {
    console.log("yo we in to");
    const unsubscribe = db
      .collection("chats")
      .where("from", "==", friend.id)
      .where("to", "==", firebase.auth().currentUser.uid)
      .onSnapshot(async (queryBySnapshot) => {
        console.log("we in this?");
        let tempFrom = [];
        queryBySnapshot.forEach((doc) => {
          tempFrom.push({ id: doc.id, ...doc.data(), from: false });
        });
        // get all of this shit
        // filter only unread messages
        // update into read using their id
        let unread = tempFrom.filter((message) => message.status === "unread");
        if (unread.length > 0) {
          unread.forEach((message) =>
            db.collection("chats").doc(message.id).update({ status: "read" })
          );
        }

        setTo(tempFrom);
      });
    return unsubscribe;
  };

  // -------------------------------CHAT-----------------------------------
  const handleChat = () => {
    let tempChat = from.concat(to);
    tempChat = tempChat.sort(
      (a, b) => b.dateTime.toDate() - a.dateTime.toDate()
    );
    setChats(tempChat);
  };

  // --------------------------------SEND----------------------------------
  const send = async () => {
    db.collection("chats").add({
      to: friend.id,
      from: firebase.auth().currentUser.uid,
      text,
      status: "unread",
      dateTime: new Date(),
    });

    setText("");
  };

  // --------------------------------DELETE ALL----------------------------------
  const deleteAll = async () => {
    const getQuery = await db.collection("chats").get();
    getQuery.forEach((doc) => {
      db.collection("chats").doc(doc.id).delete();
    });
  };

  // --------------------------------SCREEN LISTENER----------------------------------
  const screenListener = (unsubscribe) => {
    let timerId = setInterval(() => {
      if (!props.navigation.isFocused()) {
        console.log("we stopping it");
        unsubscribe();
        clearInterval(timerId);
      } else {
        // console.log("scrnlistener running");
      }
    }, 1000);
  };

  // -------------------------------REMOVE-----------------------------------
  const removeChat = async (chat) => {
    db.collection("chats").doc(chat.id).delete();
  };

  useEffect(() => {
    // count = 0
    // if (text.includes("a" || "b" || "c")) {
    //   setTextCheck(true);
    // }
    // for(let i=0; i< text.length;i++){
    //   text.charAt(i)

    // }
    // console.log(text[0]);
    // console.log(text.split("\n")[0]);
    if (text[0] === " " || text[0] === "\n") {
      setText("");
    }
  }, [text]);

  // ------------------------------------------------------------------
  useEffect(() => {
    const unsubscribeFrom = handleFrom();
    const unsubscribeTo = handleTo();
    const unsubscribeUser = handleUser();
    return () => {
      unsubscribeFrom();
      unsubscribeTo();
      unsubscribeUser();
    };
  }, []);

  // ------------------------------------------------------------------
  useEffect(() => {
    if (from && to) {
      handleChat();
    }
  }, [from, to]);

  // ------------------------------------------------------------------
  // useEffect(() => {
  //   if (unsubscribe && unsubscribe2) {
  //     screenListener();
  //   }
  // }, [unsubscribe && unsubscribe2]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
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

  const _keyboardDidShow = (e) => {
    // console.log("keyyyyyyyyyyyyyyyShow");
    // setKeyboardHeight(e.endCoordinates.height)
    // console.log(
    //   "--------------------------------------",
    //   e.endCoordinates.height
    // );
    // console.log(
    //   "++++++++++++++++++++++++++++++++++",
    //   Dimensions.get("window").height - e.endCoordinates.height
    // );
    setKeyboardHeight(e.endCoordinates.height);
    setMargin(-200);
  };

  const _keyboardDidHide = () => {
    // console.log("keyyyyyyyyyyyyyyyHide");
    setMargin(0);
  };

  return (
    <KeyboardAvoidingView
      // behavior={Platform.OS === "ios" && "padding"}
      style={styles.container}
      enabled={false}
      onPress={() => {
        Keyboard.dismiss;
        // if (popUp) {
        //   console.log("BROOOOOOOOOOOOOOOOOOOOOOOO");
        //   let tempChat = [...chats];
        //   tempChat[popUpIndex].flag = false;
        //   setPopUpIndex(null);
        //   setPopUp(false);
        //   setChats(tempChat);
        // }
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#f0f0f0",
          maxHeight: 70,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderColor: "lightgray",
          // paddingTop: "1%",
          // paddingBottom: "1%",
          minHeight: 40,
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
        <Avatar
          rounded
          source={{
            uri: friend.photoURL,
          }}
          size="medium"
          avatarStyle={{ paddingLeft: "2%" }}
          containerStyle={{ marginLeft: "3%" }}
        />
        <Text style={{ color: "#185a9d", fontSize: 24, paddingLeft: "1%" }}>
          {" "}
          {friend.displayName}
        </Text>

        {user && (
          // <Text style={{ color: "#185a9d", fontSize: 24, paddingLeft: "1%" }}>
          //   {user.status}
          // </Text>
          <View
            style={{
              // width: "10%",
              // backgroundColor: "green",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              // paddingLeft: 10,
              width: 30,
              paddingTop: "0.5%",
            }}
          >
            <Octicons
              name="primitive-dot"
              // name={favoriteAssets.includes(l.id) ? "heart" : "plus"}
              size={30}
              color={user.status === "offline" ? "gray" : "#3ea3a3"}
            />
          </View>
        )}
      </View>
      <View
        style={{
          flex: 10,
          // backgroundColor: "green"
        }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          style={{ transform: [{ scaleY: -1 }] }}
          ref={(ref) => (chatView.current = ref)}
          // onScrollToTop={() => console.log("yowhat")}
          onScroll={(event) => {
            if (event.nativeEvent.contentOffset.y > 300 && onPresent) {
              // console.log("true");
              setOnPresent(false);
            }
            if (event.nativeEvent.contentOffset.y < 300 && !onPresent) {
              // console.log("false");
              setOnPresent(true);
            }
          }}
          scrollEventThrottle
          onScrollBeginDrag={() => console.log("yoooo")}
        >
          {/* <Text style={{ transform: [{ scaleY: -1 }] }}>hey buddy</Text> */}
          {chats &&
            chats.map((chat, i) => (
              // <TouchableOpacity style={{alignContent:'flex-end'}}>

              // </TouchableOpacity>
              <View
                style={{
                  borderRadius: 20,
                  width: "90%",
                  alignSelf: "center",
                  // backgroundColor: "yellow",
                }}
                key={chat.id}
              >
                <Text>{"\n"}</Text>
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: chat.from ? "flex-end" : "flex-start",
                    // alignSelf: "flex-start",
                    // backgroundColor: "yellow",
                    alignItems: "center",
                  }}
                >
                  {popUp && chat.from && (
                    <TouchableOpacity
                      onPress={() => setModal(true)}
                      style={{
                        // textAlign: "right",
                        // backgroundColor: "#3ea3a3",
                        // alignSelf: "center",
                        // maxWidth: "85%",
                        // minWidth: "20%",
                        // width: "50%",
                        // borderRadius: 20,
                        borderTopRightRadius: 0,
                        // padding: "1.5%",
                        // scaleX: -1,
                        // scaleY: -1,
                        transform: [{ scaleY: -1 }],
                        // position: "absolute",
                        // top: 50,
                        marginRight: 10,
                      }}
                    >
                      <FontAwesome
                        name="remove"
                        size={20}
                        color="#901616"
                        // style={{ paddingTop: "2%", marginBottom: 10 }}
                      />
                    </TouchableOpacity>
                    // <TouchableOpacity>
                    //   <Text>Delete</Text>
                    // </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    disabled={chat.from ? false : true}
                    onPress={() => setPopUp(false)}
                    onLongPress={() => {
                      {
                        // console.log("duuuude");
                        // let tempChat = [...chats];
                        // tempChat[i].flag = true;
                        // setChats(tempChat);
                        setPopUp(!popUp);
                        // setPopUpIndex(i);
                        setSelectedChat(chat);
                      }
                    }}
                    style={
                      chat.from
                        ? {
                            textAlign: "right",
                            backgroundColor: "#3ea3a3",
                            alignSelf: "flex-end",
                            maxWidth: "85%",
                            minWidth: "20%",
                            borderRadius: 20,
                            borderTopRightRadius: 0,
                            padding: "1.5%",
                            // scaleX: -1,
                            // scaleY: -1,
                            transform: [{ scaleY: -1 }],
                          }
                        : {
                            textAlign: "left",
                            backgroundColor: "white",
                            alignSelf: "flex-start",
                            maxWidth: "85%",
                            minWidth: "20%",
                            borderRadius: 20,
                            borderTopLeftRadius: 0,
                            padding: "1.5%",
                            // scaleX: -1,
                            // scaleY: -1,
                            transform: [{ scaleY: -1 }],
                          }
                    }
                    // key={i}
                  >
                    <Text
                      style={
                        chat.from
                          ? {
                              textAlign: "right",
                              paddingLeft: "2%",
                              paddingRight: "2%",
                              fontSize: 12,
                              color: "white",
                              // padding: "2%",
                            }
                          : {
                              textAlign: "left",
                              paddingLeft: "2%",
                              paddingRight: "2%",
                              fontSize: 12,
                              color: "#3ea3a3",
                              // padding: "2%",
                            }
                      }
                      // key={chat.id}
                    >
                      {moment(chat.dateTime.toDate()).format("LLL")}
                    </Text>
                    <Text
                      style={
                        chat.from
                          ? {
                              textAlign: "right",
                              paddingLeft: "2%",
                              paddingRight: "2%",
                              fontSize: 20,
                              color: "white",
                              // padding: "2%",
                            }
                          : {
                              textAlign: "left",
                              paddingLeft: "2%",
                              paddingRight: "2%",
                              fontSize: 20,
                              color: "#3ea3a3",
                              // padding: "2%",
                            }
                      }
                      key={chat.id}
                    >
                      {chat.text}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          <Text>{"\n"}</Text>
        </ScrollView>
        {!onPresent && (
          <TouchableOpacity
            style={{
              position: "absolute",
              bottom: "10%",
              right: "0%",
              // borderWidth: 1,
              width: 50,
              height: 50,
              justifyContent: "center",
              alignItems: "center",
              // backgroundColor: "white",
              // borderRadius: 50,
            }}
            onPress={() => chatView.current.scrollTo()}
          >
            <MaterialCommunityIcons
              name="arrow-down-drop-circle"
              size={40}
              color="#185a9d"
            />
          </TouchableOpacity>
        )}
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: "#f0f0f0",
          maxHeight: 70,
          minHeight: 25,
          flexDirection: "row",
          // paddingLeft: "2%",
          justifyContent: "center",
          borderTopWidth: 1,
          borderColor: "lightgray",
          paddingTop: "2%",
          padding: "1%",

          paddingBottom: 0,
          // marginTop: -1,
          // paddingTop: -500,
          marginBottom:
            Platform.OS === "ios"
              ? marginVal === 0
                ? 0
                : keyboardHeight + (keyboardHeight / 100) * 2
              : 0,
          // marginBottom: `${(320 / 792) * 100}%`,
        }}
      >
        <TextInput
          style={{
            width: "90%",
            height: "90%",
            minHeight: 30,
            padding: 2,
            borderWidth: 2,
            borderColor: "#185a9d",
            borderRadius: 50,
            backgroundColor: "white",
            paddingLeft: 15,
            textAlignVertical: "center",
          }}
          // numberOfLines={10}
          multiline={true}
          placeholder="Type here"
          placeholderTextColor="darkgrey"
          onChangeText={setText}
          value={text}
        />
        <TouchableOpacity
          onPress={send}
          style={{
            // backgroundColor: "yellow",
            justifyContent: "center",
            alignItems: "center",
            width: "10%",
          }}
          disabled={text !== "" ? false : true}
        >
          <MaterialIcons
            name="send"
            size={30}
            color={text !== "" ? "#3ea3a3" : "lightgray"}
          />
        </TouchableOpacity>
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
                DELETE
                {/* {selectedFriend && selectedFriend.displayName} */}
              </Text>{" "}
              this message?
            </Text>
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
                  // if (selectedChat === "ALL") {
                  //   removeAllFriends();
                  //   setModal(false);
                  // } else {
                  removeChat(selectedChat);
                  setModal(false);
                  setPopUp(false);
                  // }
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
                  setPopUp(false);
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    //  alignContent:'center',
    //  justifyContent: "space-e",
    backgroundColor: "#E7E8EA",
    height: "100%",
  },
});
