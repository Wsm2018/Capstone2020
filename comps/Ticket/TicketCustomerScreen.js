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
import * as ImagePicker from "expo-image-picker";

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
  const [priority, setPriority] = useState("normal");

  const [image, setImage] = useState(null);

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

    const info2 = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("subscription")
      .get();
    if (info2.size > 0) {
      info2.forEach((doc) => {
        let subTime =
          doc.data().endDate.toDate() - doc.data().startDate.toDate();
        if (subTime > 0) {
          if (doc.data().type === "silver") {
            setPriority("medium");
          } else if (doc.data().type === "gold") {
            setPriority("high");
          } else if (doc.data().type === "platinum") {
            setPriority("very high");
          }
        }
      });
    } else {
      console.log("user is not a sub");
    }

    tempUser = { id: info.id, ...info.data() };
    setUser(tempUser);

    let tempServ = [];
    const info3 = await db.collection("services").get();
    info3.forEach((doc) => {
      tempServ.push({ id: doc.id, ...doc.data() });
    });
    setServicesList(tempServ);
  };

  const _pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.cancelled) {
        setImage(result.uri);
      }
    } catch (E) {
      console.log(E);
    }
  };
  //Submiting a ticket
  const addTicket = async () => {
    if (description != "" && title != "") {
      const add = firebase.functions().httpsCallable("addTicket");
      const response = await add({
        user,
        description,
        title,
        selectedValue,
        other,
        priority,
      });
      console.log("start uploading");
      const response1 = await fetch(image);
      const blob = await response1.blob();
      const upload = await firebase
        .storage()
        .ref()
        .child("customerSupport/" + response.data._path.segments[1])
        .put(blob);
      //setView("home");
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
          <Button title="Attachment Image" onPress={_pickImage} />
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
