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
import db from "../../db";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import { AsyncStorage } from "react-native";
import { CheckBox } from 'react-native-elements'



export default function CheckOut(props) {

    const tName=props.navigation.getParam("tName",'failed')
  const sName=props.navigation.getParam("sName",'failed')
    const assetBooking = props.navigation.getParam("assetBooking", "some default value");
    //const [assetBooking, setAssetBooking] = useState({ asset: { id: "5uhqZwCDvQDH13OhKBJf", price: 100 }, startDateTime: "2020-05-15T01:00", endDateTime: "2020-05-16T08:00" })

    const [totalAmount, setTotalAmount] = useState(0)

    useEffect(() => {

        if (assetBooking) {
            console.log("assset -----------------------",assetBooking.asset.price)
            
            
            var split1 = assetBooking.startDateTime.split(" ")
            var split2 = assetBooking.endDateTime.split(" ")

            var start = split1.join('')
            var end = split2.join('')

            var s = new Date(start)
            var e = new Date(end)
            var diff = (e.getTime() - s.getTime()) / 1000;
            console.log("diff 40-----------------------",diff)
            diff /= (60 * 60);
            console.log("diff 42-----------------------",diff)
            var totalAmount1= Math.round(diff * parseInt(assetBooking.asset.price) * 100) / 100
            setTotalAmount(totalAmount1)

//             const hours = Math.floor(
//                 Math.abs(
//                   new Date().getTime(assetBooking.endDateTime) -  new Date().getTime(assetBooking.startDateTime)
//                 ) / 36e5
//               );
//               console.log("**********hours",  hours)
// setTotalAmount(hours * parseInt(assetBooking.asset.price))
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
            <Text>Type name: {tName}</Text>
            <Text>Section name: {sName}</Text>

            <Text>Amount: {totalAmount} QAR</Text>
            <Text>Price: {assetBooking.asset.price} Per Hour</Text>
      <Text>Start Date and Time: {assetBooking.startDateTime}</Text>
      <Text>End Date and Time: {assetBooking.endDateTime}</Text>


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
