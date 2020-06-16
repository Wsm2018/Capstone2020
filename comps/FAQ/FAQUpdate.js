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
  const [answer, setAnswer] = useState(null);
  const question = props.q;

  const Submit = async () => {
    const add = firebase.functions().httpsCallable("FAQ");
    const response = await add({
      answeredBy: firebase.auth().currentUser.uid,
      answer,
      id: question.id,
      query: "update",
    });
    props.toggle();
  };

  return question ? (
    <View style={styles.container}>
      <View style={{ width: "100%", flex: 1 }}>
        <Text style={{ color:"#901616" , fontSize:15 , fontWeight:"bold"}}>Q. {question.question}</Text>
        <Text style={{ color:"#2E9E9B" , fontSize:20 , fontWeight:"bold"}}>Answer:</Text>
        <TextInput
          multiline
          numberOfLines={4}
          style={{
            borderWidth: 1,
            paddingLeft: 10,
            paddingRight: 10,
            flex: 1,
            marginBottom: 10,borderColor:"#2E9E9B", borderRadius:5
          }}
          placeholder="Answer?"
          onChangeText={setAnswer}
        />
        <TouchableOpacity
          style={{
            width: "30%",
            height: 40,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "flex-end",
            backgroundColor: answer ? "#3ea3a3" : "#DCDCDC",
          }}
          onPress={() => Submit()}
          disabled={!answer}
        >
          <Text style={{ color: answer ?"white" : "#708090" }}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : null;
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
