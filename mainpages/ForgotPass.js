import React, {useState} from "react";
import { View, Button, TextInput, Text,TouchableOpacity } from 'react-native';
import firebase from "firebase"
import "firebase/auth";

export default function ForgotPass(prop) {
    const [email, setEmail] = useState("");

    const handleSubmit = async() => {
        firebase.auth().sendPasswordResetEmail(email).then(() => {
           alert("Email Sent")
        }).catch(err => alert(err.message))
    }

    return (    
        <View>
            <Text>Forgot Password</Text>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail}/>
            <TouchableOpacity onPress={handleSubmit}>
                <Text>Submit</Text>
            </TouchableOpacity>
        </View>
    )
}