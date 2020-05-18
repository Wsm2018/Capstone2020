import React, { useState, useEffect } from "react";
import { View, Picker, Text, TouchableOpacity, Platform } from "react-native";
import { Input, Button } from "react-native-elements";
import ReactNativePickerModule from "react-native-picker-module";
export default function GiftScreen(props) {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [flag, setFlag] = useState(false);
  const amounts = {
    labels: ["100", "50", "10", "Other Amount"],
    values: ["100", "50", "10", "other"],
  };
  let pickerRef = null;

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

  const handleFlag = () => {
    setAmount("");
    setFlag(false);
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
        Platform.OS !== "ios" ? (
          <Picker
            selectedValue={amount}
            onValueChange={(item) => setAmount(item)}
          >
            <Picker.Item value="" label="Select Amount" />
            {amounts.labels.map((item, index) => (
              <Picker.Item
                key={index}
                value={amounts.values[index]}
                label={item}
              />
            ))}
          </Picker>
        ) : (
          <View>
            <TouchableOpacity
              style={{
                paddingVertical: 24,
              }}
              onPress={() => {
                pickerRef.show();
              }}
            >
              <Text>Select Amount</Text>
            </TouchableOpacity>
            {/* <Text>{amount !== "" ? amount : null}</Text> */}
            <ReactNativePickerModule
              pickerRef={(e) => (pickerRef = e)}
              title={"Amount"}
              items={amounts.labels}
              onDismiss={() => {
                console.log("onDismiss");
              }}
              onCancel={() => {
                console.log("Cancelled");
              }}
              onValueChange={(valueText, index) => {
                setAmount(amounts.values[index]);
              }}
            />
          </View>
        )
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <Input placeholder="Enter Amount" onChangeText={setAmount} />
          <TouchableOpacity onPress={handleFlag}>
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
