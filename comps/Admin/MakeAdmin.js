import React, { useState } from "react";
import {
  TextInput,
  Button,
  View,
  Text,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import firebase from "firebase";
import "firebase/functions";
import LottieView from "lottie-react-native";

export default function MakeAdmin(props) {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    if (email !== "") {
      const makeAdmin = firebase.functions().httpsCallable("makeAdmin");
      const response = await makeAdmin({ email: email });
      console.log(response);
    }
  };

  //source={require("../../assets/22424-presentation.json")}

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == "ios" ? "height" : "height"}
      style={styles.container}
    >
      {/* <View style={styles.container}> */}
      <View
        style={{
          flex: 2,
          alignItems: "center",
          justifyContent: "center",
          // backgroundColor: "yellow",
        }}
      >
        <LottieView
          width={Dimensions.get("window").width / 1.2}
          source={require("../../assets/admin.json")}
          autoPlay
          loop
          style={{
            alignItems: "center",
            position: "relative",
          }}
        />
      </View>

      <View
        style={{
          alignItems: "center",
          flex: 1,
          // backgroundColor: "red",
          justifyContent: "flex-start",
          // marginTop: 10,
        }}
      >
        <TextInput
          width={Dimensions.get("window").width / 1.2}
          style={{
            backgroundColor: "white",
            height: 50,
            // color: "red",
            // position: "absolute",
            borderColor: "gray",
            borderWidth: 1,
            borderRadius: 10,
            paddingStart: 10,
          }}
          placeholder="Example@email.com"
          onChangeText={setEmail}
        />
        {/* <Button title="submit" onPress={handleSubmit} /> */}
        <View style={{ marginBottom: 10 }}>
          <Text
            style={{
              textAlign: "center",
              fontSize: 16,
              color: "gray",
              // fontWeight: "bold",
            }}
          >
            Enter an email to give admin privileges.
          </Text>
        </View>
        <View
          style={{
            flex: 4,
            // backgroundColor: "red",
            // justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row-reverse",
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#20365F",
              // borderWidth: 4,
              height: 40,
              width: "30%",
              // alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
              //marginStart: "2%",
              //marginEnd: "2%",
              borderRadius: 15,
              //marginBottom: 10,
            }}
            onPress={handleSubmit}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 18,
                color: "white",
                // fontWeight: "bold",
              }}
            >
              Submit
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* </View> */}
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",
  },
});
