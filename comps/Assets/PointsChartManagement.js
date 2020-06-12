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

export default function PointsChartManagement(props) {
  const [pointsChart, setPointsChart] = useState([]);
  const [selectedPointsChart, setSelectedPointsChart] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [spentValue, setSpentValue] = useState(0);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    db.collection("pointsChart").onSnapshot((querySnapshot) => {
      const pointsChart = [];
      querySnapshot.forEach((doc) => {
        pointsChart.push({ id: doc.id, ...doc.data() });
      });
      setPointsChart([...pointsChart]);
    });
  }, []);

  const handleUpdate = () => {
    let p = selectedPointsChart;
    p.spentValue = spentValue;
    p.points = points;

    db.collection("pointsChart").doc(selectedPointsChart.id).update(p);

    setModalVisible(false);
  };

  const handleSelected = (p) => {
    setSelectedPointsChart(p);
    setSpentValue(p.spentValue);
    setPoints(p.points);
    setModalVisible(true);
  };

  return (
    <View>
      <Text>pointsChart Management</Text>

      {pointsChart &&
        pointsChart.map((p) => (
          <View>
            <Text>Subscription Type: {p.subscriptionType}</Text>
            <Text>Spent Value: {p.spentValue}</Text>
            <Text>points to earn: {p.points}</Text>
            <Button title="update" onPress={() => handleSelected(p)} />
          </View>
        ))}
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
              subscription Type: {selectedPointsChart.subscriptionType}
            </Text>
            <TextInput
              keyboardType="numeric"
              onChangeText={(text) => setSpentValue(text)}
              placeholder="spentValue"
              value={spentValue}
            />
            <TextInput
              keyboardType="numeric"
              onChangeText={(text) => setPoints(text)}
              placeholder="points"
              value={points}
            />
            <Button title="Update" onPress={() => handleUpdate()} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
