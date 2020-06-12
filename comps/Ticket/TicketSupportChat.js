import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  Picker,
  CheckBox,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
  Keyboard,
  scrollToEnd,
} from "react-native";
import db from "../../db";

import { Divider } from "react-native-elements";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import firebase from "firebase/app";
import "firebase/auth";

import moment from "moment";
export default function SupportChat(props) {
  const ticket = props.navigation.getParam("ticket");
  const user = props.navigation.getParam("user");

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    db.collection("customerSupport")
      .doc(ticket.id + "")
      .collection("liveChat")
      .onSnapshot((Snap) => {
        let temp = [];
        Snap.forEach((doc) => {
          temp.push({ id: doc.id, ...doc.data() });
        });
        temp = temp.sort((a, b) => a.dateTime.toDate() - b.dateTime.toDate());
        setMessages(temp);
      });
  }, []);

  const sendSupportMessage = async () => {
    if (text != "") {
      const send = firebase.functions().httpsCallable("sendSupportMessage");
      const response = await send({ ticket, user, text });
      setText("");
    }
  };

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

    setMargin(-280);
  };

  const _keyboardDidHide = () => {
    // console.log("keyyyyyyyyyyyyyyyHide");
    setMargin(0);
  };

  const [marginVal, setMargin] = useState(0);
  /////////////////////////////////////////////////////////////////////////////////////

  return (
    <KeyboardAvoidingView behavior="height" style={{ marginTop: marginVal }}>
      <View style={{ height: Dimensions.get("window").height / 1.19 }}>
        <ScrollView>
          {messages ? (
            <View style={styles.container}>
              {messages.map((item, index) =>
                item.from == "Auto Reply" ? (
                  <View
                    key={index}
                    style={{
                      alignSelf: "center",
                    }}
                  >
                    <View style={{ padding: 10 }}>
                      <Text style={{ textAlign: "center", color: "gray" }}>
                        {moment(item.dateTime.toDate()).format("LLL")}
                      </Text>
                      <Text style={{ textAlign: "center", color: "gray" }}>
                        {item.name}
                      </Text>
                      <Text style={{ color: "gray" }}>{item.text}</Text>
                    </View>
                  </View>
                ) : item.from == user.id ? (
                  <View
                    key={index}
                    style={{
                      backgroundColor: "#84e09e",
                      textAlign: "right",
                      alignSelf: "flex-end",
                      borderRadius: 5,
                      borderWidth: 0.1,
                      marginTop: 5,
                    }}
                  >
                    <View style={{ padding: 5 }}>
                      <Text style={styles.fontBold}>
                        {moment(item.dateTime.toDate()).format("LLL")}
                      </Text>
                      <View style={{ flexDirection: "row" }}>
                        <Text style={styles.fontBold}>
                          {item.name}: {`${item.text}`}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View
                    key={index}
                    style={{
                      backgroundColor: "lightgray",
                      borderRadius: 5,
                      alignSelf: "flex-start",
                      borderWidth: 0.1,
                      marginTop: 5,
                    }}
                  >
                    <View style={{ padding: 5 }}>
                      <Text style={styles.font}>
                        {moment(item.dateTime.toDate()).format("LLL")}
                      </Text>
                      <Text style={styles.font}>
                        {item.name}: {item.text}
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>
          ) : null}
        </ScrollView>
      </View>
      <Divider style={{ backgroundColor: "blue" }} />
      <View style={{ flexDirection: "row", backgroundColor: "white" }}>
        <TextInput
          placeholder="Type here..."
          style={{ paddingLeft: 15 }}
          value={text}
          multiline
          width={Dimensions.get("window").width - 70}
          onChangeText={setText}
        />
        <TouchableOpacity onPress={() => sendSupportMessage()}>
          <MaterialCommunityIcons
            name="send"
            size={35}
            color={"black"}
            style={{
              textAlign: "center",
              justifyContent: "center",
              margin: 5,
            }}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  font: {
    padding: 3,
    fontSize: 14,
    color: "#383838",
  },
  fontBold: {
    padding: 3,
    fontSize: 14,
    color: "#383838",
    fontWeight: "bold",
  },
});
