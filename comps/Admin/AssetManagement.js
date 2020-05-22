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
    View
} from "react-native";


import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db.js";
import { ceil } from "react-native-reanimated";
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
    const [showAddAsset, setShowAddAsset] = useState(false)
    const [name, setName] = useState()
    const [numOfPeople , setNumOfPeople] = useState(0)
    const [ price , setPrice] = useState()
    const [description , setDescription] = useState()
    const [type, setType ] = useState("Normal")
    const [location , setLocation] = useState("")
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

    const handleAdd = async ( collection , obj) => {
        db.collection(collection).add(
           obj
        );
        setShowAddSection(false)
        setShowAddType(false)
        setShowAddAsset(false)
        setName()
        setPrice()
        setLocation()
        setDescription()
        setType("Normal")
        setCode()
        setNumOfPeople(0)
    }

    return (
        <View style={styles.container}>
            <Text>Asset Managment</Text>
            {
                types && !selectedType ?
                <View>{
                    types.map(t =>
                        <TouchableOpacity onPress={() => setSelectedType(t)|| setShowAddType(false)}><Text>{t.name}</Text></TouchableOpacity>
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
                                    <TouchableOpacity onPress={() => setSelectedSection(t) }><Text>{t.name}</Text></TouchableOpacity>
                                    :
                                    null

                            )}

                <Button title="Add Section" onPress={() => setShowAddSection(true)} />
                <Button title="Manage Services" onPress={() => props.navigation.navigate("ServiceManagement", {assetType: selectedType})} />

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

                    <Button title={"Add "+selectedType.name} onPress={() => setShowAddAsset(true)} />
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
                showAddType?
                    <View>
                        <TextInput
                            onChangeText={setName}
                            placeholder="Name"
                            value={name}
                        />

                        <Button title="Add" onPress={() => handleAdd("assetTypes",{name})} disabled={!name} />
                        <Button title="Cancel" onPress={() => setShowAddType(false)} />
                    </View>
                    :
                    
                    !selectedType ?
                    <Button title="+" onPress={() => setShowAddType(true)} />
                    :
                    null
            }

            {
                showAddSection ?
                <View>
                    <TextInput
                        onChangeText={setName}
                        placeholder="Name"
                        value={name}
                    />

                    <Button title="Add" onPress={() => handleAdd("assetSections",{assetType:selectedType.id ,name})} disabled={!name} />
                    <Button title="Cancel" onPress={() => setShowAddSection(false)} />
                </View>
                :
                null
            }


            {
                showAddAsset ? 
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

                    <Button title="Add" onPress={() => handleAdd("assets",{
                        assetSection:selectedSection.id ,
                        name ,
                        code ,
                        rate : 0,
                        price,
                        status : false,
                        lock: false,
                        numOfPeople,
                        location,
                        description,
                        type
                        })} disabled={!name || !code || !price || !description } />
                    <Button title="Cancel" onPress={() => setShowAddAsset(false)} />
                </View>
                :
                null
            }
            {/*  */}
        </View>
    );
}

AssetManagement.navigationOptions = (props) => ({
    title: "Asset Management",
    headerStyle: { backgroundColor: "white" },
    headerTintColor: "black",
    headerTintStyle: { fontWeight: "bold" }
})


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",

    }

});
