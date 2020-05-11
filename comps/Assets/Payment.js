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



export default function Payment(props) {
  // use 24 time format or 12 !!!!!!
  //const assetBooking = props.navigation.getParam("assetBooking", "some default value");
  const [assetBooking, setAssetBooking] = useState({ asset: { id: "5uhqZwCDvQDH13OhKBJf", price: 100 }, startDateTime: "2020-05-15T01:00", endDateTime: "2020-05-16T08:00"})

  const [cardNumber, setCardNumber] = useState();
  const [year, setYear] = useState();
  const [month, setMonth] = useState();
  const [CVC, setCVC] = useState();
  const [name, setName] = useState();
  const [yearsList, setYearsList] = useState();
  const [monthList, setMonthList] = useState(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"])
  const [addCreditCard, setAddCreditCard] = useState(true)
  const [totalAmount , setTotalAmount] = useState(0)
  
  useEffect(() => {

    if(assetBooking){
      var s = new Date(assetBooking.startDateTime)
      var e = new Date(assetBooking.endDateTime)
      var diff = (e.getTime() - s.getTime()) / 1000;
      diff /= (60 * 60);
      setTotalAmount(diff * assetBooking.asset.price)
    }
    
    var years = [ ]
    for (let i = 0; i <= 10; i++) {
      years.push(moment().add(i, "years").format("YYYY"))
    }
    setYearsList(years)
    
  }, [])


  const pay = async () => {

    const handleBooking = firebase.functions().httpsCallable("handleBooking");
    const user = await db.collection("users").doc(firebase.auth().currentUser.uid).get()
    //user, asset, startDateTime, endDateTime, card, promotionCode,dateTime, status(true for complete, false for pay later)

    const response = await handleBooking({
      user: user.data(),
      asset: assetBooking.asset,
      startDateTime: assetBooking.startDateTime,
      endDateTime: assetBooking.endDateTime,
      card: { cardNo: cardNumber, expiryDate: year + "/" + month, CVC, cardType: "", cardHolder: name },
      promotionCode: null,
      dateTime: moment().format("YYYY-MM-DD T HH:mm"),
      status: true,
      addCreditCard: addCreditCard,
      uid: firebase.auth().currentUser.uid,
      totalAmount: totalAmount,
      status: true
    });

    props.navigation.navigate("Home")

  }

  return (
    <View style={{ paddingTop: 10 }}>

      <Text>Amount: {totalAmount} QAR</Text>

      <TextInput
        style={styles.input}
        onChangeText={text => setName(text)}
        placeholder="Name"
        value={name}
      />

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        onChangeText={text => setCardNumber(text)}
        placeholder="Card Number"
        value={cardNumber}
        maxLength={16}
      />

      <View style={{ flexDirection: "row" }}>

        {yearsList ? (
          <Picker
            selectedValue={year}
            itemStyle={{ height: 60 }}
            style={{
              height: 50,
              width: 200,
              fontSize: 20,
              backgroundColor: "#DCDCDC",
              marginBottom: 4,
              marginTop: 4,
              marginRight: "auto",
              marginLeft: "auto"
            }}
            onValueChange={(itemValue) => setYear(itemValue)}
          >
            <Picker.Item label={"Year"} value={""} />
            {yearsList.map((y) => (
              <Picker.Item label={y} value={y} />
            ))}
          </Picker>
        ) : null}

        <Picker
          selectedValue={month}
          itemStyle={{ height: 60 }}
          style={{
            height: 50,
            width: 200,
            fontSize: 20,
            backgroundColor: "#DCDCDC",
            marginBottom: 4,
            marginTop: 4,
            marginRight: "auto",
            marginLeft: "auto"
          }}
          onValueChange={(itemValue) => setMonth(itemValue)}
        >
          <Picker.Item label={"Month"} value={""} />
          {monthList.map((y) => (
            <Picker.Item label={y} value={y} />
          ))}
        </Picker>

      </View>
      <TextInput
        style={styles.input}
        onChangeText={text => setCVC(text)}
        keyboardType="numeric"
        placeholder="CVC"
        maxLength={3}
        value={CVC}
      />

      <CheckBox
        title='Save Card'
        checked={addCreditCard}
        onPress={() => setAddCreditCard(!addCreditCard)}
      />

      <View style={{ width: "30%", marginLeft: "auto", marginRight: "auto" }}>

        <Button
          title="Pay"
          onPress={() => pay()}
          disabled={
            name &&
              cardNumber &&
              month &&
              year &&
              CVC
              ? false
              : true
          }
        />

      </View>

    </View>
  );
}

Payment.navigationOptions = {
  title: "Payment",

};
//
const styles = StyleSheet.create({}) 
