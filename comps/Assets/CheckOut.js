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
    const serviceBooking = props.navigation.getParam("serviceBooking", "some default value");
    const [displayServices, setDisplayServices] = useState([])
    //const [assetBooking, setAssetBooking] = useState({ asset: { id: "5uhqZwCDvQDH13OhKBJf", price: 100 }, startDateTime: "2020-05-15T01:00", endDateTime: "2020-05-16T08:00" })

    const [totalAmount, setTotalAmount] = useState(0)

    useEffect(() => {

        if (assetBooking) {
            console.log("assset -----------------------",assetBooking.asset.price)
            
            

            var start = assetBooking.startDateTime.split(" ").join('')
            var end = assetBooking.endDateTime.split(" ").join('')

            //fix the hour if between 1 - 9
            var startHour = ""
            var endHour = ""

           
            if( assetBooking.startDateTime.split(" ")[2].split(":")[0].split("").length == 1){
                startHour = "0"+ assetBooking.startDateTime.split(" ")[2].split(":")[0].split("")[0]
                start = assetBooking.startDateTime.split(" ")[0]+"T"+startHour+":00:00"  
            }
            if( assetBooking.endDateTime.split(" ")[2].split(":")[0].split("").length == 1){
                endHour = "0"+ assetBooking.endDateTime.split(" ")[2].split(":")[0].split("")[0]
                end = assetBooking.endDateTime.split(" ")[0]+"T"+endHour+":00:00"
            }

            console.log("start", startHour, "end", endHour)

            var s = new Date(start)
            var e = new Date(end)
            var diff = (e.getTime() - s.getTime()) / 1000;
            //console.log("diff 40-----------------------",diff , s, e)
            diff /= (60 * 60);
            //console.log("diff 42-----------------------",diff)
            var assetTotal= Math.round(diff * parseInt(assetBooking.asset.price) * 100) / 100
           //console.log("total asset",assetTotal)
            var serviceTotal = 0
            if(serviceBooking.length > 0){
                for(let i=0 ; i < serviceBooking.length ; i++){
                    serviceTotal = serviceTotal + parseInt(serviceBooking[i].service.price)
                }
            }
            //console.log("total service",serviceTotal)
            setTotalAmount(assetTotal + serviceTotal)

            //get all booked services
            var newServiceArr = []
            for(let i=0 ; i < serviceBooking.length ; i++){
               // console.log("here 67")
                newServiceArr = newServiceArr.filter( s => s.service !== serviceBooking[i].service)
               // console.log(" resulttt", newServiceArr)
                 //get booked hours of service
                 var bookedhours = serviceBooking.filter(s => s.service == serviceBooking[i].service)
                 var hours = []
                 for( let k=0 ; k < bookedhours.length ; k++){
                    // console.log("73")
                     hours.push(bookedhours[k].day+"T"+bookedhours[k].time)
                 }
                newServiceArr.push({ service: serviceBooking[i].service , hours})
                 ///console.log(" new",newServiceArr)
            }
            setDisplayServices(newServiceArr)
            //console.log(" ahaa??", displayServices)
            // add the hours of each
           
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
            status: false , 
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
      <Text>Start Date and Time: {assetBooking.startDateTime}</Text>
      <Text>End Date and Time: {assetBooking.endDateTime}</Text>

      {/*service*/}
      {
          displayServices.map( s =>
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
                      s.hours.map( h =>
                      <Text>{h}</Text>
                        )
                  }


                  </View>
              
          )
      }


            <View style={{ width: "30%", marginLeft: "auto", marginRight: "auto" }}>

                <Button
                    title="Pay Now"
                    onPress={() => props.navigation.navigate("Payment",{ assetBooking: assetBooking , serviceBooking , totalAmount})}
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
