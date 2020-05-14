import React, { useState, useEffect } from "react";
import { View, Picker, Text, TouchableOpacity } from "react-native";
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

  const handleCancel = () => {
    setAmount("");
    setEmail("");
    setFlag(false);
  };

  const handleSend = async () => {
    //const response = await fetch(`https://us-central1-capstone2020-b64fd.cloudfunctions.net/sendMail?dest=${email}?sub=Gift$body${}`)
    // const message = `You got a gift code worth ${amount}QR from ${firebase.auth().currentUser.email}. \n Your code is`
  };

  return (
    <View>
      <Input
        placeholder="receiver@email.com"
        label="Email"
        value={email}
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
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <Input placeholder="Enter Amount" onChangeText={setAmount} />
          <TouchableOpacity onPress={() => setFlag(false)}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
        <Button title="Cancel" onPress={handleCancel} />
        <Button title="Send" onPress={handleSend} />
      </View>
    </View>
  );
}
