import React, { useState } from "react";
import { TextInput, Button, View, Text } from "react-native";
import firebase from "firebase";
import "firebase/functions";

export default function MakeAdmin(props) {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    if (email !== "") {
      const makeAdmin = firebase.functions().httpsCallable("makeAdmin");
      const response = await makeAdmin({ email: email });
      console.log(response);
    }
  };
  return (
    <View>
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <Button title="submit" onPress={handleSubmit} />
    </View>
  );
}
