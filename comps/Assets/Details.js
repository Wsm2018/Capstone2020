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
  const startDateTime = props.navigation.getParam("startDateTime", '2020-05-13 T 1:00:00');
  const endDateTime = props.navigation.getParam("endDateTime", '2020-05-14 T 7:00:00');
  const [workers, setWorkers] = useState([])
  const [allWorkers, setAllWorkers] = useState([])
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

  const [week, setWeek] = useState(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
  const [updateAvailableTimings, setUpdateAvailableTimings] = useState([])


  useEffect(() => {
    getServices()
  }, []);

  useEffect(() => { setUpdate(!update) }, [userDays])

  useEffect(() => {
    if (schedules) {
      filterTimings()
      getAvailableTimings()
    }
  }, [schedules])


  useEffect(() => {
    setUpdate(!update)
  }, [userDays])

  useEffect(() => {

    setUpdate(!update)
    if (services.length > 0) {

      var temp = services
      for (let i = 0; i < services.length; i++) {
        console.log("here")
        db.collection('services').doc(services[i].id).collection("workingDays").onSnapshot((snapshot) => {
          const weekDays = [];
          snapshot.forEach(async (doc) => {
            weekDays.push({ day: doc.id, ...doc.data() })
          })
          temp[i].weekDays = weekDays
          setServices(temp)
        });
      }
    }

  }, [services])

  const getServices = async () => {
    //const service = [];
    db.collection('services').where("assetType", "==", assetTypeId).onSnapshot((snapshot) => {
      const services = [];
      snapshot.forEach((doc) => {
        services.push({ id: doc.id, ...doc.data() });
      });
      setServices(services)
    });

    db.collection("users").where("role", "==", "worker").onSnapshot((snapshot) => {
      var worker = ""
      snapshot.forEach((doc) => {
        worker = { ...doc.data(), id: doc.id }
        var workerId = doc.id
        db.collection("users").doc(doc.id).collection("schedules").onSnapshot((snapshot) => {
          const schedules = [];
          snapshot.forEach((doc) => {
            schedules.push({ ...doc.data(), worker: workerId })
          })
          var temp = allWorkers
          temp.push({ worker, schedules })
          setAllWorkers(temp)
        })
      });
    });
  }

  const manageTimings = async (service) => {
    setSchedules([])
    setWorkers([])
    setSelectedService(service)
    filterTimings()
    getAvailableTimings()

    db.collection("users").where("role", "==", "worker").onSnapshot((snapshot) => {
      const schedules = [];
      const workers = []
      var temp = ""

      snapshot.forEach((doc) => {
        workers.push({ ...doc.data(), id: doc.id })

        temp = doc.data()
        temp = temp.services.filter(t => t == service.id)

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
    var days = []
    //if more than one day
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

      for (let i = 1; i <= diffDays + 1; i++) {
        days.push({ day: currentDate, timesList, bookings: 0 })
        currentDate = moment(currentDate).add(1, "day").format("YYYY-MM-DD")
      }
      days[0].timesList = firstDayHours
      days[days.length - 1].timesList = lastDayHours

      //console.log("after", days)

    }
    //if one day
    else {
      var startHour = startDateTime.split(" ")[2]
      for (let i = 0; i < timesList.length; i++) {
        if ((timesList[i].time) === startHour) {
          for (let k = i; k < timesList.length; k++) {
            firstDayHours.push(timesList[k])
          }
        }
      }

      days.push({ day: split1[0], timesList: firstDayHours, bookings: 0 })

    }


    if (selectedService) {
      for (let i = 0; i < days.length; i++) {
        var temp = []
        var findDay = week[new Date(days[i].day).getDay()]
        //var result = findDay]
        //console.log("resultaaa,", findDay)
        //filter based on the day
        var serviceWorkingDay = selectedService.weekDays.filter(h => h.day == findDay)[0]
        if (serviceWorkingDay && serviceWorkingDay.hours) {
          for (let k = 0; k < days[i].timesList.length; k++) {

            var findHour = serviceWorkingDay.hours.filter(h => h === days[i].timesList[k].time)[0]

            if (findHour) {
              temp.push(days[i].timesList[k])
            }

          }
        }

        days[i].timesList = temp
      }
    }
    setUserDays(days)
  }

  const getAvailableTimings = () => {
    var toUpdate = []
    var totalWorkers = []
    //loop through days arr
    for (let i = 0; i < userDays.length; i++) {
      //loop through day booked hours
      for (let k = 0; k < userDays[i].timesList.length; k++) {
        var counter = 0
        for (let j = 0; j < allWorkers.length; j++) {

          var check = allWorkers[j].worker.services.filter(s => s == selectedService.id)
          if (check.length > 0) {
            totalWorkers = totalWorkers.filter(t => t == allWorkers[j].id)
            if (totalWorkers.length == 0) {
              totalWorkers.push(allWorkers[j].id)
            }
            // if worker CHECK TIME IN worker schedule
            var userDateTime = userDays[i].day + "T" + userDays[i].timesList[k].time
            var checkTime = allWorkers[j].schedules.filter(s => s.dateTime === userDateTime)
            // console.log(" check resuly -----", checkTime  , "---",userDateTime)
            if (checkTime.length > 0) {
              counter = counter + 1
            }
          }
        }

        if (totalWorkers.length === counter) {
          // console.log("to update")
          toUpdate.push({ day: i, time: k })
        }
      }
    }
    setUpdateAvailableTimings(toUpdate)
  }



  const book = (day, time) => {
    //chick if service is booked more that service.maxBookings
    if (parseInt(selectedService.maxBookings) == userDays[day].bookings ) {
      alert("Sorry, Only "+ selectedService.maxBookings+" "+ selectedService.name+ "Booking/s Allowed Per Day")
    }
    else {
      var temp = serviceBooking
      var check = temp.filter(t => t.service.id == selectedService.id && t.day == userDays[day].day && t.time == userDays[day].timesList[time].time)
      //console.log("check", check)
      if (check.length == 0) {

        var selectedWorker = ""
        for (let j = 0; j < allWorkers.length; j++) {

          var findWorker = allWorkers[j].worker.services.filter(s => s == selectedService.id)

          if (findWorker.length > 0) {
            var checkSchedule = allWorkers[j].schedules.filter(s => s.dateTime == userDays[day].day + "T" + userDays[day].timesList[time])
            if (checkSchedule.length == 0) {
              var updateSchedule = allWorkers
              updateSchedule[j].schedules.push({ dateTime: userDays[day].day + "T" + userDays[day].timesList[time].time })
              setAllWorkers(updateSchedule)
              selectedWorker = allWorkers[j]

            }
          }
        }
        temp.push({ service: selectedService, day: userDays[day].day, time: userDays[day].timesList[time].time, worker: selectedWorker.worker.id })
        var ud = userDays
        ud[day].timesList[time].book = true
        ud[day].bookings = ud[day].bookings + 1
        setUserDays(ud)
        setUpdate(!update)
        setServiceBooking(temp)

      }
      else {
        var index = serviceBooking.findIndex( i => i.day == userDays[day].day && i.time == userDays[day].timesList[time].time)
        var updateWorkers = allWorkers
        for (let i = 0; i < updateWorkers.length; i++) {
          if (updateWorkers[i].worker.id == serviceBooking[index].worker) {
            // console.log(" timaaaaaaa,", serviceBooking[index].day + "T" + serviceBooking[index].time, "//////", updateWorkers[i].schedules)
            var newSchedule = updateWorkers[i].schedules.filter(t => t.dateTime != serviceBooking[index].day + "T" + serviceBooking[index].time)
            //console.log(" should delete", newSchedule)
            updateWorkers[i].schedules = newSchedule
            var ud = userDays
            //ud[serviceBooking[index]].bookings = ud[day].bookings -1
            for (let k = 0; k < userDays.length; k++) {
              if (userDays[k].day == serviceBooking[index].day) {
                ud[k].bookings = userDays[k].bookings - 1
                setUserDays(ud)
              }
            }

            setAllWorkers(updateWorkers)
            break;
          }
        }

        var temp = []
        for (let i = 0; i < serviceBooking.length; i++) {
          if (i !== index) {
            temp.push(serviceBooking[i])
          }
        }
        setServiceBooking(temp)
      }
      setUpdate(!update)
      var forceUpdate = userDays
      setUserDays(forceUpdate)
    }


  }

  const deleteBooking = (index) => {

    var updateWorkers = allWorkers
    for (let i = 0; i < updateWorkers.length; i++) {
      if (updateWorkers[i].worker.id == serviceBooking[index].worker) {
        // console.log(" timaaaaaaa,", serviceBooking[index].day + "T" + serviceBooking[index].time, "//////", updateWorkers[i].schedules)
        var newSchedule = updateWorkers[i].schedules.filter(t => t.dateTime != serviceBooking[index].day + "T" + serviceBooking[index].time)
        //console.log(" should delete", newSchedule)
        updateWorkers[i].schedules = newSchedule
        var ud = userDays
        //ud[serviceBooking[index]].bookings = ud[day].bookings -1
        for (let k = 0; k < userDays.length; k++) {
          if (userDays[k].day == serviceBooking[index].day) {
            ud[k].bookings = userDays[k].bookings - 1
            setUserDays(ud)
          }
        }

        setAllWorkers(updateWorkers)
        break;
      }
    }

    var temp = []
    for (let i = 0; i < serviceBooking.length; i++) {
      if (i !== index) {
        temp.push(serviceBooking[i])
      }
    }
    setServiceBooking(temp)


  }


  const checkHour = (time, day) => {
    //not booked
    if (serviceBooking.filter(t => t.service == selectedService && t.day == userDays[day].day && t.time == userDays[day].timesList[time].time).length > 0) {
      return "green"
    }
    else if (!updateAvailableTimings.filter(a => a.day === day && a.time === time).length == 1) {
      return "white"
    }
    else {
      return "red"
    }
  }

  return (
    <View style={styles.container}>

      {asset ?
        <View>
          <Text >{asset.code}</Text>
          <Text>{asset.price}</Text>
          <Text>{startDateTime}</Text>
          <Text>{endDateTime}</Text>


        </View>

        :
        <Text>Loading</Text>
      }
      {
        services ?

          services.map(s =>
            <View>

              <TouchableOpacity onPress={() => manageTimings(s)}>
                <Text >{s.name}</Text>

              </TouchableOpacity>
            </View>
          )
          :
          <Text>No Available Services</Text>
      }


      {
        selectedService ?
          <View>
            <Text>Service: {selectedService.name}</Text>
            {/* <Text>bookings per day: {selectedService.maxBookings}</Text> */}


          </View>
          :
          null
      }


      {
        selectedService && userDays ?
          <View>
            <Text>Working Hours</Text>
            {
              userDays.map((d, dayindex) =>
                <View>

                  <Text>{d.day}</Text>
                  <View style={{ flexDirection: "row" }}>
                    {d.timesList.map((t, timeindex) =>

                      checkHour(timeindex, dayindex) == "green" ?
                        <TouchableOpacity style={{ borderWidth: 1, borderColor: "black", backgroundColor: "green" }} onPress={() => book(dayindex, timeindex)} ><Text>{t.time.split(":")[0]}</Text></TouchableOpacity>
                        : checkHour(timeindex, dayindex) == "white" ?
                          <TouchableOpacity style={{ borderWidth: 1, borderColor: "black", backgroundColor: "white" }} onPress={() => book(dayindex, timeindex)} ><Text>{t.time.split(":")[0]}</Text></TouchableOpacity>
                          :
                          <View style={{ borderWidth: 1, borderColor: "black", backgroundColor: "red" }} ><Text>{t.time.split(":")[0]}</Text></View>

                    )}
                  </View>
                </View>

              )}
          </View>
          :
          null
      }


      {
        serviceBooking ?
          serviceBooking.map((s, index) =>
            <View>
              <Text>Service: {s.service.name}</Text>
              <Text>Time: {s.time}</Text>
              <Text>Day: {s.day}</Text>
              <Button title="X" onPress={() => deleteBooking(index)} />
            </View>
          )
          :
          null
      }

      <TouchableOpacity onPress={() => props.navigation.navigate("CheckOut", { tName: tName, sName: sName, assetBooking: { asset, startDateTime, endDateTime }, serviceBooking })} style={{ alignItems: "center", borderRadius: 50, height: 20, width: 200, margin: 5, backgroundColor: 'pink' }}>
        <Text >CheckOut</Text>
      </TouchableOpacity>

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
