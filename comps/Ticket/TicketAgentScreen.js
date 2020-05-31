import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  Picker,
} from "react-native";

import { Input } from "react-native-elements";
//Database Connection / firebase
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import { ScrollView } from "react-native-gesture-handler";

// Main Method
export default function TicketAgentScreen(props) {
  //UseState
  const [user, setUser] = useState(null);
  const [servicesList, setServicesList] = useState(null);
  const [selectedValue, setSelectedValue] = useState("projecter");

  const [title, setTitle] = useState(null);
  const [description, setDescription] = useState(null);
  const [view, setView] = useState("home");
  const [ticketList, setTicketList] = useState(null);
  const [other, setOther] = useState("");

  //UseEffect
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    db.collection("customerSupport")
      .where("userId", "==", firebase.auth().currentUser.uid)
      .onSnapshot((Snap) => {
        let temp = [];
        Snap.forEach((doc) => {
          temp.push({ id: doc.id, ...doc.data() });
          console.log(doc.id, "==>", doc.data());
        }),
          setTicketList(temp);
      });
  }, []);

  useEffect(() => {
    db.collection("customerSupport").onSnapshot((Snap) => {
      let temp = [];
      Snap.forEach((doc) => {
        temp.push({ id: doc.id, ...doc.data() });
        console.log(doc.id, "==>", doc.data());
      }),
        setTicketList(temp);
    });
  }, []);

  useEffect(() => {
    db.collection("customerSupport")
      .where()
      .onSnapshot((Snap) => {
        let temp = [];
        Snap.forEach((doc) => {
          temp.push({ id: doc.id, ...doc.data() });
          console.log(doc.id, "==>", doc.data());
        }),
          setTicketList(temp);
      });
  }, []);

  //fetching user data from firebase
  const fetchData = async () => {
    let tempUser;
    const info = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    tempUser = info.data();
    setUser(tempUser);
  };

  // Render
  return user ? (
    <View>
      {ticketList
        ? ticketList.map((item, index) =>
            item.supportAgentUid == firebase.auth().currentUser.uid ||
            item.status == "pending" ? (
              <View key={index} style={{ borderWidth: 1, padding: 10 }}>
                <Text>Title:</Text>
                <Text>{item.title}</Text>
                <Text>Status</Text>
                <Text>{item.status}</Text>
                <Button
                  title="Details"
                  onPress={() =>
                    props.navigation.navigate("Details", {
                      ticket: item,
                      user,
                    })
                  }
                />
              </View>
            ) : null
          )
        : null}
    </View>
  ) : (
    <Text>Loading...</Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
