import React, { useState, useEffect, useRef } from "react";
import {
    Platform, View, Text, Button, TouchableOpacity, Image, TextInput, Alert, Modal, StyleSheet, Dimensions
} from "react-native";
import db from "../../db";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import { ScrollView } from "react-native-gesture-handler";
import Collapsible from 'react-native-collapsible';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function ServiceManagement(props) {
    const assetType = props.navigation.getParam("assetType", 'not found');
    //const assetType = { id: '2pioF3LLXnx2Btr4OJPn' }
    const [services, setServices] = useState([])
    const [selectedService, setSelectedService] = useState()
    const [showEdit, setShowEdit] = useState(false)
    const [showAdd, setShowAdd] = useState(false)
    const [name, setName] = useState()
    const [maxBookings, setMaxBookings] = useState()
    const [price, setPrice] = useState()
    const weekDays = useRef()
    const [isCollapsed, setIsCollapsed] = useState()
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
    const [showSchedule, setShowSchedule] = useState(false)
    const [showWorkers, setShowWorkers] = useState(false)
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
    const [collaps, setCollaps] = useState()
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

    const handleSelectService = (s) => {
        if (serviceWorkHoursDays) {
            var addWD = serviceWorkHoursDays.filter(w => w.service.id == s.id)[0]
            //console.log("add wd" , addWD , s)
            //setSelectedService()
            var temp = { service: addWD.service, workingDays: addWD.workingDays }
            setSelectedService(temp)
            setShowEdit(false)
            setShowAdd(false)
            setUpdate(!update)
        }

    }

    useEffect(() => {
        if (selectedService != null) {
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
            //setServiceWorkHoursDays([])
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
                // console.log("here", i)
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
       // setServiceWorkHoursDaysBackUp(temp)
    }

    const handleDB = async () => {

        const manageServices = firebase.functions().httpsCallable("manageServices");
        if (showAdd) {
            setShowAdd(false)
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

        }
        else if (showEdit) {
            setShowEdit(false)
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

            var s = await db.collection("services").doc(selectedService.service.id).get()
            var serv = s.data()
            serv.id = selectedService.service.id
            //getServices()

            setSelectedService()

            //handleSelectService(serv)
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
            console.log(selectedService.service.id, selectedService.workingDays)
            found = serviceWorkHoursDays.filter(f => f.service.id == selectedService.service.id)[0].workingDays.filter(d => d.day == day)[0].hours.filter(t => t == hour)
        }
        else {
            found = weekDays.current.filter(w => w.day == day)[0].hours.filter(h => h == hour)
        }
        return found.length > 0
    }

    const addDay = (day, hour) => {
        if (selectedService) {

            var temp = serviceWorkHoursDays
           
            var found = serviceWorkHoursDays.filter(f => f.service == selectedService.service)[0].workingDays.filter(d => d.day == day)[0].hours.filter(t => t == hour)
            if (found.length > 0) {

                var tempHours = []
                for (let i = 0; i < serviceWorkHoursDays.length; i++) {
                    if (serviceWorkHoursDays[i].service == selectedService.service) {
                        for (let k = 0; k < serviceWorkHoursDays[i].workingDays.length; k++) {
                            if (serviceWorkHoursDays[i].workingDays[k].day == day) {
                                for (let j = 0; j < serviceWorkHoursDays[i].workingDays[k].hours.length; j++) {
                                    if (serviceWorkHoursDays[i].workingDays[k].hours[j] != hour) {
                                        tempHours.push(serviceWorkHoursDays[i].workingDays[k].hours[j])

                                    }
                                }
                                temp[i].workingDays[k].hours = tempHours

                            }

                        }

                    }
                }

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

            }
            setServiceWorkHoursDays(temp)
            setUpdate(!update)
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

                        for (let k = 0; k < weekDays.current[i].hours.length; k++) {

                            if (weekDays.current[i].hours[k] != hour) {

                                tempHours.push(weekDays.current[i].hours[k])
                            }
                        }
                        temp.push({ day: day, hours: tempHours })
                    }
                }
                weekDays.current = temp

            }
            else {
                //add to list
                temp = weekDays.current
                var index = weekDays.current.findIndex(w => w.day == day)
                temp[index].hours.push(hour)
                weekDays.current = temp

            }
            setUpdate(!update)

        }
    }


    const display = (hour) => {
        var time = timesList.filter(t => t.time == hour)[0]
        return time.show
    }

    const manageWorker = async (status, u) => {
        const manageServiceWorkers = firebase.functions().httpsCallable("manageServiceWorkers");
        var temp = selectedUser


        if (status == "delete") {
            Alert.alert("Remove Employee ",
                u.email + " from " + selectedService.service.name + " ?", [
                { text: "Yes", onPress: () => removeWorker(u) },
                { text: "No", onPress: () => console.log("NOO") }

            ],
                { cancelable: true });
        }
        else if (status == "add") {
            temp = u
            temp.services.push(selectedService.service.id)
            const response = await manageServiceWorkers({
                user: temp
            });
            
            Alert.alert("Emplyee ",
                u.email + " is Assigned for " + selectedService.service.name + ".", [
                { text: "OK", onPress: () => console.log("NOO") }

            ], { cancelable: true });
            setSelectedUser()
            setFilteredWorkers([])
            
            setShowWorkers(false)
            setSelectedService()
            //setServices([])
            getServices()
        }


        setUpdate(!update)

    }

    const removeWorker = async (u) => {
        console.log("deleting", u)
        const manageServiceWorkers = firebase.functions().httpsCallable("manageServiceWorkers");
        u.services = u.services.filter(s => s != selectedService.service.id)
        const response = await manageServiceWorkers({
            user: u
        });
        setSelectedUser()
        setFilteredWorkers([])
        setOpenWorkersModal(false)
        setSelectedService()
        setServices([])
        getServices()
    }

    const filterWorkers = () => {
        var temp = []
        for (let i = 0; i < users.length; i++) {
            if (users[i].services && users[i].role == "services employee") {
                var check = users[i].services.filter(s => s == selectedService.service.id)
                if (check.length == 0) {
                    temp.push(users[i])
                }
            }
        }
        setFilteredWorkers(temp)
        setOpenWorkersModal(true)
    }

    const cancelAll = () => {
        setShowAdd(false)
        setShowEdit(false)
        setServiceWorkHoursDays(serviceWorkHoursDaysBackUp)
        setName()
        setPrice()
        setMaxBookings()
        setServiceIcon()
    }


    return (
        <ScrollView>

            <View style={styles.two}>
                <View style={{ flexDirection: "row" }}>
                    <Text style={styles.cardTitle}>{assetType.name} Services</Text>
                    <MaterialCommunityIcons
                        name={"plus-box"}
                        size={25}
                        color={"#a6a6a6"}
                        onPress={() => setShowAdd(true) || setSelectedService()}
                    />

                </View>
                {
                    services ?
                        services.map(s =>
                            <TouchableOpacity onPress={() => handleSelectService(s)} style={{
                                flexDirection: "row",
                                marginBottom: "1%",
                                width: "30%",
                                height: 50,
                                margin: "1%",
                                padding: 4,
                                backgroundColor: selectedService && selectedService.service == s ? "#2E9E9B" : "white",
                                borderColor: "#2E9E9B",
                                borderWidth: 1,
                                borderRadius: 5

                            }}>

                                <View style={{
                                    marginLeft: "auto",
                                    marginRight: "auto",
                                    // backgroundColor: "blue",
                                    height: "100%",
                                    width: "100%",
                                    // flexDirection: "row"
                                }}>
                                    <View style={{
                                        marginLeft: "auto",
                                        marginRight: "auto",
                                        // backgroundColor: "green",
                                        marginBottom: "auto",
                                        marginTop: "auto",
                                        flexDirection: "row"
                                    }}>
                                        <MaterialCommunityIcons
                                            name={s.serviceIcon}
                                            size={25}
                                            color={selectedService && selectedService.service == s ? "white" : "#609e9f"}
                                            onPress={() => setShowAdd(true)}
                                            style={{
                                                marginBottom: "auto",
                                                marginTop: "auto",
                                                width: "20%",
                                                marginRight: "3%",
                                                marginLeft: "1%",
                                                // backgroundColor: "yellow"
                                            }}
                                        />

                                        <Text style={{
                                            marginBottom: "auto",
                                            marginTop: "auto",
                                            // backgroundColor: "red"
                                            color: selectedService && selectedService.service == s ? "white" : "#609e9f"
                                        }}>{s.name}</Text>
                                    </View>
                                </View>


                            </TouchableOpacity>
                        )
                        :
                        null
                }


            </View>





            {
                selectedService && selectedService.service ?
                    <View style={styles.three}>
                        <View style={{ flexDirection: "row", width: "100%" }}>
                            <Text style={{
                                fontSize: 18,
                                //backgroundColor: "red",
                                width: "60%",
                                height: 50,
                                color: "gray",
                            }}>

                                {selectedService.service.name} Details</Text>

                            <MaterialCommunityIcons
                                name={"delete"}
                                size={20}
                                color={"#185a9d"}
                                onPress={() => handleDB()}
                                style={{ width: "15%" }}
                            />
                            <MaterialCommunityIcons
                                name={"square-edit-outline"}
                                size={20}
                                color={"#185a9d"}
                                onPress={() =>
                                    setShowEdit(true) ||
                                    setShowAdd(false) ||
                                    setMaxBookings(parseInt(selectedService.service.maxBookings)) ||
                                    setPrice(parseInt(selectedService.service.price)) ||
                                    setName(selectedService.service.name) ||
                                    setServiceIcon(selectedService.service.serviceIcon)
                                    //console.log("ehhh", selectedService)
                                }
                                style={{ width: "15%" }}
                            />
                            <MaterialCommunityIcons
                                name={"close"}
                                size={20}
                                color={"#901616"}
                                onPress={() => setSelectedService()}
                                style={{ width: "15%" }}
                            />
                        </View>

                        <View>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={styles.listNames}>Name</Text>
                                <Text>{selectedService.service.name}</Text>
                            </View>

                            <View style={{ flexDirection: "row" }}>
                                <Text style={styles.listNames}>Price</Text>
                                <Text>{selectedService.service.price}</Text>
                            </View>

                            <View style={{ flexDirection: "row" }}>
                                <Text style={styles.listNames}>Max Booking Per Day</Text>
                                <Text>{selectedService.service.maxBookings}</Text>
                            </View>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={styles.listNames}>Rating</Text>
                                <Text>{selectedService.service.rating}</Text>
                            </View>


                            <TouchableOpacity
                                onPress={() => setShowSchedule(true)}
                                style={{
                                    backgroundColor: "#609e9f",
                                    width: 170,
                                    marginTop: "2%",
                                    borderRadius: 5,
                                    padding: 15,
                                }}
                            ><Text style={{ marginLeft: "auto", marginRight: "auto", color: "white", fontSize: 15 }}>Schedule</Text></TouchableOpacity>


                        </View>


                        <View style={{
                            marginTop: "4%", width: "100%", borderTopWidth: 0.5,
                            borderTopColor: "gray",
                        }}>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={{
                                    fontSize: 18,
                                    height: 40,
                                    color: "gray",
                                    marginTop: "1%"
                                }}>Assigned Workers</Text>
                                <MaterialCommunityIcons
                                    name={"plus-box"}
                                    size={25}
                                    color={"#a6a6a6"}
                                    onPress={() => filterWorkers() || setShowWorkers(true)}
                                    style={{ position: "absolute", left: "90%" }}
                                />
                            </View>
                            {
                                workers ?
                                    <View>
                                        {
                                            workers.map(w =>
                                                <View style={{ flexDirection: "row", borderBottomColor: "gray", borderBottomWidth: 1 }}>
                                                    <MaterialCommunityIcons
                                                        name={"account-remove-outline"}
                                                        size={25}
                                                        color={"grey"}
                                                        onPress={() => manageWorker("delete", w)}
                                                        style={{ margin: "1%" }}
                                                    />
                                                    <TouchableOpacity style={{ width: "80%" }}
                                                        onPress={() => setSelectedUser(w)}>
                                                        <Text style={{ marginBottom: "auto", marginTop: "auto" }}>
                                                            {w.email}
                                                        </Text>
                                                    </TouchableOpacity>

                                                </View>

                                            )}
                                    </View>
                                    :
                                    <Text>No Assigned Workers</Text>
                            }
                        </View>
                    </View>
                    :
                    null}

            {
                showSchedule ?
                    <Modal
                        animationType="slide"
                        transparent={true}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <MaterialCommunityIcons
                                    name={"close"}
                                    size={20}
                                    color={"grey"}
                                    onPress={() => setShowSchedule(false)}
                                    style={{ width: "15%", position: "absolute", left: "110%", marginTop: "3%" }}
                                />
                                <Text style={{
                                    fontSize: 18,
                                    // backgroundColor: "red",
                                    //width: "85%",

                                    marginBottom: "9%",
                                    color: "gray",
                                    marginLeft: "auto",
                                    marginRight: "auto"
                                }}>Working Hours</Text>
                                {
                                    selectedService.workingDays.map(w =>
                                        <View style={{ width: "100%" }}>
                                            <View style={{
                                                //backgroundColor: isCollapsed != w.day ? "#EAFAF1" : "#D4EFDF",
                                                margin: "1%",
                                                padding: 6,
                                                borderRadius: isCollapsed != w.day ? 2 : 15,
                                                borderBottomWidth: 1,
                                                borderBottomColor: "#0B5345"
                                            }}>
                                                <TouchableOpacity style={{ margin: "1%", flexDirection: "row" }}
                                                    onPress={() => isCollapsed == w.day ? setIsCollapsed() : setIsCollapsed(w.day)}>
                                                    <Text
                                                        style={{
                                                            fontSize: 15,
                                                            // backgroundColor: "red",
                                                            width: "85%",
                                                            marginBottom: "4%",
                                                            color: "#395e60",
                                                        }}
                                                    >{w.day}</Text>
                                                    {
                                                        isCollapsed == w.day ?
                                                            <MaterialCommunityIcons
                                                                name={"chevron-up"}
                                                                size={20}
                                                                color={"grey"}
                                                            />
                                                            :
                                                            <MaterialCommunityIcons
                                                                name={"chevron-down"}
                                                                size={20}
                                                                color={"grey"}
                                                            />

                                                    }

                                                </TouchableOpacity>
                                                <Collapsible collapsed={isCollapsed != w.day}>
                                                    {
                                                        w.hours.length > 0 ?

                                                            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>{
                                                                w.hours.map(h =>
                                                                    <View style={{
                                                                        borderColor: "black",
                                                                        margin: 3,
                                                                        borderWidth: 3,
                                                                        borderRadius: 7,
                                                                        padding: 2,
                                                                        width: 72,
                                                                        borderColor: "#0B5345",
                                                                        backgroundColor: "white"
                                                                    }}>

                                                                        <Text style={{ color: "#0B5345", marginLeft: "auto", marginRight: "auto" }}>{display(h)}</Text>

                                                                    </View>
                                                                )}
                                                            </View>
                                                            :

                                                            <Text style={{ color: "red", marginLeft: "auto", marginRight: "auto" }}>No Working Hours</Text>

                                                    }
                                                </Collapsible>
                                            </View>
                                        </View>
                                    )
                                }
                            </View>
                        </View>
                    </Modal>
                    :
                    null
            }
            {
                selectedUser ?
                    <Modal
                        animationType="slide"
                        transparent={true}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView3}>

                                <MaterialCommunityIcons
                                    name={"close"}
                                    size={20}
                                    color={"grey"}
                                    onPress={() => setSelectedUser()}
                                    style={{ width: "15%", position: "absolute", left: "90%", marginTop: "3%" }}
                                />
                                <Image
                                    style={{ width: "30%", height: "30%", marginBottom: "5%" }}
                                    source={{ uri: selectedUser.photoURL }}
                                />


                                <View style={styles.info}>
                                    <MaterialCommunityIcons
                                        name={"face-profile"}
                                        size={20}
                                        color={"grey"}
                                        style={{ width: "10%", margin: "3%" }}
                                    />
                                    <Text style={{ width: "80%", marginLeft: "3%" }}>{selectedUser.displayName}</Text>
                                </View>

                                <View style={styles.info}>
                                    <MaterialCommunityIcons
                                        name={"phone"}
                                        size={20}
                                        color={"grey"}
                                        style={{ width: "10%", margin: "3%", }}
                                    />
                                    <Text style={{ width: "80%", marginLeft: "3%" }}>{selectedUser.phone}</Text>
                                </View>

                                <View style={styles.info}>
                                    <MaterialCommunityIcons
                                        name={"email"}
                                        size={20}
                                        color={"grey"}
                                        style={{ width: "10%", margin: "3%" }}
                                    />
                                    <Text style={{ width: "80%", marginLeft: "3%" }}>{selectedUser.email}</Text>
                                </View>







                            </View>
                        </View>
                    </Modal>
                    :
                    null
            }

            {
                showWorkers ?
                    <Modal
                        animationType="slide"
                        transparent={true}
                    >
                        <ScrollView>
                            <View style={styles.centeredView}>
                                <View style={styles.modalView2}>
                                    <MaterialCommunityIcons
                                        name={"close"}
                                        size={20}
                                        color={"gray"}
                                        onPress={() => setShowWorkers(false)}
                                        style={{ position: "absolute", left: "90%", marginTop: "3%" }}
                                    />

                                    <Text style={{
                                        fontSize: 20,
                                        color: "gray",
                                        marginBottom: "3%"
                                    }}>Workers</Text>

                                    {filteredWorkers.length > 0 ?
                                        filteredWorkers.map(f =>
                                            <View style={{
                                                width: "100%",
                                                flexDirection: "row",
                                                backgroundColor: "#eff5f5",
                                                borderColor: "#e0ebeb",
                                                borderWidth: 2,
                                                marginBottom: 5,
                                                padding: 10
                                            }}>
                                                <Image
                                                    style={{ width: "20%", height: "100%" }}
                                                    source={{ uri: f.photoURL }}
                                                />
                                                <View style={{
                                                    width: "70%",
                                                    // backgroundColor: "blue"
                                                }}>
                                                    <View style={{ flexDirection: "row" }}>
                                                        <MaterialCommunityIcons
                                                            name={"face-profile"}
                                                            size={20}
                                                            color={"grey"}
                                                        />
                                                        <Text style={{ width: "90%", marginLeft: "3%" }}>{f.displayName}</Text>
                                                    </View>

                                                    <View style={{ flexDirection: "row" }}>
                                                        <MaterialCommunityIcons
                                                            name={"phone"}
                                                            size={20}
                                                            color={"grey"}
                                                        />
                                                        <Text style={{ width: "90%", marginLeft: "3%" }}>{f.phone}</Text>
                                                    </View>

                                                    <View style={{ flexDirection: "row" }}>
                                                        <MaterialCommunityIcons
                                                            name={"email"}
                                                            size={20}
                                                            color={"grey"}
                                                        />
                                                        <Text style={{ width: "90%", marginLeft: "3%" }}>{f.email}</Text>
                                                    </View>



                                                </View>
                                                <MaterialCommunityIcons
                                                    name={"plus"}
                                                    size={20}
                                                    color={"grey"}
                                                    onPress={() => manageWorker("add", f)}
                                                    style={{ marginTop: "auto", marginBottom: "auto" }}
                                                />

                                            </View>
                                        )
                                        :
                                        <Text>No Available Workers</Text>
                                    }



                                </View >
                            </View >
                        </ScrollView>
                    </Modal >
                    :
                    null
            }

{
                showEdit || showAdd ?
                    <View style={styles.two3}>
                        <View style={{ flexDirection: "row", width: "100%" }}>


                            <Text style={{
                                fontSize: 18,
                                // backgroundColor: "red",
                                width: "70%",
                                height: 50,
                                color: "gray",
                            }}>{ showAdd ? "Add New Service" : "Edit "+ selectedService.service.name}</Text>
                            <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "30%" }}>


                                <MaterialCommunityIcons
                                    name={"close"}
                                    size={20}
                                    color={"gray"}
                                    onPress={() => cancelAll()}
                                //style={{ position: "absolute", left: "100%", marginTop: "3%" }}
                                />
                            </View>
                        </View>


                        <View style={{ flexDirection: "row", marginBottom: "1%" }}>
                            <Text style={styles.inputTitles}>Name</Text>
                            <TextInput
                                onChangeText={setName}
                                placeholder="Name"
                                value={name}
                                style={styles.textInputs}
                            />
                        </View>

                        <View style={{ flexDirection: "row", marginBottom: "1%" }}>
                            <Text style={styles.inputTitles}>Price</Text>
                            <TextInput
                                onChangeText={setPrice}
                                placeholder="Price"
                                value={parseInt(price)}
                                style={styles.textInputs}
                                keyboardType={'numeric'}
                                min={1}
                            />
                        </View>

                        <View style={{ flexDirection: "row", marginBottom: "1%" }}>
                            <Text style={styles.inputTitles}>Max Bookings Per Day</Text>
                            <TextInput
                                onChangeText={setMaxBookings}
                                placeholder="Max Bookings Per Day"
                                value={parseInt(maxBookings)}
                                style={styles.textInputs}
                                keyboardType={'numeric'}
                                min={1}
                            />
                        </View>

                        <View style={{ flexDirection: "row", marginBottom: "1%" }}>
                            <Text style={styles.inputTitles}>Icon</Text>
                            <View style={{
                                // borderWidth: 1,
                                // borderColor: "#D4EFDF",
                                width: "70%",
                                padding: 5,
                                margin: "1%",
                            }}>
                                <TouchableOpacity style={{
                                    borderWidth: 1,
                                    borderColor: "#D4EFDF",
                                    width: "30%",
                                    alignItems: "center"
                                }} onPress={() => setShowIcons(true)}>


                                    <MaterialCommunityIcons
                                        name={serviceIcon ? serviceIcon : "help"}
                                        size={30}
                                        color={"#20365F"}

                                    />


                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text>Working Hours</Text>

                        {
                            week.map((w) =>
                                <View style={{
                                    //backgroundColor: isCollapsed != w.day ? "#EAFAF1" : "#D4EFDF",
                                    margin: "1%",
                                    padding: 6,
                                    borderRadius: isCollapsed != w.day ? 2 : 15,
                                    borderBottomWidth: 1,
                                    borderBottomColor: "#0B5345",

                                }}>
                                    <TouchableOpacity onPress={() => collaps == w ? setCollaps() : setCollaps(w)} style={{ flexDirection: "row" }}>
                                        <Text style={{
                                            fontSize: 15,
                                            //backgroundColor: "red",
                                            width: "80%",
                                            marginBottom: "4%",
                                            color: "#395e60",
                                        }}>{w}</Text>
                                        {
                                            collaps == w ?
                                                <MaterialCommunityIcons
                                                    name={"chevron-up"}
                                                    size={20}
                                                    color={"grey"}
                                                    style={{
                                                        fontSize: 15,
                                                        // backgroundColor: "blue",
                                                        width: "10%"
                                                    }}
                                                />
                                                :
                                                <MaterialCommunityIcons
                                                    name={"chevron-down"}
                                                    size={20}
                                                    color={"grey"}
                                                    style={{
                                                        fontSize: 15,
                                                        //backgroundColor: "blue", 
                                                        width: "10%"
                                                    }}
                                                />

                                        }
                                    </TouchableOpacity>

                                    <Collapsible collapsed={collaps != w}>

                                        <View style={{
                                            flexDirection: "row",
                                            flexWrap: "wrap",
                                            width: "100%",
                                            //backgroundColor:"yellow"
                                        }}>
                                            {
                                                timesList.map((t, index) =>

                                                    color(w, t.time) ?
                                                        <TouchableOpacity onPress={() => addDay(w, t.time)} style={{
                                                            margin: 1,
                                                            borderWidth: 2,
                                                            borderRadius: 7,
                                                            padding: 2,
                                                            width: 72,
                                                            borderColor: "#0B5345",
                                                            backgroundColor: "#0B5345"
                                                        }}>
                                                            <Text style={{ color: "white", marginLeft: "auto", marginRight: "auto" }}>{t.show}</Text>
                                                        </TouchableOpacity>
                                                        :
                                                        <TouchableOpacity onPress={() => addDay(w, t.time)} style={{
                                                            margin: 1,
                                                            borderWidth: 3,
                                                            borderRadius: 7,
                                                            padding: 2,
                                                            width: 72,
                                                            borderColor: "gray",
                                                            backgroundColor: "white"
                                                        }}>
                                                            <Text style={{ color: "gray", marginLeft: "auto", marginRight: "auto" }}>{t.show}</Text>
                                                        </TouchableOpacity>

                                                )
                                            }

                                        </View>

                                    </Collapsible>
                                </View>
                            )
                        }


                        {/* {icons modal} */}
                        {showIcons ?
                            <Modal
                                animationType="slide"
                                transparent={true}
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

                     
                            
                            <TouchableOpacity
                            onPress={() => handleDB()}
                            style={{
                                backgroundColor: "#609e9f",
                                width: 170,
                                marginTop: "2%",
                                borderRadius: 2,
                               padding: 10,
                               marginLeft: "auto",
                                marginRight: "auto",
                            }}
                        ><Text style={{ marginLeft: "auto", marginRight: "auto", color: "white", fontSize: 18 ,height:20}}>{showAdd ? "Add" : "Edit"}</Text></TouchableOpacity>
                    </View>
                    :
                    null
            }
        </ScrollView >
    );
}

ServiceManagement.navigationOptions = {
    title: "Service Management",
    headerStyle: { backgroundColor: "#185a9d" },
    headerTintColor: "white",
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#e3e3e3",
        width: Math.round(Dimensions.get("window").width),
        // height: Math.round(Dimensions.get("window").height),
    },
    header: {
        flex: 1,
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        // height: "25%",
    },
    one: {
        backgroundColor: "white",
        width: "100%",
        // marginTop: "3%",
        padding: "5%",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "lightgray",
    },
    two: {
        backgroundColor: "white",
        width: "100%",
        marginTop: "3%",
        padding: "5%",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "lightgray",
        flexDirection: "row",
        flexWrap: "wrap",

        // justifyContent: "space-between",
    },
    two3: {
        backgroundColor: "white",
        width: "100%",
        marginTop: "3%",
        padding: "5%",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "lightgray",
        // flexDirection: "row",
        //flexWrap: "wrap",

        // justifyContent: "space-between",
    },
    two2: {
        backgroundColor: "white",
        width: "100%",
        marginTop: "3%",
        //padding: "5%",
        borderTopWidth: 1,
        //borderBottomWidth: 1,
        borderColor: "lightgray",
        flexDirection: "row",
        flexWrap: "wrap",

        // justifyContent: "space-between",
    },
    details: {
        backgroundColor: "white",
        width: "100%",
        marginTop: "3%",
        padding: "5%",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "lightgray",
        //flexDirection: "row",
        //flexWrap: "wrap",

        // justifyContent: "space-between",
    },
    three: {
        backgroundColor: "white",
        width: "100%",
        marginTop: "3%",
        padding: "5%",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "lightgray",
        flexDirection: "row",
        flexWrap: "wrap",
    },
    four: {
        backgroundColor: "white",
        width: "100%",
        marginTop: "3%",
        padding: "5%",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "lightgray",
    },
    cardTitle: {
        fontSize: 18,
        // backgroundColor: "red",
        width: "85%",
        height: 50,
        color: "gray",
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
        //width : "70%"
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        paddingTop: 35,
        paddingLeft: 35,
        paddingRight: 35,
        paddingBottom: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: "85%"
    },
    modalView2: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        paddingTop: 35,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: "95%"
    },
    modalView3: {
        //margin: 20,
        backgroundColor: "#eff5f5",
        borderRadius: 20,
        paddingTop: 35,
        paddingLeft: 10,
        paddingRight: 10,
        //paddingBottom: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: "70%"
    },
    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    names: {
        fontSize: 15,
        // backgroundColor: "red",
        width: "90%",
        height: 30,
        color: "#566573",
        alignItems: "center",
        marginLeft: "auto",
        marginRight: "auto"
    },
    listNames: {
        fontSize: 15,
        //backgroundColor: "red",
        width: "50%",
        height: 40,
        color: "#566573",
        alignItems: "center",
        //marginLeft: "auto",
        marginRight: "2%"
    },
    textInputs: {
        borderWidth: 1,
        borderColor: "#D4EFDF",
        width: "60%",
        padding: 5,
        margin: "1%",
        //backgroundColor: "blue"
    },
    inputTitles: {
        width: "35%",
        marginBottom: "auto",
        marginTop: "auto",
        // backgroundColor:"red"
    },
    info: {
        flexDirection: "row",
        marginBottom: "1%",
        borderColor: "#e0ebeb",
        borderBottomWidth: 2,
        width: "80%",
        marginLeft: "auto",
        marginRight: "auto"
    }
});
