import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { Overlay } from "react-native-elements";

import Create from "./FAQCreate";
import Update from "./FAQUpdate";

import db from "../../db.js";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";

export default function FAQViewScreen(props) {
  const [user, setUser] = useState(null);
  const [visibleCreate, setVisibleCreate] = useState(false);
  const [visibleUpdate, setVisibleUpdate] = useState(false);
  const [questionList, setQuestionList] = useState(null);

  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const toggleOverlayCreate = () => {
    setVisibleCreate(!visibleCreate);
  };

  const toggleOverlayUpdate = (q) => {
    setSelectedQuestion(q);
    setVisibleUpdate(!visibleUpdate);
  };
  useEffect(() => {
    let temp = [];
    db.collection("faq").onSnapshot((Snap) => {
      Snap.forEach((doc) => {
        temp.push({ id: doc.id, ...doc.data() });
        console.log(doc.id, "==>", doc.data());
      });
    });
    setQuestionList(temp);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    let tempUser;
    const info = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    tempUser = { id: info.id, ...info.data() };
    setUser(tempUser);
  };

  const IgnoreQuestion = async (id) => {
    const add = firebase.functions().httpsCallable("FAQ");
    const response = await add({ query: "delete" });
  };
  return (
    <View style={styles.container}>
      <Button title="Ask a Question" onPress={toggleOverlayCreate} />

      <Overlay isVisible={visibleCreate} onBackdropPress={toggleOverlayCreate}>
        <Create toggle={toggleOverlayCreate} user={user} />
      </Overlay>
      <Overlay isVisible={visibleUpdate} onBackdropPress={toggleOverlayUpdate}>
        <Update toggle={toggleOverlayUpdate} q={selectedQuestion} />
      </Overlay>

      {questionList
        ? questionList.map((item, index) => (
            <View
              style={{ borderWidth: 1, width: "100%", padding: 10, margin: 10 }}
            >
              <Text>
                User: {item.userDisplayName} Question: {item.question}
              </Text>
              {user.activeRole == "admin" && item.status == "pending" ? (
                <>
                  <Button
                    title="Answer"
                    onPress={() => toggleOverlayUpdate(item)}
                  />
                  <Button
                    title="Ignore"
                    onPress={() => IgnoreQuestion(item.id)}
                  />
                </>
              ) : null}
            </View>
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
