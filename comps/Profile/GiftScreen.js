import React, { useState, useEffect } from "react";
import { View, Picker } from "react-native";
import { Input, Button } from "react-native-elements";

export default function GiftScreen(props) {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    if (amount === "other") {
      setFlag(true);
    }
  }, [amount]);

  return (
    <View>
      <Input
        placeholder="receiver@email.com"
        label="Email"
        onChangeText={setEmail}
      />
      {!flag ? (
        <Picker
          selectedValue={amount}
          onValueChange={(item) => setAmount(item)}
        >
          <Picker.Item value="" label="Select Amount" />
          <Picker.Item value="100" label="100" />
          <Picker.Item value="50" label="50" />
          <Picker.Item value="10" label="10" />
          <Picker.Item value="other" label="Other Amount" />
        </Picker>
      ) : (
        <Input placeholder="Enter Amount" />
      )}

      <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
        <Button title="Cancel" />
        <Button title="Send" />
      </View>
    </View>
  );
}
