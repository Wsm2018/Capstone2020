import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { Overlay, ButtonGroup } from "react-native-elements";

import Create from "./FAQCreate";
import Update from "./FAQUpdate";

import db from "../../db.js";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { Divider } from "react-native-elements";

export default function FAQViewScreen(props) {
  const [user, setUser] = useState(null);
  const [visibleCreate, setVisibleCreate] = useState(false);
  const [visibleUpdate, setVisibleUpdate] = useState(false);
  const [questionList, setQuestionList] = useState([]);

  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [selectedValue, setSelectedValue] = useState(0);
  const toggleOverlayCreate = () => {
    setVisibleCreate(!visibleCreate);
  };

  const toggleOverlayUpdate = (q) => {
    setSelectedQuestion(q);
    setVisibleUpdate(!visibleUpdate);
  };
  useEffect(() => {
    db.collection("faq").onSnapshot((Snap) => {
      let temp = [];
      Snap.forEach((doc) => {
        temp.push({ id: doc.id, ...doc.data() });
      }),
        setQuestionList(temp);
    });
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
    const response = await add({ id, query: "delete" });
  };

  const buttons1 = ["Q & A", "My Questions"];
  const buttons2 = ["Q & A", "Pending"];
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 30,
          right: 20,
          zIndex: 10,
        }}
        onPress={toggleOverlayCreate}
      >
        <MaterialCommunityIcons
          name="pencil-plus"
          size={50}
          color={"white"}
          style={{
            backgroundColor: "#3ea3a3",
            textAlign: "center",
            alignSelf: "flex-end",
            justifyContent: "center",
            borderRadius: 10,
            margin: 5,
          }}
        />
      </TouchableOpacity>
      <Overlay isVisible={visibleCreate} onBackdropPress={toggleOverlayCreate}>
        <Create toggle={toggleOverlayCreate} user={user} />
      </Overlay>
      <Overlay isVisible={visibleUpdate} onBackdropPress={toggleOverlayUpdate}>
        <Update toggle={toggleOverlayUpdate} q={selectedQuestion} />
      </Overlay>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 25, fontWeight: "bold" }}>
          Frequently Asked Questions
        </Text>
      </View>
      <ScrollView style={{ width: "100%" }}>
        {user ? (
          user.role != "admin" ? (
            <View>
              <ButtonGroup
                onPress={setSelectedValue}
                selectedIndex={selectedValue}
                buttons={buttons1}
                containerStyle={{
                  height: 50,
                  alignSelf: "center",
                  width: "100%",
                }}
                selectedButtonStyle={{ backgroundColor: "#3ea3a3" }}
              />
              {selectedValue == 0 ? (
                <ScrollView>
                  {questionList
                    ? questionList.map((item, index) =>
                        item.status == "approved" ? (
                          <View
                            key={index}
                            style={{
                              width: "90%",
                              padding: 10,
                              margin: 10,
                              alignSelf: "center",
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                              }}
                            >
                              <Text style={{ fontSize: 32, color: "red" }}>
                                Q.{" "}
                              </Text>
                              <Text
                                style={{
                                  width: "90%",
                                  alignSelf: "center",
                                }}
                              >
                                {item.question}
                              </Text>
                            </View>
                            <Divider style={{ backgroundColor: "blue" }} />
                            <View
                              style={{
                                flexDirection: "row",
                              }}
                            >
                              <Text style={{ fontSize: 32, color: "green" }}>
                                A.{" "}
                              </Text>
                              <Text
                                style={{
                                  width: "90%",
                                  alignSelf: "center",
                                }}
                              >
                                {item.answer}
                              </Text>
                            </View>

                            {user.role == "admin" ? (
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignSelf: "flex-end",
                                }}
                              >
                                <TouchableOpacity
                                  onPress={() => toggleOverlayUpdate(item)}
                                >
                                  <MaterialCommunityIcons
                                    name="update"
                                    size={25}
                                    color={"white"}
                                    style={{
                                      backgroundColor: "#3ea3a3",
                                      textAlign: "center",
                                      alignSelf: "flex-end",
                                      justifyContent: "center",
                                      borderRadius: 5,
                                      margin: 5,
                                      padding: 1,
                                    }}
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => IgnoreQuestion(item.id)}
                                >
                                  <FontAwesome
                                    name="remove"
                                    size={25}
                                    color={"white"}
                                    style={{
                                      backgroundColor: "#901616",
                                      textAlign: "center",
                                      alignSelf: "flex-end",
                                      justifyContent: "center",
                                      borderRadius: 5,
                                      margin: 5,
                                      padding: 1,
                                    }}
                                  />
                                </TouchableOpacity>
                              </View>
                            ) : null}
                          </View>
                        ) : null
                      )
                    : null}
                </ScrollView>
              ) : (
                <ScrollView>
                  {questionList
                    ? questionList.map((item, index) =>
                        item.userId == firebase.auth().currentUser.uid ? (
                          <View
                            key={index}
                            style={{
                              width: "90%",
                              padding: 10,
                              margin: 10,
                              alignSelf: "center",
                              paddingRight: 10,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                              }}
                            >
                              <Text style={{ fontSize: 32, color: "red" }}>
                                Q.{" "}
                              </Text>
                              <Text
                                style={{
                                  width: "90%",
                                  alignSelf: "center",
                                }}
                              >
                                {item.question}
                              </Text>
                            </View>
                            <Divider style={{ backgroundColor: "blue" }} />
                            <View
                              style={{
                                flexDirection: "row",
                              }}
                            >
                              <Text style={{ fontSize: 32, color: "green" }}>
                                A.{" "}
                              </Text>
                              <Text
                                style={{
                                  width: "90%",
                                  alignSelf: "center",
                                }}
                              >
                                {item.answer}
                              </Text>
                            </View>

                            {user.role == "admin" ? (
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignSelf: "flex-end",
                                }}
                              >
                                <TouchableOpacity
                                  onPress={() => toggleOverlayUpdate(item)}
                                >
                                  <MaterialCommunityIcons
                                    name="update"
                                    size={25}
                                    color={"white"}
                                    style={{
                                      backgroundColor: "#3ea3a3",
                                      textAlign: "center",
                                      alignSelf: "flex-end",
                                      justifyContent: "center",
                                      borderRadius: 5,
                                      margin: 5,
                                      padding: 1,
                                    }}
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => IgnoreQuestion(item.id)}
                                >
                                  <FontAwesome
                                    name="remove"
                                    size={25}
                                    color={"white"}
                                    style={{
                                      backgroundColor: "#901616",
                                      textAlign: "center",
                                      alignSelf: "flex-end",
                                      justifyContent: "center",
                                      borderRadius: 5,
                                      margin: 5,
                                      padding: 1,
                                    }}
                                  />
                                </TouchableOpacity>
                              </View>
                            ) : null}
                          </View>
                        ) : null
                      )
                    : null}
                </ScrollView>
              )}
            </View>
          ) : (
            <View>
              <ButtonGroup
                onPress={setSelectedValue}
                selectedIndex={selectedValue}
                buttons={buttons2}
                containerStyle={{
                  height: 50,
                  alignSelf: "center",
                  width: "100%",
                }}
                selectedButtonStyle={{ backgroundColor: "#3ea3a3" }}
              />
              {selectedValue == 0 ? (
                <ScrollView>
                  {questionList
                    ? questionList.map((item, index) =>
                        item.status == "approved" ? (
                          <View
                            key={index}
                            style={{
                              width: "100%",
                              padding: 10,
                              margin: 10,
                              alignSelf: "center",
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                              }}
                            >
                              <Text style={{ fontSize: 32, color: "red" }}>
                                Q.{" "}
                              </Text>
                              <Text
                                style={{ width: "90%", alignSelf: "center" }}
                              >
                                {item.question}
                              </Text>
                            </View>
                            <Divider style={{ backgroundColor: "blue" }} />
                            <View
                              style={{
                                flexDirection: "row",
                              }}
                            >
                              <Text style={{ fontSize: 32, color: "green" }}>
                                A.{" "}
                              </Text>
                              <Text
                                style={{ width: "90%", alignSelf: "center" }}
                              >
                                {item.answer}
                              </Text>
                            </View>

                            {user.role == "admin" ? (
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignSelf: "flex-end",
                                }}
                              >
                                <TouchableOpacity
                                  onPress={() => toggleOverlayUpdate(item)}
                                >
                                  <MaterialCommunityIcons
                                    name="update"
                                    size={25}
                                    color={"white"}
                                    style={{
                                      backgroundColor: "#3ea3a3",
                                      textAlign: "center",
                                      alignSelf: "flex-end",
                                      justifyContent: "center",
                                      borderRadius: 5,
                                      margin: 5,
                                      padding: 1,
                                    }}
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => IgnoreQuestion(item.id)}
                                >
                                  <FontAwesome
                                    name="remove"
                                    size={25}
                                    color={"white"}
                                    style={{
                                      backgroundColor: "#901616",
                                      textAlign: "center",
                                      alignSelf: "flex-end",
                                      justifyContent: "center",
                                      borderRadius: 5,
                                      margin: 5,
                                      padding: 1,
                                    }}
                                  />
                                </TouchableOpacity>
                              </View>
                            ) : null}
                          </View>
                        ) : null
                      )
                    : null}
                </ScrollView>
              ) : (
                <ScrollView>
                  {questionList
                    ? questionList.map((item, index) =>
                        item.status == "pending" ? (
                          <View
                            key={index}
                            style={{
                              width: "100%",
                              padding: 10,
                              margin: 10,
                              alignSelf: "center",
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                              }}
                            >
                              <Text style={{ fontSize: 32, color: "red" }}>
                                Q.{" "}
                              </Text>
                              <Text
                                style={{ width: "90%", alignSelf: "center" }}
                              >
                                {item.question}
                              </Text>
                            </View>
                            <Divider style={{ backgroundColor: "blue" }} />
                            <View
                              style={{
                                flexDirection: "row",
                              }}
                            >
                              <Text style={{ fontSize: 32, color: "green" }}>
                                A.{" "}
                              </Text>
                              <Text
                                style={{ width: "90%", alignSelf: "center" }}
                              >
                                {item.answer}
                              </Text>
                            </View>

                            {user.role == "admin" ? (
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignSelf: "flex-end",
                                }}
                              >
                                <TouchableOpacity
                                  onPress={() => toggleOverlayUpdate(item)}
                                >
                                  <MaterialCommunityIcons
                                    name="update"
                                    size={25}
                                    color={"white"}
                                    style={{
                                      backgroundColor: "#3ea3a3",
                                      textAlign: "center",
                                      alignSelf: "flex-end",
                                      justifyContent: "center",
                                      borderRadius: 5,
                                      margin: 5,
                                      padding: 1,
                                    }}
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => IgnoreQuestion(item.id)}
                                >
                                  <FontAwesome
                                    name="remove"
                                    size={25}
                                    color={"white"}
                                    style={{
                                      backgroundColor: "#901616",
                                      textAlign: "center",
                                      alignSelf: "flex-end",
                                      justifyContent: "center",
                                      borderRadius: 5,
                                      margin: 5,
                                      padding: 1,
                                    }}
                                  />
                                </TouchableOpacity>
                              </View>
                            ) : null}
                          </View>
                        ) : null
                      )
                    : null}
                </ScrollView>
              )}
            </View>
          )
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get("window").width,
  },
});
