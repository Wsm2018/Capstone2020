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
import { Input, Tooltip } from "react-native-elements";
import { Feather } from "@expo/vector-icons";
import "firebase/functions";
import "firebase/auth";
import db from "../../db";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import { AsyncStorage } from "react-native";
import { CheckBox } from "react-native-elements";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
  responsiveFontSize,
  responsiveWidth,
  useResponsiveFontSize,
} from "react-native-responsive-dimensions";
export default function PointsChartManagement(props) {
  const [pointsChart, setPointsChart] = useState([]);
  const [selectedPointsChart, setSelectedPointsChart] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [spentValue, setSpentValue] = useState(0);
  const [points, setPoints] = useState(0);
  const [deviceType, setDeviceType] = useState(0);
  useEffect(() => {
    db.collection("pointsChart").onSnapshot((querySnapshot) => {
      const pointsChart = [];
      querySnapshot.forEach((doc) => {
        pointsChart.push({ id: doc.id, ...doc.data() });
      });
      setPointsChart([...pointsChart]);
    });
  }, []);
  const getDeviceType = async () => {
    const type = await Device.getDeviceTypeAsync();
    setDeviceType(type);
  };
  useEffect(() => {
    getDeviceType();
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
    <ScrollView contentContainerStyle={{ backgroundColor: "#e3e3e3" }}>
      <View style={styles.container}>
        <Text
          style={{
            fontSize: responsiveFontSize(2),
            color: "#185a9d",
            justifyContent: "center",
            alignSelf: "center",
            marginTop: "5%",
            fontWeight: "bold",
          }}
        >
          Points Chart Management
        </Text>
        <Text></Text>
        {pointsChart &&
          pointsChart.map((p) => (
            <View>
              <View style={styles.one}>
                <Text></Text>
                <View style={styles.text}>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(1.8),
                      color: "black",
                      marginTop: "1%",
                    }}
                  >
                    Subscription Type
                  </Text>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(1.8),
                      marginTop: "1%",
                    }}
                  >
                    {p.subscriptionType}
                  </Text>
                </View>
                <View style={styles.text}>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(1.8),
                      color: "black",
                      marginTop: "1%",
                    }}
                  >
                    Spent Value
                  </Text>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(1.8),
                      marginTop: "1%",
                    }}
                  >
                    {p.spentValue}
                  </Text>
                </View>

                <View style={styles.text}>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(1.8),
                      color: "black",
                      marginTop: "1%",
                    }}
                  >
                    Points To Earn
                  </Text>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(1.8),
                      marginTop: "1%",
                    }}
                  >
                    {p.points}
                  </Text>
                </View>
                <View style={{ marginTop: "3%" }}></View>
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => handleSelected(p)}
                >
                  <Feather
                    name="edit"
                    size={responsiveScreenWidth(4)}
                    color="white"
                  />
                </TouchableOpacity>

                {/* <Button title="update" onPress={() => handleSelected(p)} /> */}
                {/* <Text style={styles.two}></Text> */}
              </View>
              <Text></Text>
            </View>
          ))}

        <Modal
          animationType="SLIDE"
          transparent={true}
          visible={modalVisible}
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
                Subscription Type: {selectedPointsChart.subscriptionType}
              </Text>
              <Text>{"\n"}</Text>

              {/* <Input
                keyboardType="numeric"
                onChangeText={(text) => setPoints(text)}
                placeholder="points"
                value={points}
                inputContainerStyle={{
                  borderBottomWidth: 0,
                }}
                containerStyle={styles.Inputs}
                //  placeholderTextColor="#185a9d"
                inputStyle={{
                  //   color: "#185a9d",
                  fontSize: 16,
                }}
              /> */}
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{ width: "20%", fontSize: responsiveFontSize(1.7) }}
                >
                  Spent Value
                </Text>
                <View
                  style={{
                    borderRadius: 8,
                    borderWidth: 1,
                    //  borderColor: "#185a9d",
                    height: "80%",
                    width: "25%",
                    alignSelf: "center",
                    // opacity: 0.8,
                    paddingLeft: "3%",
                    // marginTop: 20,
                    // flexDirection: "row-reverse",
                    // justifyContent: "space-between",
                    backgroundColor: "white",
                  }}
                >
                  <TextInput
                    keyboardType="numeric"
                    onChangeText={(text) => setSpentValue(text)}
                    placeholder="spentValue"
                    value={spentValue}
                    style={{ fontSize: responsiveFontSize(1.7) }}
                    // style={{ width: "100%" }}
                  />
                </View>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{
                    alignSelf: "center",
                    width: "20%",
                    fontSize: responsiveFontSize(1.7),
                  }}
                >
                  Points
                </Text>
                <View
                  style={{
                    borderRadius: 8,
                    borderWidth: 1,
                    //  borderColor: "#185a9d",
                    height: "110%",
                    width: "25%",
                    alignSelf: "center",
                    // opacity: 0.8,
                    paddingLeft: "3%",
                    marginTop: 10,
                    // flexDirection: "row-reverse",
                    // justifyContent: "space-between",
                    backgroundColor: "white",
                  }}
                >
                  <TextInput
                    keyboardType="numeric"
                    onChangeText={(text) => setPoints(text)}
                    placeholder="points"
                    value={points}
                    style={{ fontSize: responsiveFontSize(1.7) }}
                  />
                </View>
              </View>
              <Text></Text>
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
                    onPress={() => handleUpdate()}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: responsiveFontSize(1.8),
                        fontWeight: "500",
                      }}
                    >
                      Update
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.redButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: responsiveFontSize(1.8),
                        fontWeight: "500",
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* <Modal
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
        </Modal> */}
      </View>
    </ScrollView>
  );
}
PointsChartManagement.navigationOptions = (props) => ({
  title: "Points Chart Management",
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
});
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e3e3e3",
    flex: 1,
  },
  header: {
    flex: 0.7,
    // alignItems: "center",
    backgroundColor: "#e3e3e3",
  },
  pi: {
    flex: 0.3,
    justifyContent: "flex-start",
    alignItems: "center",
    // backgroundColor: "#e3e3e3",
    // backgroundColor: "red",
  },

  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",
    //width: Math.round(Dimensions.get("window").width),
    // height: Math.round(Dimensions.get("window").height),
  },
  text: {
    fontSize: 80,
    marginLeft: "4%",
    marginRight: "5%",
    marginBottom: "1%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  text2: {
    fontSize: 80,
    marginLeft: "4%",
    marginBottom: "1%",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  one: {
    backgroundColor: "white",
    width: "100%",
    //marginTop: "3%",
    //padding: "2%",

    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
  },
  Inputs: {
    borderRadius: 5,
    borderWidth: 1,
    // borderColor: "#185a9d",
    height: 50,
    width: "43%",
    alignSelf: "center",
    opacity: 0.8,
    paddingLeft: 12,
    marginTop: 20,
    marginLeft: "1%",
    backgroundColor: "white",
    // justifyContent:"center"
  },
  two: {
    backgroundColor: "#e3e3e3",
    width: "100%",
    // marginTop: "3%",
    // padding: "2%",

    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
  },
  two: {
    backgroundColor: "white",
    width: "100%",
    marginTop: "3%",
    padding: "2%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
    // flexDirection: "row",
    //flexWrap: "wrap",

    // justifyContent: "space-between",
  },

  payButton: {
    backgroundColor: "#3ea3a3",
    height: responsiveScreenHeight(4.5),
    width: "10%",
    alignSelf: "flex-end",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 5,
    marginBottom: 15,

    //flexDirection: "row",
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
