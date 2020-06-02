import React, { useState, useEffect } from "react";
import { View, Text, Button, TouchableOpacity, TextInput, Alert, Modal, StyleSheet } from "react-native";
import db from "../../db";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import { ScrollView } from "react-native-gesture-handler";
import Collapsible from 'react-native-collapsible';


export default function ServiceManagement(props) {
    //const assetType = props.navigation.getParam("assetType", '2pioF3LLXnx2Btr4OJPn');
    const assetType = { id: '2pioF3LLXnx2Btr4OJPn' }
    const [services, setServices] = useState([])
    const [selectedService, setSelectedService] = useState()
    const [showEdit, setShowEdit] = useState(false)
    const [showAdd, setShowAdd] = useState(false)
    const [name, setName] = useState()
    const [maxBookings, setMaxBookings] = useState()
    const [price, setPrice] = useState()
    const [weekDays, setWeekDays] = useState([])
    const [collaps, setCollaps] = useState()
    const [timesList, setTimesList] = useState([
        { use: false, show: "12:00 AM", time: "00:00:00" },
        { use: false, show: "1:00 AM", time: "1:00:00" },
        { use: false, show: "2:00 AM", time: "2:00:00" },
        { use: false, show: "3:00 AM", time: "3:00:00" },
        { use: false, show: "4:00 AM", time: "4:00:00" },
        { use: false, show: "5:00 AM", time: "5:00:00" },
        { use: false, show: "6:00 AM", time: "6:00:00" },
        { use: false, show: "7:00 AM", time: "7:00:00" },
        { use: false, show: "8:00 AM", time: "8:00:00" },
        { use: false, show: "9:00 AM", time: "9:00:00" },
        { use: false, show: "10:00 AM", time: "10:00:00" },
        { use: false, show: "11:00 AM", time: "11:00:00" },
        { use: false, show: "12:00 PM", time: "12:00:00" },
        { use: false, show: "1:00 PM", time: "13:00:00" },
        { use: false, show: "2:00 PM", time: "14:00:00" },
        { use: false, show: "3:00 PM", time: "15:00:00" },
        { use: false, show: "4:00 PM", time: "16:00:00" },
        { use: false, show: "5:00 PM", time: "17:00:00" },
        { use: false, show: "6:00 PM", time: "18:00:00" },
        { use: false, show: "7:00 PM", time: "19:00:00" },
        { use: false, show: "8:00 PM", time: "20:00:00" },
        { use: false, show: "9:00 PM", time: "21:00:00" },
        { use: false, show: "10:00 PM", time: "22:00:00" },
        { use: false, show: "11:00 PM", time: "23:00:00" },
    ])

    const [week, setWeek] = useState(["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])

    const [serviceWorkHoursDays, setServiceWorkHoursDays] = useState([])

    useEffect(() => {
        db.collection("services").onSnapshot((snapshot) => {
            const temp = []
            snapshot.forEach(doc => {
                if (doc.data().assetType == assetType.id) {
                    temp.push({ id: doc.id, ...doc.data() })
                }
            });
            setServices(temp)
        })
    }, [])

    useEffect(() => {

        if (services.length > 0) {
            var temp = services
            for (let i = 0; i < services.length; i++) {
                db.collection('services').doc(services[i].id).collection("workingDays").onSnapshot((snapshot) => {
                    var weekDays = [];
                    snapshot.forEach(async (doc) => {
                        weekDays.push({ day: doc.id, ...doc.data(), service: services[i].id })
                    })
                    manageDays(services[i], weekDays)
                });
            }
        }

    }, [services])

    const manageDays = (service, weekDays) => {
        var temp = serviceWorkHoursDays
        var workingAt = []
        for (let i = 0; i < week.length; i++) {
            var findDay = weekDays.filter(w => w.day === week[i])[0]
            // console.log(" found", findDay)
            workingAt.push({ day: week[i], hours: findDay ? findDay.hours : [] })
        }

        temp.push({ service, workingDays: workingAt })
        setServiceWorkHoursDays(temp)
    }

    useEffect(() => {
        //console.log(" finaal ", serviceWorkHoursDays)
    }, [serviceWorkHoursDays])


    const handleDB = async () => {
        if (showAdd) {
            var sId = ""
            let add = await db.collection("services").add({
                name,
                price,
                maxBookings,
                rating: 0,
                assetType: assetType.id
            }).then(docRef =>
                sId = docRef.id
            )
            for (let i = 0; i < weekDays.length; i++) {
                db.collection("services").doc(sId).collection("weekDays").doc(weekDays.day).set(hours)
            }

            setShowAdd(false)
        }
        else if (showEdit) {
            db.collection("services").doc(selectedService.id).update({
                name,
                price,
                maxBookings
            })
            setShowEdit(false)
        }
        else {
            Alert.alert("Delete " + selectedService.name + " ?",
                "", [
                { text: "Yes", onPress: () => db.collection("services").doc(selectedService.id).delete() && setSelectedService() },
                { text: "No", onPress: () => console.log("NOO") }

            ],
                { cancelable: true });
        }
        setName()
        setPrice()
        setMaxBookings()

    }

    const color = (day, hour) => {
        var found = serviceWorkHoursDays.filter(f => f == selectedService)[0].workingDays.filter(d => d.day == day)[0].hours.filter(t => t == hour)
       
        return found.length > 0
    }

    const addDay = (day, hour) => {
        var temp = serviceWorkHoursDays
        //console.log("found ", serviceWorkHoursDays)
        
        var found = serviceWorkHoursDays.filter(f => f == selectedService)[0].workingDays.filter(d => d.day == day)[0].hours.filter(t => t == hour)
        if( found.length > 0 ){
            console.log("remove")

        }
        else{
            console.log("add")
            for( let i=0 ; i < serviceWorkHoursDays.length ; i++){
                console.log("here",selectedService)
                if(serviceWorkHoursDays[i].service == selectedService){
                    console.log("here",serviceWorkHoursDays[i].service)
                    for( let k=0 ; k < serviceWorkHoursDays[i].workingDays.length ; k++){
                        if( serviceWorkHoursDays[i].workingDays[k].day == day){

                            temp.workingDays[k].hours.push(hour)
                            console.log(" ehhhee",temp.workingDays[k].hours)
                        }
                    }
                }
            }
        }
        setServiceWorkHoursDays( temp)
    }

    const display = (hour) => {
        var time = timesList.filter(t => t.time == hour)[0]
        return time.show
    }


    return (
        <ScrollView>
            <Text>{assetType.name} Service Management</Text>


            {
                services && !selectedService ?
                    <View>
                        {
                            serviceWorkHoursDays.map(s =>
                                <TouchableOpacity onPress={() => setSelectedService(s)}><Text>{s.service.name}</Text></TouchableOpacity>
                            )
                        }
                        {!showAdd ? <Button title="Add" onPress={() => setShowAdd(true)} /> : null}
                    </View>
                    :
                    null
            }

            {
                selectedService && !showEdit ?
                    <View>
                        <Text>Name: {selectedService.service.name}</Text>
                        <Text>Price: {selectedService.service.price}</Text>
                        <Text>Max Booking Per Day: {selectedService.service.maxBookings}</Text>
                        <Text>Rating: {selectedService.service.rating}</Text>
                        <Text>Working Hours</Text>
                        {
                            selectedService.workingDays.map(w =>
                                <View>
                                    <Text>{w.day}</Text>

                                    {
                                        w.hours.length > 0 ?

                                            <View style={{ flexDirection: "row" }}>{
                                                w.hours.map(h =>
                                                    <Text style={{ borderColor: "black", borderWidth: 1 }}>{display(h)}</Text>
                                                )}
                                            </View>
                                            :
                                            <Text>No Working Hours</Text>
                                    }
                                </View>
                            )
                        }

                        <Button title={"Edit"}
                            onPress={() =>
                                setShowEdit(true) ||
                                setMaxBookings(selectedService.maxBookings) ||
                                setPrice(selectedService.price) ||
                                setName(selectedService.name)
                            }
                        />
                        {/* <Button title={"Delete"} onPress={() => handleDB()} /> */}

                    </View>
                    :
                    null}

            {showEdit || showAdd ?
                <View>
                    <TextInput
                        onChangeText={setName}
                        placeholder="Name"
                        value={name}
                    />
                    <TextInput
                        onChangeText={setPrice}
                        placeholder="Price"
                        value={price}
                    />
                    <TextInput
                        onChangeText={setMaxBookings}
                        placeholder="Max Bookings Per Day"
                        value={maxBookings}
                    />

                    <Text>Working Hours</Text>

                    {
                        week.map((w) =>
                            <View style={{ width: "80%" }}>
                                <TouchableOpacity onPress={() => collaps == w ? setCollaps() :
                                    setCollaps(w)}><Text >{w}</Text>
                                </TouchableOpacity>

                                {collaps == w ?
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
                                                <Text>{w}</Text>
                                                <View style={{
                                                    flexDirection: "row",
                                                    //width:"80%", 
                                                }}>
                                                    {
                                                        timesList.map((t, index) =>
                                                            index < 6 ?
                                                                color(w, t.time) ?
                                                                    <TouchableOpacity onPress={()=>addDay( w , t.time )}>
                                                                        <Text style={{ backgroundColor: "green", borderColor: "black", borderWidth: 1 }}>{t.show}</Text>
                                                                        </TouchableOpacity>
                                                                    :
                                                                    <TouchableOpacity onPress={()=>addDay( w , t.time )}>
                                                                        <Text style={{ borderColor: "black", borderWidth: 1 }}>{t.show}</Text>
                                                                        </TouchableOpacity>
                                                                :
                                                                null
                                                        )
                                                    }

                                                </View>

                                                <View style={{ flexDirection: "row" }}>
                                                    {
                                                        timesList.map((t, index) =>
                                                            index >= 6 && index < 12 ?

                                                                color(w, t.time) ?

                                                                <TouchableOpacity onPress={()=>addDay( w , t.time )}><Text style={{ backgroundColor: "green", borderColor: "black", borderWidth: 1 }}>{t.show}</Text>
                                                                   </TouchableOpacity>
                                                                    :
                                                                    <TouchableOpacity onPress={()=>addDay( w , t.time )}><Text style={{ borderColor: "black", borderWidth: 1 }}>{t.show}</Text>
                                                                    </TouchableOpacity>
                                                                    :
                                                                null
                                                        )
                                                    }
                                                </View>

                                                <View style={{ flexDirection: "row" }}>
                                                    {
                                                        timesList.map((t, index) =>
                                                            index >= 12 && index < 18 ?

                                                            color(w, t.time) ?

                                                            <TouchableOpacity onPress={()=>addDay( w , t.time )}><Text style={{ backgroundColor: "green", borderColor: "black", borderWidth: 1 }}>{t.show}</Text>
                                                               </TouchableOpacity>
                                                                :
                                                                <TouchableOpacity onPress={()=>addDay( w , t.time )}><Text style={{ borderColor: "black", borderWidth: 1 }}>{t.show}</Text>
                                                                </TouchableOpacity>
                                                                :
                                                            null
                                                        )
                                                    }
                                                </View>

                                                <View style={{ flexDirection: "row" }}>
                                                    {
                                                        timesList.map((t, index) =>
                                                            index >= 18 && index < 24 ?

                                                            color(w, t.time) ?

                                                            <TouchableOpacity onPress={()=>addDay( w , t.time )}><Text style={{ backgroundColor: "green", borderColor: "black", borderWidth: 1 }}>{t.show}</Text>
                                                               </TouchableOpacity>
                                                                :
                                                                <TouchableOpacity onPress={()=>addDay( w , t.time )}><Text style={{ borderColor: "black", borderWidth: 1 }}>{t.show}</Text>
                                                                </TouchableOpacity>
                                                                :
                                                            null
                                                        )
                                                    }
                                                </View>
                                                <Button title="OK" onPress={() => setCollaps()} />
                                            </View>
                                        </View>
                                    </Modal>
                                    :
                                    null}
                            </View>
                        )
                    }

                    {showAdd ?
                        <Button title={"Add"} onPress={() => handleDB()} />
                        :
                        <Button title={"Edit"} onPress={() => handleDB()} />
                    }
                    <Button title={"Cancel"} onPress={() => setShowEdit(false)} />
                </View>

                :
                null
            }

        </ScrollView>
    );
}


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