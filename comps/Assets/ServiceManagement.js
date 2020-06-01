import React, { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
import db from "../../db";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";

export default function ServiceManagement(props) {
    const assetType = props.navigation.getParam("assetType", 'failed');
    const [ services , setServices] = useState([])
    useEffect(()=>{
        db.collection("services").onSnapshot((snapshot) => {
            const temp = []
            snapshot.forEach(doc => {
                if( doc.data().assetType == assetType.id){
                    temp.push({ id: doc.id, ...doc.data() })     
                } 
            });
            setServices(temp)
        })
    },[])
  return (
    <View>
      <Text>{assetType.name} Service Management</Text>

      {
          services?
          services.map( s =>
          <Text>{s.name}</Text>
            )
            :
            null
      }
    </View>
  );
}