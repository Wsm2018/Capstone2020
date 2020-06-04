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
  Modal,
} from "react-native";
import firebase from "firebase/app";
import "firebase/functions";
import "firebase/auth";
import db from "../../db";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import { AsyncStorage } from "react-native";
import { CheckBox } from "react-native-elements";
export default function ReferralScreen(props) {
  const [user, setUser] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [points, setPoints] = useState(0);
  const [balance, setBalance] = useState(0);

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
    <View>
      <Text>Points exchange Screen</Text>
      <Text>Available Balance : {user.balance} QAR</Text>
      <Text>Available Points: {user.points} </Text>
      <Button
        title="50 for 10 QAR"
        disabled={user.points >= 50 ? false : true}
        onPress={() => handleSet(50, 10)}
      />
      <Button
        title="100 for 25 QAR"
        disabled={user.points >= 100 ? false : true}
        onPress={() => handleSet(100, 25)}
      />
      <Button
        title="250 for 70 QAR"
        disabled={user.points >= 250 ? false : true}
        onPress={() => handleSet(250, 70)}
      />
      <Button
        title="500 for 150 QAR"
        disabled={user.points >= 500 ? false : true}
        onPress={() => handleSet(500, 150)}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={{ marginTop: 22 }}>
          <View
            style={{
              marginTop: 22,
              backgroundColor: "#919191",
              margin: "5%",
              padding: "5%",
              // paddingTop: "1%",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 5,
              ...Platform.select({
                ios: {
                  paddingTop: 50,
                  margin: "15%",
                  minHeight: 300,
                  width: "70%",
                },
                android: {
                  minHeight: 200,
                },
              }),
            }}
          >
            <Text>
              Exchange {points} points for {balance} QAR
            </Text>
            <Button title="Exchange" onPress={() => handleExchange()} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
