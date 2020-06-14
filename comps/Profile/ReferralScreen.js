import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Button,
  SafeAreaView,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import * as Device from "expo-device";

import LottieView from "lottie-react-native";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
} from "react-native-responsive-dimensions";

import { Tooltip } from "react-native-elements";

import { Card } from "react-native-shadow-cards";
import { FontAwesome, Fontisto, AntDesign, Ionicons } from "@expo/vector-icons";
import * as SMS from "expo-sms";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default function ReferralScreen(props) {
  const user = props.user;
  const [phoneModal, setPhoneModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [showPhoneErr, setShowPhoneErr] = useState(false);
  const [deviceType, setDeviceType] = useState(0);

  useEffect(() => {
    getDeviceType();
  }, []);

  const handleSendSMS = async () => {
    if (phone === "") {
      setPhoneErr("* Enter the phone number");
      setShowPhoneErr(true);
      return;
    }
    if (phone.length < 8) {
      setPhoneErr("* Invalid phone number");
      setShowPhoneErr(true);
      return;
    }
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const { result } = await SMS.sendSMSAsync(
        [`+974${phone}`],
        `Hey!\nUse my referral code ( ${user.referralCode} ) to download "QuickbooQ" application and enjoy the discount.\nCheers! \n${user.displayName}`
      );
      if (result === "sent") {
        Alert.alert(
          "",
          "Message Sent",
          [
            {
              text: "OK",
              onPress: () => {
                setPhoneModal(false);
                setPhone("");
              },
            },
          ],
          { cancelable: false }
        );
      }
      // Alert.alert("","Message sent")
      // setPhoneModal(false);
    }
  };

  const getDeviceType = async () => {
    const type = await Device.getDeviceTypeAsync();
    setDeviceType(type);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <View
            // elevation={2}
            style={{
              backgroundColor: "white",
              width: "100%",
              flex: 1,
              borderWidth: 1,
              borderTopWidth: 0,
              borderColor: "darkgray",
            }}
          >
            <View
              style={{
                flex: 4,
                marginTop: -10,
                // backgroundColor: "red",
                alignItems: "center",
                flexDirection: "column",
                justifyContent: "space-evenly",
              }}
            >
              <View
                style={{
                  flex: 0.2,

                  // marginTop: -5,
                  // backgroundColor: "blue",
                  alignItems: "center",
                  // flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: responsiveScreenFontSize(2),
                    fontWeight: "bold",
                    color: "black",

                    // color: "#20365F",
                  }}
                >
                  Tokens: {user.tokens}
                </Text>
              </View>
              <Card
                // elevation={2}
                style={{
                  width: "45%",
                  // flex: 1,
                  // backgroundColor: "#6b9c74",
                  // backgroundColor: "rgb(26,148,149)",
                  backgroundColor: "#e3e1e1",

                  // height: "50%",
                  flex: 0.51,
                  borderWidth: 1,
                  // borderTopWidth: 0,
                  borderColor: "darkgray",
                }}
              >
                <View
                  style={{
                    width: "100%",
                    // backgroundColor: "green",
                    flexDirection: "row",
                    height: "100%",
                    // justifyContent: "flex-end",
                  }}
                >
                  <View
                    style={{
                      width: "75%",
                      // backgroundColor: "blue",
                      // height: "100%",
                    }}
                  >
                    <View
                      style={{
                        // backgroundColor: "red",
                        // flex: 0.7,
                        // flexDirection: "row",
                        justifyContent: "center",
                        marginLeft: "10%",
                      }}
                    >
                      <View
                        style={{
                          // backgroundColor: "red",
                          // flex: 1,
                          // flexDirection: "row",
                          justifyContent: "space-evenly",
                          marginTop: "7%",
                          marginLeft: "20%",
                        }}
                      >
                        <Text
                          style={{
                            textAlign: "center",
                            // textAlign: "right",
                            // marginStart: 10,
                            // flex: 4,
                            fontSize: responsiveScreenFontSize(1.68),
                            // fontWeight: "bold",
                            color: "black",
                          }}
                        >
                          Referral Code
                        </Text>
                        <Text
                          style={{
                            textAlign: "center",
                            // textAlign: "right",
                            // marginStart: 10,
                            // flex: 4,
                            fontSize: responsiveScreenFontSize(3),
                            fontWeight: "bold",
                            color: "black",
                          }}
                        >
                          {user.referralCode}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-evenly",
                          }}
                        >
                          <View style={{ justifyContent: "center" }}>
                            <TouchableOpacity
                              onPress={() => setPhoneModal(true)}
                            >
                              {deviceType === 1 ? (
                                <Fontisto
                                  name="share"
                                  size={23}
                                  color="#216380"
                                />
                              ) : (
                                <Fontisto
                                  name="share"
                                  size={32}
                                  color="#216380"
                                />
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={{ width: "25%" }}>
                    <Tooltip
                      height={responsiveScreenHeight(20)}
                      width={responsiveScreenWidth(70)}
                      backgroundColor={"#2E9E9B"}
                      popover={
                        <Text
                          style={{
                            color: "white",
                            fontSize: responsiveScreenFontSize(2),
                          }}
                        >
                          You can receive tokens by referring the App to new
                          users! Just click on the ({" "}
                          <Fontisto name="share" size={16} color="white" /> )
                          icon to share your referral code using an SMS.
                        </Text>
                      }
                      containerStyle={{
                        justifyContent: "center",
                        alignSelf: "center",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          margin: 10,
                        }}
                      >
                        {deviceType === 1 ? (
                          <AntDesign
                            name="questioncircle"
                            size={20}
                            color="#901616"
                          />
                        ) : (
                          <AntDesign
                            name="questioncircle"
                            size={23}
                            color="#901616"
                          />
                        )}
                      </View>
                    </Tooltip>
                  </View>
                </View>
              </Card>
              <View
                style={{
                  flexDirection: "row",
                  // flex: 1,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    justifyContent: "flex-start",
                    // backgroundColor: "red",
                    flex: 0.5,
                  }}
                ></View>
              </View>
            </View>
          </View>
        </View>
        <Modal visible={phoneModal} transparent={true}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.centeredView2]}>
              <View elevation={5} style={styles.modalView2}>
                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "flex-end",
                    marginEnd: 15,
                    marginTop: 15,
                  }}
                  onPress={() => setPhoneModal(false)}
                >
                  <AntDesign
                    name="close"
                    size={25}
                    style={{ color: "#224229" }}
                  />
                </TouchableOpacity>
                {/* <TouchableOpacity onPress={() => setPhoneModal(false)}>
              <Text>X</Text>
            </TouchableOpacity> */}
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    // backgroundColor: "blue",
                    // marginTop: "-2%",
                  }}
                >
                  <LottieView
                    width={Dimensions.get("window").width / 3.5}
                    source={require("../../assets/images/2442-send.json")}
                    autoPlay
                    loop
                    style={{
                      position: "relative",
                      // width: "100%",
                    }}
                  />
                  <Text
                    style={{
                      // paddingTop: "10%",
                      paddingBottom: "5%",
                      fontSize: responsiveScreenFontSize(2),
                      // color: "darkred",
                      fontWeight: "bold",
                    }}
                  >
                    Enter a Phone Number:
                  </Text>
                  <View
                    width={Dimensions.get("window").width / 1.8}
                    style={{
                      height: responsiveScreenHeight(5),
                      width: responsiveScreenWidth(50),
                      // backgroundColor: "green",
                      // alignItems: "center",
                      justifyContent: "center",
                      // flexDirection: "row",
                      paddingLeft: 6,
                      // width: "60%",
                      borderColor: "gray",
                      borderWidth: 2,
                      borderRadius: 5,
                      // marginBottom: 10,
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          fontSize: responsiveScreenFontSize(2),
                          color: "gray",
                        }}
                      >
                        🇶🇦 +974{" "}
                      </Text>
                      <TextInput
                        placeholder="1234 5678"
                        onChangeText={(phn) => {
                          setPhone(phn);
                          setPhoneErr("");
                          setShowPhoneErr(false);
                        }}
                        keyboardType="phone-pad"
                        maxLength={8}
                        fontSize={responsiveScreenFontSize(2)}
                      />
                    </View>
                  </View>
                  {showPhoneErr ? (
                    <Text
                      style={
                        showPhoneErr
                          ? { color: "red" }
                          : { color: "transparent" }
                      }
                    >
                      {phoneErr}
                    </Text>
                  ) : null}
                </View>

                <View
                  style={{
                    flex: 0.4,
                    // backgroundColor: "red",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                    // flexDirection: "row-reverse",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      flex: 0.4,

                      backgroundColor: "#2E9E9B",
                      height: 40,
                      width: "40%",
                      // borderWidth: 4,
                      // alignSelf: "center",
                      justifyContent: "center",
                      alignItems: "center",
                      // marginStart: "3%",
                      //marginEnd: "2%",
                      borderRadius: 10,
                      //marginBottom: 10,
                    }}
                    onPress={() => handleSendSMS()}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: responsiveScreenFontSize(2),
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      Send
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalView2: {
    // flex: 1,
    // margin: 20,
    height: height / 2.2,
    width: width / 1.6,
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
    // backgroundColor: "red",
  },
  centeredView2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 22,
    // backgroundColor: "red",
  },
});
