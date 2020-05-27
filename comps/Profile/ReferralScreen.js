import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "react-native-shadow-cards";

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
              // backgroundColor: "red",
              alignItems: "center",
              justifyContent: "space-evenly",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 16,
                fontWeight: "bold",
                color: "#20365F",
              }}
            >
              My Referral Code: {user.referralCode}
            </Text>
            {/* <Text>{user.referralCode}</Text> */}
            <Text
              style={{
                textAlign: "center",
                fontSize: 16,
                fontWeight: "bold",
                color: "#20365F",
              }}
            >
              Tokens: {user.tokens}
            </Text>
            {/* <Text>{user.tokens}</Text> */}
            <Text
              style={{
                textAlign: "center",
                fontSize: 16,
                fontWeight: "bold",
                color: "#20365F",
              }}
            >
              Discounts: 0 (hard coded)
            </Text>
            {/* <Text>0 (hard coded) </Text> */}
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
