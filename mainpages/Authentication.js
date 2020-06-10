import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableOpacity,
  Dimensions,
  Modal,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  AsyncStorage,
  ImageBackground,
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
  const [phoneNumbers, setPhoneNumbers] = useState([]);

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

  // ----------------------------------- FORGET PASSWORD ---------------------------------------

  const [forgotView, setForgotView] = useState(0);

  const [forgotEmail, setForgotEmail] = useState("");
  const [showEmailErr, setShowEmailErr] = useState(false);

  const [resetCode, setResetCode] = useState("");
  const [showResetCodeErr, setShowResetCodeErr] = useState(false);
  const [resetErrMsg, setResetErrMsg] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [showNewPassErr, setShowNewPassErr] = useState(false);
  const [newPasswordErrMsg, setNewPasswordErrMsg] = useState("");

  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCofirmNewPassErr, setShowCofirmNewPassErr] = useState(false);
  const [cofirmNewPassErrMsg, setCofirmNewPassErrMsg] = useState("");

  const [allEmails, setAllEmails] = useState([]);
  const [emailErrMsg, setEmailErrMsg] = useState("");

  // --------------------------------------------- END OF ALL STATES --------------------------------

  const getAllUsers = () => {
    db.collection("users").onSnapshot((querySnapshot) => {
      let users = [];
      let emails = [];
      querySnapshot.forEach((doc) => {
        emails.push(doc.data().email);
        users.push({ id: doc.id, ...doc.data() });
      });
      setAllEmails([...emails]);
      setAllUsers([...users]);
    });
  };

  const getAllPhoneNumber = () => {
    db.collection("users").onSnapshot((querySnapshot) => {
      let phones = [];
      querySnapshot.forEach((doc) => {
        phones.push(doc.data().phone);
      });
      console.log("phones            ", phones);
      setPhoneNumbers([...phones]);
    });
  };

  useEffect(() => {
    getAllUsers();
    getAllPhoneNumber();
  }, []);

  const changePassword = async () => {
    if (newPassword === "" || confirmNewPassword === "") {
      setShowNewPassErr(true);
      setNewPasswordErrMsg("* Enter Password");
      setShowCofirmNewPassErr(true);
      setCofirmNewPassErrMsg("* Enter Confirm Password");
    } else {
      if (newPassword !== confirmNewPassword) {
        setShowCofirmNewPassErr(true);
        setShowNewPassErr(true);
        setCofirmNewPassErrMsg("* Passwords do not match");
        setNewPasswordErrMsg("* Passwords do not match");
      } else {
        // add change password code
        if (passwordStrength(newPassword)) {
          let forgotUser = allUsers.filter(
            (user) => user.email === forgotEmail
          );
          forgotUser = forgotUser[0];
          const update = firebase.functions().httpsCallable("updatePassword");
          const response = await update({
            user: forgotUser,
            password: newPassword,
          });

          setForgotView(0);
          setForgotEmail("");
          setResetCode("");
          setNewPassword("");
          setModalViewLogin(false);
          setConfirmNewPassword("");
        } else {
          setShowCofirmNewPassErr(true);
          setShowNewPassErr(true);
          setCofirmNewPassErrMsg("* Enter a strong password");
          setNewPasswordErrMsg("* Enter a strong password");
        }
      }
    }
  };

  // used for sending verfication code to the phone.
  const handleSendVerificationCode = async () => {
    if (phone !== "") {
      // checking if Phone No. is 8 digits
      if (phone.length !== 8) {
        setPhoneErr("red");
        return;
        // return alert("Phone Number is Not Available!");
      } else {
        setPhoneErr("transparent");
      }
    } else {
      setPhoneErr("red");
      return;
      // return alert("Enter your Phone Number!");
    }

    if (displayName === "") {
      setDisplayErr("red");
      return;
      // return alert("Enter your Display Name!");
    } else {
      const result = allUsers.filter((item) => {
        return item.displayName == displayName;
      });
      if (result.length > 0) {
        return setDisplayErr("red");
      } else {
        setDisplayErr("transparent");
      }
    }

    if (!phoneNumbers.includes(`+974${phone}`)) {
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
    } else {
      alert("Phone Number Already Exists");
    }

    // trying creating user and if there is any error it will alert it for example:
    // email is not corrent or password is not strong
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
  // 12.1
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
    if (forgotEmail.length !== 0) {
      if (emailValidity(forgotEmail)) {
        if (allEmails.includes(forgotEmail)) {
          //call a server side function
          //to send the code.
          //need to get email then id of the acc
          // where the send email code at?
          let forgotUser = allUsers.filter(
            (user) => user.email === forgotEmail
          );
          forgotUser = forgotUser[0];
          console.log("submitting");
          const test = firebase.functions().httpsCallable("sendResetPassCode");
          const response = await test({ id: forgotUser.id });

          setForgotView(1);

          console.log(response);
        } else {
          setShowEmailErr(true);
          setEmailErrMsg("* Email does not exists");
        }
      } else {
        setShowEmailErr(true);
        setEmailErrMsg("* Invalid Email");
      }
    } else {
      setShowEmailErr(true);
      setEmailErrMsg("* Enter Email");
    }
  };

  const emailValidity = (email) => {
    if (validator.validate(email)) {
      const emailParts = email.split("@");
      const providers = ["gmail", "yahoo", "outlook", "hotmail", "protonmail"];
      const providerParts = emailParts[1].split(".");
      const provider = providerParts[0];
      return providers.includes(provider);
    }
  };

  const passwordStrength = (password) => {
    const strongRegex = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
    );
    console.log("pass", strongRegex.test(password));
    return strongRegex.test(password);
  };

  const registerNext = async () => {
    const result = true;
    allUsers.map((item) => {
      if (item.email === registerEmail) {
        alert("Email already exists");
        result = false;
      }
    });

    if (emailValidity(registerEmail)) {
      let count = 0;

      if (!registerEmail.includes("@")) {
        setRegisterEmailError("red");
      } else {
        setRegisterEmailError("transparent");
        count = count + 1;
      }

      if (!passwordStrength(registerPassword)) {
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
      // alert("Enter a real email address");
      setRegisterEmailError("red");
      // setRegisterPasswordError("red");
      // setConfirmRegisterPasswordError("red");
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

  const validateResetCode = async () => {
    if (resetCode.length === 0) {
      setShowResetCodeErr(true);
      setResetErrMsg("* Enter Reset Code");
    } else {
      if (resetCode.length === 8) {
        // Add server call here
        let forgotUser = allUsers.filter(
          (users) => users.email === forgotEmail
        );
        forgotUser = forgotUser[0];
        let code = forgotUser.resetPassword.filter(
          (code) => code.expired === false
        );
        code = code[0];
        console.log("code line 502", code);
        if (resetCode === code.passwordCode) {
          setForgotView(2);
        } else {
          setShowResetCodeErr(true);
          setResetErrMsg("* Invalid Reset Code");
        }
      } else {
        setShowResetCodeErr(true);
        setResetErrMsg("* Invalid Reset Code");
      }
    }
  };

  ///////////////////////////////Font-End////////////////////////////////

  useEffect(() => {
    Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
      Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
    };
  }, []);

  const _keyboardDidShow = () => {
    // console.log("keyyyyyyyyyyyyyyyShow");

    setMargin(-200);
  };

  const _keyboardDidHide = () => {
    // console.log("keyyyyyyyyyyyyyyyHide");
    setMargin(0);
  };

  const [marginVal, setMargin] = useState(0);
  /////////////////////////////////////////////////////////////////////////////////////

  return (
    <View style={{ backgroundColor: "#185a9d", flex: 1, width: "100%" }}>
      <ImageBackground
        source={require("../assets/bg/bg5.png")}
        style={{ width: "100%", height: "100%", position: "absolute" }}
      >
        <KeyboardAvoidingView
          // behavior="position"
          // behavior="height"
          // behavior="padding"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          // contentContainerStyle={{ flex: 1 }}
          style={{
            width: "100%",
            flex: 1,
            // backgroundColor: "#185a9d",
            height: "100%",
          }}
          // keyboardVerticalOffset={-100}
        >
          <View
            style={[
              styles.container,
              { marginTop: Platform.isPad ? 0 : marginVal },
            ]}
          >
            {/* {marginVal === 0 && ( */}
            <View style={styles.header}>
              <LottieView
                source={require("../assets/login1.json")}
                autoPlay
                loop
                style={{
                  position: "relative",
                  // width: "60%",
                  flex: 1,
                  alignSelf: "center",
                  // backgroundColor: "red",
                }}
              />
            </View>
            {/* )} */}
            <View style={styles.buttonGroup}>
              <ButtonGroup
                onPress={() => (view === 1 ? setView(0) : setView(1))}
                selectedIndex={view}
                selectedTextStyle={{ color: "#185a9d" }}
                textStyle={{ color: "white", fontSize: 21 }}
                buttons={buttons}
                containerStyle={{
                  backgroundColor: "transparent",
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
                  <View
                    style={{
                      flex: 6,
                      width: "100%",
                      justifyContent: "center",
                      // backgroundColor: "red",
                      // minHeight: "70%",
                    }}
                  >
                    {!registered ? (
                      registerView === 0 ? (
                        <View>
                          <Input
                            inputContainerStyle={{
                              borderBottomWidth: 0,
                              // color: "white",
                            }}
                            leftIcon={
                              <Icon
                                name="email-outline"
                                size={20}
                                color="#185a9d"
                              />
                            }
                            containerStyle={styles.Inputs}
                            onChangeText={setRegisterEmail}
                            placeholder="E-mail *"
                            value={registerEmail}
                            placeholderTextColor="#185a9d"
                            inputStyle={{
                              color: "#185a9d",
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
                              leftIcon={
                                <Icon name="key" size={20} color="#185a9d" />
                              }
                              rightIcon={
                                marginVal === 0 && (
                                  <Tooltip
                                    // disabled
                                    height={180}
                                    width={370}
                                    backgroundColor={"#185a9d"}
                                    popover={
                                      <View>
                                        <Text
                                          style={{
                                            color: "white",
                                            fontSize: 18,
                                          }}
                                        >
                                          - Your password must be between 8 and
                                          30 characters.
                                        </Text>
                                        <Text
                                          style={{
                                            color: "white",
                                            fontSize: 18,
                                          }}
                                        >
                                          - Password must contain at least one
                                          uppercase, or capital, letter (ex: A,
                                          B, etc.)
                                        </Text>
                                        <Text
                                          style={{
                                            color: "white",
                                            fontSize: 18,
                                          }}
                                        >
                                          - One number digit and at least one
                                          special character.
                                        </Text>
                                      </View>
                                    }
                                    containerStyle={{
                                      justifyContent: "center",
                                      alignSelf: "center",
                                    }}
                                  >
                                    <AntDesign
                                      name="exclamationcircleo"
                                      size={22}
                                      color="#185a9d"
                                    />
                                  </Tooltip>
                                )
                              }
                              containerStyle={styles.Inputs}
                              onChangeText={setRegisterPassword}
                              placeholder="Password *"
                              secureTextEntry={true}
                              value={registerPassword}
                              errorMessage="* Enter a strong password"
                              errorStyle={{ color: registerPasswordError }}
                              inputStyle={{
                                color: "#185a9d",
                                fontSize: 16,
                              }}
                              placeholderTextColor="#185a9d"
                              renderErrorMessage
                            />
                          </View>
                          <Input
                            inputStyle={{
                              color: "#185a9d",
                              fontSize: 16,
                            }}
                            inputContainerStyle={{ borderBottomWidth: 0 }}
                            leftIcon={
                              <Icon
                                name="lock-outline"
                                size={20}
                                color="#185a9d"
                              />
                            }
                            containerStyle={styles.Inputs}
                            onChangeText={setConfirmRegisterPassword}
                            placeholder="Confirm Password *"
                            secureTextEntry={true}
                            value={confirmRegisterPassword}
                            placeholderTextColor="#185a9d"
                            errorMessage="* Password doesn't match"
                            errorStyle={{ color: confirmRegisterPasswordError }}
                            renderErrorMessage
                          />
                        </View>
                      ) : (
                        <View>
                          <Input
                            inputStyle={{
                              color: "#185a9d",
                              fontSize: 16,
                            }}
                            inputContainerStyle={{ borderBottomWidth: 0 }}
                            leftIcon={
                              <Icon
                                name="account-card-details"
                                size={20}
                                color="#185a9d"
                              />
                            }
                            containerStyle={styles.Inputs}
                            placeholderTextColor="#185a9d"
                            onChangeText={setDisplayName}
                            placeholder="Display Name *"
                            value={displayName}
                            errorMessage="* Invalid name"
                            errorStyle={{ color: displayNameError }}
                            renderErrorMessage
                          />
                          {/* <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-evenly",
                          alignContent: "center",
                        }}
                      >
                        <Input
                          inputStyle={{
                            color: "#185a9d",
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
                            borderColor: "#185a9d",
                            height: 50,
                            width: "25%",
                            alignSelf: "center",
                            opacity: 0.8,
                            paddingLeft: 10,
                            marginTop: 20,
                            marginLeft: 20,
                            paddingTop: 5,
                          }}
                          placeholderTextColor="#185a9d"
                          keyboardType="number-pad"
                          placeholder="+974"
                          // errorMessage="* Invalid Phone No."
                          // errorStyle={{ color: phoneError }}
                          // renderErrorMessage
                          disabled={true}
                        />
                        <Input
                          inputStyle={{
                            color: "#185a9d",
                            fontSize: 16,
                          }}
                          inputContainerStyle={{ borderBottomWidth: 0 }}
                          // leftIcon={
                          //   <Icon
                          //     name="cellphone-android"
                          //     size={20}
                          //     color="#185a9d"
                          //   />
                          // }
                          containerStyle={{
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: "#185a9d",
                            height: 50,
                            width: "50%",
                            alignSelf: "center",
                            opacity: 0.8,
                            paddingLeft: 12,
                            marginTop: 20,
                            marginRight: 25,
                            paddingTop: "1%",
                          }}
                          placeholderTextColor="#185a9d"
                          onChangeText={setPhone}
                          keyboardType="number-pad"
                          placeholder="Phone No."
                          value={phone}
                          errorMessage="* Invalid Phone No."
                          errorStyle={{ color: phoneError }}
                          renderErrorMessage
                        />
                      </View> */}
                          <View
                            style={{
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                // justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: "#185a9d",
                                height: 50,
                                marginTop: 25,
                                width: "80%",
                              }}
                            >
                              {/* // leftIcon={
                          //   <Image
                          //     source={require("../assets/qatarFlag.png")}
                          //     style={{ width: 20, height: 25 }}
                          //   /> */}

                              <Text
                                style={{
                                  fontSize: 16,
                                  color: "#185a9d",
                                  // width: "25%",
                                  paddingLeft: 10,
                                  // backgroundColor: "red",
                                }}
                              >
                                🇶🇦 +974{" "}
                              </Text>
                              <Input
                                inputStyle={{
                                  color: "#185a9d",
                                  fontSize: 16,
                                  // justifyContent: "center",
                                }}
                                inputContainerStyle={{
                                  borderBottomWidth: 0,
                                  // justifyContent: "center",
                                  // fontSize: 18,
                                }}
                                // lcon={
                                //   <Icon
                                //     name="cellphone-android"
                                //     size={20}
                                //     color="#185a9d"
                                //   />
                                // }
                                containerStyle={{
                                  // borderRadius: 8,
                                  // borderWidth: 1,
                                  // borderColor: "#185a9d",
                                  height: 50,
                                  // backgroundColor: "blue",
                                  width: "80%",
                                  // width: "55%",
                                  // alignSelf: "center",
                                  // opacity: 0.8,
                                  // paddingLeft: 0,
                                  // marginTop: 20,
                                  // marginRight: 25,
                                  paddingTop: 5,
                                  // fontSize: 18,
                                }}
                                placeholderTextColor="#185a9d"
                                onChangeText={setPhone}
                                keyboardType="number-pad"
                                placeholder="Phone Number *"
                                value={phone}
                                errorMessage="* Invalid Phone No."
                                errorStyle={{
                                  color: phoneError,
                                  marginLeft: -75,
                                }}
                                renderErrorMessage
                              />
                            </View>
                          </View>
                          <View
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "center",
                                width: "80%",
                                // alignSelf: "center",
                                // marginLeft: "1%",
                              }}
                            >
                              <Input
                                inputStyle={{
                                  fontSize: 16,
                                  paddingLeft: 10,
                                  color: "#185a9d",
                                  // width: "50%",
                                }}
                                inputContainerStyle={{ borderBottomWidth: 0 }}
                                leftIcon={
                                  <Icon
                                    name="alpha-r-box"
                                    size={20}
                                    color="#185a9d"
                                  />
                                }
                                containerStyle={styles.useCodeInputs}
                                placeholderTextColor="#185a9d"
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
                                <Text
                                  style={{ color: "white", fontWeight: "bold" }}
                                >
                                  Use Code
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      )
                    ) : (
                      <View>
                        <Input
                          inputStyle={{
                            color: "#185a9d",
                            fontSize: 16,
                          }}
                          editable={!!verificationId}
                          // inputContainerStyle={{ borderBottomWidth: 10 }}
                          leftIcon={
                            <Octicons
                              name="verified"
                              size={20}
                              color="#185a9d"
                            />
                          }
                          containerStyle={styles.Inputs}
                          placeholderTextColor="#185a9d"
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
                        <Text style={{ color: "white", fontWeight: "bold" }}>
                          Next
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => handleSetRegisterView()}
                          style={styles.backButton}
                        >
                          <Ionicons
                            name="ios-arrow-back"
                            size={30}
                            color="#185a9d"
                          />
                        </TouchableOpacity>
                        {!registered ? (
                          <TouchableOpacity
                            onPress={() => handleSendVerificationCode()}
                            style={styles.registerButton}
                          >
                            <Text
                              style={{ color: "white", fontWeight: "bold" }}
                            >
                              Sign Up!
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onPress={handleRegister}
                            disabled={!verificationId}
                            style={{ ...styles.registerButton }}
                          >
                            <Text
                              style={{ color: "white", fontWeight: "bold" }}
                            >
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
                    <View
                      style={{
                        flex: 2,
                        width: "100%",
                        // backgroundColor: "red",
                        justifyContent: "center",
                      }}
                    >
                      <Input
                        inputStyle={{
                          color: "#185a9d",
                          fontSize: 16,
                        }}
                        inputContainerStyle={{ borderBottomWidth: 0 }}
                        leftIcon={
                          <Icon
                            name="email-outline"
                            size={20}
                            color="#185a9d"
                          />
                        }
                        containerStyle={styles.Inputs}
                        onChangeText={setLoginEmail}
                        placeholder="E-mail *"
                        value={loginEmail}
                        errorMessage="* E-mail not valid"
                        placeholderTextColor="#185a9d"
                        errorStyle={{
                          color: loginEmailError,
                        }}
                        renderErrorMessage
                      />
                      <Input
                        inputStyle={{
                          color: "#185a9d",
                          fontSize: 16,
                        }}
                        inputContainerStyle={{ borderBottomWidth: 0 }}
                        leftIcon={<Icon name="key" size={20} color="#185a9d" />}
                        containerStyle={styles.Inputs}
                        onChangeText={setLoginPassword}
                        placeholder="Password *"
                        secureTextEntry={true}
                        value={loginPassword}
                        placeholderTextColor="#185a9d"
                        errorMessage="* Please check your email and password"
                        errorStyle={{
                          color: loginPasswordError,
                          fontSize: 13,
                          marginLeft: -10,
                        }}
                        renderErrorMessage
                      />
                    </View>

                    <View
                      style={{
                        flex: 1,
                        width: "100%",
                        justifyContent: "center",
                        // backgroundColor: "yellow",
                        // marginTop: "15%",
                      }}
                    >
                      <View style={{}}>
                        <TouchableOpacity
                          style={[styles.loginButton]}
                          onPress={() => handleLogin()}
                        >
                          <Text
                            style={{
                              color: "white",
                              fontSize: 17,
                              fontWeight: "bold",
                            }}
                          >
                            Login
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.loginButton}
                          onPress={() => setAccessFlag(true)}
                        >
                          <Text
                            style={{
                              color: "white",
                              fontSize: 16,
                              fontWeight: "bold",
                            }}
                          >
                            Access Code
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View>
                        {marginVal === 0 && (
                          <Text
                            onPress={() => setModalViewLogin(true)}
                            style={{ textAlign: "center", color: "#185a9d" }}
                          >
                            Forgot Password?
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ) : modalViewLogin === true && accessFlag == false ? (
                  forgotView === 0 ? (
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
                            <Icon
                              name="email-outline"
                              size={20}
                              color="#185a9d"
                            />
                          }
                          containerStyle={styles.Inputs}
                          onChangeText={(email) => {
                            setForgotEmail(email);
                            setEmailErrMsg("");
                            setShowEmailErr(false);
                          }}
                          placeholder="E-mail"
                          value={forgotEmail}
                          inputStyle={{
                            fontSize: 16,
                            color: "#185a9d",
                          }}
                          placeholderTextColor="#185a9d"
                          errorMessage={emailErrMsg}
                          errorStyle={
                            showEmailErr
                              ? { color: "red", fontWeight: "bold" }
                              : { color: "transparent", fontWeight: "bold" }
                          }
                          renderErrorMessage={showEmailErr}
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
                            style={{ textAlign: "center", color: "#185a9d" }}
                          >
                            Back to Login
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : forgotView === 1 ? (
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
                            <Icon
                              name="email-outline"
                              size={20}
                              color="#185a9d"
                            />
                          }
                          containerStyle={styles.Inputs}
                          onChangeText={(code) => {
                            setResetCode(code);
                            setResetErrMsg("");
                            setShowResetCodeErr(false);
                          }}
                          placeholder="Reset Code"
                          value={resetCode}
                          inputStyle={{
                            fontSize: 16,
                            color: "#185a9d",
                          }}
                          placeholderTextColor="#185a9d"
                          errorMessage={resetErrMsg}
                          errorStyle={
                            showResetCodeErr
                              ? { color: "red", fontWeight: "bold" }
                              : { color: "transparent" }
                          }
                          renderErrorMessage={showResetCodeErr}
                        />
                        <View>
                          <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => validateResetCode()}
                          >
                            <Text style={{ color: "white" }}>Submit</Text>
                          </TouchableOpacity>
                          <Text
                            onPress={() => setForgotView(0)}
                            style={{ textAlign: "center", color: "#185a9d" }}
                          >
                            Back to Email
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.form}>
                      <View
                        style={{
                          flex: 6,
                          width: "100%",
                          justifyContent: "space-evenly",
                        }}
                      >
                        <View>
                          <Input
                            inputContainerStyle={{ borderBottomWidth: 0 }}
                            leftIcon={
                              <Icon
                                name="email-outline"
                                size={20}
                                color="#185a9d"
                              />
                            }
                            containerStyle={styles.Inputs}
                            onChangeText={(newPass) => {
                              setNewPassword(newPass);
                              setNewPasswordErrMsg("");
                              setShowNewPassErr(false);
                              setCofirmNewPassErrMsg("");
                              setShowCofirmNewPassErr(false);
                            }}
                            placeholder="New Password"
                            value={newPassword}
                            inputStyle={{
                              fontSize: 16,
                              color: "#185a9d",
                            }}
                            secureTextEntry
                            placeholderTextColor="#185a9d"
                            errorMessage={newPasswordErrMsg}
                            errorStyle={
                              showNewPassErr
                                ? { color: "red", fontWeight: "bold" }
                                : { color: "transparent" }
                            }
                            renderErrorMessage={showNewPassErr}
                          />

                          <Input
                            inputContainerStyle={{ borderBottomWidth: 0 }}
                            leftIcon={
                              <Icon
                                name="email-outline"
                                size={20}
                                color="#185a9d"
                              />
                            }
                            containerStyle={styles.Inputs}
                            onChangeText={(confirm) => {
                              setConfirmNewPassword(confirm);
                              setNewPasswordErrMsg("");
                              setShowNewPassErr(false);
                              setCofirmNewPassErrMsg("");
                              setShowCofirmNewPassErr(false);
                            }}
                            secureTextEntry
                            placeholder="Confirm New Password"
                            value={confirmNewPassword}
                            inputStyle={{
                              fontSize: 16,
                              color: "#185a9d",
                            }}
                            placeholderTextColor="#185a9d"
                            errorMessage={cofirmNewPassErrMsg}
                            errorStyle={
                              showCofirmNewPassErr
                                ? { color: "red", fontWeight: "bold" }
                                : { color: "transparent" }
                            }
                            renderErrorMessage={showCofirmNewPassErr}
                          />
                        </View>

                        <View>
                          <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => changePassword()}
                          >
                            <Text style={{ color: "white" }}>Submit</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )
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
                              <Icon
                                name="account-key"
                                size={20}
                                color="#185a9d"
                              />
                            }
                            containerStyle={styles.Inputs}
                            onChangeText={setAccessCode}
                            placeholder="Access Code *"
                            value={AccessCode}
                            errorMessage="* Code Invalid"
                            inputStyle={{
                              color: "#185a9d",
                              fontSize: 16,
                            }}
                            placeholderTextColor="#185a9d"
                            errorStyle={{ color: accessCodeError }}
                            renderErrorMessage
                          />
                          <View>
                            <TouchableOpacity
                              style={styles.loginButton}
                              onPress={() => handleAccessCode()}
                            >
                              <Text
                                style={{ color: "white", fontWeight: "bold" }}
                              >
                                Use Code
                              </Text>
                            </TouchableOpacity>
                            <Text
                              onPress={() => setAccessFlag(false)}
                              style={{ textAlign: "center", color: "#185a9d" }}
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
                                  color="#185a9d"
                                />
                              }
                              containerStyle={styles.AccessInputs}
                              value={AccessEmail}
                              inputStyle={{
                                color: "#185a9d",
                                fontSize: 16,
                                textAlign: "center",
                              }}
                              placeholderTextColor="#185a9d"
                              disabled={true}
                            />

                            <Input
                              inputContainerStyle={{ borderBottomWidth: 0 }}
                              // leftIcon={
                              //   <Icon
                              //     name="email-outline"
                              //     size={20}
                              //     color="#185a9d"
                              //   />
                              // }
                              containerStyle={{
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: "#185a9d",
                                height: 50,
                                width: "20%",
                                alignSelf: "center",
                                opacity: 0.8,
                                paddingLeft: 12,
                                marginTop: 20,
                                paddingTop: "1%",
                              }}
                              inputStyle={{
                                color: "#185a9d",
                                textAlign: "center",
                              }}
                              placeholderTextColor="#185a9d"
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
                                color="#185a9d"
                              />
                            }
                            containerStyle={styles.Inputs}
                            onChangeText={setAccessDisplayName}
                            placeholder="Display Name *"
                            value={accessDisplayName}
                            inputStyle={{
                              fontSize: 16,
                            }}
                            placeholderTextColor="#185a9d"
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
                                color: "#185a9d",
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
                                borderColor: "#185a9d",
                                height: 50,
                                width: "25%",
                                alignSelf: "center",
                                opacity: 0.8,
                                paddingLeft: 10,
                                marginTop: 20,
                                marginLeft: 20,
                              }}
                              placeholderTextColor="#185a9d"
                              keyboardType="number-pad"
                              placeholder="+974"
                              // errorMessage="* Invalid Phone No."
                              // errorStyle={{ color: phoneErr2 }}
                              // renderErrorMessage
                              disabled={true}
                            />
                            <Input
                              inputStyle={{
                                color: "#185a9d",
                                fontSize: 16,
                              }}
                              inputContainerStyle={{ borderBottomWidth: 0 }}
                              // leftIcon={
                              //   <Icon
                              //     name="cellphone-android"
                              //     size={20}
                              //     color="#185a9d"
                              //   />
                              // }
                              containerStyle={{
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: "#185a9d",
                                height: 50,
                                width: "50%",
                                alignSelf: "center",
                                opacity: 0.8,
                                paddingLeft: 12,
                                marginTop: 20,
                                marginRight: 25,
                                paddingTop: "1%",
                              }}
                              placeholderTextColor="#185a9d"
                              onChangeText={setPhoneAccess}
                              keyboardType="number-pad"
                              placeholder="Phone Number *"
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
                              <Text
                                style={{ color: "white", fontWeight: "bold" }}
                              >
                                Next
                              </Text>
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
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "",
    alignItems: "center",
    // width: Math.round(Dimensions.get("window").width),
    // width: "100%",
    justifyContent: "flex-end",
    // height: Math.round(Dimensions.get("window").height),
    // height: "100%",
  },
  buttonGroup: {
    alignItems: "center",
    // flex: 0.25,
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
    // justifyContent: "center",
    textAlign: "center",
    color: "#185a9d",
    fontSize: 34,
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#415598",
    flex: 1,
    flexDirection: "row",
  },
  form: {
    flex: 1,
    // height: Math.round(Dimensions.get("window").height),
    // paddingTop: "2%",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "red",
  },
  Inputs: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#185a9d",
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
    borderColor: "#185a9d",
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
    backgroundColor: "#185a9d",
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
    backgroundColor: "#60c4c4",
    height: 45,
    width: "60%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "2%",
    borderRadius: 30,
    marginBottom: 5,
    marginTop: 5,
    // borderWidth: 3,
    // borderColor: "#185a9d",
  },
  registerButton: {
    backgroundColor: "#60c4c4",
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
    backgroundColor: "#60c4c4",
    height: 50,
    width: "30%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginStart: "2%",
    marginEnd: "3%",
    borderRadius: 10,
    marginBottom: 0,
    marginTop: 20,
  },
  useCodeInputs: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#185a9d",
    height: 50,
    width: "69%",
    alignSelf: "center",
    opacity: 0.8,
    paddingLeft: 10,
    marginTop: 20,
    marginLeft: 15,
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    flex: 0.5,
    paddingTop: "9%",
  },
});
