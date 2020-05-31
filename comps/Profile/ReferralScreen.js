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
          <Text>My Referral Code</Text>
          <Text>{user.referralCode}</Text>
          <Text>Token</Text>
          <Text>{user.tokens}</Text>
          <Text>Discounts</Text>
          <Text>0 (hard coded) </Text>
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
