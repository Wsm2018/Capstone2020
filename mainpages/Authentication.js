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
} from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../db";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

const config = {
  apiKey: "AIzaSyBLdt-1iHho-6QGiq30plqoBz4Sjox4_hA",
  authDomain: "capstone2020-b64fd.firebaseapp.com",
  databaseURL: "https://capstone2020-b64fd.firebaseio.com",
  projectId: "capstone2020-b64fd",
  storageBucket: "capstone2020-b64fd.appspot.com",
  messagingSenderId: "930744827368",
  appId: "1:930744827368:web:6f2a6287721546d272785d",
};
try {
  firebase.initializeApp(config);
} catch (err) {
  console.log(err);
}
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

  //***** Access Code  */
  const [AccessCode, setAccessCode] = useState("");
  const [AccessAmount, setAccessAmount] = useState("QR");
  // ***** Register useState *****

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmRegisterPassword, setConfirmRegisterPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // the register button status for validation
  const [btnStatus, setBtnStatus] = useState(true);

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

  // ***** ForgotPass useState *****

  const [forgotPassEmail, setForgotPassEmail] = useState("");

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

  // it check if the email and password is not empty to enable the register button
  // and it will keep checking whenever the user edits on the email or password fields
  useEffect(() => {
    if (
      registerEmail !== "" &&
      registerPassword !== "" &&
      confirmRegisterPassword !== "" &&
      displayName !== "" &&
      phone !== ""
    ) {
      setBtnStatus(false);
    } else {
      setBtnStatus(true);
    }
  }, [
    registerEmail,
    registerPassword,
    confirmRegisterPassword,
    displayName,
    phone,
  ]);

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

    // if (registerPassword !== confirmRegisterPassword) {
    //   // return alert("Password and Confirm Password should be same !");
    //   setConfirmRegisterPasswordError("red");
    // } else {
    //   setConfirmRegisterPasswordError("transparent");
    // }

    try {
      const phoneProvider = new firebase.auth.PhoneAuthProvider();
      const verificationId = await phoneProvider.verifyPhoneNumber(
        `+974${phone}`,
        recaptchaVerifier.current
      );
      setVerificationId(verificationId);
      alert("Verification code has been sent to your phone.");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
    setRegistered(true);
  };

  // handleRegister will create a the user and create the document for the user in the
  // database with all the needed information
  const handleRegister = async () => {
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
            }&phoneNumber=${phone}&displayName=${displayName}`
          );

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

          // calling createUserInfo and waiting for it before moving the user to login page
          await createUserInfo();
        } catch (error) {
          alert(error.message);
        }
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
    // trying creating user and if there is any error it will alert it for example:
    // email is not corrent or password is not strong
  };

  // createUserInfo will complete all the data for the user to create a document in the
  // database
  const createUserInfo = async () => {
    alert("Hello Testing");
    // generating a random 6 digit referralCode
    // let referralCode = Math.floor(Math.random() * 1000000) + "";

    // if (referralCode.length === 1) {
    //   referralCode = "00000" + referralCode;
    // } else if (referralCode.length === 2) {
    //   referralCode = "0000" + referralCode;
    // } else if (referralCode.length === 3) {
    //   referralCode = "000" + referralCode;
    // } else if (referralCode.length === 4) {
    //   referralCode = "00" + referralCode;
    // } else if (referralCode.length === 5) {
    //   referralCode = "0" + referralCode;
    // }

    // const users = db.collection("users");
    // checking if any other user has the generated referralCode and waiting because its
    // checking all the users document
    // let result = await users.where("referralCode", "==", referralCode).get();
    // while there is any user with that referralCode it will generate a new code and try
    // again till it returns 0 documents
    // while (result.size > 0) {
    //   referralCode = Math.floor(Math.random() * 1000000) + "";
    //   if (referralCode.length === 1) {
    //     referralCode = "00000" + referralCode;
    //   } else if (referralCode.length === 2) {
    //     referralCode = "0000" + referralCode;
    //   } else if (referralCode.length === 3) {
    //     referralCode = "000" + referralCode;
    //   } else if (referralCode.length === 4) {
    //     referralCode = "00" + referralCode;
    //   } else if (referralCode.length === 5) {
    //     referralCode = "0" + referralCode;
    //   }
    //   result = await users.where("referralCode", "==", referralCode).get();
    // }
    // const name = email.split("@");

    // creating user document in the database with all the information
    console.log("user ", firebase.auth().currentUser.uid);
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .set({
        outstandingBalance: 0,
        balance: 0,
        email: registerEmail,
        role: "user",
        qrCode: "",
        displayName,
        phone: `+974${phone}`,
        referralCode: 0,
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
        favorite: [],
        reputation: 0,
        points: 0,
        photoURL:
          "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png",
      });
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
        // setLoginEmailError("red");
        setLoginPasswordError("red");
        // alert(err);
      });
  };

  const handleSubmit = async () => {
    // let count = 0;
    firebase
      .auth()
      .sendPasswordResetEmail(loginEmail)
      .then(() => {
        alert("Email Sent");
        setLoginEmailError("transparent");
        setModalViewLogin(false);
        // count = 1;
      })
      .catch((err) => {
        setLoginEmailError("red");
        // count = 0;
      });

    // if (count === 1) {
    //   setModalViewLogin(false);
    // }
  };

  const registerNext = async () => {
    let count = 0;
    if (!registerEmail.includes("@")) {
      setRegisterEmailError("red");
    } else {
      setRegisterEmailError("transparent");
      count = count + 1;
    }

    if (registerPassword.length < 6) {
      setRegisterPasswordError("red");
    } else {
      setRegisterPasswordError("transparent");
      count = count + 1;
    }

    if (registerPassword !== confirmRegisterPassword) {
      // return alert("Password and Confirm Password should be same !");
      setConfirmRegisterPasswordError("red");
    } else {
      setConfirmRegisterPasswordError("transparent");
      count = count + 1;
    }

    if (count === 3) {
      setRegisterView(1);
    }
  };

  const handleAccessCode = async () => {
    if (AccessCode === "") {
      setAccessCodeError("red");
    } else {
      setAccessCodeError("transparent");
      setAccessValid(true);
    }
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
            backgroundColor: "#0f4573",
            // color: "red",
            //borderColor: "white",
            // borderBottomColor: "white"
            marginTop: 50,
            width: "80%",
          }}
          selectedButtonStyle={{
            backgroundColor: "#0f3a5e",
            //borderBottomColor: "black",
          }}
          innerBorderStyle={
            {
              // color: "transparent",
            }
          }
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
                    errorMessage="* Invalid E-mail"
                    errorStyle={{ color: registerEmailError }}
                    renderErrorMessage
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
                    errorMessage="* Password must be atleast 6 characters"
                    errorStyle={{ color: registerPasswordError }}
                    inputStyle={{
                      color: "white",
                      fontSize: 16,
                    }}
                    placeholderTextColor="white"
                    renderErrorMessage
                  />

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
                    errorMessage="* Password doesn't match"
                    errorStyle={{ color: confirmRegisterPasswordError }}
                    renderErrorMessage
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
                    errorMessage="* Invalid name"
                    errorStyle={{ color: displayNameError }}
                    renderErrorMessage
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
                    errorMessage="* Invalid Phone No."
                    errorStyle={{ color: phoneError }}
                    renderErrorMessage
                    // maxLength={8}
                  />

                  {/* <Input
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
                    onChangeText={setReferralCode}
                    keyboardType="number-pad"
                    placeholder="Referral Code"
                    value={referralCode}
                    // errorMessage="Error"
                    // errorStyle={{ color: "blue" }}
                    // renderErrorMessage
                  /> */}
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
                    onPress={() => setRegisterView(0)}
                    style={styles.backButton}
                  >
                    <Text style={{ color: "#0f4573", fontWeight: "bold" }}>
                      Back
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSendVerificationCode}
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
                  errorMessage="* E-mail not valid"
                  placeholderTextColor="white"
                  errorStyle={{
                    color: loginEmailError,
                  }}
                  renderErrorMessage
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
                  inputStyle={{
                    color: "white",
                    fontSize: 16,
                  }}
                  placeholderTextColor="white"
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
                      onChangeText={setAccessCode}
                      placeholder="Access Code"
                      value={AccessCode}
                      errorMessage="* Code Invalid"
                      inputStyle={{
                        color: "white",
                        fontSize: 16,
                      }}
                      placeholderTextColor="white"
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
                        value={AccessAmount}
                        // value="QR"
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
                      onChangeText={setDisplayName}
                      placeholder="Display Name"
                      value={displayName}
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
                      onChangeText={setPhoneAccess}
                      placeholder="Phone No."
                      value={phoneAccess}
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
    backgroundColor: "#0f4573",
    alignItems: "center",
    width: Math.round(Dimensions.get("window").width),
    height: Math.round(Dimensions.get("window").height),
  },
  buttonGroup: {
    alignItems: "center",
  },
  containerLogin: {
    flex: 1,
    backgroundColor: "#0f3a5e",
    width: "80%",
    marginTop: -5,
    marginBottom: "5%",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "white",

  },
  containerRegister: {
    flex: 1,
    backgroundColor: "#0f3a5e",
    width: "80%",
    marginTop: -5,
    marginBottom: "5%",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "white",

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
    backgroundColor: "#415598",
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
    backgroundColor: "white",
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
    backgroundColor: "#6586a6",
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
    // position: "relative",
  },
  registerButton: {
    backgroundColor: "#6586a6",
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
