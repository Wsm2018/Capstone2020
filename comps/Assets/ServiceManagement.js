import React, { useState, useEffect, useRef } from "react";
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
    const weekDays = useRef()
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
    const [showIcons, setShowIcons] = useState(false)
    const [serviceIcon, setServiceIcon] = useState()
    const [week, setWeek] = useState(["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])
    const [serviceWorkHoursDays, setServiceWorkHoursDays] = useState([])
    const [serviceWorkHoursDaysBackUp, setServiceWorkHoursDaysBackUp] = useState([])
    const [update, setUpdate] = useState(false)
    const [users, setUsers] = useState([])
    const [workers, setWorkers] = useState([])
    const [selectedUser, setSelectedUser] = useState()
    const [filteredWorkers, setFilteredWorkers] = useState([])
    const [openWorkersModal, setOpenWorkersModal] = useState(false)
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
        "xbox-controller", "account", "car-key", "doctor", "human-female", "human", "image-filter-drama", "mailbox", "map-outline", "motorbike", "needle",
        "numeric-1", "numeric-2", "numeric-3", "numeric-4", "numeric-5", "numeric-6",
        "numeric-7", "numeric-8", "numeric-9", "package-variant-closed", "phone-classic", "pier-crane",
        "pier", "power-plug", "pulse", "puzzle", "radiobox-blank", "react",
        "screw-flat-top", "script-text", "local-gas-station"
    ]

    useEffect(() => {
        weekDays.current = [{ day: "Saturday", hours: [] }, { day: "Sunday", hours: [] }, { day: "Monday", hours: [] }, { day: "Tuesday", hours: [] }, { day: "Wednesday", hours: [] }, { day: "Thursday", hours: [] }, { day: "Friday", hours: [] }]
        getServices()

    }, [])

    useEffect(() => {
        if (selectedService) {
            var temp = []
            for (let i = 0; i < users.length; i++) {
                if (users[i].services) {
                    var found = users[i].services.filter(s => s === selectedService.service.id)
                    if (found.length > 0) {
                        temp.push(users[i])
                    }
                }

            }
            setWorkers(temp)
        }
    }, [selectedService])

    const getServices = () => {
        db.collection("services").onSnapshot((snapshot) => {
            const temp = []
            snapshot.forEach(doc => {
                if (doc.data().assetType == assetType.id) {
                    temp.push({ id: doc.id, ...doc.data() })
                }
            });
            setServices(temp)
        })


        db.collection("users").onSnapshot((snap) => {
            let users = [];
            snap.forEach((doc) => {
                if (doc.data().email !== "DELETED")
                    users.push({ id: doc.id, ...doc.data() });
            });
            setUsers(users);
        });

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
        setServiceWorkHoursDaysBackUp(temp)
    }

    const handleDB = async () => {
        const manageServices = firebase.functions().httpsCallable("manageServices");
        if (showAdd) {
            // var sId = ""
            // let add = await db.collection("services").add({
            //     name,
            //     price,
            //     maxBookings,
            //     rating: 0,
            //     serviceIcon,
            //     assetType: assetType.id
            // }).then(docRef =>
            //     sId = docRef.id
            // )
            // for (let i = 0; i < weekDays.current.length; i++) {
            //     if (weekDays.current[i].hours.length > 0) {
            //         db.collection("services").doc(sId).collection("workingDays").doc(weekDays.current[i].day).set({ hours: weekDays.current[i].hours })
            //     }
            // }
            
            var obj = {
                name,
                price,
                maxBookings,
                rating: 0,
                serviceIcon,
                assetType: assetType.id
            }
            const response = await manageServices({
                status: "add",
                weekDays: weekDays.current,
                obj
            });
            setShowAdd(false)
        }
        else if (showEdit) {

            if (!serviceIcon) {
                setServiceIcon("help")
            }
            var obj = {
                name,
                price,
                maxBookings,
                serviceIcon
            }
            const response = await manageServices({
                status: "update",
                weekDays: weekDays.current,
                obj,
                selectedService,
                serviceWorkHoursDays,
            });
            // db.collection("services").doc(selectedService.service.id).update({
            //     name,
            //     price,
            //     maxBookings,
            //     serviceIcon
            // })
            var fix = await db.collection("services").doc(selectedService.service.id).get()

            // for (let i = 0; i < serviceWorkHoursDays.length; i++) {
            //     if (serviceWorkHoursDays[i].service == selectedService.service) {
            //         for (let k = 0; k < serviceWorkHoursDays[i].workingDays.length; k++) {
            //             if (serviceWorkHoursDays[i].workingDays[k].hours.length > 0) {
            //                 console.log("why edit hhhaaa??", selectedService.service.id, serviceWorkHoursDays[i].workingDays[k].day)
            //                 db.collection("services").doc(selectedService.service.id).collection("workingDays").doc(serviceWorkHoursDays[i].workingDays[k].day).set(
            //                     { hours: serviceWorkHoursDays[i].workingDays[k].hours })
            //             }
            //             else {
            //                 console.log("why delete hhhaaa??", serviceWorkHoursDays[i].workingDays[k].day, selectedService.service.id)
            //                 db.collection("services").doc(selectedService.service.id).collection("workingDays").doc(serviceWorkHoursDays[i].workingDays[k].day).delete()

            //             }
            //         }

            //     }
            // }
            var temp = selectedService
            temp.service = fix.data()
            temp.service.id = selectedService.service.id
            setSelectedService(temp)
            setShowEdit(false)
            weekDays.current = [{ day: "Saturday", hours: [] }, { day: "Sunday", hours: [] }, { day: "Monday", hours: [] }, { day: "Tuesday", hours: [] }, { day: "Wednesday", hours: [] }, { day: "Thursday", hours: [] }, { day: "Friday", hours: [] }]
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

        var found = []
        if (selectedService) {
            found = serviceWorkHoursDays.filter(f => f.service == selectedService.service)[0].workingDays.filter(d => d.day == day)[0].hours.filter(t => t == hour)
        }
        else {
            found = weekDays.current.filter(w => w.day == day)[0].hours.filter(h => h == hour)
        }
        return found.length > 0
    }

    const addDay = (day, hour) => {
        if (selectedService) {
            //add to service working hours -- edit --
            var temp = serviceWorkHoursDays
            var found = serviceWorkHoursDays.filter(f => f.service == selectedService.service)[0].workingDays.filter(d => d.day == day)[0].hours.filter(t => t == hour)
            if (found.length > 0) {
                console.log("remove")
                var tempHours = []
                for (let i = 0; i < serviceWorkHoursDays.length; i++) {
                    if (serviceWorkHoursDays[i].service == selectedService.service) {
                        for (let k = 0; k < serviceWorkHoursDays[i].workingDays.length; k++) {
                            if (serviceWorkHoursDays[i].workingDays[k].day == day) {
                                for (let j = 0; j < serviceWorkHoursDays[i].workingDays[k].hours.length; j++) {
                                    if (serviceWorkHoursDays[i].workingDays[k].hours[j] != hour) {
                                        tempHours.push(serviceWorkHoursDays[i].workingDays[k].hours[j])
                                        //console.log("adding hour",)
                                    }
                                }
                                temp[i].workingDays[k].hours = tempHours
                                //console.log("removing",temp[i].workingDays[k])
                            }

                        }

                    }
                }
                console.log("")
                setServiceWorkHoursDays(temp)
            }
            else {

                for (let i = 0; i < serviceWorkHoursDays.length; i++) {
                    if (serviceWorkHoursDays[i].service == selectedService.service) {
                        for (let k = 0; k < serviceWorkHoursDays[i].workingDays.length; k++) {
                            if (serviceWorkHoursDays[i].workingDays[k].day == day) {
                                temp[i].workingDays[k].hours.push(hour)
                            }
                        }
                    }
                }
                console.log("add", temp)
            }
            setServiceWorkHoursDays(temp)
        }
        else {
            //--add to week days -- add/create
            var temp = []
            var found = weekDays.current.filter(w => w.day == day)[0].hours.filter(h => h == hour)
            if (found.length > 0) {
                //remove from list
                for (let i = 0; i < weekDays.current.length; i++) {
                    if (weekDays.current[i].day != day) {

                        temp.push(weekDays.current[i])
                    }
                    else {
                        var tempHours = []
                        console.log("oha", weekDays.current[i].hours.length)
                        for (let k = 0; k < weekDays.current[i].hours.length; k++) {
                            console.log(" loopp", k)
                            if (weekDays.current[i].hours[k] != hour) {
                                console.log("add day", weekDays.current[i].hours[k])
                                tempHours.push(weekDays.current[i].hours[k])
                            }
                        }
                        temp.push({ day: day, hours: tempHours })
                    }
                }
                weekDays.current = temp
                console.log("week days remove", weekDays.current)
            }
            else {
                //add to list
                temp = weekDays.current
                var index = weekDays.current.findIndex(w => w.day == day)
                temp[index].hours.push(hour)
                weekDays.current = temp
                console.log("week days add", weekDays.current)
            }

        }
        var update = timesList
        setTimesList(update)
    }

    const display = (hour) => {
        var time = timesList.filter(t => t.time == hour)[0]
        return time.show
    }

    const manageWorker = async (status, u) => {
        const manageServiceWorkers = firebase.functions().httpsCallable("manageServiceWorkers");
        var temp = selectedUser
        if (status == "delete") {
            temp.services = temp.services.filter(s => s != selectedService.service.id)
            const response = await manageServiceWorkers({
                user: temp
            });
        }
        else if (status == "add") {
            console.log("tmep", temp)
            temp = u
            temp.services.push(selectedService.service.id)
            const response = await manageServiceWorkers({
                user: temp
            });
        }
        setSelectedUser()
        setFilteredWorkers([])
        setOpenWorkersModal(false)
    }

    const filterWorkers = () => {
        var temp = []
        for (let i = 0; i < users.length; i++) {
            if (users[i].services && users[i].role == "service employee") {
                var check = users[i].services.filter(s => s == selectedService.service.id)
                if (check.length == 0) {
                    temp.push(users[i])
                }
            }
        }
        setFilteredWorkers(temp)
        setOpenWorkersModal(true)
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
                        <Text>Workers</Text>
                        <Button title="add" onPress={() => filterWorkers()} />
                        {
                            workers ?
                                <View>

                                    {
                                        workers.map(w =>

                                            <TouchableOpacity onPress={() => setSelectedUser(w)}><Text>{w.email}</Text></TouchableOpacity>

                                        )}
                                </View>
                                :
                                <Text>No Assigned Workers</Text>
                        }

                        {
                            openWorkersModal ?
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
                                            {filteredWorkers ?
                                                filteredWorkers.map(f =>
                                                    <View>
                                                        <Text>{f.email}</Text>
                                                        <Button title="Assign" onPress={() => manageWorker("add", f)} />
                                                        <Button title="Cancel" onPress={() => setOpenWorkersModal(false)} />
                                                    </View>
                                                )
                                                :
                                                <Text>No Available Workers</Text>
                                            }


                                        </View>
                                    </View>
                                </Modal>
                                :
                                null
                        }

                        <Button title={"Edit"}
                            onPress={() =>
                                setShowEdit(true) ||
                                setShowAdd(false) ||
                                setMaxBookings(selectedService.service.maxBookings) ||
                                setPrice(selectedService.service.price) ||
                                setName(selectedService.service.name) ||
                                setServiceIcon(selectedService.service.serviceIcon)
                                //console.log("ehhh", selectedService)
                            }
                        />
                        <Button title={"Delete"} onPress={() => handleDB()} />
                        <Button title={"Back"} onPress={() => setSelectedService()} />

                    </View>
                    :
                    null}
            {
                selectedUser && !openWorkersModal ?
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
                                <Text>{selectedUser.email}</Text>
                                <Button title="Remove Worker" onPress={() => manageWorker("delete")} />
                                <Button title="Back" onPress={() => setSelectedUser()} />
                            </View>
                        </View>
                    </Modal>
                    :
                    null
            }



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
                                                                    <TouchableOpacity onPress={() => addDay(w, t.time)}>
                                                                        <Text style={{ backgroundColor: "green", borderColor: "black", borderWidth: 1 }}>{t.show}</Text>
                                                                    </TouchableOpacity>
                                                                    :
                                                                    <TouchableOpacity onPress={() => addDay(w, t.time)}>
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

                                                                    <TouchableOpacity onPress={() => addDay(w, t.time)}><Text style={{ backgroundColor: "green", borderColor: "black", borderWidth: 1 }}>{t.show}</Text>
                                                                    </TouchableOpacity>
                                                                    :
                                                                    <TouchableOpacity onPress={() => addDay(w, t.time)}><Text style={{ borderColor: "black", borderWidth: 1 }}>{t.show}</Text>
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

                                                                    <TouchableOpacity onPress={() => addDay(w, t.time)}><Text style={{ backgroundColor: "green", borderColor: "black", borderWidth: 1 }}>{t.show}</Text>
                                                                    </TouchableOpacity>
                                                                    :
                                                                    <TouchableOpacity onPress={() => addDay(w, t.time)}><Text style={{ borderColor: "black", borderWidth: 1 }}>{t.show}</Text>
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

                                                                    <TouchableOpacity onPress={() => addDay(w, t.time)}><Text style={{ backgroundColor: "green", borderColor: "black", borderWidth: 1 }}>{t.show}</Text>
                                                                    </TouchableOpacity>
                                                                    :
                                                                    <TouchableOpacity onPress={() => addDay(w, t.time)}><Text style={{ borderColor: "black", borderWidth: 1 }}>{t.show}</Text>
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
                    {showIcons ?
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
                    <Button title={"Cancel"} onPress={() => setShowEdit(false) || setServiceWorkHoursDays(serviceWorkHoursDaysBackUp)} />
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
