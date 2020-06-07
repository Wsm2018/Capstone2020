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
  Platform,
  ClippingRectangle,
} from "react-native";
import {
  MaterialCommunityIcons,
  Feather,
  Ionicons,
  FontAwesome,
  MaterialIcons,
} from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import ReactNativePickerModule from "react-native-picker-module";

import DatePicker from "react-native-datepicker";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db";
import { Avatar, ListItem } from "react-native-elements";

import * as Linking from "expo-linking";
import * as Print from "expo-print";

import moment from "moment";

export default function Users() {
  let pickerRef = null;
  let rolePickRef = null;
  const [users, setUsers] = useState(null);
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [modal, setModal] = useState(false);
  const [modal2, setModal2] = useState(false);
  const [modal3, setModal3] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [balance, setBalance] = useState("");
  const [tokens, setTokens] = useState("");
  const [reputation, setReputation] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [loaded, setLoaded] = useState(false);
  const [valueText, setValueText] = useState();
  const subscriptionLevel = ["gold", "silver", "bronze"];

  useEffect(() => {
    db.collection("users").onSnapshot((snap) => {
      let users = [];
      snap.forEach((doc) => {
        if (doc.data().email !== "DELETED")
          users.push({ id: doc.id, ...doc.data() });
      });
      setUsers(users);
    });
  }, []);

  const roles = [
    "customer",
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
    if (subscription) {
      subscribe("update");
    }
  };

  let unsub = null;

  // ---------------------------------DELETE---------------------------------
  const handleDelete = async () => {
    // ---------------------------------
    setUser(null);
    setSubscription(null);
    unsub();
    const response = await fetch(
      `https://us-central1-capstone2020-b64fd.cloudfunctions.net/deleteGuestUser?uid=${user.id}`
    );
  };

  const getSubscription = async () => {
    unsub = db
      .collection("users")
      .doc(user.id)
      .collection("subscription")
      .onSnapshot((snap) => {
        snap.forEach((doc) => {
          const endDate = doc.data().endDate.toDate();
          if (endDate > new Date()) {
            setSubscription({ id: doc.id, ...doc.data() });
            setStartDate(doc.data().startDate.toDate());
            setEndDate(doc.data().endDate.toDate());
            setValueText(doc.data().type);
          }
        });
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
      getSubscription();
    } else {
      if (loaded) {
        if (unsub) {
          unsub();
        }

        setSubscription(null);
      } else {
        setLoaded(true);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      let tempUser = users.filter((u) => u.id === user.id);

      setUser(tempUser[0]);
    }
  }, [users]);

  const subscribe = (type) => {
    if (type === "new") {
      let sub = {
        gold: {
          type: "gold",
          startDate: new Date(),
          endDate: new Date(moment().add(1, "month").calendar()),
        },
        silver: {
          type: "silver",
          startDate: new Date(),
          endDate: new Date(moment().add(1, "month").calendar()),
        },
        bronze: {
          type: "bronze",
          startDate: new Date(),
          endDate: new Date(moment().add(1, "month").calendar()),
        },
      };
      if (valueText === "gold") {
        db.collection("users")
          .doc(user.id)
          .collection("subscription")
          .add(sub.gold);
      } else if (valueText === "silver") {
        db.collection("users")
          .doc(user.id)
          .collection("subscription")
          .add(sub.silver);
      } else if (valueText === "bronze") {
        db.collection("users")
          .doc(user.id)
          .collection("subscription")
          .add(sub.bronze);
      }
    } else {
      db.collection("users")
        .doc(user.id)
        .collection("subscription")
        .doc(subscription.id)
        .update({
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          type: valueText,
        });
    }
  };

  const endSubscription = () => {
    setModal3(false);
    setSubscription(null);
    db.collection("users")
      .doc(user.id)
      .collection("subscription")
      .doc(subscription.id)
      .update({ endDate: new Date() });
  };

  return user ? (
    <View style={styles.container}>
      {/* MOVES THIS  TOUCHABLE DOWN */}
      <TouchableOpacity onPress={() => setUser(null)}>
        <Text>Back to Users List</Text>
      </TouchableOpacity>
      {/* ---------------------------------------------- */}

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
              height: "60%",
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
              {/* -------------------------CONFIRM RESET PASS------------------------- */}
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
              {/* -------------------------CANCEL RESET PASS-------------------------- */}
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
      {/* ---------------------------------MODAL2--------------------------------- */}
      <Modal transparent={true} visible={modal2} animationType="slide">
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
              Are you sure you want to DELETE {user.displayName}'s account?
            </Text>
            <Text></Text>
            <Text>This action can't be undone!</Text>
            <Text></Text>
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
              {/* -----------------------------CONFIRM DELETE------------------------- */}
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  width: "25%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={handleDelete}
              >
                <Text>CONFIRM</Text>
              </TouchableOpacity>
              {/* -----------------------------CANCEL DELETE------------------------- */}
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  width: "25%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => setModal2(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView>
        {/* =====================profile picture===========================*/}
        <View style={styles.one}>
          <View
            style={
              Platform.OS === "ios" ? styles.avatarIpad : styles.avatarPhone
            }
          >
            <Avatar rounded source={{ uri: user.photoURL }} size="xlarge" />
            <View style={{ flex: 2, backgroundColor: "red" }}>
              <Text
                style={{
                  alignSelf: "center",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                {user.displayName}
              </Text>
            </View>

            <View
              style={{
                flex: 2,
                flexDirection: "row",
                // backgroundColor: "red",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* ---------------------------------RESET PASSWORD--------------------------------- */}
              <View
                style={{
                  // backgroundColor: "red",
                  flex: 0.5,
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                <TouchableOpacity onPress={() => setModal(true)}>
                  <Text>Reset Password</Text>
                </TouchableOpacity>
              </View>
              {/* ---------------------------------EDIT--------------------------------- */}
              <View
                style={{
                  // backgroundColor: "blue",
                  flex: 0.6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TouchableOpacity onPress={() => setEditMode(true)}>
                  <Text>Edit Info</Text>
                </TouchableOpacity>
              </View>
              {/* ---------------------------------RESET PASSWORD--------------------------------- */}
              <View
                style={{
                  // backgroundColor: "green",
                  flex: 0.5,
                  alignItems: "flex-start",
                  justifyContent: "center",
                }}
              >
                <TouchableOpacity onPress={() => setModal2(true)}>
                  <Text>Delete User</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        {/* =====================profile picture===========================*/}
        <View style={styles.two}>
          <Text style={styles.cardTitle}> Personal Info</Text>
          {/* <View
            style={{
              flex: 1,
              justifyContent: "space-evenly",
              backgroundColor: "red",
            }}
          > */}
          {editMode ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: "5%",
              }}
            >
              <View style={{ width: 100 }}>
                <Text style={styles.text2}>Email:</Text>
              </View>
              <View
                width={Dimensions.get("window").width / 1.8}
                style={styles.inputStyle}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TextInput
                    placeholder={"Email"}
                    value={email}
                    onChangeText={setEmail}
                    // style={styles.inputStyle}
                    // width={Dimensions.get("window").width / 2}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.text}>
              <Text style={styles.text2}>Email: {user.email}</Text>
            </View>
          )}
          {editMode ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: "5%",
              }}
            >
              <View style={{ width: 100 }}>
                <Text style={styles.text2}>Name:</Text>
              </View>
              <View
                width={Dimensions.get("window").width / 1.8}
                style={styles.inputStyle}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TextInput
                    placeholder={"Display Name"}
                    value={displayName}
                    onChangeText={setDisplayName}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.text}>
              <Text style={styles.text2}>Name: {user.displayName}</Text>
            </View>
          )}

          {editMode ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: "5%",
              }}
            >
              <View style={{ width: 100 }}>
                <Text style={styles.text2}>Phone:</Text>
              </View>
              <View
                width={Dimensions.get("window").width / 1.8}
                style={styles.inputStyle}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 18, color: "gray" }}>🇶🇦 +974 </Text>
                  <TextInput
                    // placeholder="1234 5678"
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={8}
                    fontSize={18}
                    value={phone}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.text}>
              <Text style={styles.text2}>Phone: {user.phone}</Text>
            </View>
          )}
          {/* </View> */}
        </View>
        {/* ---------------------------------PICKER--------------------------------- */}
        <View style={styles.three}>
          <Text style={{ ...styles.cardTitle, marginBottom: "5%" }}>
            {" "}
            User Details
          </Text>
          {editMode ? (
            Platform.OS === "android" ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: "5%",
                }}
              >
                <View style={{ width: 100 }}>
                  <Text style={styles.text2}>Role: </Text>
                </View>

                <View
                  style={{
                    flex: 0.81,
                    borderRadius: 5,
                    borderWidth: 2,
                    borderColor: "gray",
                    height: 40,
                    //width: "80%",
                    alignSelf: "center",
                    paddingLeft: 12,
                    //marginTop: 20,
                    justifyContent: "space-between",
                    //width: 300,
                  }}
                >
                  <Picker
                    style={styles.picker}
                    // style={{ width: "50%" }}
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
              <View
                style={{
                  //backgroundColor: "darkred",
                  flex: 0.15,
                  width: "100%",
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: "5%",
                  }}
                >
                  <View style={{ width: 100 }}>
                    <Text style={styles.text2}>Role: </Text>
                  </View>

                  <View width={Dimensions.get("window").width / 1.8}>
                    <TouchableOpacity
                      style={{
                        width: "100%",
                        // paddingVertical: 24,
                        // backgroundColor: "blue",
                        alignItems: "center",
                        justifyContent: "center",

                        height: 20,
                      }}
                      onPress={() => {
                        rolePickRef.show();
                      }}
                    >
                      <View
                        style={{
                          width: "100%",
                          height: 40,

                          // flexDirection: "row",
                          // justifyContent: "space-evenly",
                          alignItems: "center",
                          // backgroundColor: "red",
                          borderWidth: 1,

                          paddingLeft: 6,
                          // width: "60%",
                          borderColor: "gray",
                          borderWidth: 2,
                          borderRadius: 5,
                          // marginBottom: 10,
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            justifyContent: "space-between",
                            flexDirection: "row",
                            alignItems: "center",
                            // backgroundColor: "blue",
                          }}
                        >
                          <Text style={{ fontWeight: "bold" }}>
                            {selectedRole === "" ? "Select Role" : selectedRole}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
                <ReactNativePickerModule
                  pickerRef={(e) => (rolePickRef = e)}
                  title={"Roles"}
                  items={roles}
                  onDismiss={() => {
                    console.log("onDismiss");
                  }}
                  onCancel={() => {
                    console.log("Cancelled");
                  }}
                  onValueChange={(valueText, index) => {
                    setSelectedRole(valueText);
                  }}
                />
              </View>
            )
          ) : (
            <View style={styles.text}>
              <Text style={styles.text2}>Role: {user.role}</Text>
            </View>
          )}
          {editMode ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: "5%",
              }}
            >
              <View style={{ width: 100 }}>
                <Text style={styles.text2}>Balance: </Text>
              </View>
              <View
                width={Dimensions.get("window").width / 1.8}
                style={styles.inputStyle}
              >
                <TextInput
                  placeholder={"Balance"}
                  value={balance}
                  onChangeText={setBalance}
                  // style={styles.textinput}
                  width={Dimensions.get("window").width / 2}
                />
              </View>
            </View>
          ) : (
            <View style={styles.text}>
              <Text style={styles.text2}>Balance: {user.balance}</Text>
            </View>
          )}
          {editMode ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: "5%",
              }}
            >
              <View style={{ width: 100 }}>
                <Text style={styles.text2}>Referral: </Text>
              </View>
              <View
                width={Dimensions.get("window").width / 1.8}
                style={styles.inputStyle}
              >
                <TextInput
                  placeholder={user.referralCode}
                  // value={tokens}
                  // onChangeText={setTokens}
                  disabled={true}
                  // style={styles.textinput}
                  width={Dimensions.get("window").width / 2}
                />
              </View>
            </View>
          ) : (
            <View style={styles.text}>
              <Text style={styles.text2}>Referral: {user.referralCode}</Text>
            </View>
          )}
          {editMode ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: "5%",
              }}
            >
              <View style={{ width: 100 }}>
                <Text style={styles.text2}>Tokens: </Text>
              </View>
              <View
                width={Dimensions.get("window").width / 1.8}
                style={styles.inputStyle}
              >
                <TextInput
                  placeholder={"Tokens"}
                  value={tokens}
                  onChangeText={setTokens}
                  // style={styles.textinput}
                  width={Dimensions.get("window").width / 2}
                />
              </View>
            </View>
          ) : (
            <View style={styles.text}>
              <Text style={styles.text2}>Tokens: {user.tokens}</Text>
            </View>
          )}
          {editMode ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: "5%",
              }}
            >
              <View style={{ width: 100 }}>
                <Text style={styles.text2}>Reputation: </Text>
              </View>
              <View
                width={Dimensions.get("window").width / 1.8}
                style={styles.inputStyle}
              >
                <TextInput
                  placeholder={"Reputation"}
                  value={reputation}
                  onChangeText={setReputation}
                  // style={styles.textinput}
                  width={Dimensions.get("window").width / 2}
                />
              </View>
            </View>
          ) : (
            <View style={styles.text}>
              <Text style={styles.text2}>Reputation: {user.reputation}</Text>
            </View>
          )}
          {/* </View> */}
          {/* ---------------------------------MODAL3--------------------------------- */}
          <Modal transparent={true} visible={modal3} animationType="slide">
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
                  Are you sure you want to END {user.displayName}'s
                  Subscription?
                </Text>
                <Text></Text>
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
                  {/* -----------------------------CONFIRM DELETE------------------------- */}
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      width: "25%",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => endSubscription()}
                  >
                    <Text>CONFIRM</Text>
                  </TouchableOpacity>
                  {/* -----------------------------CANCEL DELETE------------------------- */}
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      width: "25%",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => setModal3(false)}
                  >
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {editMode ? (
            <View style={{ backgroundColor: "yellow", flexDirection: "row" }}>
              <Text
                style={{
                  fontSize: 16,
                }}
              >
                Subscription:{" "}
              </Text>
              {subscription ? (
                <View>
                  <Text style={styles.text2}>Selected Level: {valueText}</Text>
                  {Platform.OS === "ios" ? (
                    <View>
                      <TouchableOpacity
                        style={
                          {
                            // paddingVertical: 10,
                          }
                        }
                        onPress={() => {
                          pickerRef.show();
                        }}
                      >
                        <Text>Select subscription level</Text>
                      </TouchableOpacity>
                      <ReactNativePickerModule
                        pickerRef={(e) => (pickerRef = e)}
                        title={"Select a subscription level"}
                        items={subscriptionLevel}
                        onDismiss={() => {
                          console.log("onDismiss");
                        }}
                        onCancel={() => {
                          console.log("Cancelled");
                        }}
                        onValueChange={(valueText, index) => {
                          console.log("value: ", valueText);
                          console.log("index: ", index);
                          setValueText(valueText);
                        }}
                      />
                    </View>
                  ) : (
                    <Picker
                      selectedValue={valueText}
                      style={{ height: 50, width: 150 }}
                      onValueChange={(item, itemIndex) => setValueText(item)}
                    >
                      {subscriptionLevel.map((item, index) => (
                        <Picker.Item key={index} label={item} value={item} />
                      ))}
                    </Picker>
                  )}
                  <DatePicker
                    style={{ width: 200 }}
                    date={startDate}
                    mode="date"
                    placeholder="Select Start Date"
                    format="YYYY-MM-DD"
                    minDate={moment(new Date()).format("YYYY-MM-DD")}
                    maxDate={endDate}
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    customStyles={{
                      dateIcon: {
                        position: "absolute",
                        left: 0,
                        top: 4,
                        marginLeft: 0,
                      },
                      dateInput: {
                        marginLeft: 36,
                      },
                    }}
                    onDateChange={(startDate) => setStartDate(startDate)}
                  />
                  <DatePicker
                    style={{ width: 200 }}
                    date={endDate}
                    mode="date"
                    placeholder="Select End Date"
                    format="YYYY-MM-DD"
                    minDate={startDate}
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    customStyles={{
                      dateIcon: {
                        position: "absolute",
                        left: 0,
                        top: 4,
                        marginLeft: 0,
                      },
                      dateInput: {
                        marginLeft: 36,
                      },
                    }}
                    onDateChange={(endDate) => setEndDate(endDate)}
                  />
                  <TouchableOpacity
                    style={
                      {
                        // paddingVertical: 10,
                      }
                    }
                    onPress={() => {
                      setModal3(true);
                    }}
                  >
                    <Text>End Subscription</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      // backgroundColor: "red",
                    }}
                  >
                    {/* <Text style={styles.text2}>
                      Selected Level: {valueText}
                    </Text> */}
                    {Platform.OS === "ios" ? (
                      <View>
                        <TouchableOpacity
                          style={
                            {
                              // paddingVertical: 10,
                            }
                          }
                          onPress={() => {
                            pickerRef.show();
                          }}
                        >
                          <Text>Select subscription level</Text>
                        </TouchableOpacity>
                        <ReactNativePickerModule
                          pickerRef={(e) => (pickerRef = e)}
                          title={"Select a subscription level"}
                          items={subscriptionLevel}
                          onDismiss={() => {
                            console.log("onDismiss");
                          }}
                          onCancel={() => {
                            console.log("Cancelled");
                          }}
                          onValueChange={(valueText, index) => {
                            console.log("value: ", valueText);
                            console.log("index: ", index);
                            setValueText(valueText);
                          }}
                        />
                      </View>
                    ) : (
                      <Picker
                        selectedValue={valueText}
                        style={{ height: 50, width: 150 }}
                        onValueChange={(item, itemIndex) => setValueText(item)}
                      >
                        {subscriptionLevel.map((item, index) => (
                          <Picker.Item key={index} label={item} value={item} />
                        ))}
                      </Picker>
                    )}
                  </View>
                  <TouchableOpacity
                    style={
                      {
                        // paddingVertical: 10,
                      }
                    }
                    onPress={() => {
                      subscribe("new");
                    }}
                  >
                    <Text>Add Subscription</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          ) : subscription ? (
            <View>
              <View style={{ marginLeft: "4%" }}>
                <Text style={{ fontSize: 16 }}>Subscription: </Text>
              </View>
              <View style={{ marginLeft: "8%" }}>
                <Text>Type: {subscription.type}</Text>
                <Text>
                  Start Date:{" "}
                  {moment(subscription.startDate.toDate()).format(
                    "MMMM Do YYYY"
                  )}
                </Text>
                <Text>
                  End Date:{" "}
                  {moment(subscription.endDate.toDate()).format("MMMM Do YYYY")}
                </Text>
              </View>
            </View>
          ) : (
            <View>
              <View style={{ marginLeft: "4%", flexDirection: "row" }}>
                <Text style={{ fontSize: 16 }}>Subscription: </Text>
                <Text style={{ fontSize: 16 }}>No Subscription</Text>
              </View>
            </View>
          )}
          {editMode && (
            <View
              // style={{ backgroundColor: "red", flex: 1 }}
              style={{
                //   borderWidth: 1,
                flex: 1,
                backgroundColor: "lightgreen",
                width: "100%",
                height: "100%",
                justifyContent: "space-around",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              {/* ---------------------------------SAVE--------------------------------- */}
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  width: "25%",
                  height: "50%",

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
                  height: "50%",

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
      </ScrollView>
    </View>
  ) : users ? (
    <ScrollView>
      {users.map((user) => (
        <TouchableOpacity key={user.id} onPress={() => setUser(user)}>
          <ListItem
            leftAvatar={{ source: { uri: user.photoURL } }}
            rightAvatar={
              <Ionicons name="ios-arrow-forward" size={24} color="black" />
            }
            title={user.displayName}
            subtitle={user.email}
            bottomDivider
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  ) : (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LottieView
        width={Dimensions.get("window").width / 3}
        source={require("../../assets/loadingAnimations/890-loading-animation.json")}
        autoPlay
        loop
        style={{
          position: "relative",
          width: "100%",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebe8e8",
    // alignItems: "center",
    // paddingBottom: 50,
    justifyContent: "center",
  },
  avatarPhone: {
    justifyContent: "center",
    alignItems: "center",
    width: "95%",
  },
  avatarIpad: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  two: {
    backgroundColor: "white",
    width: "100%",
    marginTop: "3%",
    padding: "5%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
    // flexDirection: "row",
    //flexWrap: "wrap",
    // flex: 1,
    height: "25%",
  },
  three: {
    backgroundColor: "white",
    width: "100%",
    marginTop: "3%",
    padding: "5%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
    // flexDirection: "row",
    //flexWrap: "wrap",
    // flex: 1,
    // height: "100%",
  },
  inputStyle: {
    height: 40,
    // backgroundColor: "green",
    // alignItems: "center",
    justifyContent: "center",
    // flexDirection: "row",
    paddingLeft: 6,
    // width: "60%",
    borderColor: "gray",
    borderWidth: 2,
    borderRadius: 5,
    // marginBottom: 10,
  },
  one: {
    backgroundColor: "white",
    flex: 1,
    // justifyContent: "space-between",
    // marginTop: "3%",
    // padding: "2%",
    // borderTopWidth: 1,
    // borderBottomWidth: 1,
    // // height: "100%",
    // borderColor: "lightgray",
  },
  cardTitle: {
    fontSize: 18,
    // backgroundColor: "red",
    width: "100%",

    height: 30,
    color: "black",
    fontWeight: "bold",
  },
  text: {
    // fontSize: 80,
    marginLeft: "4%",
    marginRight: "5%",
    marginBottom: "1%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textinput: {
    height: 40,

    paddingLeft: 6,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
  },
  text2: {
    fontSize: 16,
  },
  picker: {
    height: 40,
    width: "99%",
    borderColor: "black",
    borderWidth: 1,
    color: "#667085",
    borderStyle: "solid",
  },
});
Users.navigationOptions = {
  headerStyle: { backgroundColor: "#005c9d" },
  headerTintColor: "white",
};
