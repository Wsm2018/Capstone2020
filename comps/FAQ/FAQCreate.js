import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Dimensions,
} from "react-native";
import db from "../../db";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";

export default function FAQCreate(props) {
  const [FAQ, setFAQ] = useState(null);
  const [question, setQuestion] = useState(null);

  const Submit = async () => {
    const add = firebase.functions().httpsCallable("FAQ");
    const response = await add({ question, user: props.user, query: "create" });
    props.toggle();
  };

  return (
    <View style={styles.container}>
      <View style={{ borderWidth: 1, width: "100%" }}>
        <Text>Ask a Question?</Text>
        <TextInput placeholder="Question?" onChangeText={setQuestion} />
        <Button title="Submit" onPress={() => Submit()} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: Math.round(Dimensions.get("window").width) * 0.7,
    height: Math.round(Dimensions.get("window").height) * 0.5,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
