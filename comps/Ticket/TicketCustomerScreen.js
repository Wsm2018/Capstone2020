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
export default function TicketScreen(props) {
  //UseState
  const [user, setUser] = useState(null);
  const [servicesList, setServicesList] = useState(null);
  const [selectedValue, setSelectedValue] = useState("projecter");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

  //fetching user data from firebase
  const fetchData = async () => {
    let tempUser;
    const info = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    tempUser = { id: info.id, ...info.data() };
    console.log(tempUser);
    setUser(tempUser);
    console.log("user", user);
  };

  //Submiting a ticket
  const addTicket = async () => {
    if (description != "" && title != "") {
      console.log("user", user);
      const add = firebase.functions().httpsCallable("addTicket");
      const response = await add({
        user,
        description,
        title,
        selectedValue,
        other,
      });
      console.log("response", response);
      setView("home");
    } else {
      alert("Please fill the required fields");
    }
  };

  // Render
  return user ? (
    <View style={styles.container}>
      {view == "create" ? (
        <View>
          <Text>Customer Support</Text>
          <Text>Ticket Subject</Text>
          <TextInput
            placeholder="Subject"
            onChangeText={(text) => setTitle(text)}
          />
          <Text>Issued For?</Text>
          <TextInput
            placeholder="Description"
            onChangeText={(text) => setDescription(text)}
          />
          <Text>Issued On?</Text>
          <Picker
            selectedValue={selectedValue}
            style={{ height: 50, width: 150 }}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedValue(itemValue)
            }
          >
            {servicesList ? (
              servicesList.map((item, index) => (
                <Picker.Item label={item.name} value={item.name} />
              ))
            ) : (
              <Picker.Item label="Loading" value="Loading" />
            )}

            <Picker.Item label="Other User" value="user" />
          </Picker>
          {selectedValue == "user" ? (
            <TextInput
              placeholder="User Details"
              onChangeText={(text) => setOther(text)}
            />
          ) : null}
          <Button title="Submit" onPress={() => addTicket()} />
          <Button title="back" onPress={() => setView("home")} />
        </View>
      ) : (
        <View>
          <Text>Customer Support</Text>
          {ticketList ? (
            <ScrollView>
              {ticketList.map((item, index) => (
                <View
                  style={{ flexDirection: "row", padding: 5, borderWidth: 1 }}
                >
                  <View style={{ flexDirection: "column", padding: 10 }}>
                    <Text>Title: {item.title}</Text>
                    <Text>Status: {item.status}</Text>
                    {item.supportAgentUid != "" ? (
                      <Text>Agent: {item.supportAgentUid}</Text>
                    ) : null}
                  </View>

                  <Button
                    title="details"
                    onPress={() =>
                      props.navigation.navigate("Details", {
                        ticket: item,
                        user,
                      })
                    }
                  />
                </View>
              ))}
            </ScrollView>
          ) : null}

          <Button title="Report a problem" onPress={() => setView("create")} />
        </View>
      )}
    </View>
  ) : (
    <View>
      <Text>Loading...</Text>
    </View>
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
