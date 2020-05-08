//@refresh reset
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import { Icon } from "react-native-elements";
import db from "../db";

export default function ServicePage() {
  const [services, setServices] = useState([])
  useEffect(()=>{
    callServices()
  },[])

  const callServices = async() =>{
    const getServices = await db.collection("services").get()
    let data = []
    getServices.forEach(doc =>{
      data.push(doc.data());
    })
    setServices(data)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          console.log("serivers: ",services)
        }}
      >
        <Text>hi</Text>
      </TouchableOpacity>
      {services.map((item,i) =>
      <View key={i}>
      <Text >service name: {item.name}</Text>
      <Text >price: {item.price}</Text>
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

ServicePage.navigationOptions = {
  title: null,
  tabBarIcon: () => {
    <Icon name="service" type="font-awesome" size={24} />
  },
};

{/* <TouchableOpacity
        onPress={() => {
          handleLogout();
        }}
      >
        <Text>hi</Text>
</TouchableOpacity> */}
