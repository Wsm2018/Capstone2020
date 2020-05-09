import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../db";
import LottieView from "lottie-react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Input } from "react-native-elements";
import { ButtonGroup } from "react-native-elements";

export default function Authentication(props) {
  const [view, setView] = useState(0);
  const [registerView, setRegisterView] = useState(0);
  const [modalViewLogin, setModalViewLogin] = useState(false);
  const [accessFlag, setAccessFlag] = useState(false);
  const [accessValid, setAccessValid] = useState(false);
  const buttons = ["Login", "Register"];

  // ***** Register useState *****

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmRegisterPassword, setConfirmRegisterPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");

  // the register button status for validation
  const [btnStatus, setBtnStatus] = useState(true);

  // ***** Login useState *****

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ***** ForgotPass useState *****

  const [forgotPassEmail, setForgotPassEmail] = useState("");

  // it check if the email and password is not empty to enable the register button
  // and it will keep checking whenever the user edits on the email or password fields
  useEffect(() => {
    if (registerEmail !== "" && registerPassword !== "") {
      setBtnStatus(false);
    } else {
      setBtnStatus(true);
    }
  }, [registerEmail, registerPassword]);

  // handleRegister will create a the user and create the document for the user in the
  // database with all the needed information
  const handleRegister = async () => {
    if (phone !== "") {
      // checking if Phone No. is 8 digits
      if (phone.length !== 8) {
        return alert("Phone Number is Not Available!");
      }
    } else {
      return alert("Enter your Phone Number!");
    }

    if (displayName === "") {
      return alert("Enter your Display Name!");
    }

    if (registerPassword !== confirmRegisterPassword) {
      return alert("Password and Confirm Password should be same !");
    }

    // trying creating user and if there is any error it will alert it for example:
    // email is not corrent or password is not strong
    try {
      // waiting for the user to be created in the authentication
      await firebase
        .auth()
        .createUserWithEmailAndPassword(registerEmail, registerPassword);

      // initiating user info in firebase funcations to add a display image and display name
      const response = await fetch(
        `https://us-central1-capstone2020-b64fd.cloudfunctions.net/initUser?uid=${
          firebase.auth().currentUser.uid
        }&phoneNumber=${phone}&displayName=${displayName}`
      );

      //sending the user an email verification
      await firebase
        .auth()
        .currentUser.sendEmailVerification()
        .then(() => {
          console.log("Email Sent!");
        })
        .catch((err) => {
          console.log(err);
        });

      // calling createUserInfo and waiting for it before moving the user to login page
      await createUserInfo();
    } catch (error) {
      alert(error.message);
    }
  };

  // createUserInfo will complete all the data for the user to create a document in the
  // database
  const createUserInfo = async () => {
    // generating a random 6 digit referralCode
    let referralCode = Math.floor(Math.random() * 1000000) + "";

    if (referralCode.length === 1) {
      referralCode = "00000" + referralCode;
    } else if (referralCode.length === 2) {
      referralCode = "0000" + referralCode;
    } else if (referralCode.length === 3) {
      referralCode = "000" + referralCode;
    } else if (referralCode.length === 4) {
      referralCode = "00" + referralCode;
    } else if (referralCode.length === 5) {
      referralCode = "0" + referralCode;
    }

    const users = db.collection("users");
    // checking if any other user has the generated referralCode and waiting because its
    // checking all the users document
    let result = await users.where("referralCode", "==", referralCode).get();
    // while there is any user with that referralCode it will generate a new code and try
    // again till it returns 0 documents
    while (result.size > 0) {
      referralCode = Math.floor(Math.random() * 1000000) + "";
      if (referralCode.length === 1) {
        referralCode = "00000" + referralCode;
      } else if (referralCode.length === 2) {
        referralCode = "0000" + referralCode;
      } else if (referralCode.length === 3) {
        referralCode = "000" + referralCode;
      } else if (referralCode.length === 4) {
        referralCode = "00" + referralCode;
      } else if (referralCode.length === 5) {
        referralCode = "0" + referralCode;
      }
      result = await users.where("referralCode", "==", referralCode).get();
    }
    // const name = email.split("@");

    // creating user document in the database with all the information
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .set({
        outstandingBalance: 0,
        balance: 0,
        email: registerEmail,
        role: "user",
        qrCode: "",
        name: displayName,
        phone: `+974${phone}`,
        referralCode,
        loyaltyCode: "",
        subscription: {
          name: null,
          startDate: null,
          endDate: null,
          point: null,
        },
        // checking if the user used referral code and giving him a token if he did
        tokens: 0,
        location: null,
        privacy: {
          emailP: false,
          nameP: false,
          locationP: false,
          carsP: false,
        },
        friends: [],
        favorite: [],
        reputation: 0,
        points: 0,
      });

    // if the user used a referral code it will add document inside the referrer
    // subcollection and it will have the new user referral code and the status as false
    // the status will show if the user used the token or not
    if (referralStatus === true) {
      const referralDoc = await users
        .where("referralCode", "==", referral)
        .get();
      referralDoc.forEach((doc) => {
        db.collection("users").doc(doc.id).collection("referrer").doc().set({
          referrerCode: referralCode,
          status: false,
        });
      });
    }
  };

  const handleLogin = async () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(loginEmail, loginPassword)
      .then(() => {
        console.log("successful login!");
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const handleSubmit = async () => {
    firebase
      .auth()
      .sendPasswordResetEmail(forgotPassEmail)
      .then(() => {
        alert("Email Sent");
      })
      .catch((err) => alert(err.message));
    setModalViewLogin(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LottieView
          source={require("../assets/login.json")}
          autoPlay
          loop
          style={{ position: "relative", width: "50%" }}
        />
      </View>
      <View style={styles.buttonGroup}>
        <ButtonGroup
          onPress={() => (view === 1 ? setView(0) : setView(1))}
          selectedIndex={view}
          buttons={buttons}
          containerStyle={{
            // height: 100,
            backgroundColor: "transparent",
            borderColor: "gray",
            borderBottomColor: "gray",
            marginTop: 50,
            width: "80%",
          }}
          selectedButtonStyle={{
            backgroundColor: "#06575c",
            borderBottomColor: "black",
          }}
          innerBorderStyle={{
            color: "gray",
          }}
        />
      </View>

      {view === 1 ? (
        <View style={styles.containerRegister}>
          <View style={styles.form}>
            <View style={{ flex: 6, width: "100%" }}>
              {registerView === 0 ? (
                <View>
                  <Input
                    inputContainerStyle={{
                      borderBottomWidth: 0,
                      // color: "white",
                    }}
                    leftIcon={
                      <Icon name="email-outline" size={20} color="lightgray" />
                    }
                    containerStyle={styles.Inputs}
                    onChangeText={setRegisterEmail}
                    placeholder="E-mail"
                    value={registerEmail}
                    placeholderTextColor="white"
                    inputStyle={{
                      color: "white",
                      fontSize: 16,
                    }}
                    // errorMessage="Error"
                    // errorStyle={{ color: "blue" }}
                    // renderErrorMessage
                  />
                  {/* <TextInput
                onChangeText={setRegisterEmail}
                placeholder="username@email.com"
                value={registerEmail}
              /> */}
                  <Input
                    inputContainerStyle={{ borderBottomWidth: 0 }}
                    leftIcon={<Icon name="key" size={20} color="lightgray" />}
                    containerStyle={styles.Inputs}
                    onChangeText={setRegisterPassword}
                    placeholder="Password"
                    secureTextEntry={true}
                    value={registerPassword}
                    // errorMessage="Error"
                    // errorStyle={{ color: "blue" }}

                    inputStyle={{
                      color: "white",
                      fontSize: 16,
                    }}
                    placeholderTextColor="white"
                    // renderErrorMessage
                  />
                  {/* <TextInput
                onChangeText={setRegisterPassword}
                placeholder="Password"
                secureTextEntry={true}
                value={registerPassword}
              /> */}
                  <Input
                    inputStyle={{
                      color: "white",
                      fontSize: 16,
                    }}
                    inputContainerStyle={{ borderBottomWidth: 0 }}
                    leftIcon={
                      <Icon name="lock-outline" size={20} color="lightgray" />
                    }
                    containerStyle={styles.Inputs}
                    onChangeText={setConfirmRegisterPassword}
                    placeholder="Confirm Password"
                    secureTextEntry={true}
                    value={confirmRegisterPassword}
                    placeholderTextColor="white"
                    // errorMessage="Error"
                    // errorStyle={{ color: "blue" }}
                    // renderErrorMessage
                  />
                </View>
              ) : (
                <View>
                  <Input
                    inputStyle={{
                      color: "white",
                      fontSize: 16,
                    }}
                    inputContainerStyle={{ borderBottomWidth: 0 }}
                    leftIcon={
                      <Icon
                        name="account-card-details"
                        size={20}
                        color="lightgray"
                      />
                    }
                    containerStyle={styles.Inputs}
                    placeholderTextColor="white"
                    onChangeText={setDisplayName}
                    placeholder="Display Name"
                    value={displayName}
                    // errorMessage="Error"
                    // errorStyle={{ color: "blue" }}
                    // renderErrorMessage
                  />

                  <Input
                    inputStyle={{
                      color: "white",
                      fontSize: 16,
                    }}
                    inputContainerStyle={{ borderBottomWidth: 0 }}
                    leftIcon={
                      <Icon
                        name="cellphone-android"
                        size={20}
                        color="lightgray"
                      />
                    }
                    containerStyle={styles.Inputs}
                    placeholderTextColor="white"
                    onChangeText={setPhone}
                    keyboardType="number-pad"
                    placeholder="Phone No."
                    value={phone}
                    // errorMessage="Error"
                    // errorStyle={{ color: "blue" }}
                    // renderErrorMessage
                  />

                  <Input
                    inputStyle={{
                      color: "white",
                      fontSize: 16,
                    }}
                    inputContainerStyle={{ borderBottomWidth: 0 }}
                    leftIcon={
                      <Icon name="percent" size={20} color="lightgray" />
                    }
                    containerStyle={styles.Inputs}
                    placeholderTextColor="white"
                    // onChangeText={}
                    keyboardType="number-pad"
                    placeholder="Referral Code"
                    value={phone}
                    // errorMessage="Error"
                    // errorStyle={{ color: "blue" }}
                    // renderErrorMessage
                  />
                </View>
              )}
            </View>

            <View
              style={{
                // flexDirection: "row",
                // justifyContent: "center",
                flex: 1,
                // backgroundColor: "green",
                width: "100%",
              }}
            >
              {registerView === 0 ? (
                <TouchableOpacity
                  onPress={() => setRegisterView(1)}
                  style={styles.loginButton}
                >
                  <Text style={{ color: "white" }}>Next</Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <TouchableOpacity
                    onPress={() => setRegisterView(0)}
                    style={styles.backButton}
                  >
                    <Text style={{ color: "#3e875b", fontWeight: "bold" }}>
                      Back
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRegister}
                    style={styles.registerButton}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Sign Up!
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      ) : view === 0 ? (
        <View style={styles.containerLogin}>
          {modalViewLogin === false && accessFlag == false ? (
            <View style={styles.form}>
              <View style={{ flex: 6, width: "100%" }}>
                <Input
                  inputStyle={{
                    color: "white",
                    fontSize: 16,
                  }}
                  inputContainerStyle={{ borderBottomWidth: 0 }}
                  leftIcon={
                    <Icon name="email-outline" size={20} color="lightgray" />
                  }
                  containerStyle={styles.Inputs}
                  onChangeText={setLoginEmail}
                  placeholder="E-mail"
                  value={loginEmail}
                  // errorMessage="Error"

                  placeholderTextColor="white"
                  // errorStyle={{ color: "blue" }}
                  // renderErrorMessage
                />
                <Input
                  inputStyle={{
                    color: "white",
                    fontSize: 16,
                  }}
                  inputContainerStyle={{ borderBottomWidth: 0 }}
                  leftIcon={<Icon name="key" size={20} color="lightgray" />}
                  containerStyle={styles.Inputs}
                  onChangeText={setLoginPassword}
                  placeholder="Password"
                  secureTextEntry={true}
                  value={loginPassword}
                  placeholderTextColor="white"
                />
              </View>

              <View
                style={{
                  // flexDirection: "row",
                  // justifyContent: "center",
                  flex: 1,
                  // backgroundColor: "green",
                  width: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => handleLogin()}
                >
                  <Text style={{ color: "white" }}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => setAccessFlag(true)}
                >
                  <Text style={{ color: "white" }}>Access Code</Text>
                </TouchableOpacity>
                <Text
                  onPress={() => setModalViewLogin(true)}
                  style={{ textAlign: "center", color: "white" }}
                >
                  Forgot Password?
                </Text>
              </View>
            </View>
          ) : modalViewLogin === true && accessFlag == false ? (
            <View style={styles.form}>
              <View
                style={{
                  flex: 6,
                  width: "100%",
                  // paddingTop: "15%",
                  justifyContent: "space-evenly",
                }}
              >
                <Input
                  inputContainerStyle={{ borderBottomWidth: 0 }}
                  leftIcon={
                    <Icon name="email-outline" size={20} color="lightgray" />
                  }
                  containerStyle={styles.Inputs}
                  onChangeText={setLoginEmail}
                  placeholder="E-mail"
                  value={loginEmail}
                  // errorMessage="Error"
                  inputStyle={{
                    color: "white",
                    fontSize: 16,
                  }}
                  placeholderTextColor="white"
                  // errorStyle={{ color: "blue" }}
                  // renderErrorMessage
                />
                <View>
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => handleSubmit()}
                  >
                    <Text style={{ color: "white" }}>Submit</Text>
                  </TouchableOpacity>
                  <Text
                    onPress={() => setModalViewLogin(false)}
                    style={{ textAlign: "center", color: "white" }}
                  >
                    Back to Login
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            modalViewLogin === false &&
            accessFlag == true && (
              <View style={styles.form}>
                {accessValid == false ? (
                  <View
                    style={{
                      flex: 6,
                      width: "100%",
                      // paddingTop: "15%",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <Input
                      inputContainerStyle={{ borderBottomWidth: 0 }}
                      leftIcon={
                        <Icon name="account-key" size={20} color="lightgray" />
                      }
                      containerStyle={styles.Inputs}
                      onChangeText={setLoginEmail}
                      placeholder="Access Code"
                      value={loginEmail}
                      // errorMessage="Error"
                      inputStyle={{
                        color: "white",
                        fontSize: 16,
                      }}
                      placeholderTextColor="white"
                      // errorStyle={{ color: "blue" }}
                      // renderErrorMessage
                    />
                    <View>
                      <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => setAccessValid(true)}
                      >
                        <Text style={{ color: "white" }}>Use Code</Text>
                      </TouchableOpacity>
                      <Text
                        onPress={() => setAccessFlag(false)}
                        style={{ textAlign: "center", color: "white" }}
                      >
                        Back to Login
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View
                    style={{
                      flex: 6,
                      width: "100%",
                      // paddingTop: "15%",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        //width: "80%",
                      }}
                    >
                      <Input
                        inputContainerStyle={{ borderBottomWidth: 0 }}
                        leftIcon={
                          <Icon
                            name="email-outline"
                            size={20}
                            color="lightgray"
                          />
                        }
                        containerStyle={styles.AccessInputs}
                        onChangeText={setLoginEmail}
                        // placeholder="E-mail"
                        value={"email@email.com"}
                        // errorMessage="Error"
                        inputStyle={{
                          color: "white",
                          fontSize: 16,
                          textAlign: "center",
                        }}
                        placeholderTextColor="white"
                        disabled={true}
                        // errorStyle={{ color: "blue" }}
                        // renderErrorMessage
                      />

                      <Input
                        inputContainerStyle={{ borderBottomWidth: 0 }}
                        // leftIcon={
                        //   <Icon
                        //     name="email-outline"
                        //     size={20}
                        //     color="lightgray"
                        //   />
                        // }
                        containerStyle={{
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "white",
                          height: 50,
                          width: "20%",
                          alignSelf: "center",
                          opacity: 0.8,
                          paddingLeft: 12,
                          marginTop: 20,
                        }}
                        // onChangeText={setLoginEmail}
                        // placeholder="QR"
                        //value={loginEmail}
                        // errorMessage="Error"
                        inputStyle={{
                          color: "white",
                          // fontSize: 16,
                          textAlign: "center",
                        }}
                        placeholderTextColor="white"
                        value="QR"
                        disabled={true}
                        // errorStyle={{ color: "blue" }}
                        // renderErrorMessage
                      />
                    </View>
                    <Input
                      inputContainerStyle={{ borderBottomWidth: 0 }}
                      leftIcon={
                        <Icon
                          name="account-card-details"
                          size={20}
                          color="lightgray"
                        />
                      }
                      containerStyle={styles.Inputs}
                      onChangeText={setLoginEmail}
                      placeholder="Display Name"
                      value={loginEmail}
                      // errorMessage="Error"
                      inputStyle={{
                        color: "white",
                        fontSize: 16,
                      }}
                      placeholderTextColor="white"
                      // errorStyle={{ color: "blue" }}
                      // renderErrorMessage
                    />
                    <Input
                      inputContainerStyle={{ borderBottomWidth: 0 }}
                      leftIcon={
                        <Icon
                          name="cellphone-android"
                          size={20}
                          color="lightgray"
                        />
                      }
                      containerStyle={styles.Inputs}
                      onChangeText={setLoginEmail}
                      placeholder="Phone No."
                      value={loginEmail}
                      // errorMessage="Error"
                      inputStyle={{
                        color: "white",
                        fontSize: 16,
                      }}
                      placeholderTextColor="white"
                      // errorStyle={{ color: "blue" }}
                      // renderErrorMessage
                    />

                    <View style={{ marginTop: "7%" }}>
                      <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => setAccessValid(false)}
                      >
                        <Text style={{ color: "white" }}>Next</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )
          )}

          {/* <View style={styles.footer}>
            <Text style={{ color: "white" }}>Don't Have an Account? </Text>
            <TouchableOpacity>
              <Text style={{ color: "darkblue" }}>Register</Text>
            </TouchableOpacity>
          </View> */}
        </View>
      ) : (
        <View>
          {/* <Text>Forgot Password</Text> */}
          <TextInput
            placeholder="Email"
            value={forgotPassEmail}
            onChangeText={setForgotPassEmail}
          />
          <TouchableOpacity onPress={handleSubmit}>
            <Text>Submit</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setView("Login")}>
            <Text>Back to Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A5155",
    alignItems: "center",
    //justifyContent: "center",
    // flexDirection: "column",
    // paddingHorizontal: 20,
    width: Math.round(Dimensions.get("window").width),
    height: Math.round(Dimensions.get("window").height),
  },
  buttonGroup: {
    alignItems: "center",
  },
  containerLogin: {
    flex: 1,
    backgroundColor: "#06575c",
    width: "80%",
    marginTop: -5,
    marginBottom: "5%",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "gray",
    // alignItems: "center",
    // justifyContent: "flex-start",
    // flexDirection: "column",
    // paddingHorizontal: 20,
    //width: Math.round(Dimensions.get("window").width),
    //height: Math.round(Dimensions.get("window").height),
  },
  containerRegister: {
    flex: 1,
    backgroundColor: "#06575c",
    width: "80%",
    marginTop: -5,
    marginBottom: "5%",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "gray",
    //alignItems: "center",
    //justifyContent: "center",
    // flexDirection: "column",
    // paddingHorizontal: 20,
    //width: Math.round(Dimensions.get("window").width),
    //height: Math.round(Dimensions.get("window").height),
  },
  headerText: {
    alignItems: "center",
    textAlign: "center",
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A5155",
    flex: 1,
    flexDirection: "row",
  },
  form: {
    flex: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  Inputs: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "white",
    height: 50,
    width: "80%",
    alignSelf: "center",
    opacity: 0.8,
    paddingLeft: 12,
    marginTop: 20,
    // color: "white",
  },
  AccessInputs: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "white",
    height: 50,
    width: "56%",
    alignSelf: "center",
    opacity: 0.8,
    paddingLeft: 12,
    marginTop: 20,
    marginEnd: 10,
    // color: "white",
  },
  Buttons: {
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "white",
    height: 35,
    width: "30%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    // marginRight:8,
    marginStart: "2%",
    marginEnd: "2%",
  },
  backButton: {
    backgroundColor: "lightgray",
    height: 40,
    width: "20%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 18,
    // marginRight:8,
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 10,
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: "#3e875b",
    height: 40,
    width: "80%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 18,
    // marginRight:8,
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 10,
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: "#3e875b",
    height: 40,
    width: "55%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 18,
    // marginRight:8,
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 10,
    marginBottom: 10,
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "red",
    flex: 1,
    // paddingTop: 20,
  },
});
