import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "react-native-shadow-cards";
import {
  FontAwesome,
  Fontisto,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";

export default function ReferralScreen(props) {
  const user = props.user;
  console.log("user from referrel ", user);
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
                // backgroundColor: "#6b9c74",
                // backgroundColor: "rgb(26,148,149)",
                backgroundColor: "#e3e1e1",

                // height: "50%",
                flex: 0.4,
                borderWidth: 1,
                // borderTopWidth: 0,
                borderColor: "darkgray",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
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
                  <Text
                    style={{
                      // marginStart: 10,
                      textAlign: "center",
                      fontSize: 20,
                      // fontWeight: "bold",
                      // borderBottomWidth: 1,
                      color: "black",
                    }}
                  >
                    My Referral Code
                  </Text>
                </View>

                {/* <Fontisto name="share" size={23} color="black" /> */}
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
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
