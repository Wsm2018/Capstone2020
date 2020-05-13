//@refresh reset
import { Button } from "react-native-elements"
import React, { useState, useEffect, useRef } from "react";
import { createStackNavigator } from 'react-navigation-stack';

import {
  Image,
  Platform,
  TextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import moment from "moment";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db.js";
import { timing } from "react-native-reanimated";


require("firebase/firestore");



export default function Details(props) {
  const tName = props.navigation.getParam("tName", 'failed')
  const sName = props.navigation.getParam("sName", 'failed')
  const asset = props.navigation.getParam("asset", 'failed');
  const [serviceBooking, setServiceBooking] = useState([])
  const [selectedService, setSelectedService] = useState()
  const assetTypeId = props.navigation.getParam("assetTypeId", '2pioF3LLXnx2Btr4OJPn');
  const startDateTime = props.navigation.getParam("startDateTime", '2020-05-13 T 5:00:00');
  const endDateTime = props.navigation.getParam("endDateTime", '2020-05-14 T 7:00:00');
  const [workers, setWorkers] = useState([])
  const [update, setUpdate] = useState(true)
  const [services, setServices] = useState([])
  const [schedules, setSchedules] = useState([])
  const [userDays, setUserDays] = useState([])
  const [timesList, setTimesList] = useState([
    { book: false, time: "1:00:00" },
    { book: false, time: "2:00:00" },
    { book: false, time: "3:00:00" },
    { book: false, time: "4:00:00" },
    { book: false, time: "5:00:00" },
    { book: false, time: "6:00:00" },
    { book: false, time: "7:00:00" },
    { book: false, time: "8:00:00" },
    { book: false, time: "9:00:00" },
    { book: false, time: "10:00:00" },
    { book: false, time: "11:00:00" },
    { book: false, time: "12:00:00" },
    { book: false, time: "13:00:00" },
    { book: false, time: "14:00:00" },
    { book: false, time: "15:00:00" },
    { book: false, time: "16:00:00" },
    { book: false, time: "17:00:00" },
    { book: false, time: "18:00:00" },
    { book: false, time: "19:00:00" },
    { book: false, time: "20:00:00" },
    { book: false, time: "21:00:00" },
    { book: false, time: "22:00:00" },
    { book: false, time: "23:00:00" },
  ])
  const [updateAvailableTimings, setUpdateAvailableTimings] = useState([])
  const tempTime = useRef()

  useEffect(() => {
    getServices()
  }, []);

  useEffect(() => { setUpdate(!update) }, [userDays])

  useEffect(() => {
    if (schedules) {
      console.log("here")
      filterTimings()
      getAvailableTimings()
    }
  }, [schedules])

  const getServices = async () => {

    var get = await db.collection('services').where("assetType", "==", assetTypeId).onSnapshot((snapshot) => {
      const services = [];
      snapshot.forEach((doc) => {
        services.push({ id: doc.id, ...doc.data() });
      });
      setServices(services)
    });

    
  }

  const getWorkers = (id) => {
    
    setSchedules([])
    setWorkers([])
    setSelectedService(id)
    //get workers and schedule timings
    db.collection("users").where("role", "==", "worker").onSnapshot((snapshot) => {
      const schedules = [];
      const workers = []
      var temp = ""

      snapshot.forEach((doc) => {
        workers.push({ ...doc.data(), id: doc.id })

        temp = doc.data()
        temp = temp.services.filter(t => t == id)
        console.log("temp --------", temp)
        if (temp.length > 0) {
          setWorkers(workers)
          var workerId = doc.id
          db.collection("users").doc(doc.id).collection("schedules").onSnapshot((snapshot) => {
            snapshot.forEach((doc) => {
              schedules.push({ ...doc.data(), worker: workerId })
              setSchedules(schedules)
            })
          })
        }
      });
    });

  }



  const filterTimings = () => {

    var split1 = startDateTime.split(" ")
    var split2 = endDateTime.split(" ")

    var diffDays = Math.ceil((new Date(split2[0]) - new Date(split1[0])) / (1000 * 60 * 60 * 24))
    var firstDayHours = []
    var lastDayHours = []

    //console.log("dffffffffffffffff", diffDays)

    if (diffDays > 0) {

      var startHour = startDateTime.split(" ")[2]
      var endHour = endDateTime.split(" ")[2]

      //remove hours before start hour
      for (let i = 0; i < timesList.length; i++) {

        if ((timesList[i].time + "") === startHour) {
          for (let k = i; k < timesList.length; k++) {
            firstDayHours.push(timesList[k])
          }
        }
      }
      //add only the hours before last hour
      for (let i = 0; i < timesList.length; i++) {
        if ((timesList[i].time + "") == endHour) {
          break
        }
        if ((timesList[i].time + "") != endHour) {
          lastDayHours.push(timesList[i])
        }
      }
      var currentDate = split1[0]
      var days = []
      for (let i = 1; i <= diffDays + 1; i++) {
        days.push({ day: currentDate, timesList, oneBooking: false })
        currentDate = moment(currentDate).add(1, "day").format("YYYY-MM-DD")
      }
      days[0].timesList = firstDayHours
      days[days.length - 1].timesList = lastDayHours
      setUserDays(days)
    }
    else {
      var startHour = startDateTime.split(" ")[2]


      for (let i = 0; i < timesList.length; i++) {

        if ((timesList[i].time) === startHour) {
          for (let k = i; k < timesList.length; k++) {
            firstDayHours.push(timesList[k])
          }
        }
      }

      var days = []
      days.push({ day: split1[0], timesList: firstDayHours, oneBooking: false })
      setUserDays(days)

    }


  }

  const getAvailableTimings = () => {
    var toUpdate = []
    //loop through days arr
    for (let i = 0; i < userDays.length; i++) {
      //loop through day booked hours
      for (let k = 0; k < userDays[i].timesList.length; k++) {

        var userDateTime = userDays[i].day + "T" + userDays[i].timesList[k].time
        var filter = schedules.filter(t => t.dateTime === userDateTime)
        if (filter.length == workers.length) {

          toUpdate.push({ day: i, time: k })
        }
      }
    }
    setUpdateAvailableTimings(toUpdate)
  }


  const check = (time, day) => {
    if (updateAvailableTimings.filter(a => a.day === day && a.time === time).length == 1) {
      return false
    }
    else {
      return true
    }
  }

  const bookedByUser = (day, time) => {
    if (serviceBooking.filter(t => t.service == selectedService && t.day == userDays[day].day && t.time == userDays[day].timesList[time]).length > 0) {
      return true
    }
    else {
      return false
    }
  }

  const book = (day, time) => {

    var temp = serviceBooking
    var check = temp.filter(t => t.service == selectedService && t.day == userDays[day].day && t.time == userDays[day].timesList[time])
    if (check.length == 0) {
      temp.push({ service: selectedService, day: userDays[day].day, time: userDays[day].timesList[time] })
      var ud = userDays
      ud[day].timesList[time].book = true
      setUserDays(ud)
      setServiceBooking(temp)

    }
    else {
      temp = temp.filter(t => t.service != selectedService && t.day != userDays[day].day && t.time != userDays[day].timesList[time])
    }

    console.log(" add bookings", serviceBooking)
  }

  const deleteBooking = (index) =>{
    var temp = []
    for( let i=0 ; i < serviceBooking.length ; i++ ){
        if( i !== index){
          temp.push(serviceBooking[i])
        }
    }
    setServiceBooking(temp)
  }

  useEffect(() => {
    setUpdate(!update)
  }, [userDays])


  return (
    <View style={styles.container}>

      {/* {asset ?
        <View>
          <Text >{asset.code}</Text>
          <Text>{asset.price}</Text>
          <Text>{startDateTime}</Text>
          <Text>{endDateTime}</Text>

          <TouchableOpacity onPress={() => props.navigation.navigate("CheckOut", { tName: tName, sName: sName, assetBooking: { asset, startDateTime, endDateTime } })} style={{ alignItems: "center", borderRadius: 50, height: 20, width: 200, margin: 5, backgroundColor: 'pink' }}>
            <Text >CheckOut</Text>
          </TouchableOpacity>

        </View>

        :
        <Text>Loading</Text>
      } */}
      {
        services ?

          services.map(s =>
            <View>

              <TouchableOpacity onPress={() => getWorkers(s.id)}>
                <Text >{s.name}</Text>

              </TouchableOpacity>
            </View>
          )
          :
          <Text>No Available Services</Text>
      }
      {
        selectedService && userDays ?
          userDays.map((d, dayindex) =>
            <View>

              <Text>{d.day}</Text>
              <View style={{ flexDirection: "row" }}>
                {d.timesList.map((t, timeindex) =>

                  check(timeindex, dayindex) ?
                    <TouchableOpacity style={{ borderWidth: 1, borderColor: "black", backgroundColor: bookedByUser(dayindex, timeindex) ? "green" : "white" }} onPress={() => book(dayindex, timeindex)} ><Text>{t.time.split(":")[0]}</Text></TouchableOpacity>
                    :
                    <View style={{ borderWidth: 1, borderColor: "black", backgroundColor: "red" }} ><Text>{t.time.split(":")[0]}</Text></View>

                )}
              </View>
            </View>

          )
          :
          null
      }

      {
        serviceBooking ?
          serviceBooking.map((s, index) =>
            <View>
              <Text>Service: {s.service}</Text>
              <Text>Time: {s.time.time}</Text>
              <Text>Day: {s.day}</Text>
              <Button title="X" onPress={()=> deleteBooking(index)}/>
            </View>
          )
          :
          null
      }


    </View>
  )
}

Details.navigationOptions = (props) => ({
  title: "Details",
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
  }
});
