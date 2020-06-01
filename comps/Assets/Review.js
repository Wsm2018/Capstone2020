//@refresh reset
import { Button, Input, Rating } from "react-native-elements";
import React, { useState, useEffect } from "react";
import { createStackNavigator } from "react-navigation-stack";

import {
  Image,
  Platform,
  TextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import Textarea from "react-native-textarea";

import "firebase/functions";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db.js";
require("firebase/firestore");
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import EvilIcons from "react-native-vector-icons/EvilIcons";
import { max } from "moment";

export default function Details(props) {
  // const asset = props.navigation.getParam("asset",'failed');
  // const startDateTime = props.navigation.getParam("startDateTime",'failed');
  // const endDateTime = props.navigation.getParam("endDateTime",'failed');
  const asset = props.asset;
  const startDateTime = props.startDateTime;
  const endDateTime = props.endDateTime;

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);
  const [user, setUser] = useState(null);

  ///////////////////Front-End///////////////////////////
  const [modalAddReview, setModalAddReview] = useState(false);
  const [modalViewReview, setModalViewReview] = useState(false);

  /////////////////////////////////////////////////////////

  useEffect(() => {
    getReviews();
  }, [asset]);

  useEffect(() => {
    // console.log(rating);
  }, [rating]);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const user = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    // console.log('user: ',user.data())
    setUser(user.data());
  };

  const getReviews = async () => {
    const temp = [];

    db.collection("assets")
      .doc(asset.id)
      .collection("reviews")
      .onSnapshot((snapshot) => {
        snapshot.forEach((doc) => {
          temp.push({ id: doc.id, ...doc.data() });
        });

        // console.log(temp);
        setReviews(temp);
      });
  };

  const handleAddReview = async () => {
    // console.log("before");
    const addReview = firebase.functions().httpsCallable("addReview");
    const result = await addReview({
      comment: newReview,
      displayName: user.displayName,
      uid: firebase.auth().currentUser.uid,
      aid: asset.id,
      rating: rating,
    });
    // console.log("after");

    ///////////FrontEnd Code////////////////
    setModalAddReview(false);
    setRating(0);
    setNewReview("");

    ///////////////////////////////////////
  };

  return (
    <View style={styles.container}>
      {/* <ScrollView> */}
      {/* {console.log('asset return',asset)} */}
      {/* {console.log('startD return',startDateTime)} */}
      {/* {console.log('endD return',endDateTime)} */}
      <KeyboardAvoidingView>
        {asset ? (
          <View>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 10,
                  backgroundColor: "#f5f5f5",
                  padding: 5,
                  // borderRadius: 5,
                }}
              >
                <View
                  style={{
                    width: "25%",
                    // backgroundColor: "red",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#20365F",
                      width: 70,
                      height: 70,
                      margin: 5,
                      alignItems: "center",
                      flexDirection: "row",
                      //elevation: 12,
                      borderWidth: 2,
                      borderColor: "#20365F",
                    }}
                    disabled
                  >
                    <View
                      style={{
                        height: "100%",
                        width: "100%",
                        justifyContent: "center",
                        textAlign: "center",
                        alignContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <MaterialCommunityIcons
                        name="car"
                        size={30}
                        color={"white"}
                      />
                      <Text
                        style={{
                          textAlign: "center",
                          color: "white",
                          fontSize: 18,
                        }}
                      >
                        {asset.code}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={{ width: "75%", justifyContent: "center" }}>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    <Text style={{ fontWeight: "bold" }}>Price: </Text>
                    <Text>{asset.price} QR</Text>
                  </View>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    <Text style={{ fontWeight: "bold" }}>Description: </Text>
                    <Text>{asset.description}</Text>
                  </View>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    <Text style={{ fontWeight: "bold" }}>Average Rating: </Text>
                    <Text>{asset.rating}</Text>
                  </View>
                </View>
              </View>
              {/* <Text> {asset.description}</Text> */}
              {/* <Text> Price Per Hour {asset.price}</Text> */}

              {/* {startDateTime === "0000-00-00" ? null : (
              <>
                <Text>{startDateTime}</Text>
                <Text>{endDateTime}</Text>
              </>
            )} */}

              <View style={{ marginTop: 15, marginBottom: 10 }}>
                <Text style={{ color: "gray" }}>Latest Review</Text>

                {reviews.length > 0 ? (
                  reviews.map(
                    (r, i) =>
                      i === reviews.length - 1 && (
                        <View
                          style={{
                            marginTop: 5,
                            // marginBottom: 10,
                            flexDirection: "row",
                            // backgroundColor: "#f5f5f5",
                          }}
                        >
                          <View style={{ width: "15%", textAlign: "center" }}>
                            <EvilIcons name="user" size={60} color={"gray"} />
                          </View>
                          <View
                            style={{
                              width: "75%",
                              alignItems: "flex-start",
                              marginTop: 5,
                            }}
                          >
                            <Rating
                              type="star"
                              ratingCount={5}
                              startingValue={r.rating}
                              imageSize={15}
                              readonly
                              onFinishRating={setRating}
                            />
                            <Text style={{ color: "gray" }}>
                              {r.displayName}
                            </Text>
                            <Text style={{}}>
                              {r.comment}
                              {/* ashgdjasgdjhasgdhgsahgdjhsagjdjsadajgjahgdjhagsdasgdjasgdjashgdjasgdjagsjdajhsgdjahgdjhagjhgdajgdjagjdg */}
                            </Text>
                          </View>
                          <View
                            style={{
                              width: "10%",
                              justifyContent: "flex-end",
                              // alignItems: "center",
                              // padding: 5,
                              // marginTop: 10,
                            }}
                          >
                            {/* <TouchableOpacity
                              style={{
                                // width: "70%",
                                backgroundColor: "#20365F",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: 5,
                                marginBottom: 5,
                              }}
                              onPress={() => setModalAddReview(true)}
                            >
                              
                              <MaterialCommunityIcons
                                name="plus"
                                size={22}
                                color={"white"}
                              />
                            </TouchableOpacity> */}
                            <TouchableOpacity
                              style={{
                                // width: "70%",
                                backgroundColor: "#20365F",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: 5,
                              }}
                              onPress={() => setModalViewReview(true)}
                            >
                              {/* <Text style={{ fontSize: 12, color: "gray" }}>
                              >
                            </Text> */}
                              <MaterialCommunityIcons
                                name="format-list-bulleted"
                                size={22}
                                color={"white"}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )
                  )
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ width: "90%" }}>
                      <Text>No reviews available for this item</Text>
                    </View>
                    <View
                      style={{
                        // alignItems: "flex-end",
                        // marginTop: 8,
                        width: "10%",
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          // width: "10%",
                          backgroundColor: "#20365F",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: 5,
                          marginBottom: 5,
                        }}
                        onPress={() => setModalAddReview(true)}
                      >
                        {/* <Text style={{ fontSize: 12, color: "gray" }}>
                              +
                            </Text> */}
                        <MaterialCommunityIcons
                          name="plus"
                          size={22}
                          color={"white"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>

            <Modal
              animationType="fade"
              transparent={true}
              visible={modalAddReview}
              // key={news.id}
              onRequestClose={() => {
                setModalAddReview(false);
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  margin: "5%",
                  marginTop: "15%",
                  height: "80%",
                  padding: "3%",
                  borderRadius: 20,
                  borderColor: "#e3e3e3",
                  borderWidth: 2,
                }}
              >
                <View
                  style={{
                    alignItems: "flex-end",
                    // paddingRight: 5,
                    height: "10%",
                  }}
                >
                  {/* <Text>X</Text> */}
                  <MaterialCommunityIcons
                    name="close"
                    size={22}
                    color={"#20365F"}
                    onPress={() => setModalAddReview(false)}
                  />
                </View>
                <View style={{ height: "70%", justifyContent: "space-evenly" }}>
                  <View style={{ marginTop: 10 }}>
                    <Textarea
                      containerStyle={styles.textareaContainer}
                      style={styles.textarea}
                      maxLength={100}
                      onChangeText={setNewReview}
                      defaultValue={newReview}
                      placeholder={"Write Your Review Here"}
                      placeholderTextColor={"#c7c7c7"}
                      underlineColorAndroid={"transparent"}
                    />
                  </View>
                  <View style={{ marginTop: 10, justifyContent: "center" }}>
                    <Rating
                      type="star"
                      ratingCount={5}
                      imageSize={30}
                      startingValue={rating}
                      onFinishRating={setRating}
                    />
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: 12,
                        color: "gray",
                      }}
                    >
                      Slide to add rating
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    height: "20%",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  {/* <Button title={"Add Review"} onPress={handleAddReview} /> */}
                  <TouchableOpacity
                    onPress={handleAddReview}
                    style={{
                      width: "30%",
                      backgroundColor: "#20365F",
                      padding: 5,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 20,
                    }}
                  >
                    {/* <Text style={{ color: "white" }}>Add Review</Text> */}
                    <MaterialCommunityIcons
                      name="plus"
                      size={22}
                      color={"white"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalViewReview}
              // key={news.id}
              onRequestClose={() => {
                setModalViewReview(false);
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  margin: "5%",
                  marginTop: "15%",
                  height: "80%",
                  padding: "3%",
                  borderRadius: 20,
                  borderColor: "#e3e3e3",
                  borderWidth: 2,
                }}
              >
                <View style={{ alignItems: "flex-end", height: "10%" }}>
                  {/* <Text>X</Text> */}
                  <MaterialCommunityIcons
                    name="close"
                    size={22}
                    color={"#20365F"}
                    onPress={() => setModalViewReview(false)}
                  />
                </View>
                <ScrollView>
                  {/* {console.log(reviews, "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrr")} */}
                  {reviews.map((r, i) => (
                    <View
                      style={{
                        marginTop: 5,
                        marginBottom: 10,
                        flexDirection: "row",
                        borderBottomWidth: 1,
                        paddingBottom: 10,
                        borderBottomColor: "lightgray",
                      }}
                    >
                      <View style={{ width: "20%", textAlign: "center" }}>
                        <EvilIcons name="user" size={60} color={"gray"} />
                      </View>
                      <View
                        style={{
                          width: "80%",
                          alignItems: "flex-start",
                          marginTop: 5,
                        }}
                      >
                        <Rating
                          type="star"
                          ratingCount={5}
                          startingValue={r.rating}
                          imageSize={15}
                          readonly
                          onFinishRating={setRating}
                          // style={{ backgroundColor: "transparent" }}
                        />
                        <Text style={{ color: "gray" }}>{r.displayName}</Text>
                        <Text style={{}}>{r.comment}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </Modal>
          </View>
        ) : (
          <Text>Loading</Text>
        )}
      </KeyboardAvoidingView>
      {/* </ScrollView> */}
    </View>
  );
}

Details.navigationOptions = (props) => ({
  title: "Details",
  headerStyle: { backgroundColor: "white" },
  headerTintColor: "black",
  headerTintStyle: { fontWeight: "bold" },
});

const styles = StyleSheet.create({
  textareaContainer: {
    height: 180,
    padding: 5,
    backgroundColor: "#e3e3e3",
  },
  textarea: {
    textAlignVertical: "top", // hack android
    height: 170,
    fontSize: 14,
    color: "#333",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50,
  },
  TypesFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: "rgba(96,100,109, 0.8)",
  },
  codeHighlightContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 24,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center",
  },
  tabBarInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: "center",
    backgroundColor: "#fbfbfb",
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    textAlign: "center",
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});