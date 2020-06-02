//@refresh reset
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
    CheckBox
} from "react-native";


import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db.js";
import { ceil } from "react-native-reanimated";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
require("firebase/firestore");

export default function AssetManagement(props) {
    const [latLong, setLatLong] = useState("");
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
            //obj.image = photoURL
            db.collection("assetTypes").doc(selectedType.id).update(obj)
            //db.collection("assetTypes").doc(selectedType.id).update({image : photoURL})
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
        const assetManager = firebase.functions().httpsCallable("assetManager");
        const response = await assetManager({
            collection, doc, type: "delete"
        });
        cancelAll()

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
    }

    return (
        <ScrollView>
            <Text>Asset Managment</Text>


            {
                types && !selectedType ?
                    <View>{
                        types.map(t =>
                            <TouchableOpacity onPress={() =>
                                setSelectedType(t) ||
                                setShowAddType(false) ||
                                setName(t.name) ||
                                setAssetIcon(t.assetIcon) ||
                                setSectionIcon(t.sectionIcon) ||
                                setShowInMap(t.showInMap)
                            }><Text>{t.name}</Text></TouchableOpacity>
                        )
                    }
                    </View>
                    :
                    null
            }

            {
                selectedType && sections ?
                    <View>
                        {
                            sections.map(t =>
                                t.assetType == selectedType.id ?
                                    <TouchableOpacity onPress={() => setSelectedSection(t) || setName()}><Text>{t.name}</Text></TouchableOpacity>
                                    :
                                    null

                            )}
                        {
                            !selectedSection ?
                                <View>
                                    <Button title={"Edit " + selectedType.name} onPress={() => setShowEditType(true)} />
                                    <Button title={"Delete " + selectedType.name} onPress={() => handleDelete("assetTypes", selectedType.id)} />
                                    <Button title="Add Section" onPress={() => setShowAddSection(true) || setName()} />
                                    <Button title="Manage Services" onPress={() => props.navigation.navigate("ServiceManagement", { assetType: selectedType })} />

                                </View>
                                :
                                null
                        }

                    </View>
                    :
                    null
            }

            {
                selectedSection && assets ?
                    <View>
                        {
                            assets.map(t =>
                                t.assetSection == selectedSection.id ?
                                    <TouchableOpacity onPress={() => setSelectedAsset(t)}><Text>{t.code}</Text></TouchableOpacity>
                                    :
                                    null
                            )}
                        <Button title={"Edit " + selectedSection.name} onPress={() =>
                            setShowEditSection(true) ||
                            setName(selectedSection.name)
                        } />
                        <Button title={"Delete " + selectedSection.name} onPress={() => handleDelete("assetSections", selectedSection.id)} />
                        <Button title={"Add " + selectedSection.name} onPress={() => setShowAddAsset(true)} />
                    </View>
                    :
                    null
            }


            {
                selectedSection || selectedType ?
                    <Button title={"Go Back"} onPress={() => setSelectedType() || setSelectedSection()} />
                    :
                    null
            }

            {
                selectedAsset ?
                    <Modal
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => {
                            Alert.alert("Modal has been closed.");
                        }}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                {
                                    showEditAsset ?
                                        <View>
                                            <TextInput
                                                onChangeText={setName}
                                                placeholder="Name"
                                                value={name}
                                            />
                                            <TextInput
                                                onChangeText={setCode}
                                                placeholder="code"
                                                value={code}
                                            />
                                            <TextInput
                                                onChangeText={setPrice}
                                                placeholder="Price"
                                                value={price}
                                            />
                                            <TextInput
                                                onChangeText={setType}
                                                placeholder="Type"
                                                value={type}
                                            />
                                            <TextInput
                                                onChangeText={setNumOfPeople}
                                                placeholder="Number of people"
                                                value={numOfPeople}
                                            />
                                            <TextInput
                                                onChangeText={setLocation}
                                                placeholder="Name"
                                                value={location}
                                            />
                                            <TextInput
                                                onChangeText={setDescription}
                                                placeholder="Name"
                                                value={description}
                                            />

                                            <Button title="Edit" onPress={() => handleEdit("assets", {
                                                assetSection: selectedSection.id,
                                                name,
                                                code,
                                                rate: 0,
                                                price,
                                                status: false,
                                                lock: false,
                                                numOfPeople,
                                                location,
                                                description,
                                                type
                                            }, selectedAsset.id)

                                            } />

                                            <Button title="Cancel" onPress={() => setShowEditAsset(false) || cancelAll()} />
                                        </View>

                                        :
                                        <View>
                                            <Text>{selectedAsset.name ? selectedAsset.name : null}</Text>
                                            <Text>{selectedAsset.price ? selectedAsset.price : null}</Text>
                                            {/* <Text>{selectedAsset.location? selectedAsset.location: null}</Text> */}
                                            <Text>{selectedAsset.type ? selectedAsset.type : null}</Text>
                                            <Text>{selectedAsset.numOfPeople ? selectedAsset.numOfPeople : null}</Text>
                                            <Text>{selectedAsset.description ? selectedAsset.description : null}</Text>


                                            <TouchableOpacity onPress={() => setShowEditAsset(true) ||
                                                setName(selectedAsset.name) ||
                                                setPrice(selectedAsset.price) ||
                                                setLocation(selectedAsset.location) ||
                                                setDescription(selectedAsset.description) ||
                                                setType(selectedAsset.type) ||
                                                setCode(selectedAsset.code) ||
                                                setNumOfPeople(selectedAsset.numOfPeople)
                                            } ><Text>Edit</Text></TouchableOpacity>
                                            <TouchableOpacity onPress={() => setSelectedAsset() || setName()}><Text>Back</Text></TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDelete("assets", selectedAsset.id)}><Text>Delete</Text></TouchableOpacity>
                                        </View>
                                }


                            </View>
                        </View>
                    </Modal>
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
                                <TextInput
                                    onChangeText={setName}
                                    placeholder="Name"
                                    value={name}
                                />

                                <Text>Show In Map</Text>
                                <CheckBox
                                    value={showInMap}
                                    onValueChange={() => setShowInMap(!showInMap)}
                                />

                                <TouchableOpacity onPress={() => setOpenSectionIcon(true)}>
                                    <Text>Section Icon</Text>
                                    <MaterialCommunityIcons
                                        name={sectionIcon ? sectionIcon : "help"}
                                        size={30}
                                        color={"#20365F"}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setOpenAssetIcon(true)}>
                                    <Text>Asset Icon</Text>
                                    <MaterialCommunityIcons
                                        name={assetIcon ? assetIcon : "help"}
                                        size={30}
                                        color={"#20365F"}

                                    />
                                </TouchableOpacity>
                                <View
                                    style={{ width: "30%" }}
                                >
                                    <Button title="Pick Image" onPress={handlePickImage} />
                                </View>
                                <TouchableOpacity onPress={() => handleType({ name, sectionIcon, assetIcon , showInMap })} disabled={!name || !sectionIcon  || !uri || !assetIcon}><Text>{showAddType ? "Add" : "Edit"}</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowInMap(false) || setShowAddType(false) || setShowEditType(false) || setName()}><Text>Cancel</Text></TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                    :

                    !selectedType ?
                        <Button title="+" onPress={() => setShowAddType(true)} />
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
                                <TextInput
                                    onChangeText={setName}
                                    placeholder="Name"
                                    value={name}
                                />

                                <Button title={showAddSection ? "Add" : "Edit"} onPress={() =>
                                    showAddSection ? handleAdd("assetSections", { assetType: selectedType.id, name })
                                        :
                                        handleEdit("assetSections", { name, assetType: selectedType.id }, selectedSection.id)} disabled={!name} />
                                <Button title="Cancel" onPress={() => setShowAddSection(false) || setShowEditSection(false) || cancelAll()} />
                            </View>
                        </View>
                    </Modal>
                    :
                    null
            }


            {
                showAddAsset ?
                    <Modal
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => {
                            Alert.alert("Modal has been closed.");
                        }}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <TextInput
                                    onChangeText={setName}
                                    placeholder="Name"
                                    value={name}
                                />
                                <TextInput
                                    onChangeText={setCode}
                                    placeholder="code"
                                    value={code}
                                />
                                <TextInput
                                    onChangeText={setPrice}
                                    placeholder="Price"
                                    value={price}
                                />
                                <TextInput
                                    onChangeText={setType}
                                    placeholder="Type"
                                    value={type}
                                />
                                <TextInput
                                    onChangeText={setNumOfPeople}
                                    placeholder="Number of people"
                                    value={numOfPeople}
                                />
                                <TextInput
                                    onChangeText={setLocation}
                                    placeholder="Name"
                                    value={location}
                                />
                                <TextInput
                                    onChangeText={setDescription}
                                    placeholder="Name"
                                    value={description}
                                />

                                <Button title="Add" onPress={() => handleAdd("assets", {
                                    assetSection: selectedSection.id,
                                    name,
                                    code,
                                    rate: 0,
                                    price,
                                    status: false,
                                    lock: false,
                                    numOfPeople,
                                    location,
                                    description,
                                    type
                                })} disabled={!name || !code || !price || !description} />
                                <Button title="Cancel" onPress={() => setShowAddAsset(false) || cancelAll()} />
                            </View>
                        </View>
                    </Modal>
                    :
                    null
            }
            {/*  */}
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




        </ScrollView>
    );
}

AssetManagement.navigationOptions = (props) => ({
    title: "Asset Management",
    headerStyle: { backgroundColor: "white" },
    headerTintColor: "black",
    headerTintStyle: { fontWeight: "bold" }
})


const styles = StyleSheet.create({
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
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: "75%"
    },
    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },

});
