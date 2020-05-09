import React, { useState, useEffect, useRef } from "react";
import {
    Alert,
    Image,
    Platform,
    TextInput,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Picker,
} from "react-native";
import firebase from "firebase/app";
import "firebase/functions";
import "firebase/auth";
import db from "../db";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import { AsyncStorage } from "react-native";
import { CheckBox } from 'react-native-elements'



export default function CheckOut(props) {

    //const assetBooking = props.navigation.getParam("assetBooking", "some default value");
    const [assetBooking, setAssetBooking] = useState({ asset: { id: "5uhqZwCDvQDH13OhKBJf", price: 100 }, startDateTime: "2020-05-15T01:00", endDateTime: "2020-05-16T08:00" })

    const [totalAmount, setTotalAmount] = useState(0)

    useEffect(() => {

        if (assetBooking) {
            var s = new Date(assetBooking.startDateTime)
            var e = new Date(assetBooking.endDateTime)
            var diff = (e.getTime() - s.getTime()) / 1000;
            diff /= (60 * 60);
            setTotalAmount(diff * assetBooking.asset.price)
        }

    }, [])


    const payLater = async () => {

        const handleBooking = firebase.functions().httpsCallable("handleBooking");
        const user = await db.collection("users").doc(firebase.auth().currentUser.uid).get()
        //user, asset, startDateTime, endDateTime, card, promotionCode,dateTime, status(true for complete, false for pay later)

        const response = await handleBooking({
            user: user.data(),
            asset: assetBooking.asset,
            startDateTime: assetBooking.startDateTime,
            endDateTime: assetBooking.endDateTime,
            card: { cardNo: "", expiryDate: "", CVC:"", cardType: "", cardHolder: "" },
            promotionCode: null,
            dateTime: moment().format("YYYY-MM-DD T HH:mm"),
            status: true,
            addCreditCard: false,
            uid: firebase.auth().currentUser.uid,
            totalAmount: totalAmount,
            status: false
        });

        props.navigation.navigate("Home")

    }

    return (
        <View style={{ paddingTop: 10 }}>

            <Text>Checkout</Text>

            <Text>Amount: {totalAmount} QAR</Text>


            <View style={{ width: "30%", marginLeft: "auto", marginRight: "auto" }}>

                <Button
                    title="Pay Now"
                    onPress={() => props.navigation.navigate("Payment",{ assetBooking: assetBooking})}
                />

            </View>
            <View style={{ width: "30%", marginLeft: "auto", marginRight: "auto" }}>

                <Button
                    title="Pay Later"
                    onPress={() => payLater()}
                />

            </View>

        </View>
    );
}

CheckOut.navigationOptions = {
    title: "CheckOut",

};
//
const styles = StyleSheet.create({}) 
