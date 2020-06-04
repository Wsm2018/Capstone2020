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
import { set } from "react-native-reanimated";

// Main Method
export default function TicketAgentScreen(props) {
  //UseState
  const [user, setUser] = useState(null);
  const [agentList, setAgentList] = useState([]);
  const [ticketList, setTicketList] = useState(null);
  const [view, setView] = useState("home");
  const [num, setNum] = useState();
  const [searchResult, setSearchResult] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

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

  useEffect(() => {
    db.collection("customerSupport").onSnapshot((Snap) => {
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
    tempUser = { id: info.id, ...info.data() };
    setUser(tempUser);

    let agentsTemp = [];
    const info2 = await db
      .collection("users")
      .where("activeRole", "==", "customer support")
      .get();
    info2.forEach((doc) => agentsTemp.push({ id: doc.id, ...doc.data() }));
    setAgentList(agentsTemp);
  };

  const searchCar = async () => {
    const result = await db
      .collectionGroup("cars")
      .where("plate", "==", num)
      .get();
    let temp;
    result.forEach((doc) => {
      temp = doc.ref.path.split("/");
    });
    const path = temp;
    if (path) {
      const user = await db.collection("users").doc(path[1]).get();
      setSearchResult(user.data());
    } else {
      setSearchResult(false);
    }
  };

  const ApproveReport = async () => {
    const add = firebase.functions().httpsCallable("updateTicket");
    const response = await add({
      user,
      ticket: selectedValue,

      query: "Approve",
    });
  };

  // Render
  return user ? (
    <View>
      {view == "home" ? (
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
                          agentList,
                        })
                      }
                    />
                  </View>
                ) : null
              )
            : null}
          <Button title="User List" onPress={() => setView("userList")} />
        </View>
      ) : view == "userList" ? (
        <View>
          <TextInput onChangeText={setNum} />
          <Button title="search" onPress={searchCar} />
          {searchResult ? (
            <View style={{ borderWidth: 1 }}>
              <Text>User : {searchResult.displayName}</Text>
              <Picker
                selectedValue={selectedValue}
                style={{ height: 50, width: 150 }}
                onValueChange={(itemValue, itemIndex) =>
                  setSelectedValue(itemValue)
                }
              >
                {ticketList ? (
                  ticketList.map((item, index) => (
                    <Picker.Item label={item.id} value={item.id} />
                  ))
                ) : (
                  <Picker.Item label="Loading" value="Loading" />
                )}
              </Picker>
              <Button title="Approve" onPress={ApproveReport} />
            </View>
          ) : (
            <Text>Not Found</Text>
          )}
          <Button title="Ticket List" onPress={() => setView("home")} />
        </View>
      ) : (
        <Text>Something Went wrong??</Text>
      )}
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
