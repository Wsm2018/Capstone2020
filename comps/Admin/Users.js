//@refresh reset
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Picker,
  Modal,
  TextInput,
  Dimensions,
  ClippingRectangle,
} from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import { Avatar, ListItem } from "react-native-elements";

import * as Linking from "expo-linking";
import * as Print from "expo-print";

export default function Users() {
  const [users, setUsers] = useState(null);
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [modal, setModal] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [balance, setBalance] = useState("");
  const [tokens, setTokens] = useState("");
  const [reputation, setReputation] = useState("");

  useEffect(() => {
    db.collection("users").onSnapshot((snap) => {
      let users = [];
      snap.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      setUsers(users);
    });
  }, []);

  const roles = [
    "user",
    "asset handler",
    "customer support",
    "manager",
    "user handler",
    "asset handler (incomplete)",
    "customer support (incomplete)",
    "manager (incomplete)",
    "user handler (incomplete)",
    "admin",
  ];

  // ---------------------------------DOWNLOAD---------------------------------
  const handleDownload = async () => {
    // ---------------------------------
    const reset = firebase.functions().httpsCallable("resetUserPassword");
    const response = await reset({ user, password });
    // ---------------------------------
    let page = `<View><Text>Email:${user.email}</Text>
    <Text>Password:${password}</Text></View>`;
    let pdf = await Print.printToFileAsync({ html: page });
    let uri = pdf.uri;
    const response2 = await fetch(uri);
    const blob = await response2.blob();
    const putResult = await firebase
      .storage()
      .ref()
      .child(`pdf/${user.id}`)
      .put(blob);

    // ---------------------------------
    const url = await firebase
      .storage()
      .ref()
      .child(`pdf/${user.id}`)
      .getDownloadURL();

    Linking.openURL(url);
  };

  // ------------------------------------------------------------------
  const handleCancel = () => {
    setEditMode(false);
    setSelectedRole(user.role);
  };

  // ------------------------------------------------------------------
  const handleSave = async () => {
    setEditMode(false);
    if (email !== user.email) {
      const result = users.filter((item) => {
        return item.email === email;
      });
      if (result.length > 0) {
        return alert("Email Already Exist!");
      }
    }

    if (displayName !== user.displayName) {
      const result2 = users.filter((item) => {
        return item.displayName === displayName;
      });
      if (result2.length > 0) {
        return alert("Display Name Already Exist!");
      }
    }

    if ("+974" + phone !== user.phone) {
      const result3 = users.filter((item) => {
        return item.phone === "+974" + phone;
      });
      if (result3.length > 0) {
        return alert("Phone No. Already Exist!");
      }
    }

    const update = firebase.functions().httpsCallable("adminUpdateUser");
    await update({
      selectedRole,
      user,
      email,
      displayName,
      phone,
      balance,
      tokens,
      reputation,
    });
  };

  // ------------------------------------------------------------------
  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      setEmail(user.email);
      setDisplayName(user.displayName);
      setPhone(String(user.phone).slice(4));
      setBalance(String(user.balance));
      setTokens(String(user.tokens));
      setReputation(String(user.reputation));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      let tempUser = users.filter((u) => u.id === user.id);

      setUser(tempUser[0]);
    }
  }, [users]);

  // const getUser = async () => {
  //   if (user) {
  //     // db.collection("users")
  //     //   .doc(user.id)
  //     //   .onSnapshot((query) => {
  //     //     console.log(query.data());
  //     //     setUser({ id: query.id, ...query.data() });
  //     //   });
  //     let index = users.indexOf(user);
  //     console.log(users[index]);
  //     setUser(users[index]);

  //   }
  // };

  // useEffect(() => {
  //   getUser();
  // }, [!editMode]);

  return user ? (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setUser(null)}>
        <Text>Back to Users List</Text>
      </TouchableOpacity>
      <Text>User Details</Text>
      {/* ---------------------------------MODAL--------------------------------- */}
      <Modal transparent={true} visible={modal} animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            // alignItems: "center",
            alignSelf: "center",
            marginTop: 22,
            // ---This is for Width---
            width: "80%",
          }}
        >
          <View
            style={{
              margin: 20,
              backgroundColor: "white",
              borderRadius: 20,
              padding: 35,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              justifyContent: "center",
              // ---This is for Height---
              height: "50%",
            }}
          >
            <Text>
              Are you sure you want to update {user.displayName}'s password?
            </Text>
            <Text></Text>
            <Text>
              This will update the account password and will download a pdf
              after the change
            </Text>
            <Text></Text>
            <TextInput
              placeholder={"New Password"}
              value={password}
              onChangeText={setPassword}
            />
            <Text></Text>
            <View
              style={{
                //   borderWidth: 1,
                width: "100%",
                height: "10%",
                justifyContent: "space-around",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              {/* ---------------------------------CONFIRM--------------------------------- */}
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  width: "25%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={handleDownload}
                disabled={password === "" ? true : false}
              >
                <Text>CONFIRM</Text>
              </TouchableOpacity>
              {/* ---------------------------------CANCEL--------------------------------- */}
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  width: "25%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => setModal(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        {/* ---------------------------------RESET PASSWORD--------------------------------- */}
        <TouchableOpacity
          style={{ borderWidth: 1 }}
          onPress={() => setModal(true)}
        >
          <Text>Reset Password</Text>
        </TouchableOpacity>
        <Text> | </Text>
        {/* ---------------------------------EDIT--------------------------------- */}
        <TouchableOpacity
          style={{ borderWidth: 1 }}
          onPress={() => setEditMode(true)}
        >
          <Text>Edit</Text>
        </TouchableOpacity>
      </View>
      <Avatar rounded source={{ uri: user.photoURL }} size="xlarge" />

      {editMode ? (
        <View style={{ flexDirection: "row" }}>
          <Text>Email:</Text>
          <TextInput
            placeholder={"Email"}
            value={email}
            onChangeText={setEmail}
            style={{ borderColor: "black", borderWidth: 1, borderRadius: 10 }}
            width={Dimensions.get("window").width / 2}
          />
        </View>
      ) : (
        <Text>Email: {user.email}</Text>
      )}
      {editMode ? (
        <View style={{ flexDirection: "row" }}>
          <Text>Display Name:</Text>

          <TextInput
            placeholder={"Display Name"}
            value={displayName}
            onChangeText={setDisplayName}
            style={{ borderColor: "black", borderWidth: 1, borderRadius: 10 }}
            width={Dimensions.get("window").width / 2}
          />
        </View>
      ) : (
        <Text>Display Name: {user.displayName}</Text>
      )}
      {/* ---------------------------------PICKER--------------------------------- */}
      {editMode ? (
        <View style={{ flexDirection: "row" }}>
          <Text>Role:</Text>

          <View
            style={{
              borderColor: "lightgray",
              backgroundColor: "lightgray",
              flex: 1,
            }}
          >
            <Picker
              // mode="dropdown"
              selectedValue={selectedRole}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedRole(itemValue)
              }
            >
              {roles.map((role, index) => (
                <Picker.Item label={role} value={role} key={index} />
              ))}
            </Picker>
          </View>
        </View>
      ) : (
        <Text>Role: {user.role}</Text>
      )}
      {editMode ? (
        <View style={{ flexDirection: "row" }}>
          <Text>Phone:</Text>

          <View style={{ flexDirection: "row" }}>
            <TextInput
              value={"+974"}
              style={{ borderColor: "black", borderWidth: 1, borderRadius: 10 }}
              editable={false}
              width={40}
            />
            <TextInput
              placeholder={"Phone No."}
              value={phone}
              onChangeText={setPhone}
              style={{ borderColor: "black", borderWidth: 1, borderRadius: 10 }}
              width={Dimensions.get("window").width / 2}
            />
          </View>
        </View>
      ) : (
        <Text>Phone: {user.phone}</Text>
      )}
      {editMode ? (
        <View style={{ flexDirection: "row" }}>
          <Text>Balance:</Text>

          <TextInput
            placeholder={"Balance"}
            value={balance}
            onChangeText={setBalance}
            style={{ borderColor: "black", borderWidth: 1, borderRadius: 10 }}
            width={Dimensions.get("window").width / 2}
          />
        </View>
      ) : (
        <Text>Balance: {user.balance}</Text>
      )}
      <Text>Referral Code: {user.referralCode}</Text>
      {editMode ? (
        <View style={{ flexDirection: "row" }}>
          <Text>Tokens:</Text>

          <TextInput
            placeholder={"Tokens"}
            value={tokens}
            onChangeText={setTokens}
            style={{ borderColor: "black", borderWidth: 1, borderRadius: 10 }}
            width={Dimensions.get("window").width / 2}
          />
        </View>
      ) : (
        <Text>Tokens: {user.tokens}</Text>
      )}
      {editMode ? (
        <View style={{ flexDirection: "row" }}>
          <Text>Reputation:</Text>

          <TextInput
            placeholder={"Reputation"}
            value={reputation}
            onChangeText={setReputation}
            style={{ borderColor: "black", borderWidth: 1, borderRadius: 10 }}
            width={Dimensions.get("window").width / 2}
          />
        </View>
      ) : (
        <Text>Reputation: {user.reputation}</Text>
      )}
      {!editMode && (
        <View style={{ flexDirection: "row" }}>
          <Text>Last Location: </Text>
          {user.location ? (
            <TouchableOpacity>
              <Text>Track User</Text>
            </TouchableOpacity>
          ) : (
            <Text>Unknown</Text>
          )}
        </View>
      )}

      <Text></Text>

      {editMode && (
        <View
          style={{
            //   borderWidth: 1,
            width: "100%",
            height: "5%",
            justifyContent: "space-around",
            alignItems: "center",
            flexDirection: "row",
            marginBottom: 20,
          }}
        >
          {/* ---------------------------------SAVE--------------------------------- */}
          <TouchableOpacity
            style={{
              borderWidth: 1,
              width: "25%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={handleSave}
          >
            <Text>Save</Text>
          </TouchableOpacity>
          {/* ---------------------------------CANCEL--------------------------------- */}
          <TouchableOpacity
            style={{
              borderWidth: 1,
              width: "25%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={handleCancel}
          >
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  ) : users ? (
    <ScrollView>
      {users.map((user) => (
        <TouchableOpacity key={user.id} onPress={() => setUser(user)}>
          <ListItem
            leftAvatar={{ source: { uri: user.photoURL } }}
            title={user.displayName}
            subtitle={user.email}
            bottomDivider
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  ) : (
    <View>
      <Text>LOADING...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // alignItems: "center",
    justifyContent: "center",
  },
});
