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
    const [disable , setDisable] = useState(false)
    const tName = props.navigation.getParam("tName", 'failed')
    const sName = props.navigation.getParam("sName", 'failed')
    const assetBooking = props.navigation.getParam("assetBooking", "some default value");
    const serviceBooking = props.navigation.getParam("serviceBooking", "some default value");
    const [displayServices, setDisplayServices] = useState([])
    //const [assetBooking, setAssetBooking] = useState({ asset: { id: "5uhqZwCDvQDH13OhKBJf", price: 100 }, startDateTime: "2020-05-15T01:00", endDateTime: "2020-05-16T08:00" })
    const [start, setStart] = useState()
    const [end, setEnd] = useState()
    const [totalAmount, setTotalAmount] = useState(0)

    useEffect(() => {
        if (assetBooking) {
            fixTimings()
            countTotal()
            orderList()   
        }
    }, [])

    const fixTimings = () => {
        if (assetBooking.startDateTime.split(" ")[3] == "PM") {
            setStart(assetBooking.startDateTime.split(" ")[0] + " T " + (parseInt(assetBooking.startDateTime.split(" ")[2].split(":")[0]) + 12) + ":00:00")
        }
        else {
            setStart(assetBooking.startDateTime.split(" ")[0] + " T " + assetBooking.startDateTime.split(" ")[2] + ":00")
        }
        if (assetBooking.endDateTime.split(" ")[3] == "PM") {
            setEnd(assetBooking.endDateTime.split(" ")[0] + " T " + (parseInt(assetBooking.endDateTime.split(" ")[2].split(":")[0]) + 12) + ":00:00")
        }
        else {
            setEnd(assetBooking.endDateTime.split(" ")[0] + " T " + assetBooking.endDateTime.split(" ")[2] + ":00")
        }
    }

    const countTotal = ()=>{
        var start = assetBooking.startDateTime.split(" ").join('')
        var end = assetBooking.endDateTime.split(" ").join('')
        var startHour = ""
        var endHour = ""


        if (assetBooking.startDateTime.split(" ")[2].split(":")[0].split("").length == 1) {
            startHour = "0" + assetBooking.startDateTime.split(" ")[2].split(":")[0].split("")[0]
            start = assetBooking.startDateTime.split(" ")[0] + "T" + startHour + ":00:00"
        }
        if (assetBooking.endDateTime.split(" ")[2].split(":")[0].split("").length == 1) {
            endHour = "0" + assetBooking.endDateTime.split(" ")[2].split(":")[0].split("")[0]
            end = assetBooking.endDateTime.split(" ")[0] + "T" + endHour + ":00:00"
        }

        // count days and total
        var s = new Date(start)
        var e = new Date(end)
        var diff = (e.getTime() - s.getTime()) / 1000;

        diff /= (60 * 60);

        var assetTotal = Math.round(diff * parseInt(assetBooking.asset.price) * 100) / 100

        var serviceTotal = 0
        if (serviceBooking.length > 0) {
            for (let i = 0; i < serviceBooking.length; i++) {
                serviceTotal = serviceTotal + parseInt(serviceBooking[i].service.price)
            }
        }
        setTotalAmount(assetTotal + serviceTotal)
    }

    const orderList = () => {
        var newServiceArr = []
        for (let i = 0; i < serviceBooking.length; i++) {
            newServiceArr = newServiceArr.filter(s => s.service !== serviceBooking[i].service)
            var bookedhours = serviceBooking.filter(s => s.service == serviceBooking[i].service)
            var hours = []
            var whatever = []
            for (let k = 0; k < bookedhours.length; k++) {
                hours.push(bookedhours[k].day + " " + bookedhours[k].show)
                if (bookedhours[k].time.split(":")[0].split("").length == 1) {
                    whatever.push({ hr24:bookedhours[k].day + "T0" + bookedhours[k].time , hr12:bookedhours[k].day + "T0" + bookedhours[k].show  })
                }
                else {
                    whatever.push({ hr24:bookedhours[k].day + "T" + bookedhours[k].time , hr12:bookedhours[k].day + "T" + bookedhours[k].show  })
                }

            }
            newServiceArr.push({ service: serviceBooking[i].service, hours, whatever })

        }

        //order timings 
        for (let i = 0; i < newServiceArr.length; i++) {
            var arranged = [] 
            var use = newServiceArr[i].whatever
            if (use.length > 0) {
                var counter = use.length
                while (counter > 0) {
                    var min = use[0].hr24
                    var index = 0
                    for (let k = 0; k < use.length; k++) {
      
                        if (new Date(min).getTime() > new Date(use[k].hr24).getTime()) {
                            min = newServiceArr[i].whatever[k]
                            index = k
                        }
                    }
                    arranged.push(use[index].hr12)
                    use = use.filter( (t , i ) => i != index)
                    counter = counter - 1
                }
            }
            newServiceArr[i].hours = arranged


        }
        setDisplayServices(newServiceArr)
    }




    const payLater = async () => {

        const handleBooking = firebase.functions().httpsCallable("handleBooking");
        var user = await db.collection("users").doc(firebase.auth().currentUser.uid).get()
        var u = user.data()
        u.id = firebase.auth().currentUser.uid
        //user, asset, startDateTime, endDateTime, card, promotionCode,dateTime, status(true for complete, false for pay later)

        const response = await handleBooking({
            user: user.data(),
            asset: assetBooking.asset,
            startDateTime: assetBooking.startDateTime,
            endDateTime: assetBooking.endDateTime,
            card: { cardNo: "", expiryDate: "", CVC: "", cardType: "", cardHolder: "" },
            promotionCode: null,
            dateTime: moment().format("YYYY-MM-DD T HH:mm"),
            status: true,
            addCreditCard: false,
            uid: firebase.auth().currentUser.uid,
            totalAmount: totalAmount,
            status: false,
            serviceBooking
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
            <Text>Start Date and Time: {start}</Text>
            <Text>End Date and Time: {end}</Text>

            {/*service*/}
            {
                displayServices.map(s =>
                    <View>
                        <Text>
                            Service: {s.service.name}
                        </Text>
                        <Text>
                            Price Per Hour {s.service.price}
                        </Text>

                        <Text>
                            Total: {s.service.price * s.hours.length}
                        </Text>
                        <Text>
                            Bookings
                  </Text>
                        {
                            s.hours.map(h =>
                                <Text>{h}</Text>
                            )
                        }


                    </View>

                )
            }


            <View style={{ width: "30%", marginLeft: "auto", marginRight: "auto" }}>

                <Button
                    title="Pay Now"
                    onPress={() => props.navigation.navigate("Payment", { assetBooking: assetBooking, serviceBooking, totalAmount })}
                    disable= {disable}
                />

            </View>
            <View style={{ width: "30%", marginLeft: "auto", marginRight: "auto" }}>

                <Button
                    title="Pay Later"
                    onPress={() => setDisable(true) ||payLater()}
                    disable= {disable}
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
