import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Modal,
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
  SwipeableListView,
} from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";
import db from "../../db.js";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import { AsyncStorage } from "react-native";
import ExtendServices from "./ExtendServices"

export default function BookingHistory(props) {

  const [assetBookings, setAssetBookings] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [newServiceBookings, setNewServiceBookings] = useState([]);
  const [newShow, setNewShow] = useState([])
  const [newUserDays, setNewUserDays] = useState([])
  const serviceTotal = useRef()
  const total = useRef()
  const assetTotal = useRef()
  const [payments, setPayments] = useState([]);
  const [viewDetails, setViewDetails] = useState()
  const [services, setServices] = useState([])
  const [workers, setWorkers] = useState([])
  const [extension, setExtension] = useState()
  const [dateInput, showDateInput] = useState(false)
  const [addServices, setAddServices] = useState(false)
  const [typeId, setTypeId] = useState()
  const [accepted, setAccepted] = useState()
  const [updateAvailableTimings, setUpdateAvailableTimings] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [assetBookingTotal, setAssetBookingTotal] = useState(0)
  const [serviceBookingTotal, setServiceBookingTotal] = useState(0)

  useEffect(() => {
    getBookings()

  }, []);

  const getBookings = () => {
    //payment has booking and user id
    db.collection("payments")
      .onSnapshot((querySnapshot) => {
        const p = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().assetBooking.user.id == firebase.auth().currentUser.uid) {
            p.push({ id: doc.id, ...doc.data() });
            setPayments([...p]);
          }
        });
      });

    db.collection("services")
      .onSnapshot((querySnapshot) => {
        const p = [];
        querySnapshot.forEach((doc) => {
          p.push({ id: doc.id, ...doc.data(), bookings: "" });

        });
        setServices([...p]);
      });

    db.collection("users").where("role", "==", "worker").onSnapshot((snapshot) => {
      var worker = ""
      snapshot.forEach((doc) => {
        worker = { ...doc.data(), id: doc.id }

        var workerId = doc.id
        db.collection("users").doc(doc.id).collection("schedules").onSnapshot((snapshot) => {
          const schedules = [];
          snapshot.forEach((doc) => {
            schedules.push({ ...doc.data(), worker: workerId, id: doc.id })

          })
          var temp = workers
          temp.push({ worker, schedules })
          setWorkers(temp)
        })
      });
    });
  };

  useEffect(() => {
    if (services) {
      for (let i = 0; i < services.length; i++) {
        db.collection("services").doc(services[i].id).collection("serviceBookings")
          .onSnapshot((querySnapshot) => {
            const p = [];
            querySnapshot.forEach((doc) => {
              p.push({ id2: doc.id, id: doc.id, ...doc.data() });
            });
            let temp = services
            temp[i].bookings = [...p]
            setServiceBookings(temp)
          });
      }
    }
  }, [services])

  useEffect(() => {
    if (viewDetails) {
      let bookedServices = []
      let temp = viewDetails
      for (let i = 0; i < serviceBookings.length; i++) {
        for (let k = 0; k < serviceBookings[i].bookings.length; k++) {
          if (serviceBookings[i].bookings[k].assetBooking.id === viewDetails.assetBooking.id) {
            bookedServices.push({ id: serviceBookings[i].bookings[k].id2, dateTime: serviceBookings[i].bookings[k].dateTime, service: serviceBookings[i].bookings[k].service, worker: serviceBookings[i].bookings[k].worker })
          }
        }
      }
      temp.bookedServices = bookedServices
      setViewDetails(temp)
    }
  }, [viewDetails])

  const cancelBooking = async () => {
    //delete Payment
    db.collection("payments").doc(viewDetails.id).delete()
    //delete asset booking
    db.collection("assets").doc(viewDetails.assetBooking.asset.id).collection("assetBookings").doc(viewDetails.assetBooking.id).delete()

    for (let i = 0; i < viewDetails.bookedServices.length; i++) {
      //update worker schedule
      var worker = workers.filter(w => w.worker.id == viewDetails.bookedServices[i].worker)[0]
      var sch = worker.schedules.filter(s => s.serviceBooking.assetBooking.id === viewDetails.assetBooking.id)[0]
      db.collection("users").doc(viewDetails.bookedServices[i].worker).collection("schedules").doc(sch.id).delete()
      //delete service booking
      db.collection("services").doc(viewDetails.bookedServices[i].service.id).collection("serviceBookings").doc(viewDetails.bookedServices[i].id).delete()

    }
    //update user points & balance
    var user = await db.collection("users").doc(firebase.auth().currentUser.uid).get()
    var points = parseInt(user.data().points) - 10
    var status = viewDetails.status
    if (status) {
      var balance = viewDetails.totalAmount + parseInt(90)
      db.collection("users").doc(firebase.auth().currentUser.uid).update({ points: points, balance: balance })
    }
    else {
      db.collection("users").doc(firebase.auth().currentUser.uid).update({ points: points })
    }
  }

  const checkExtension = async () => {
    //console.log("start", viewDetails.assetBooking.endDateTime , "end", extension)
    let bookingTemp = [];
    let bookings = await db.collection('assets').doc(viewDetails.assetBooking.asset.id).collection('assetBookings').get()
    if (bookings) {
      bookings.forEach(b => {
        bookingTemp.push(b.data())
      })
    }
    //console.log(" bookings", viewDetails.assetBooking.asset.id)

    var check = bookingTemp.filter((assetBooking) =>
      (viewDetails.assetBooking.endDateTime <= assetBooking.startDateTime &&
        extension <= assetBooking.startDateTime) ||
      (viewDetails.assetBooking.endDateTime >= assetBooking.endDateTime &&
        extension >= assetBooking.endDateTime)
    )

    setAccepted(check.length == bookingTemp.length)
    //get asset type id
    var type = await db.collection("assetSections").doc(viewDetails.assetBooking.asset.assetSection).get()
    setTypeId(type.data().assetType)
  }

  useEffect(()=>{
    if(accepted){
      var start = viewDetails.assetBooking.endDateTime
      var end = ""
      if (extension.split(" ")[3] == "PM") {
        end = extension.split(" ")[0] + " T " + (parseInt(extension.split(" ")[2].split(":")[0]) + 12) + ":00:00"
      }
      else {
        end = extension.split(" ")[0] + " T " + extension.split(" ")[2] + ":00"
      }

      // count days and total
      var s = new Date(start.split(" ").join(''))
      var e = new Date(end.split(" ").join(''))
      var diff = (e.getTime() - s.getTime()) / 1000;

      diff /= (60 * 60);

      var assetTotal = Math.round(diff * parseInt(viewDetails.assetBooking.asset.price) * 100) / 100

      setTotalAmount(assetTotal)
      // total.current = assetTotal
      // assetTotal.current = assetTotal
      setAssetBookingTotal( assetTotal)
    }
  },[accepted])

  useEffect(() => {
    if (extension) {
      setNewServiceBookings([])
      // setExtension()
      checkExtension()

    }
  }, [extension])

  useEffect(()=>{
    var serviceT = 0
    console.log("OHA",newServiceBookings)
    if (newServiceBookings.length > 0) {
      for (let i = 0; i < newServiceBookings.length; i++) {
        console.log("in loop",newServiceBookings[i].service.price )
        serviceT = serviceT + parseInt(newServiceBookings[i].service.price)
      }
      setTotalAmount(totalAmount + serviceT)
    //total.current= total.current + serviceT
    //serviceTotal.current = serviceT
    setServiceBookingTotal(serviceT)
    //console.log("service booking state", serviceBookingTotal , "Ref ", serviceTotal.current ,"loop", serviceT)
    }

  },[newServiceBookings])

  const getServiceBookings = (bookings, show, userdays, updateAvailable) => {
    setNewServiceBookings(bookings)
    setNewShow(show)
    //setNewUserDays(userdays)
    setAddServices(false)
    //setUpdateAvailableTimings(updateAvailable)
    
    
  }

  const back = () => {
    setViewDetails()
    showDateInput(false)
    setAddServices(false)
    setExtension()
    setNewShow([])
    setNewServiceBookings([])
  }

  const confirm = async () => {
    Alert.alert("Payment", '',
      [
        { text: 'Pay Now?', onPress: () => console.log("ff") },
        { text: 'Pay Later', onPress: () => payLater() },
        { text: 'Cancel', onPress: () => console.log('No Pressed') },
      ],

    );
  }

  const payLater = async () => {

    var u = await db.collection("users").doc(firebase.auth().currentUser.uid).get()
    var user = u.data()
    user.id = firebase.auth().currentUser.uid

    var endDateTime = ""

    if (extension.split(" ")[3] == "PM") {
      endDateTime = extension.split(" ")[0] + " T " + (parseInt(extension.split(" ")[2].split(":")[0]) + 12) + ":00:00"
    }
    else {
      endDateTime = extension.split(" ")[0] + " T " + extension.split(" ")[2] + ":00"
    }
    const handleBooking = firebase.functions().httpsCallable("handleBooking");
    const editBooking = firebase.functions().httpsCallable("editBooking");
    if (viewDetails.status) {
      const response = await handleBooking({
        user: user,
        asset: viewDetails.assetBooking.asset,
        startDateTime: viewDetails.assetBooking.endDateTime,
        endDateTime: endDateTime,
        card: { cardNo: "", expiryDate: "", CVC: "", cardType: "", cardHolder: "" },
        promotionCode: null,
        dateTime: moment().format("YYYY-MM-DD T HH:mm"),
        addCreditCard: false,
        uid: firebase.auth().currentUser.uid,
        totalAmount: totalAmount,
        status: false,
        serviceBooking: newServiceBookings
      });
    }
    else{
      const response = await editBooking({
        paymentId: viewDetails.id, 
        endDateTime: endDateTime,
        assetBooking: viewDetails.assetBooking,
        totalAmount: totalAmount + viewDetails.totalAmount ,
        status: false,
        serviceBooking: newServiceBookings
      });
    }

  }

  return (
    <View style={{ backgroundColor: "#F0F8FF", height: "100%", paddingTop: 10 }}>
      {
        accepted?
        <View><Text>total : {totalAmount}</Text>
        <Text>total Asset : {assetBookingTotal}   </Text></View>
        :
        null
      }
      
      {
        payments && !viewDetails ?
          payments.map(p =>

            <TouchableOpacity onPress={() => setViewDetails(p)}><Text>{p.id}</Text>
              <Text>{p.totalAmount}</Text>
              <Text>{!p.status ? "Not Payed" : null}</Text>

            </TouchableOpacity>
          )
          :
          null
      }

      {
        viewDetails ?
          <View>
            <Text>{viewDetails.id}</Text>
            <Text>{viewDetails.assetBooking.startDateTime}</Text>
            <Text>{viewDetails.assetBooking.endDateTime}</Text>
            {/* <Button title={"edit"} onPress={}/> */}
            {/* <Button title={"cancel"} onPress={()=>cancelBooking()}/> */}
            <Button title={"Back"} onPress={() => back()} />
            <Button title={"extend"} onPress={() => showDateInput(true)} />
          </View>
          :
          null
      }

      {
        dateInput ?
          <DatePicker
            style={{ width: 200 }}
            //is24Hour
            minuteInterval={15}
            date={extension}
            mode="datetime"
            placeholder="select a Start date"
            format="YYYY-MM-DD T h:00 A"
            minDate={viewDetails.assetBooking.endDateTime}
            maxDate={moment().add(3, "month")}
            minTime={moment(viewDetails.assetBooking.endDateTime).format()}
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
            onDateChange={setExtension}
          />
          :
          null
      }

      {
        accepted && extension ?
          <View>
            <Text>Extension Valid</Text>
            <Button title="Services" onPress={() => setAddServices(true)} />
            <Button title="Confirm" onPress={() => confirm()} />
          </View>
          : !accepted && extension ?
            <Text>Extension Not Valid</Text>
            :
            null

      }

      {
        addServices ?
          <Modal
            animationType="slide"
            transparent={true}
            visible={addServices}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <ExtendServices
                  //sName={selectedSection.name}
                  //tName={tName}
                  oldDays={newUserDays}
                  oldSb={newServiceBookings}
                  oldSh={newShow}
                  oldAvailable={updateAvailableTimings}
                  serviceBookingArr={(bookings, show, days, updateAvailable) => getServiceBookings(bookings, show, days, updateAvailable)}
                  asset={viewDetails.assetBooking.asset}
                  startDateTime={viewDetails.assetBooking.endDateTime}
                  endDateTime={extension}
                  type={typeId}
                  navigation={props.navigation}
                />

              </View>
            </View>
          </Modal>

          :
          null
      }

      {
        newServiceBookings.length > 0 ?
          <View>
            <Text>Booked Services</Text>
            {
              newShow.map(s =>
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
            <Text>Services Total Amount:   {serviceBookingTotal}</Text>
          </View>
          :
          null
      }



    </View>
  );
}

BookingHistory.navigationOptions = {
  title: "History",

};
//
const styles = StyleSheet.create({
  input: { height: 40, borderColor: "#284057", borderWidth: 1, width: "60%", backgroundColor: "white", paddingLeft: 7 },
  label: { fontSize: 15, color: "#284057", width: "30%", fontWeight: "bold" },
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
}) //backgroundColor:"white" fontWieght:"bold" , paddingLeft: 5
