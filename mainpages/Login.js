import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";

import firebase from "firebase/app";
import "firebase/auth";

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    await firebase.auth().signInWithEmailAndPassword(email, password);
  };

  return (
    <View style={styles.container}>
      <View>
        <TextInput
          onChangeText={setEmail}
          placeholder="username@email.com"
          value={email}
        />
      </View>
      <View>
        <TextInput
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry={true}
          value={password}
        />
      </View>
      <TouchableOpacity onPress={() => handleLogin()}>
        <Text>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    paddingHorizontal: 20,
  },
});
