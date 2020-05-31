import React, { useState } from "react";
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
} from "react-native";

import { Card } from "react-native-shadow-cards";
import { FontAwesome, Fontisto, AntDesign, Ionicons } from "@expo/vector-icons";
import * as SMS from "expo-sms";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default function ReferralScreen(props) {
  const user = props.user;
  const [phoneModal, setPhoneModal] = useState(false);
  const [phone, setPhone] = useState("");

  const handleSendSMS = async () => {
    if (phone === "") {
      alert("Enter Phone Number");
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

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Card
          elevation={2}
          style={{
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
            <Card
              // elevation={2}
              style={{
                width: "50%",
                // flex: 1,
                // backgroundColor: "#6b9c74",
                // backgroundColor: "rgb(26,148,149)",
                backgroundColor: "#e3e1e1",

                // height: "50%",
                flex: 0.5,
                borderWidth: 1,
                // borderTopWidth: 0,
                borderColor: "darkgray",
              }}
            >
              <View
                style={{
                  // backgroundColor: "red",
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    // backgroundColor: "red",
                    flex: 1,
                    // flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      // textAlign: "right",
                      // marginStart: 10,
                      // flex: 4,
                      fontSize: 32,
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
                    <Text
                      style={{
                        // marginStart: 10,
                        textAlign: "center",
                        fontSize: 18,
                        // fontWeight: "bold",
                        // borderBottomWidth: 1,
                        color: "black",
                      }}
                    >
                      My Referral Code
                    </Text>
                    <View style={{ justifyContent: "center" }}>
                      <TouchableOpacity onPress={() => setPhoneModal(true)}>
                        <Fontisto name="share" size={23} color="black" />
                      </TouchableOpacity>
                    </View>
                  </View>
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
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "black",

                    // color: "#20365F",
                  }}
                >
                  Tokens: {user.tokens}
                </Text>
              </View>

              {/* <View
                style={{
                  justifyContent: "flex-start",
                  // backgroundColor: "red",
                  flex: 0.5,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "black",
                  }}
                >
                  Discount: 0
                </Text>
              </View> */}
            </View>
          </View>
        </Card>
      </View>
      <Modal visible={phoneModal} transparent={true}>
        <View style={styles.centeredView2}>
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
              <AntDesign name="close" size={25} style={{ color: "#224229" }} />
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={() => setPhoneModal(false)}>
              <Text>X</Text>
            </TouchableOpacity> */}

            <View
              width={Dimensions.get("window").width / 2}
              style={{
                // backgroundColor: "green",
                alignItems: "center",

                // flexDirection: "row",
                // paddingLeft: 6,
                // width: "60%",
                borderColor: "black",
                borderWidth: 1,
                borderRadius: 10,
                // marginBottom: 10,
              }}
            >
              <TextInput
                placeholder=" 1234 5678"
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={8}
              />
            </View>
            <View
              style={{
                flex: 4,
                // backgroundColor: "red",
                justifyContent: "space-evenly",
                alignItems: "center",
                flexDirection: "row-reverse",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#20365F",
                  // borderWidth: 4,
                  height: 40,
                  width: "30%",
                  // alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  //marginStart: "2%",
                  //marginEnd: "2%",
                  borderRadius: 15,
                  //marginBottom: 10,
                }}
                onPress={() => handleSendSMS()}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    color: "white",
                    // fontWeight: "bold",
                  }}
                >
                  Send
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalView2: {
    // flex: 1,
    // margin: 20,
    height: height / 2.5,
    width: width / 1.5,
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
  centeredView2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
});
