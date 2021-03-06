import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import db from "../../db";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";

export default function FAQCreate(props) {
  const [FAQ, setFAQ] = useState(null);
  const [question, setQuestion] = useState(null);

  const Submit = async () => {
    console.log("data: ", props.user);
    const add = firebase.functions().httpsCallable("FAQ");
    const response = await add({ question, user: props.user, query: "create" });
    props.toggle();
  };

  return (
    <View style={styles.container}>
      <View style={{ width: "100%", flex: 1 }}>
        <Text style={{ color: "#901616", fontSize: 20, fontWeight: "bold" }}>
          Question:
        </Text>
        <TextInput
          multiline
          numberOfLines={4}
          style={{
            borderWidth: 1,
            paddingLeft: 10,
            paddingRight: 10,
            flex: 1,
            marginBottom: 10,
            borderColor: "#901616",
            borderRadius: 2,
          }}
          placeholder="Question?"
          onChangeText={setQuestion}
        />
        <TouchableOpacity
          style={{
            width: "30%",
            height: 40,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "flex-end",
            backgroundColor: question ? "#3ea3a3" : "#DCDCDC",
          }}
          onPress={() => Submit()}
          disabled={!question}
        >
          <Text style={{ color: question ? "white" : "#708090" }}>Submit</Text>
        </TouchableOpacity>
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
