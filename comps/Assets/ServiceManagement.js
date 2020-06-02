import React, { useState, useEffect } from "react";
import { View, Text, Button, TouchableOpacity, TextInput, Alert, Modal, StyleSheet } from "react-native";
import db from "../../db";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import { ScrollView } from "react-native-gesture-handler";
import Collapsible from 'react-native-collapsible';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function ServiceManagement(props) {
    const assetType = props.navigation.getParam("assetType", '2pioF3LLXnx2Btr4OJPn');
    //const assetType = { id: '2pioF3LLXnx2Btr4OJPn' }
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
    const [showIcons , setShowIcons] = useState(false)
    const [serviceIcon , setServiceIcon] = useState() 
    const [week, setWeek] = useState(["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])
    const [serviceWorkHoursDays, setServiceWorkHoursDays] = useState([])
    const [update , setUpdate] = useState(false)
    const icons = [
        "alpha-a", "alpha-b", "alpha-c", "alpha-d", "alpha-e", "alpha-f", "alpha-g", "alpha-h", "alpha-i", "alpha-j", "alpha-k", "alpha-l",
        "alpha-m", "alpha-n", "alpha-o", "alpha-p", "alpha-q", "alpha-r", "alpha-s", "alpha-t", "alpha-u", "alpha-v", "alpha-w", "alpha-x",
        "alpha-y", "alpha-z", "car",
        "airballoon", "air-conditioner", "air-horn", "airplane-takeoff", "airport", "alarm", "airplane", "album", "alien",
        "ambulance", "apple", "archive", "artist", "assistant", "audiobook", "audio-video", "atom", "baby-buggy", "bag-personal", "bank", "barley",
        "barn", "barrel", "battery", "basketball-hoop", "basketball", "beaker-outline", "bed-empty", "bell", "battery-charging", "beach", "beer",
        "billiards", "billiards-rack", "bowling", "boombox", "bowl", "bottle-wine", "broom", "bus", "cake", "car-wash", "car-estate", "cart",
        "cctv", "chef-hat", "creation", "crown", "cup", "diamond-stone", "dog-service", "doctor", "dump-truck", "flower-tulip", "food-fork-drink",
        "forklift", "garage-open", "gift", "golf", "hammer", "home", "home-group", "lamp", "lock", "map-marker", "medal", "pac-man", "palette-outline",
        "parking", "phone", "percent", "piano", "pill", "pipe-leak", "printer", "radio", "roller-skate", "room-service-outline", "scissors-cutting",
        "settings-outline", "shower", "shower-head", "smoking", "smoking-off", "star", "stocking", "toilet", "tooth", "tower-fire", "trash-can", "water",
        "xbox-controller", "account", "car-key", "doctor","human-female","human","image-filter-drama","mailbox","map-outline","motorbike","needle",
        "numeric-1","numeric-2","numeric-3","numeric-4","numeric-5","numeric-6",
        "numeric-7","numeric-8","numeric-9","package-variant-closed","phone-classic","pier-crane",
        "pier","power-plug","pulse","puzzle","radiobox-blank","react",
        "screw-flat-top","script-text","local-gas-station"
    ]

    useEffect(() => {
        getServices()
        
    }, [])

    const getServices =()=>{
        db.collection("services").onSnapshot((snapshot) => {
            const temp = []
            snapshot.forEach(doc => {
                if (doc.data().assetType == assetType.id) {
                    temp.push({ id: doc.id, ...doc.data() })
                }
            });
            setServices(temp)
        })
    }

    useEffect(() => {

        if (services.length > 0) {
            setServiceWorkHoursDays([])
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

 


    const handleDB = async () => {
        if (showAdd) {
            var sId = ""
            let add = await db.collection("services").add({
                name,
                price,
                maxBookings,
                rating: 0,
                serviceIcon,
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
           
                if( !serviceIcon){
                    setServiceIcon("help")
                }
            db.collection("services").doc(selectedService.service.id).update({
                name,
                price,
                maxBookings,
                serviceIcon
            })
            var fix = await db.collection("services").doc(selectedService.service.id).get()
            var temp = selectedService
            temp.service = fix.data()
            temp.service.id = selectedService.service.id
            setSelectedService(temp)
            setShowEdit(false)
        }
        else {
            Alert.alert("Delete " + selectedService.service.name + " ?",
                "", [
                { text: "Yes", onPress: () => db.collection("services").doc(selectedService.service.id).delete() && setSelectedService() },
                { text: "No", onPress: () => console.log("NOO") }

            ],
                { cancelable: true });
        }
        setName()
        setPrice()
        setMaxBookings()
        setServiceIcon()
        setUpdate(!update)

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
                                setMaxBookings(selectedService.service.maxBookings) ||
                                setPrice(selectedService.service.price) ||
                                setName(selectedService.service.name)||
                                setServiceIcon(selectedService.service.serviceIcon)
                                //console.log("ehhh", selectedService)
                            }
                        />
                        <Button title={"Delete"} onPress={() => handleDB()} />
                        <Button title={"Back"} onPress={() => setSelectedService()} />

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
                    <TouchableOpacity onPress={() => setShowIcons(true)}>
                                    <Text>Asset Icon</Text>
                                    <MaterialCommunityIcons
                                        name={serviceIcon ? serviceIcon : "help"}
                                        size={30}
                                        color={"#20365F"}

                                    />
                                </TouchableOpacity>

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

        {/* {icons modal} */}
        { showIcons ?
                    <Modal
                        animationType="slide"
                        transparent={true}
                        //visible={}
                        onRequestClose={() => {
                            Alert.alert("Modal has been closed.");
                        }}
                    >
                        <ScrollView>
                            <View style={styles.centeredView}>
                                <View style={styles.modalView}>
                                    <View style={{
                                        width: "100%", flexDirection: "row",
                                        flexWrap: "wrap"
                                    }}>
                                        {
                                            icons.map((i, index) =>
                                                <View
                                                    style={{
                                                        width: "20%",
                                                        alignItems: "center",
                                                        marginBottom: 15,
                                                    }}
                                                >
                                                    <TouchableOpacity onPress={() => setServiceIcon(i) || setShowIcons(false)}>
                                                        <MaterialCommunityIcons
                                                            name={i}
                                                            size={30}
                                                            color={"#20365F"}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </Modal>
                    :
                    null
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