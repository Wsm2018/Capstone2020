//@refresh reset
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Picker } from "react-native";
import { Card } from "react-native-shadow-cards";
import { ScrollView } from "react-native-gesture-handler";
import ReactNativePickerModule from "react-native-picker-module"
import db from '../db'
import firebase from "firebase";
import "firebase/auth";
import moment from "moment";
export default function SubscriptionsScreen(props) {
  let pickerRef = null;
  const [valueText, setValueText] = useState("")
  const [userSubscription, setUserSubscription] = useState()
  const subscriptionLevel = ["gold", "sliver", "bronze"]
  console.log("user from referrel ", userSubscription);

  useEffect(() =>{
    getSubscription()
  },[])

  const getSubscription = async() =>{
      let sub = await db.collection("users").doc(firebase.auth().currentUser.uid).collection('subscription')
      .orderBy("endDate",'desc').limit(1).get()
      sub.forEach(doc =>{
          setUserSubscription(doc.data())
      })
  }
  const subscribe = (type) =>{
    if(type === "new"){
    let sub = {
        gold:{
          type: "gold",
          startDate: new Date(),
          endDate: new Date(moment().add(1,'month').calendar())
        },
        sliver:{
          type: "sliver",
          startDate: new Date(),
          endDate: new Date(moment().add(1,'month').calendar())
        },
        bronze:{
          type: "bronze",
          startDate: new Date(),
          endDate: new Date(moment().add(1,'month').calendar())
        }
    };
    if(valueText === 'gold'){
        db.collection("users").doc(firebase.auth().currentUser.uid).collection("subscription").add(sub.gold)
    }
    else if(valueText === 'sliver'){
        db.collection("users").doc(firebase.auth().currentUser.uid).collection("subscription").add(sub.sliver)
    }
    else if(valueText === 'bronze'){
        db.collection("users").doc(firebase.auth().currentUser.uid).collection("subscription").add(sub.bronze)
    }
    console.log('done')}
    else if(type === "update"){
      setUserSubscription(undefined)
    }
  }
  return (
    <View style={styles.container}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Card
          elevation={2}
          style={{
            width: "100%",
            flex: 1,
            borderWidth: 1,
            borderTopWidth: 0,
            borderColor: "darkgray",
          }}
        >
            {userSubscription === undefined ?
            <View style={{ flex: 1, justifyContent: "center", alignItems: 'baseline' }}>
            <ScrollView >
                <Text>no subscription</Text>
                <View >
                    
                    <Text>Selected Level: {valueText}</Text>
                    {Platform.OS === "ios" ? 
                    <View>
                    <TouchableOpacity
                    style={{
                    paddingVertical: 10,
                    }}
                    onPress={() => {
                    pickerRef.show()
                    }}>
                    <Text>Select subscription level</Text>
                    </TouchableOpacity>
                    <ReactNativePickerModule
                    pickerRef={e => (pickerRef = e)}
                    title={"Select a subscription level"}
                    items={subscriptionLevel}
                    onDismiss={() => {
                    console.log("onDismiss")
                    }}
                    onCancel={() => {
                    console.log("Cancelled")
                    }}
                    onValueChange={(valueText, index) => {
                    console.log("value: ", valueText)
                    console.log("index: ", index)
                    setValueText(valueText)
                    }}
                /> </View>
                    : 

                    <Picker
                    selectedValue={valueText}
                    style={{ height: 50, width: 150 }}
                    onValueChange={(item, itemIndex) => setValueText(item)}
                    >
                    {subscriptionLevel.map((item, index) =>
                      <Picker.Item key={index} label={item} value={item} />
                    )}
                    
                    </Picker>
                    
                    }
                    
                    {valueText === "bronze"? <Text>this level will gives you: 3 </Text>
                    :valueText === "sliver" ?<Text>this level will gives you: 5</Text>
                    :valueText === "gold" ?<Text>this level will gives you: 10</Text>
                    : null}
                </View>
                <TouchableOpacity
                        style={{
                        paddingVertical: 10,
                        }}
                        onPress={() => {
                        subscribe("new")
                        }}>
                        <Text>subscribe now</Text>
                    </TouchableOpacity>
            </ScrollView>
            </View>
            : 
            <View style={{ flex: 1, justifyContent: "center", alignItems: 'baseline' }}>
                <ScrollView>
                    <Text>Subscription will end at: {moment(userSubscription.endDate.toDate()).format('L')}</Text>
                      <Text>your subscription level is: {userSubscription.type}</Text>
                    <TouchableOpacity
                        style={{
                        paddingVertical: 10,
                        }}
                        onPress={() => {
                        subscribe("update")
                        }}>
                        <Text>renew and upgrade</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>}
        </Card>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
