import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Image
} from "react-native";
import LottieView from 'lottie-react-native';

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

//react elements
import { Input } from "react-native-elements"

import firebase from "firebase/app";
import "firebase/auth";

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    await firebase.auth().signInWithEmailAndPassword(email, password);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        
      <Text style={styles.headerText}>Sign in</Text>
      
      </View>
      <View style={styles.form}>
      <LottieView source={require('../assets/login.json')} autoPlay loop style={{position:"relative",width:"50%"}}/>

        <Input
          inputContainerStyle={{borderBottomWidth: 0}}
          leftIcon={
            <Icon name="email-outline" size={20} color="lightgray" />
          }
          containerStyle={styles.Inputs}
          onChangeText={setEmail}
          placeholder="username@email.com"
          value={email}
        />
        <Input
          inputContainerStyle={{borderBottomWidth: 0}}
          leftIcon={
            <Icon name="email-outline" size={20} color="lightgray" />
          }
          containerStyle={styles.Inputs}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry={true}
          value={password}
        />
        <View style={{flexDirection:"row", justifyContent:"center"}}>
          <TouchableOpacity style={styles.Buttons}>
          <Text>Access Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.Buttons} onPress={() => handleLogin()}>
            <Text>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={{color:"white"}}>Don't Have an Account? </Text>
        <TouchableOpacity >
          <Text style={{color:"darkblue"}}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A5155",
    //alignItems: "center",
    //justifyContent: "center",
   // flexDirection: "column",
   // paddingHorizontal: 20,
    width:Math.round(Dimensions.get('window').width),
    height:Math.round(Dimensions.get('window').height),
  },
  headerText:{
    alignItems:"center",
    textAlign:"center",
    color:"white",
    fontSize:34,
    fontWeight:"bold"
  },
  footer:{
    textAlign:"center",
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"#0A5155",
    flex:1,
    flexDirection:"row",
  },
  form:{
    flex:4,
    justifyContent:"center",
    alignItems:"center"
  },
  Inputs:{
    borderRadius:8,
    borderWidth:1,
    borderColor:"white",
    height:50,
    width:"70%",
    alignSelf:"center",
    opacity:0.8,
    paddingLeft:20,
    marginTop:20
  },
  Buttons:{
    borderRadius:8,
    borderWidth:1,
    backgroundColor:"white",
    height:35,
    width:"30%",
    alignSelf:"center",
    justifyContent:"center",
    alignItems:"center",
    marginTop:20,
    // marginRight:8,
    marginStart: "2%",
    marginEnd:"2%"
  },
  header:{
    justifyContent:"flex-end",
    backgroundColor:"#0A5155",
    flex:1,
  }
});
