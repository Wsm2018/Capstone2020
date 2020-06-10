
import { Button } from "react-native-elements"
import React, { useState, useEffect } from "react";
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
    Modal,
    CheckBox,
    Dimensions,
    Alert , KeyboardAvoidingView
} from "react-native";


import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db.js";
import { ceil } from "react-native-reanimated";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import { ColorPicker, TriangleColorPicker } from 'react-native-color-picker'
import SketchPicker from "react-color"
import { ColorWheel } from 'react-native-color-wheel';
require("firebase/firestore");
const { width, height } = Dimensions.get("window");

export default function AssetManagement(props) {
    const [latLong, setLatLong] = useState("");
    const [color, setColor] = useState()
    const [code, setCode] = useState("");
    const [types, setTypes] = useState([])
    const [sections, setSectinos] = useState([])
    const [assets, setAssets] = useState([])
    const [selectedType, setSelectedType] = useState()
    const [selectedSection, setSelectedSection] = useState()
    const [selectedAsset, setSelectedAsset] = useState()
    const [showAddSection, setShowAddSection] = useState(false)
    const [showAddType, setShowAddType] = useState(false)
    const [showEditType, setShowEditType] = useState(false)
    const [showEditSection, setShowEditSection] = useState(false)
    const [showAddAsset, setShowAddAsset] = useState(false)
    const [showEditAsset, setShowEditAsset] = useState(false)
    const [name, setName] = useState()
    const [numOfPeople, setNumOfPeople] = useState(0)
    const [price, setPrice] = useState()
    const [description, setDescription] = useState()
    const [type, setType] = useState("Normal")
    const [location, setLocation] = useState("")
    const [TypeImage, setTypeImage] = useState()
    const [sectionIcon, setSectionIcon] = useState()
    const [assetIcon, setAssetIcon] = useState()
    const [openSectionIcon, setOpenSectionIcon] = useState(false)
    const [openAssetIcon, setOpenAssetIcon] = useState(false)
    const [uri, setUri] = useState("");
    const [hasCameraRollPermission, setHasCameraRollPermission] = useState(false);
    const [photoURL, setPhotoURL] = useState("");
    const [showInMap, setShowInMap] = useState(false);
    const [update, setUpdate] = useState(false)
    const [title, setTitle] = useState()
    const [long, setLong] = useState(0.0)
    const [lat, setLat] = useState(0.0)
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [deleting, setDeleting] = useState(false)


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

    const colors = [
        "B40404", "B43104", "FF3333", "B45104", "FF8D04", "FFD904", "F0FF04", "BBFF04", "82FF04", "04C822",
        "047B16", "02FA6C", "02FAAF", "02FAE3", "02D8FA", "029CFA", "0255FA", "020DFA", "6F02FA", "9C02FA",
        "FA02F2", "FA02AB", "FA0267", "FA022F", "030001", "FEFEFE", "CBCBCB", "767474"
    ]

    const askPermission = async () => {
        const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
        setHasCameraRollPermission(status === "granted");
    };


    useEffect(() => {
        askPermission();
    }, []);

    const handlePickImage = async () => {
        // show camera roll, allow user to select
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });

        if (!result.cancelled) {
            console.log("not cancelled", result.uri);
            setUri(result.uri);
        }
    };

    useEffect(() => {
        db.collection("assetTypes").onSnapshot((snapshot) => {
            const temp = []
            snapshot.forEach(doc => {
                temp.push({ id: doc.id, ...doc.data() })
            });
            setTypes(temp)
        })

        db.collection("assetSections").onSnapshot((snapshot) => {
            const temp = []
            snapshot.forEach(doc => {
                temp.push({ id: doc.id, ...doc.data() })
            });
            setSectinos(temp)
        })

        db.collection("assets").onSnapshot((snapshot) => {
            const temp = []
            snapshot.forEach(doc => {
                temp.push({ id: doc.id, ...doc.data() })
            });
            setAssets(temp)
        })

    }, [])

    const handleType = async (obj) => {

        if (showAddType) {
            var docId = ""
            var type = await db.collection("assetTypes").add(obj).then(docRef => docId = docRef.id)
            getUrl(docId)
        }
        else {
            db.collection("assetTypes").doc(selectedType.id).update(obj)
            getUrl(selectedType.id)
        }
        cancelAll()

    }

    const getUrl = async (docId) => {
        const response = await fetch(uri);
        console.log("fetch result", JSON.stringify(response));

        const blob = await response.blob();
        const putResult = await firebase
            .storage()
            .ref()
            .child(`/AssetTypes/${docId}`)
            .put(blob);

        const url = await firebase
            .storage()
            .ref()
            .child(`/AssetTypes/${docId}`)
            .getDownloadURL();
        console.log("download url", url);

        setPhotoURL(url);
        db.collection("assetTypes").doc(docId).update({ image: url })
    }

    const handleAdd = async (collection, obj) => {
        const assetManager = firebase.functions().httpsCallable("assetManager");

        const response = await assetManager({
            collection, obj, type: "add"
        });


        cancelAll()
        setShowAddType(false)
        setShowAddSection(false)
        setShowAddAsset(false)
    }

    const handleEdit = async (collection, obj, doc) => {
        const assetManager = firebase.functions().httpsCallable("assetManager");
        const response = await assetManager({
            collection, obj, doc, type: "update"
        });
        cancelAll()
        setShowEditType(false)
        setShowEditSection(false)
        setShowEditAsset(false)
    }

    const handleDelete = async (collection, doc) => {
        var deleteIt = false
        Alert.alert("Delete " + (selectedAsset ? selectedAsset.code : selectedSection ? selectedSection.name : selectedType.name) + " ?",
            "", [
            { text: "Yes", onPress: () => deleteDoc(collection, doc) },
            { text: "No", onPress: () => console.log("NOO") }

        ],
            { cancelable: true });

        // const assetManager = firebase.functions().httpsCallable("assetManager");
        // if( deleting){
        //     const response = await assetManager({
        //         collection, doc, type: "delete"
        //     });
        // }

        cancelAll()


    }

    const deleteDoc = async (collection, doc) => {
        const assetManager = firebase.functions().httpsCallable("assetManager");

        const response = await assetManager({
            collection, doc, type: "delete"
        });
        if (selectedAsset) {
            setSelectedAsset()
            setUpdate(!update)
        }
        else if (selectedSection) {
            setSelectedSection()
        }
        else if (selectedType) {
            setSelectedType()
        }
        cancelAll()
    }

    const cancelAll = () => {
        setShowAddSection(false)
        setShowAddType(false)
        setShowAddAsset(false)
        setShowEditAsset(false)
        setShowEditType(false)
        setShowInMap(false)
        setName()
        setPrice()
        setLocation()
        setDescription()
        setType()
        setCode()
        setNumOfPeople(0)
        setSectionIcon()
        setAssetIcon()
        setTitle()
        setColor()
        setLong(0.0)
        setLat(0.0)
        setUri()
        setDeleting(false)
    }

    return (
        <ScrollView>

            <View style={styles.two}>
                <View style={{ flexDirection: "row" , borderBottomColor:"#CCD1D1" , borderBottomWidth:1 , width:"100%"}}>
                    <Text style={styles.cardTitle}>Asset Types</Text>
                    <MaterialCommunityIcons
                        name={"plus-box"}
                        size={25}
                        color={"#a6a6a6"}
                        onPress={() => setShowAddType(true)}

                    />

                </View>


                {
                    types ?
                        <View style={{
                            width: "100%", flexDirection: "row",
                            flexWrap: "wrap"
                        }}>
                            {

                                types.map(t =>
                                    <View style={{
                                        //width: "20%",
                                        borderColor: "#CCD1D1",
                                        alignItems: "center",
                                        borderWidth: 1,
                                        margin: "4%",
                                        padding: 4
                                    }}>
                                        <TouchableOpacity onPress={() =>
                                            setSelectedType(t) ||
                                            setShowAddType(false) ||
                                            setName(t.name) ||
                                            setAssetIcon(t.assetIcon) ||
                                            setSectionIcon(t.sectionIcon) ||
                                            setShowInMap(t.showInMap) ||
                                            setTitle(t.title)
                                        }>
                                            <Image
                                                style={{ width: 130, height: 130, marginLeft: "auto", marginRight: "auto" }}
                                                source={{ uri: t.image }}
                                            />
                                            <Text style={styles.names}>{t.name}</Text>
                                        </TouchableOpacity>

                                    </View>
                                )
                            }

                        </View>
                        :
                        null
                }

            </View>


            {
                selectedType && sections ?
                    <View style={styles.details}>
                        <View style={{ flexDirection: "row" , borderBottomColor:"#CCD1D1" , borderBottomWidth:1 , width:"100%", marginBottom:"2%"}}>
                            <Text style={{
                                fontSize: 18,
                                // backgroundColor: "red",
                                width: "60%",
                                height: 50,
                                color: "gray",
                            }}>{selectedType.name} Details</Text>

                            <View style={{
                                flexDirection: "row",
                                //backgroundColor: "blue" ,
                                width: "100%"
                            }}>
                                <MaterialCommunityIcons
                                    name={"delete"}
                                    size={20}
                                    color={"#185a9d"}
                                    onPress={() => handleDelete("assetTypes", selectedType.id)}
                                    style={{ width: "15%" }}
                                />
                                <MaterialCommunityIcons
                                    name={"square-edit-outline"}
                                    size={20}
                                    color={"#185a9d"}
                                    onPress={() => setShowEditType(true)}
                                    style={{ width: "15%" }}
                                />
                                <MaterialCommunityIcons
                                    name={"close"}
                                    size={20}
                                    color={"#901616"}
                                    onPress={() => setSelectedType() || setSelectedSection() || setSelectedAsset()}
                                    style={{ width: "15%" }}
                                />
                            </View>

                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.listNames}>Name</Text>
                            <Text>{selectedType.name}</Text>
                        </View>

                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.listNames}>Title</Text>
                            <Text>{selectedType.Title}</Text>
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.listNames}>Section Icon</Text>
                            <Text>{selectedType.sectionIcon}</Text>
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.listNames}>Asset Icon</Text>
                            <Text>{selectedType.assetIcon}</Text>
                        </View>

                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.listNames}>Show In Map</Text>
                            <MaterialCommunityIcons
                                name={selectedType.showInMap ? "check" : "close"}
                                size={30}
                                color={selectedType.showInMap ? "#2ECC71" : "#20365F"}
                            />
                        </View>

                        <TouchableOpacity style={{
                            backgroundColor: "#609e9f",
                            width: 170,
                            marginTop: "2%",
                            borderRadius: 5,
                            padding: 15,
                        }}
                            onPress={() => props.navigation.navigate("ServiceManagement", { assetType: selectedType })}>
                            <Text style={{ marginLeft: "auto", marginRight: "auto", color: "white", fontSize: 15 }}>
                                Manage Services
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.two2}>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={styles.cardTitle}>{selectedType.name} Sections</Text>

                                <MaterialCommunityIcons
                                    name={"plus-box"}
                                    size={25}
                                    color={"#a6a6a6"}
                                    onPress={() => setShowAddSection(true)}
                                    style={{ position: "absolute", left: "100%" }}
                                />

                            </View>
                            <View style={{width:"100%" , flexWrap:"wrap"  , flexDirection:"row"}}>
                            {
                                sections.map((t, i) =>
                                    t.assetType == selectedType.id ?
                                        <View style={{  alignItems: "center" }} key={i}>
                                            <TouchableOpacity
                                                onPress={() => setSelectedSection(t)}
                                                style={{
                                                    backgroundColor:
                                                        selectedSection === t ? "#2E9E9B" : "#e3e3e3",
                                                    width: 100,
                                                    height: 100,
                                                    margin: 5,
                                                    alignItems: "center",
                                                    flexDirection: "row",
                                                    //elevation: 12,
                                                    borderWidth: 2,
                                                    borderColor: "#2E9E9B",
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        // height: "20%",
                                                        width: "100%",
                                                        justifyContent: "center",
                                                        textAlign: "center",
                                                        alignContent: "center",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <MaterialCommunityIcons
                                                        name={selectedType.sectionIcon}
                                                        size={40}
                                                        color={selectedSection === t ? "white" : "#2E9E9B"}
                                                    />
                                                    <Text
                                                        style={{
                                                            textAlign: "center",
                                                            color: selectedSection === t ? "white" : "#2E9E9B",
                                                            fontSize: 20,
                                                        }}
                                                    >
                                                        {t.name}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>

                                        :
                                        null

                                )}
                                </View>
                        </View>
                    </View>
                    :
                    null
            }


            {
                selectedSection && assets ?
                    <View style={styles.three}>
                        <View style={{ flexDirection: "row" , borderBottomColor:"#CCD1D1" , borderBottomWidth:1 , width:"100%" , marginBottom:"3%"}}>
                            <Text style={{
                                fontSize: 18,
                                // backgroundColor: "red",
                                width: "60%",
                                height: 50,
                                color: "gray",
                            }}>{selectedSection.name} Details</Text>


                            {/* <View style={{
                                flexDirection: "row",
                                backgroundColor: "blue" ,
                                //width: "100%"
                            }}> */}

                            <MaterialCommunityIcons
                                name={"delete"}
                                size={20}
                                color={"#185a9d"}
                                onPress={() => handleDelete("assetSections", selectedSection.id)}
                                // style={{ marginRight: "5%" }}
                                style={{ width: "15%" }}
                            />

                            <MaterialCommunityIcons
                                name={"square-edit-outline"}
                                size={20}
                                color={"#185a9d"}
                                onPress={() => setShowEditSection(true) ||
                                    setName(selectedSection.name)}
                                style={{ width: "15%" }}
                            />


                            <MaterialCommunityIcons
                                name={"close"}
                                size={20}
                                color={"#901616"}
                                onPress={() => setSelectedSection() || setSelectedAsset()}
                                //style={{ marginRight: "5%" }}
                                style={{ width: "15%" }}
                            />

                            {/* </View> */}

                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.listNames}>Name</Text>
                            <Text style={{ width: "70%" }}>{selectedSection.name}</Text>
                        </View>

                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.listNames}>Color</Text>
                            <View style={{ width: "70%" }}>
                                <Text style={{ width: "10%", backgroundColor: selectedSection.color }}></Text>
                            </View>


                        </View>
                        {selectedSection.location ?

                            <View style={{ flexDirection: "row" }}>
                                <Text style={styles.listNames}>Location</Text>

                                <Text style={{ width: "30%" }}>Longitude {selectedSection.location.longitude}</Text>
                                <Text style={{ width: "30%" }}>Latitude {selectedSection.location.latitude}</Text>


                            </View>
                            : null}


                        <View style={styles.two2}>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={styles.cardTitle}>{selectedSection.name} {selectedType.name}s</Text>

                                <MaterialCommunityIcons
                                    name={"plus-box"}
                                    size={25}
                                    color={"#a6a6a6"}
                                    onPress={() => setShowAddAsset(true)}
                                    style={{ position: "absolute", left: "100%" }}
                                />

                            </View>

<View style={{width:"100%" , flexWrap:"wrap" , flexDirection:"row"}}>
{

assets.map((t, i) =>
    t.assetSection == selectedSection.id ?
        <View key={i}>
            <TouchableOpacity
                onPress={() => setSelectedAsset(t)}
                style={{
                    backgroundColor:
                        selectedSection === t ? "#20365F" : "#e3e3e3",
                    width: 80,
                    height: 80,
                    margin: 5,
                    alignItems: "center",
                    flexDirection: "row",
                    //elevation: 12,
                    borderWidth: 2,
                    borderColor: "#20365F",
                }}
            >
                <View
                    style={{
                        // height: "20%",
                        width: "100%",
                        justifyContent: "center",
                        textAlign: "center",
                        alignContent: "center",
                        alignItems: "center",
                    }}
                >
                    <MaterialCommunityIcons
                        name={selectedType.assetIcon}
                        size={40}
                        color={"#20365F"}
                    />
                    <Text
                        style={{
                            textAlign: "center",
                            color: "#20365F",
                            fontSize: 20,
                        }}
                    >
                        {t.code}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
        :
        null
)}

</View>
                            
                        </View>
                    </View>
                    :
                    null
            }




            {
                selectedAsset ?
                    <View style={styles.details}>
                        <View style={{ flexDirection: "row", borderBottomColor:"#CCD1D1" , borderBottomWidth:1 , width:"100%" , marginBottom:"3%" }}>
                            <Text style={{
                                fontSize: 18,
                                // backgroundColor: "red",
                                width: "60%",
                                height: 50,
                                color: "gray",
                            }}>{selectedAsset.code} Details</Text>

                            <View style={{
                                flexDirection: "row",
                                //backgroundColor: "blue" ,
                                width: "100%"
                            }}>
                                <MaterialCommunityIcons
                                    name={"delete"}
                                    size={20}
                                    color={"#185a9d"}
                                    onPress={() => handleDelete("assets", selectedAsset.id)}
                                    style={{ width: "15%" }}
                                />
                                <MaterialCommunityIcons
                                    name={"square-edit-outline"}
                                    size={20}
                                    color={"#185a9d"}
                                    onPress={() => setShowEditAsset(true) ||
                                        setName(selectedAsset.name) ||
                                        setPrice(selectedAsset.price) ||
                                        setLocation(selectedAsset.location) ||
                                        setDescription(selectedAsset.description) ||
                                        setType(selectedAsset.type) ||
                                        setCode(selectedAsset.code) ||
                                        setNumOfPeople(selectedAsset.numOfPeople)
                                    }
                                    style={{ width: "15%" }}
                                />
                                <MaterialCommunityIcons
                                    name={"close"}
                                    size={20}
                                    color={"#901616"}
                                    onPress={() => setSelectedAsset()}
                                    style={{ width: "15%" }}
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.listNames}>Code</Text>
                            <Text style={{ width: "70%" }} >{selectedAsset.code}</Text>
                        </View>



                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.listNames}>Name</Text>
                            <Text style={{ width: "70%" }}>{selectedType.name}</Text>
                        </View>



                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.listNames}>Price Per Hour</Text>
                            <Text style={{ width: "70%" }}>{selectedAsset.price} QR</Text>
                        </View>

                        {selectedAsset.numOfPeople ?
                            <View style={{ flexDirection: "row" }}>
                                <Text style={styles.listNames}>Number Of People</Text>
                                <Text>{selectedAsset.numOfPeople}</Text>
                            </View>
                            : null}

                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.listNames}>Description</Text>
                            <Text style={{ width: "70%" }}>{selectedAsset.description ? selectedAsset.description : null}</Text>
                        </View>

                        {selectedAsset.location ?

                            <View style={{ flexDirection: "row" }}>
                                <Text style={styles.listNames}>Location</Text>

                                <Text style={{ width: "30%" }}>Longitude {selectedAsset.location.longitude}</Text>
                                <Text style={{ width: "30%" }}>Latitude {selectedAsset.location.latitude}</Text>


                            </View>
                            : null}

                    </View>

                    :

                    null
            }


            {
                showAddType || showEditType ?
                    <Modal
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => {
                            Alert.alert("Modal has been closed.");
                        }}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                

                                <MaterialCommunityIcons
                                    name={"close"}
                                    size={20}
                                    color={"#ABB2B9"}
                                    onPress={() => setShowInMap(false) || setShowAddType(false) || setShowEditType(false) || setName()}
                                    style={{ position: "absolute", left: "110%", marginTop: "4%" }}
                                />

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
                                    <Text style={styles.inputTitles}>Title</Text>
                                    <TextInput
                                        onChangeText={setTitle}
                                        placeholder="Name"
                                        value={title}
                                        style={styles.textInputs}
                                    />
                                </View>


                                <View style={{ flexDirection: "row", marginBottom: "1%" }}>
                                    <Text style={styles.inputTitles}>Show In Map</Text>
                                    <CheckBox
                                        value={showInMap}
                                        onValueChange={() => setShowInMap(!showInMap)}
                                        style={{
                                            width: "70%",
                                            borderWidth: 1,
                                            borderColor: "#0E6655",
                                            padding: 5,
                                            margin: "1%",
                                        }}
                                    />

                                </View>

                                <View style={{ flexDirection: "row", marginBottom: "1%" }}>

                                    <Text style={styles.inputTitles}>Section Icon</Text>
                                    <TouchableOpacity style={{ width: "70%", margin: "1%" }} onPress={() => setOpenSectionIcon(true)}>
                                        <MaterialCommunityIcons
                                            name={sectionIcon ? sectionIcon : "help"}
                                            size={30}
                                            color={"#20365F"}
                                            style={{
                                                width: "100%",
                                                // borderWidth: 1,
                                                //borderColor: "#0E6655",
                                                padding: 5,
                                                margin: "1%",
                                            }}
                                        />
                                    </TouchableOpacity>

                                </View>

                                <View style={{ flexDirection: "row", marginBottom: "1%" }}>

                                    <Text style={styles.inputTitles}>Asset Icon</Text>
                                    <TouchableOpacity style={{ width: "70%", margin: "1%" }} onPress={() => setOpenAssetIcon(true)}>
                                        <MaterialCommunityIcons
                                            name={assetIcon ? assetIcon : "help"}
                                            size={30}
                                            color={"#20365F"}
                                            style={{
                                                width: "100%",
                                                // borderWidth: 1,
                                                //borderColor: "#0E6655",
                                                padding: 5,
                                                margin: "1%",
                                            }}

                                        />
                                    </TouchableOpacity>

                                </View>

                                <View style={{ flexDirection: "row", marginBottom: "1%" }}>
                                    <View style={{ width: "35%", marginTop: "auto", marginBottom: "auto" }}>
                                        <Button title="Pick Image" onPress={handlePickImage} />
                                    </View>
                                    <View style={{ width: "70%", margin: "2%" }}>
                                        {
                                            uri ?
                                                <Image
                                                    style={{ width: "100%", height: 130, marginLeft: "auto", marginRight: "auto", margin: "2%" }}
                                                    source={{ uri: uri }}
                                                />
                                                :
                                                <Text style={{ margin: "1%", width: "100%", width: 130, height: 130, borderWidth: 1, borderColor: "#566573", backgroundColor: "#EAECEE" }}></Text>

                                        }
                                    </View>

                                </View>




                                {/* <TouchableOpacity  ><Text>{showAddType ? "Add" : "Edit"}</Text></TouchableOpacity> */}
                                {/**disabled={!name || !sectionIcon || !uri || !assetIcon} */}
                                <MaterialCommunityIcons
                                    name={showAddType ? "plus-circle-outline" : "square-edit-outline"}
                                    size={30}
                                    color={"#609e9f"}
                                    onPress={() => handleType({ name, sectionIcon, assetIcon, showInMap, title })}
                                    style={{ marginBottom: "4%" }}
                                />
                            </View>
                        </View>
                    </Modal>

                    :
                    null
            }

            {
                showAddSection || showEditSection ?
                    <Modal
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => {
                            Alert.alert("Modal has been closed.");
                        }}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>

                                <MaterialCommunityIcons
                                    name={"close"}
                                    size={20}
                                    color={"#ABB2B9"}
                                    onPress={() => setShowAddSection(false) || setShowEditSection(false) || cancelAll()}
                                    style={{ position: "absolute", left: "110%", marginTop: "4%" }}
                                />

                                <View style={{ flexDirection: "row", marginBottom: "1%" }}>
                                    <Text style={styles.inputTitles}>Name</Text>
                                    <TextInput
                                        onChangeText={setName}
                                        placeholder="Name"
                                        value={name}
                                        style={styles.textInputs}
                                    />
                                </View>


                                <View style={{ flexDirection: "row", marginBottom: "1%", height: "15%" }}>
                                    <Text style={styles.inputTitles}>Section Color</Text>
                                    <View style={{ width: "70%", margin: "1%", }}>
                                        <TouchableOpacity
                                            style={{
                                                borderColor: "yellow",
                                                width: "20%",
                                                height: "80%",
                                                //marginBottom:"auto",
                                                //marginTop:"auto",
                                                //alignItems: "center",
                                                //marginBottom: 15,
                                                borderColor: color ? `#${color}` : "black",
                                                borderWidth: 1,
                                                backgroundColor: color ? `#${color}` : "white"
                                            }}
                                            onPress={() => setShowColorPicker(true)}
                                        >
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={{ flexDirection: "row", marginBottom: "1%" }}>
                                    <Text style={styles.inputTitles}>Location</Text>
                                    <View style={{ width: "70%", margin: "1%" }}>
                                        <Text>Longitude</Text>
                                        <TextInput
                                            onChangeText={setLong}
                                            placeholder="Longitude"
                                            value={long}
                                            style={{
                                                borderWidth: 1,
                                                borderColor: "#D4EFDF",
                                                padding: 5,
                                                margin: "1%", width: "100%"
                                            }}
                                        />
                                        <Text>Latitude</Text>
                                        <TextInput
                                            onChangeText={setLat}
                                            placeholder="Latitude"
                                            value={lat}
                                            style={{
                                                width: "100%", borderWidth: 1,
                                                borderColor: "#D4EFDF",

                                                padding: 5,
                                                margin: "1%",
                                            }}
                                        />
                                    </View></View>
                                <MaterialCommunityIcons
                                    name={showAddSection ? "plus-circle-outline" : "square-edit-outline"}
                                    size={30}
                                    color={"#609e9f"}
                                    onPress={() =>
                                        showAddSection ? handleAdd("assetSections", { assetType: selectedType.id, name, color, location: { Latitude: lat, Longitude: long } })
                                            :
                                            handleEdit("assetSections", { name, assetType: selectedType.id }, selectedSection.id)} disabled={!name}
                                // style={{ position: "absolute", left: "110%", marginTop: "4%" }}
                                />


                            </View>


                        </View>
                    </Modal>
                    :
                    null
            }

{/* <KeyboardAvoidingView
        
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          width: "100%",
          flex: 1,
          backgroundColor: "#20365F",
         height: "100%",
        }}
        // keyboardVerticalOffset={-100}
      ></KeyboardAvoidingView> */}

            {
                showAddAsset || showEditAsset ?
                
                    <Modal
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => {
                            Alert.alert("Modal has been closed.");
                        }}
                    >
                       
                        <View style={styles.centeredView}>
                        
                            <View style={styles.modalView}>
                                <MaterialCommunityIcons
                                    name={"close"}
                                    size={20}
                                    color={"#ABB2B9"}
                                    onPress={() => setShowAddAsset(false) || cancelAll()}
                                    style={{ position: "absolute", left: "110%", marginTop: "4%" }}
                                />
                                <KeyboardAvoidingView
        
        behavior={Platform.OS === "ios" ? "position" : "padding"}
        style={{
 
        }}
      ><ScrollView>
                                <View style={{ flexDirection: "row", marginBottom: "0.5%" }}>
                                    <Text style={styles.inputTitles}>Name</Text>
                                    <TextInput
                                        onChangeText={setName}
                                        placeholder="Name"
                                        value={name}
                                        style={styles.textInputs}
                                    />
                                </View>


                                <View style={{ flexDirection: "row", marginBottom: "0.5%" }}>
                                    <Text style={styles.inputTitles}>Code</Text>
                                    <TextInput
                                        onChangeText={setCode}
                                        placeholder="code"
                                        value={code}
                                        style={styles.textInputs}
                                    />
                                </View>

                                <View style={{ flexDirection: "row", marginBottom: "0.5%" }}>
                                    <Text style={styles.inputTitles}>Price</Text>
                                    <TextInput
                                        onChangeText={setPrice}
                                        placeholder="Price"
                                        value={price}
                                        style={styles.textInputs}
                                    />
                                </View>

                                <View style={{ flexDirection: "row", marginBottom: "0.5%" }}>
                                    <Text style={styles.inputTitles}>Type</Text>
                                    <TextInput
                                        onChangeText={setType}
                                        placeholder="Type"
                                        value={type}
                                        style={styles.textInputs}
                                    />
                                </View>

                                <View style={{ flexDirection: "row", marginBottom: "0.5%" }}>
                                    <Text style={styles.inputTitles}>Number of People</Text>
                                    <TextInput
                                        onChangeText={setNumOfPeople}
                                        placeholder="Number of people"
                                        value={numOfPeople}
                                        style={styles.textInputs}
                                    />
                                </View>
                                <View style={{ flexDirection: "row", marginBottom: "0.5%" }}>
                                    <Text style={styles.inputTitles}>Location</Text>
                                    <View style={{ width: "70%", margin: "1%" }}>
                                        <Text>Longitude</Text>
                                        <TextInput
                                            onChangeText={setLong}
                                            placeholder="Longitude"
                                            value={long}
                                            style={{
                                                borderWidth: 1,
                                                borderColor: "#D4EFDF",
                                                padding: 5,
                                                margin: "1%", width: "100%"
                                            }}
                                        />
                                        <Text>Latitude</Text>
                                        <TextInput
                                            onChangeText={setLat}
                                            placeholder="Latitude"
                                            value={lat}
                                            style={{
                                                width: "100%", borderWidth: 1,
                                                borderColor: "#D4EFDF",

                                                padding: 5,
                                                margin: "1%",
                                            }}
                                        />
                                    </View></View>

                                <View style={{ flexDirection: "row", marginBottom: "0.5%" }}>
                                    <Text style={styles.inputTitles}>Description</Text>
                                    <TextInput
                                        onChangeText={setDescription}
                                        placeholder="Description"
                                        value={description}
                                        style={{
                                            borderWidth: 1,
                                            borderColor: "#D4EFDF",
                                            width: "70%",
                                            //height:"150%",
                                            padding: 5,
                                            margin: "1%",
                                        }}
                                    />
                                </View>

                                <MaterialCommunityIcons
                                    name={showAddAsset ? "plus-circle-outline" : "square-edit-outline"}
                                    size={30}
                                    color={"#609e9f"}
                                    onPress={() => showAddAsset ? handleAdd("assets", {
                                        assetSection: selectedSection.id,
                                        name,
                                        code,
                                        rate: 0,
                                        price,
                                        status: false,
                                        lock: false,
                                        numOfPeople,
                                        location: { Latitude: lat, Longitude: long },
                                        description,
                                        type
                                    }) : handleEdit("assets", {
                                        assetSection: selectedSection.id,
                                        name,
                                        code,
                                        rate: 0,
                                        price,
                                        status: false,
                                        lock: false,
                                        numOfPeople,
                                        location: { Latitude: lat, Longitude: long },
                                        description,
                                        type
                                    }, selectedAsset.id)}
                                    style={{ marginBottom: "4%" , marginLeft:"auto" , marginRight:"auto"}}
                                />
                                {/* <Button title="Add" onPress={() => handleAdd("assets", {
                                    assetSection: selectedSection.id,
                                    name,
                                    code,
                                    rate: 0,
                                    price,
                                    status: false,
                                    lock: false,
                                    numOfPeople,
                                    location: { Latitude: lat, Longitude: long },
                                    description,
                                    type
                                })} disabled={!name || !code || !price || !description} /> */}
</ScrollView></KeyboardAvoidingView>
                            </View>
                            
                        </View>
                       
                    </Modal>
                   
                    :
                    null
            }

            {
                openSectionIcon || openAssetIcon ?
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
                                                    <TouchableOpacity onPress={() =>
                                                        openAssetIcon ? setAssetIcon(i) || setOpenAssetIcon(false)
                                                            : setSectionIcon(i) ||
                                                            setOpenSectionIcon(false)}>
                                                        <MaterialCommunityIcons
                                                            name={i}
                                                            size={30}
                                                            color={"#609e9f"}
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

            {
                showColorPicker ?
                    <Modal
                        animationType="slide"
                        transparent={true}
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
                                            colors.map((i, index) =>
                                                <TouchableOpacity
                                                    style={{
                                                        width: "20%",
                                                        height: "20%",
                                                        alignItems: "center",
                                                        marginBottom: 15,
                                                        backgroundColor: `#${i}`
                                                    }}
                                                    onPress={() => setColor(i) || setShowColorPicker(false)}
                                                >

                                                    <Text></Text>
                                                </TouchableOpacity>

                                            )}
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </Modal>
                    :

                    null
            }

        </ScrollView>
    );
}

AssetManagement.navigationOptions = (props) => ({
    title: "Asset Management",
    headerStyle: { backgroundColor: "#185a9d" },
    headerTintColor: "black",
    headerTintStyle: { fontWeight: "bold" }
})

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
        marginTop: 60,
        //width : "70%"
    },
    modalView: {
        height: height / 1.35,
    width: width / 1.2,
        // margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 38,
        // paddingLeft: 35,
        // paddingRight: 35,

        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        // width: "75%"
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
        width: "30%",
        height: 30,
        color: "#566573",
        alignItems: "center",
        //marginLeft: "auto",
        marginRight: "2%"
    },
    textInputs: {
        borderWidth: 1,
        borderColor: "#D4EFDF",
        width: "70%",
        padding: 5,
        margin: "1%",
        //backgroundColor: "blue"
    },
    inputTitles: {
        width: "28%",
        marginBottom: "auto",
        marginTop: "auto",
        //backgroundColor:"red"
    }
});
