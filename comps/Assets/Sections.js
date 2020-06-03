//@refresh reset
import { Button } from "react-native-elements"
import React, { useState, useEffect , useRef } from "react";
import { createStackNavigator } from 'react-navigation-stack';

import {
  Image,
  Platform,
  TextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Picker,
  Modal
} from "react-native";

import DatePicker from 'react-native-datepicker'
import moment from "moment"
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db.js";
require("firebase/firestore");



export default function Sections(props) {
  const [assetSections, setAssetSections] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showSections , setShowSections] = useState(false)

  /////////////////////////new
  const [ startTime , setStartTime] = useState()
  const [ endTime , setEndTime] = useState()
  const type = props.navigation.getParam("type", 'failed').id;
  const tName = props.navigation.getParam("type", 'failed').name
  const [startTimeModal , setStartTimeModal] = useState(false)
  const [endTimeModal , setEndTimeModal] = useState(false)
  const [tempStartDate, setTempStartDate] = useState();
  const [tempEndDate, setTempEndDate] = useState();
  const displayList = useRef()
 
  const [timesList , setTimesList] = useState([
    "12:00 AM",
    "1:00 AM",
    "2:00 AM",
    "3:00 AM",
    "4:00 AM",
    "5:00 AM",
    "6:00 AM",
    "7:00 AM",
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
    "9:00 PM",
    "10:00 PM",
    "11:00 PM",
  ])

  useEffect(() => {
    getSections();
  }, [type]);

  useEffect(() => { 
    if(tempStartDate){
      var temp =[]
      var found = false
      for( let i=0 ; i < timesList.length ; i++){
        if( found ){
          temp.push(timesList[i])
        }
        if( timesList[i] == moment().format("H:00 A")){
          found = true
        }
      }
      displayList.current = temp
      setStartTimeModal(true)
    } 
  }, [tempStartDate]);

  useEffect(() => { 
    if(tempEndDate){
      var temp =[]
      var found = false
      console.log("started",startDate.split(" ")[2])
      if( tempEndDate.split(" ")[0] === startDate.split(" ")[0]){
        var s = startDate.split(" ")[2] + " "+startDate.split(" ")[3]
        for( let i=0 ; i < timesList.length ; i++){
          if( found ){
            temp.push(timesList[i])
          }
          if( timesList[i] == s){
            found = true
            console.log("here")
          }
        }
        displayList.current = temp
      }
      else{
        displayList.current = timesList
      }
      
      
      setEndTimeModal(true)
    } 
  }, [tempEndDate]);

  useEffect(()=>{
    if(startTime ){
      setStartDate(tempStartDate.split(" ")[0] + " T "+ startTime)
      setEndDate()
    }
  },[startTime])

  useEffect(()=>{
    if(endTime){
      setEndDate(tempEndDate.split(" ")[0] + " T "+ endTime)
    }
  },[endTime])

  const getSections = async () => {
    const temp = [];

    const sections = await db.collection('assetSections').where("assetType", "==", type).get();
    sections.forEach(doc => {

      temp.push({ id: doc.id, ...doc.data() })
    });
    console.log(temp)
    setAssetSections(temp);
  }

  return (
    <View style={styles.container}>
      {
        !showSections ?
          <View>
            <Text>Choose a start date and time</Text>
            <DatePicker
              style={{ width: 200 }}
              //is24Hour
              date={startDate}
              mode="date"
              placeholder="select a Start date"
              format="YYYY-MM-DD T h:mm A"
              minDate={moment()}
              maxDate={moment().add(3,"month")}
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              customStyles={{
                dateIcon: {
                  position: 'absolute',
                  left: 0,
                  top: 4,
                  marginLeft: 0
                },
                dateInput: {
                  marginLeft: 36
                }
                // ... You can check the source to find the other keys.
              }}
              onDateChange={setTempStartDate}
            />
            
            {
              startDate ?
                <Text>
                  Your start date and time is {startDate} now choose an end date
        </Text>
                :
                null
            }
            

            <DatePicker
              style={{ width: 200 }}
              date={endDate}
              mode="date"
              placeholder="select an end date"
              format="YYYY-MM-DD T h:mm A"
              minDate={startDate}
              //maxDate={moment(startDate).add(2,"day")}
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              customStyles={{
                dateIcon: {
                  position: 'absolute',
                  left: 0,
                  top: 4,
                  marginLeft: 0
                },
                dateInput: {
                  marginLeft: 36
                }
                // ... You can check the source to find the other keys.
              }}
              onDateChange={setTempEndDate}
              disabled={!startDate}
            />

            <Button title={"Continue"} onPress={()=>setShowSections(true)} disabled={ !startDate || !endDate}/>

          </View>
          :
          <View>
            <Text>You are booking from {startDate} until {endDate} Now Choose a Section</Text>
            {assetSections.map((s, i) => (
              <TouchableOpacity onPress={() => props.navigation.navigate("List", { tName: tName, section: s, startDate: startDate, endDate: endDate, assetTypeId: type })} key={i} style={{ alignItems: "center", borderRadius: 50, height: 20, width: 200, margin: 5, backgroundColor: 'pink' }}>
                <Text >{s.name}</Text>
              </TouchableOpacity>
            ))}
            <Button title={"Change Date and Time"} onPress={()=>setShowSections(false)} />
          </View>

      }

{
        startTimeModal || endTimeModal ?
          <Modal
            animationType="slide"
            transparent={true}
            //visible={addServices}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                {
                  displayList.current.length > 0?

                  displayList.current.map( t =>
                    
                  <TouchableOpacity onPress={()=> 
                    startTimeModal? setStartTime(t) || setStartTimeModal(false): setEndTime(t) || setEndTimeModal(false)
                  }><Text>{t}</Text></TouchableOpacity>
                    )
                  :
                  <Button title="Exit" onPress={()=> setStartTimeModal(false) || setEndTimeModal(false)}/>
                }
              </View>
            </View>
          </Modal>

          :
          null
      }






    </View>
  );
}

Sections.navigationOptions = (props) => ({
  title: "Sections",
  headerStyle: { backgroundColor: "white" },
  headerTintColor: "black",
  headerTintStyle: { fontWeight: "bold" }
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center"
  },
  contentContainer: {
    paddingTop: 30
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10
  },
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50
  },
  TypesFilename: {
    marginVertical: 7
  },
  codeHighlightText: {
    color: "rgba(96,100,109, 0.8)"
  },
  codeHighlightContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    paddingHorizontal: 4
  },
  getStartedText: {
    fontSize: 24,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center"
  },
  tabBarInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        elevation: 20
      }
    }),
    alignItems: "center",
    backgroundColor: "#fbfbfb",
    paddingVertical: 20
  },
  tabBarInfoText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    textAlign: "center"
  },
  navigationFilename: {
    marginTop: 5
  },
  helpContainer: {
    marginTop: 15,
    alignItems: "center"
  },
  helpLink: {
    paddingVertical: 15
  },
  helpLinkText: {
    fontSize: 14,
    color: "#2e78b7"
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
});