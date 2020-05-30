import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Modal,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  AsyncStorage,
} from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import db, { config } from "../db";
import LottieView from "lottie-react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AntDesign, Ionicons } from "react-native-vector-icons";
import { Input, Tooltip } from "react-native-elements";
import { ButtonGroup, Image } from "react-native-elements";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { Octicons } from "@expo/vector-icons";
const validator = require("email-validator");
// const config = {
//   apiKey: "AIzaSyBLdt-1iHho-6QGiq30plqoBz4Sjox4_hA",
//   authDomain: "capstone2020-b64fd.firebaseapp.com",
//   databaseURL: "https://capstone2020-b64fd.firebaseio.com",
//   projectId: "capstone2020-b64fd",
//   storageBucket: "capstone2020-b64fd.appspot.com",
//   messagingSenderId: "930744827368",
//   appId: "1:930744827368:web:6f2a6287721546d272785d",
// };
// try {
//   firebase.initializeApp(config);
// } catch (err) {
//   console.log(err);
// }

export default function Authentication(props) {
  const [view, setView] = useState(0);
  const [registerView, setRegisterView] = useState(0);
  const [modalViewLogin, setModalViewLogin] = useState(false);
  const [accessFlag, setAccessFlag] = useState(false);
  const [accessValid, setAccessValid] = useState(false);
  const buttons = ["Login", "Register"];

  //***** Access Code  */
  const [AccessCode, setAccessCode] = useState("");
  const [AccessEmail, setAccessEmail] = useState("email@email.com");
  const [AccessAmount, setAccessAmount] = useState("QR");
  const [accessDisplayName, setAccessDisplayName] = useState("");
  const [accessRef, setAccessRef] = useState();
  // ***** Register useState *****

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmRegisterPassword, setConfirmRegisterPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [referral, setReferral] = useState("");
  // the referralStatus will show if a referral code is used
  const [referralStatus, setReferralStatus] = useState("false");
  const [allUsers, setAllUsers] = useState([]);

  // ***** Login useState *****

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ***** Phone Verification useState *****
  // to know if the registration is completed, used for phone verification
  const [registered, setRegistered] = useState(false);
  const recaptchaVerifier = React.useRef(null);
  const [verificationId, setVerificationId] = React.useState();
  const [verificationCode, setVerificationCode] = React.useState();
  const firebaseConfig = firebase.apps.length
    ? firebase.app().options
    : undefined;
  const [message, showMessage] = React.useState(
    !firebaseConfig || Platform.OS === "web"
      ? {
          text:
            "To get started, provide a valid firebase config in App.js and open this snack on an iOS or Android device.",
        }
      : undefined
  );

  // Validation useStates for Form
  //Login
  const [loginEmailError, setLoginEmailError] = useState("transparent");
  const [loginPasswordError, setLoginPasswordError] = useState("transparent");

  //Reg
  const [registerEmailError, setRegisterEmailError] = useState("transparent");
  const [registerPasswordError, setRegisterPasswordError] = useState(
    "transparent"
  );
  const [
    confirmRegisterPasswordError,
    setConfirmRegisterPasswordError,
  ] = useState("transparent");
  const [phoneError, setPhoneErr] = useState("transparent");
  const [displayNameError, setDisplayErr] = useState("transparent");
  const [refErr, setRefErr] = useState("transparent");

  //Access

  const [accessCodeError, setAccessCodeError] = useState("transparent");
  const [displayErr2, setDisplayErr2] = useState("transparent");
  const [phoneErr2, setPhoneErr2] = useState("transparent");
  const [phoneAccess, setPhoneAccess] = useState("");

  const getAllUsers = () => {
    db.collection("users").onSnapshot((querySnapshot) => {
      let users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      setAllUsers([...users]);
    });
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  // used for sending verfication code to the phone.
  const handleSendVerificationCode = async () => {
    if (phone !== "") {
      // checking if Phone No. is 8 digits
      if (phone.length !== 8) {
        setPhoneErr("red");
        // return alert("Phone Number is Not Available!");
      } else {
        setPhoneErr("transparent");
      }
    } else {
      setPhoneErr("red");
      // return alert("Enter your Phone Number!");
    }

    if (displayName === "") {
      setDisplayErr("red");
      // return alert("Enter your Display Name!");
    } else {
      setDisplayErr("transparent");
    }

    try {
      const phoneProvider = new firebase.auth.PhoneAuthProvider();
      const verificationId = await phoneProvider.verifyPhoneNumber(
        `+974${phone}`,
        recaptchaVerifier.current
      );
      setVerificationId(verificationId);
      alert("Verification code has been sent to your phone.");
      setRegistered(true);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // checkReferral will check if the referral exists and the code is available
  const checkReferral = async () => {
    // checking if the referral code is not empty
    if (referral !== "") {
      // checking if referral code is 6 digits
      if (referral.length === 6) {
        // defining the users collection from firestore
        const users = db.collection("users");
        // getting the referral document if the referralCode is equal to the provided code
        // and using await because it will check all the documents
        let result = await users.where("referralCode", "==", referral).get();
        // it will check if there is only one document in the returned and
        // the referral doc exists
        if (result.size === 1) {
          //alert("Referral Code Added!");
          setRefErr("transparent");
          setReferralStatus("true");
        } else {
          //alert("Referral Code is Wrong!");
          setRefErr("red");
          setReferral("");
        }
      } else {
        //alert("Referral Code is Not Available!");
        setRefErr("red");
      }
    } else {
      //alert("Enter a Code First!");
      setRefErr("red");
    }
  };

  // handleRegister will create a the user and create the document for the user in the
  // database with all the needed information
  const handleRegister = async () => {
    if (
      verificationCode === null ||
      verificationCode === "" ||
      verificationCode === undefined
    ) {
      alert("Enter Verification Code");
      return;
    }
    try {
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      if (credential !== null) {
        try {
          // waiting for the user to be created in the authentication
          await firebase
            .auth()
            .createUserWithEmailAndPassword(registerEmail, registerPassword);

          // initiating user info in firebase funcations to add a display image and display name
          const response = await fetch(
            `https://us-central1-capstone2020-b64fd.cloudfunctions.net/initUser?uid=${
              firebase.auth().currentUser.uid
            }&phoneNumber=${phone}&displayName=${displayName}&referralStatus=${referralStatus}&referral=${referral}`
          );
          await AsyncStorage.setItem(firebase.auth().currentUser.uid, true);
          //sending the user a verification email
          await firebase
            .auth()
            .currentUser.sendEmailVerification()
            .then(() => {
              console.log("Email Sent!");
            })
            .catch((err) => {
              console.log(err);
            });
        } catch (error) {
          alert(error.message);
        }
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleLogin = async () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(loginEmail, loginPassword)
      .then(() => {
        setLoginEmailError("transparent");
        setLoginPasswordError("transparent");
        console.log("successful login!");
      })
      .catch((err) => {
        setLoginPasswordError("red");
      });
  };

  const handleSubmit = async () => {
    firebase
      .auth()
      .sendPasswordResetEmail(loginEmail)
      .then(() => {
        alert("Email Sent");
        setLoginEmailError("transparent");
        setModalViewLogin(false);
      })
      .catch((err) => {
        setLoginEmailError("red");
      });
  };

  const emailValidity = () => {
    if (validator.validate(registerEmail)) {
      const emailParts = registerEmail.split("@");
      const providers = ["gmail", "yahoo", "outlook", "hotmail", "protonmail"];
      const providerParts = emailParts[1].split(".");
      const provider = providerParts[0];
      return providers.includes(provider);
    } else {
      alert("Not a valid email");
    }
  };

  const passwordStrength = () => {
    const strongRegex = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
    );
    console.log("pass", strongRegex.test(registerPassword));
    return strongRegex.test(registerPassword);
  };

  const registerNext = async () => {
    const result = true;
    allUsers.map((item) => {
      if (item.email === registerEmail) {
        alert("Email already exists");
        result = false;
      }
    });

    if (emailValidity()) {
      let count = 0;

      if (!registerEmail.includes("@")) {
        setRegisterEmailError("red");
      } else {
        setRegisterEmailError("transparent");
        count = count + 1;
      }

      if (!passwordStrength()) {
        setRegisterPasswordError("red");
      } else {
        setRegisterPasswordError("transparent");
        count = count + 1;
      }

      if (registerPassword !== confirmRegisterPassword) {
        setConfirmRegisterPasswordError("red");
      } else {
        setConfirmRegisterPasswordError("transparent");
        count = count + 1;
      }

      if (count === 3 && result) {
        setRegisterView(1);
      }
    } else {
      alert("Enter a real email address");
    }
  };

  const handleAccessCode = async () => {
    if (AccessCode.length !== 8) {
      setAccessCodeError("red");
    } else {
      const result = await db
        .collectionGroup("gifts")
        .where("expiryDate", ">", new Date())
        .where("code", "==", AccessCode)
        .where("status", "==", false)
        .get();
      if (result.size === 1) {
        result.forEach((doc) => {
          setAccessRef(doc.ref);
          setAccessEmail(doc.data().email);
          setAccessAmount("QR " + doc.data().giftBalance);
          setAccessCodeError("transparent");
          setAccessValid(true);
        });
      } else {
        setAccessCodeError("red");
      }
    }
  };

  const handleAccessCodeData = async () => {
    if (accessDisplayName === "") {
      return setDisplayErr2("red");
    } else {
      const result = allUsers.filter((item) => {
        return item.displayName == accessDisplayName;
      });
      if (result.length > 0) {
        return setDisplayErr2("red");
      } else {
        setDisplayErr2("transparent");
      }
    }
    if (phoneAccess.length !== 8) {
      return setPhoneErr2("red");
    } else {
      setPhoneErr2("transparent");
    }
    accessRef.update({ status: true });

    await firebase.auth().signInAnonymously();

    const response = await fetch(
      `https://us-central1-capstone2020-b64fd.cloudfunctions.net/initUser?uid=${
        firebase.auth().currentUser.uid
      }&phoneNumber=${phoneAccess}&displayName=${accessDisplayName}&referralStatus=${"false"}&role=${"guest"}&path=${
        accessRef.path
      }`
    );
  };

  const handleSetRegisterView = () => {
    setRegisterView(0);
    setRegistered(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LottieView
          source={require("../assets/login.json")}
          autoPlay
          loop
          style={{ position: "relative", width: "55%", paddingTop: "5%" }}
        />
      </View>
      <View style={styles.buttonGroup}>
        <ButtonGroup
          onPress={() => (view === 1 ? setView(0) : setView(1))}
          selectedIndex={view}
          selectedTextStyle={{ color: "#20365F" }}
          textStyle={{ color: "white", fontSize: 21 }}
          buttons={buttons}
          containerStyle={{
            backgroundColor: "#20365F",
            borderTopRightRadius: 30,
            borderTopLeftRadius: 30,
            borderWidth: 0,
            borderColor: "white",
            marginTop: 50,
            width: "87%",
          }}
          selectMultiple={false}
          selectedButtonStyle={{
            backgroundColor: "white",
          }}
          innerBorderStyle={{
            color: "transparent",
          }}
        />
      </View>

      {view === 1 ? (
        <View style={styles.containerRegister}>
          <View style={styles.form}>
            <FirebaseRecaptchaVerifierModal
              ref={recaptchaVerifier}
              firebaseConfig={config}
            />
            <View style={{ flex: 6, width: "100%" }}>
              {!registered ? (
                registerView === 0 ? (
                  <View>
                    <Input
                      inputContainerStyle={{
                        borderBottomWidth: 0,
                        // color: "white",
                      }}
                      leftIcon={
                        <Icon name="email-outline" size={20} color="#20365F" />
                      }
                      containerStyle={styles.Inputs}
                      onChangeText={setRegisterEmail}
                      placeholder="E-mail"
                      value={registerEmail}
                      placeholderTextColor="#20365F"
                      inputStyle={{
                        color: "#20365F",
                        fontSize: 16,
                      }}
                      errorMessage="* Invalid E-mail"
                      errorStyle={{ color: registerEmailError }}
                      renderErrorMessage
                    />

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        // width: "85%",

                        // paddingLeft: "10%",
                      }}
                    >
                      <Input
                        inputContainerStyle={{ borderBottomWidth: 0 }}
                        leftIcon={<Icon name="key" size={20} color="#20365F" />}
                        rightIcon={
                          <Tooltip
                            height={150}
                            width={370}
                            backgroundColor={"#20365F"}
                            popover={
                              <Text style={{ color: "white", fontSize: 18 }}>
                                Your password must be between 8 and 30
                                characters. Password must contain at least one
                                uppercase, or capital, letter (ex: A, B, etc.)
                                One number digit and at least one special
                                character.
                              </Text>
                            }
                            containerStyle={{
                              justifyContent: "center",
                              alignSelf: "center",
                            }}
                          >
                            <AntDesign
                              name="exclamationcircleo"
                              size={22}
                              color="#20365F"
                            />
                          </Tooltip>
                        }
                        containerStyle={styles.Inputs}
                        onChangeText={setRegisterPassword}
                        placeholder="Password"
                        secureTextEntry={true}
                        value={registerPassword}
                        errorMessage="* Enter a strong password"
                        errorStyle={{ color: registerPasswordError }}
                        inputStyle={{
                          color: "#20365F",
                          fontSize: 16,
                        }}
                        placeholderTextColor="#20365F"
                        renderErrorMessage
                      />
                    </View>
                    <Input
                      inputStyle={{
                        color: "#20365F",
                        fontSize: 16,
                      }}
                      inputContainerStyle={{ borderBottomWidth: 0 }}
                      leftIcon={
                        <Icon name="lock-outline" size={20} color="#20365F" />
                      }
                      containerStyle={styles.Inputs}
                      onChangeText={setConfirmRegisterPassword}
                      placeholder="Confirm Password"
                      secureTextEntry={true}
                      value={confirmRegisterPassword}
                      placeholderTextColor="#20365F"
                      errorMessage="* Password doesn't match"
                      errorStyle={{ color: confirmRegisterPasswordError }}
                      renderErrorMessage
                    />
                  </View>
                ) : (
                  <View>
                    <Input
                      inputStyle={{
                        color: "#20365F",
                        fontSize: 16,
                      }}
                      inputContainerStyle={{ borderBottomWidth: 0 }}
                      leftIcon={
                        <Icon
                          name="account-card-details"
                          size={20}
                          color="#20365F"
                        />
                      }
                      containerStyle={styles.Inputs}
                      placeholderTextColor="#20365F"
                      onChangeText={setDisplayName}
                      placeholder="Display Name"
                      value={displayName}
                      errorMessage="* Invalid name"
                      errorStyle={{ color: displayNameError }}
                      renderErrorMessage
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        alignContent: "center",
                      }}
                    >
                      <Input
                        inputStyle={{
                          color: "#20365F",
                          fontSize: 16,
                        }}
                        inputContainerStyle={{ borderBottomWidth: 0 }}
                        // leftIcon={
                        //   <Image
                        //     source={require("../assets/qatarFlag.png")}
                        //     style={{ width: 20, height: 25 }}
                        //   />
                        // }
                        containerStyle={{
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "#20365F",
                          height: 50,
                          width: "25%",
                          alignSelf: "center",
                          opacity: 0.8,
                          paddingLeft: 10,
                          marginTop: 20,
                          marginLeft: 20,
                          paddingTop:5
                        }}
                        placeholderTextColor="#20365F"
                        keyboardType="number-pad"
                        placeholder="+974"
                        errorMessage="* Invalid Phone No."
                        errorStyle={{ color: phoneError }}
                        renderErrorMessage
                        disabled={true}
                      />
                      <Input
                        inputStyle={{
                          color: "#20365F",
                          fontSize: 16,
                        }}
                        inputContainerStyle={{ borderBottomWidth: 0 }}
                        // leftIcon={
                        //   <Icon
                        //     name="cellphone-android"
                        //     size={20}
                        //     color="#20365F"
                        //   />
                        // }
                        containerStyle={{
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "#20365F",
                          height: 50,
                          width: "50%",
                          alignSelf: "center",
                          opacity: 0.8,
                          paddingLeft: 12,
                          marginTop: 20,
                          marginRight: 25,
                          paddingTop: "1%",
                        }}
                        placeholderTextColor="#20365F"
                        onChangeText={setPhone}
                        keyboardType="number-pad"
                        placeholder="Phone No."
                        value={phone}
                        errorMessage="* Invalid Phone No."
                        errorStyle={{ color: phoneError }}
                        renderErrorMessage
                      />
                    </View>
                    <View style={{ flexDirection: "row" , justifyContent:'center'}}>
                      <Input
                        inputStyle={{
                          fontSize: 16,
                          // width:'50%'
                        }}
                        inputContainerStyle={{ borderBottomWidth: 0 }}
                        leftIcon={
                          <Icon
                            name="account-card-details"
                            size={20}
                            color="lightgray"
                          />
                        }
                        containerStyle={styles.useCodeInputs}
                        placeholderTextColor="white"
                        onChangeText={setReferral}
                        placeholder="Referral Code"
                        value={referral}
                        errorMessage="* Invalid Code"
                        errorStyle={{ color: refErr }}
                        renderErrorMessage
                      />

                      <TouchableOpacity
                        onPress={checkReferral}
                        style={styles.useCodeButton}
                      >
                        <Text style={{ color: "white", fontWeight: "bold" }}>
                          Use Code
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              ) : (
                <View>
                  <Input
                    inputStyle={{
                      //color: "white",
                      fontSize: 16,
                    }}
                    editable={!!verificationId}
                    // inputContainerStyle={{ borderBottomWidth: 10 }}
                    leftIcon={
                      <Octicons name="verified" size={20} color="lightgray" />
                    }
                    containerStyle={styles.Inputs}
                    placeholderTextColor="gray"
                    onChangeText={setVerificationCode}
                    placeholder="Verification Code"
                  />
                </View>
              )}
            </View>

            <View
              style={{
                flex: 1,
                width: "100%",
              }}
            >
              {registerView === 0 ? (
                <TouchableOpacity
                  onPress={() => registerNext()}
                  style={styles.loginButton}
                >
                  <Text style={{ color: "white" }}>Next</Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <TouchableOpacity
                    onPress={() => handleSetRegisterView()}
                    style={styles.backButton}
                  >
                    <Ionicons name="ios-arrow-back" size={30} color="#20365F" />
                  </TouchableOpacity>
                  {!registered ? (
                    <TouchableOpacity
                      onPress={() => handleSendVerificationCode()}
                      style={styles.registerButton}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        Sign Up!
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={handleRegister}
                      disabled={!verificationId}
                      style={{ ...styles.registerButton }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        Confirm Verification Code
                      </Text>
                    </TouchableOpacity>
                  )}
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
                    color: "#20365F",
                    fontSize: 16,
                  }}
                  inputContainerStyle={{ borderBottomWidth: 0 }}
                  leftIcon={
                    <Icon name="email-outline" size={20} color="#20365F" />
                  }
                  containerStyle={styles.Inputs}
                  onChangeText={setLoginEmail}
                  placeholder="E-mail"
                  value={loginEmail}
                  errorMessage="* E-mail not valid"
                  placeholderTextColor="#20365F"
                  errorStyle={{
                    color: loginEmailError,
                  }}
                  renderErrorMessage
                />
                <Input
                  inputStyle={{
                    color: "#20365F",
                    fontSize: 16,
                  }}
                  inputContainerStyle={{ borderBottomWidth: 0 }}
                  leftIcon={<Icon name="key" size={20} color="#20365F" />}
                  containerStyle={styles.Inputs}
                  onChangeText={setLoginPassword}
                  placeholder="Password"
                  secureTextEntry={true}
                  value={loginPassword}
                  placeholderTextColor="#20365F"
                  errorMessage="* Please check your email and password"
                  errorStyle={{
                    color: loginPasswordError,
                    fontSize: 13,
                  }}
                  renderErrorMessage
                />
              </View>

              <View
                style={{
                  flex: 1,
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
                  style={{ textAlign: "center", color: "#20365F" }}
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
                  justifyContent: "space-evenly",
                }}
              >
                <Input
                  inputContainerStyle={{ borderBottomWidth: 0 }}
                  leftIcon={
                    <Icon name="email-outline" size={20} color="#20365F" />
                  }
                  containerStyle={styles.Inputs}
                  onChangeText={setLoginEmail}
                  placeholder="E-mail"
                  value={loginEmail}
                  inputStyle={{
                    fontSize: 16,
                  }}
                  placeholderTextColor="#20365F"
                  errorMessage="* Email not valid"
                  errorStyle={{ color: loginEmailError }}
                  renderErrorMessage
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
                    style={{ textAlign: "center", color: "#20365F" }}
                  >
                    Back to Login
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            modalViewLogin === false &&
            accessFlag === true && (
              <View style={styles.form}>
                {accessValid == false ? (
                  <View
                    style={{
                      flex: 6,
                      width: "100%",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <Input
                      inputContainerStyle={{ borderBottomWidth: 0 }}
                      leftIcon={
                        <Icon name="account-key" size={20} color="#20365F" />
                      }
                      containerStyle={styles.Inputs}
                      onChangeText={setAccessCode}
                      placeholder="Access Code"
                      value={AccessCode}
                      errorMessage="* Code Invalid"
                      inputStyle={{
                        color: "#20365F",
                        fontSize: 16,
                      }}
                      placeholderTextColor="#20365F"
                      errorStyle={{ color: accessCodeError }}
                      renderErrorMessage
                    />
                    <View>
                      <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => handleAccessCode()}
                      >
                        <Text style={{ color: "white" }}>Use Code</Text>
                      </TouchableOpacity>
                      <Text
                        onPress={() => setAccessFlag(false)}
                        style={{ textAlign: "center", color: "#20365F" }}
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
                      justifyContent: "space-evenly",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Input
                        inputContainerStyle={{ borderBottomWidth: 0 }}
                        leftIcon={
                          <Icon
                            name="email-outline"
                            size={20}
                            color="#20365F"
                          />
                        }
                        containerStyle={styles.AccessInputs}
                        value={AccessEmail}
                        inputStyle={{
                          color: "#20365F",
                          fontSize: 16,
                          textAlign: "center",
                        }}
                        placeholderTextColor="#20365F"
                        disabled={true}
                      />

                      <Input
                        inputContainerStyle={{ borderBottomWidth: 0 }}
                        // leftIcon={
                        //   <Icon
                        //     name="email-outline"
                        //     size={20}
                        //     color="#20365F"
                        //   />
                        // }
                        containerStyle={{
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "#20365F",
                          height: 50,
                          width: "20%",
                          alignSelf: "center",
                          opacity: 0.8,
                          paddingLeft: 12,
                          marginTop: 20,
                          paddingTop: "1%",
                        }}
                        inputStyle={{
                          color: "#20365F",
                          textAlign: "center",
                        }}
                        placeholderTextColor="#20365F"
                        value={AccessAmount}
                        disabled={true}
                      />
                    </View>
                    <Input
                      inputContainerStyle={{ borderBottomWidth: 0 }}
                      leftIcon={
                        <Icon
                          name="account-card-details"
                          size={20}
                          color="#20365F"
                        />
                      }
                      containerStyle={styles.Inputs}
                      onChangeText={setAccessDisplayName}
                      placeholder="Display Name"
                      value={accessDisplayName}
                      inputStyle={{
                        fontSize: 16,
                      }}
                      placeholderTextColor="#20365F"
                      errorMessage="* Invalid Display Name"
                      errorStyle={{ color: displayErr2 }}
                      renderErrorMessage
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        alignContent: "center",
                      }}
                    >
                      <Input
                        inputStyle={{
                          color: "#20365F",
                          fontSize: 16,
                        }}
                        inputContainerStyle={{ borderBottomWidth: 0 }}
                        // leftIcon={
                        //   <Image
                        //     source={require("../assets/qatarFlag.png")}
                        //     style={{ width: 20, height: 25 }}
                        //   />
                        // }
                        containerStyle={{
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "#20365F",
                          height: 50,
                          width: "25%",
                          alignSelf: "center",
                          opacity: 0.8,
                          paddingLeft: 10,
                          marginTop: 20,
                          marginLeft: 20,
                        }}
                        placeholderTextColor="#20365F"
                        keyboardType="number-pad"
                        placeholder="+974"
                        errorMessage="* Invalid Phone No."
                        errorStyle={{ color: phoneErr2 }}
                        renderErrorMessage
                        disabled={true}
                      />
                      <Input
                        inputStyle={{
                          color: "#20365F",
                          fontSize: 16,
                        }}
                        inputContainerStyle={{ borderBottomWidth: 0 }}
                        // leftIcon={
                        //   <Icon
                        //     name="cellphone-android"
                        //     size={20}
                        //     color="#20365F"
                        //   />
                        // }
                        containerStyle={{
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "#20365F",
                          height: 50,
                          width: "50%",
                          alignSelf: "center",
                          opacity: 0.8,
                          paddingLeft: 12,
                          marginTop: 20,
                          marginRight: 25,
                          paddingTop: "1%",
                        }}
                        placeholderTextColor="#20365F"
                        onChangeText={setPhoneAccess}
                        keyboardType="number-pad"
                        placeholder="Phone No."
                        value={phoneAccess}
                        errorMessage="* Invalid Phone No."
                        errorStyle={{ color: phoneErr2 }}
                        renderErrorMessage
                      />
                    </View>

                    <View style={{ marginTop: "7%" }}>
                      <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleAccessCodeData}
                      >
                        <Text style={{ color: "white" }}>Next</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )
          )}
        </View>
      ) : (
        <View>
          {/* <Text>Forgot Password</Text> */}
          {/* <TextInput
          placeholder="Email"
          value={forgotPassEmail}
          onChangeText={setForgotPassEmail}
        />
        <TouchableOpacity onPress={handleSubmit}>
          <Text>Submit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setView("Login")}>
          <Text>Back to Login</Text>
        </TouchableOpacity> */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#20365F",
    alignItems: "center",
    width: Math.round(Dimensions.get("window").width),
    height: Math.round(Dimensions.get("window").height),
  },
  buttonGroup: {
    alignItems: "center",
  },
  containerLogin: {
    flex: 1,
    backgroundColor: "white",
    width: "87%",
    marginTop: -6,
    marginBottom: "5%",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "white",
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  containerRegister: {
    flex: 1,
    backgroundColor: "white",
    width: "87%",
    marginTop: -6,
    marginBottom: "5%",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "white",
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  headerText: {
    alignItems: "center",
    textAlign: "center",
    color: "#20365F",
    fontSize: 34,
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#415598",
    flex: 1,
    flexDirection: "row",
  },
  form: {
    flex: 4,
    paddingTop: "15%",
    justifyContent: "center",
    alignItems: "center",
  },
  Inputs: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#20365F",
    height: 50,
    width: "80%",
    alignSelf: "center",
    opacity: 0.8,
    paddingLeft: 12,
    marginTop: 20,
  },
  AccessInputs: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#20365F",
    height: 50,
    width: "56%",
    alignSelf: "center",
    opacity: 0.8,
    paddingLeft: 12,
    marginTop: 20,
    marginEnd: 10,
  },
  Buttons: {
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#20365F",
    height: 35,
    width: "30%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginStart: "2%",
    marginEnd: "2%",
  },
  backButton: {
    backgroundColor: "white",
    height: 50,
    width: "15%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginEnd: "2%",
    borderRadius: 30,
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: "#20365F",
    height: 50,
    width: "80%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 30,
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: "#20365F",
    height: 50,
    width: "55%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 30,
    marginBottom: 10,
  },
  useCodeButton: {
    backgroundColor: "#20365F",
    height: 50,
    width: "26%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "3%",
    borderRadius: 10,
    marginBottom: 0,
    marginTop:20
  },
  useCodeInputs: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#20365F",
    height: 50,
    width: "52%",
    alignSelf: "center",
    opacity: 0.8,
    paddingLeft: 10,
    marginTop: 20,
    marginLeft:8
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    flex: 0.7,
    paddingTop: "9%",
  },
});
