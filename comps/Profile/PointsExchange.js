//@refresh reset
import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Image,
  Platform,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Picker,
  Dimensions,
  Modal,
  SafeAreaView,
  TouchableWithoutFeedback,
} from "react-native";
import firebase from "firebase/app";
import "firebase/functions";
import "firebase/auth";
import db from "../../db";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import { AsyncStorage } from "react-native";
import { CheckBox } from "react-native-elements";
import { AntDesign, FontAwesome } from "react-native-vector-icons";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
  responsiveHeight,
  responsiveFontSize,
  useResponsiveFontSize,
} from "react-native-responsive-dimensions";
import * as Device from "expo-device";

const { height, width } = Dimensions.get("screen");
export default function ReferralScreen(props) {
  const [user, setUser] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [points, setPoints] = useState(0);
  const [balance, setBalance] = useState(0);
  const [deviceType, setDeviceType] = useState(0);

  useEffect(() => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((querySnap) => {
        let data = querySnap.data();
        data.id = firebase.auth().currentUser.uid;
        setUser(data);
      });
  }, []);

  const handleExchange = async () => {
    let u = user;
    u.points = u.points - points;
    u.balance = u.balance + balance;
    const handlePointsExchange = firebase
      .functions()
      .httpsCallable("handlePointsExchange");
    const response = await handlePointsExchange({
      user: u,
    });
    // db.collection("users").doc(u.id).update(u);
    setModalVisible(false);
  };

  const handleSet = async (points, balance) => {
    setPoints(points);
    setBalance(balance);
    setModalVisible(true);
  };

  return (
    <Modal visible={props.pointsModal} transparent={true}>
      {/* visible={props.pointsModal} */}
      <SafeAreaView style={styles.centeredView}>
        <View elevation={5} style={styles.modalView}>
          {/* <TouchableOpacity onPress={() => props.setPointsModal(false)}>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={{
              justifyContent: "center",
              alignItems: "flex-end",
              marginEnd: 15,
              marginTop: 15,
            }}
            onPress={() => props.setPointsModal(false)}
          >
            <AntDesign
              name="close"
              size={responsiveFontSize(2.5)}
              style={{ color: "#224229" }}
            />
          </TouchableOpacity>
          <View
            style={{
              // flex: 0.5,
              flex: 0.2,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(2),
                color: "#185a9d",
                fontWeight: "bold",
              }}
            >
              Points Exchange
            </Text>
          </View>
          <Text></Text>
          <Text></Text>
          <View style={{ justifyContent: "center", alignSelf: "center" }}>
            <Text style={{ fontSize: responsiveFontSize(2) }}>
              Available Balance : {user.balance} QAR
            </Text>
            <Text></Text>
            <Text style={{ fontSize: responsiveFontSize(2) }}>
              Available Points: {user.points}{" "}
            </Text>
          </View>
          <View style={{ marginTop: responsiveScreenHeight(4) }}></View>
          {/* <TouchableWithoutFeedback> */}
          <View
            style={{
              flexDirection: "row",
              // alignSelf: "center",
              justifyContent: "space-evenly",
            }}
          >
            <View style={{}}>
              <TouchableOpacity
                disabled={user.points >= 100 ? false : true}
                style={
                  user.points >= 100
                    ? {
                        backgroundColor: "#185a9d",
                        height: responsiveScreenHeight(5),
                        width: responsiveScreenWidth(35),
                        alignSelf: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 5,
                        marginTop: "10%",
                      }
                    : {
                        backgroundColor: "#b0b0b0",
                        height: responsiveScreenHeight(5),
                        width: responsiveScreenWidth(35),
                        alignSelf: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 5,
                        marginTop: "10%",
                      }
                }
                onPress={() => handleSet(50, 10)}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: responsiveScreenFontSize(2),
                    color: "white",
                  }}
                >
                  50pt for 10 QAR
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={user.points >= 100 ? false : true}
                style={
                  user.points >= 100
                    ? {
                        backgroundColor: "#185a9d",
                        height: responsiveScreenHeight(5),
                        width: responsiveScreenWidth(35),
                        alignSelf: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 5,
                        marginTop: "10%",
                      }
                    : {
                        backgroundColor: "#b0b0b0",
                        height: responsiveScreenHeight(5),
                        width: responsiveScreenWidth(35),
                        alignSelf: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 5,
                        marginTop: "10%",
                      }
                }
                onPress={() => handleSet(100, 25)}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: responsiveScreenFontSize(2),
                    color: "white",
                  }}
                >
                  100pt for 25 QAR
                </Text>
              </TouchableOpacity>
            </View>

            {/* </TouchableWithoutFeedback> */}
            {/* 
          <Button
            title="50 for 10 QAR"
            disabled={user.points >= 50 ? false : true}
            onPress={() => handleSet(50, 10)}
          /> */}
            {/* <Button
            title="100 for 25 QAR"
            disabled={user.points >= 100 ? false : true}
            onPress={() => handleSet(100, 25)}
          /> */}
            <View style={{ justifyContent: "center" }}>
              <TouchableOpacity
                disabled={user.points >= 250 ? false : true}
                style={
                  user.points >= 100
                    ? {
                        backgroundColor: "#185a9d",
                        height: responsiveScreenHeight(5),
                        width: responsiveScreenWidth(35),
                        alignSelf: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 5,
                        marginTop: "10%",
                      }
                    : {
                        backgroundColor: "#b0b0b0",
                        height: responsiveScreenHeight(5),
                        width: responsiveScreenWidth(35),
                        alignSelf: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 5,
                        marginTop: "10%",
                      }
                }
                onPress={() => handleSet(250, 70)}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: responsiveScreenFontSize(2),
                    color: "white",
                  }}
                >
                  250pt for 70 QAR
                </Text>
              </TouchableOpacity>

              {/* <Button
            title="250 for 70 QAR"
            disabled={user.points >= 250 ? false : true}
            onPress={() => handleSet(250, 70)}
          /> */}

              <TouchableOpacity
                disabled={user.points >= 500 ? false : true}
                style={
                  user.points >= 100
                    ? {
                        backgroundColor: "#185a9d",
                        height: responsiveScreenHeight(5),
                        width: responsiveScreenWidth(36),
                        alignSelf: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 5,
                        marginTop: "10%",
                      }
                    : {
                        backgroundColor: "#b0b0b0",
                        height: responsiveScreenHeight(5),
                        width: responsiveScreenWidth(35),
                        alignSelf: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 5,
                        marginTop: "10%",
                      }
                }
                onPress={() => handleSet(500, 150)}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: responsiveScreenFontSize(2),
                    color: "white",
                  }}
                >
                  500pt for 150 QAR
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* 
          <Button
            title="500 for 150 QAR"
            disabled={user.points >= 500 ? false : true}
            onPress={() => handleSet(500, 150)}
          /> */}

          <Modal
            transparent={true}
            visible={modalVisible}
            // visible={true}
            animationType="slide"
            //visible={true}
            onRequestClose={() => {
              setModalVisible(false);
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignContent: "center",
                alignSelf: "center",
                alignItems: "center",
                marginTop: 22,
                // ---This is for Width---
                width: "80%",
              }}
            >
              <View
                style={{
                  margin: 20,
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 35,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                  justifyContent: "center",
                  alignContent: "center",
                  alignSelf: "center",
                  alignItems: "center",
                  // ---This is for Height---
                  height: "50%",
                }}
              >
                <Text
                  style={{
                    fontSize: responsiveFontSize(1.8),
                    textAlign: "center",
                  }}
                >
                  Exchange {points} points for {balance} QAR
                </Text>
                <View style={{ marginTop: responsiveScreenHeight(8) }}></View>
                <View
                  style={{
                    width: "100%",
                    height: "5%",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                    alignSelf: "center",
                    flexDirection: "row",
                  }}
                >
                  <TouchableOpacity
                    style={styles.greenButton}
                    onPress={() => handleExchange()}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: responsiveScreenFontSize(2),
                        color: "white",
                      }}
                    >
                      Exchange
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.redButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: responsiveScreenFontSize(2),
                        color: "white",
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* <Button title="Exchange" onPress={() => handleExchange()} /> */}
                {/* <Button title="Cancel" onPress={() => setModalVisible(false)} /> */}
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalView: {
    // flexDirection:
    // flex: 1,
    // margin: 20,
    height: height / 1.5,
    width: width / 1.2,
    backgroundColor: "#fff",
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },

    borderRadius: 20,
    // padding: 35,
    // justifyContent: "center",
    // alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  greenButton: {
    backgroundColor: "#3ea3a3",
    height: responsiveScreenHeight(4.5),
    width: "38%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 5,
    marginBottom: 10,

    //flexDirection: "row",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  redButton: {
    backgroundColor: "#901616",
    height: responsiveScreenHeight(4.5),
    width: "38%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 5,
    marginBottom: 10,
  },
});
