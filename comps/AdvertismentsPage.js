//@refresh reset
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import firebase, { firestore } from "firebase/app";
import "firebase/auth";
import { Icon, Avatar, Button, Image } from "react-native-elements";
import DatePicker from 'react-native-datepicker'
import moment from "moment";
import * as ImagePicker from 'expo-image-picker';
import "firebase/storage";
import db from "../db";
import SubscriptionsScreen from './SubscriptionsScreen';
import { set } from "react-native-reanimated";
import * as Linking from 'expo-linking';
export default function AdvertismentsPage() {
    const [hasCameraRollPermission, setHasCameraRollPermission] = useState(false);
    const [image, setImage] = useState(null);

    const [flag, setFlag] = useState(0);

    useEffect(() =>{
        if(flag === 4){
            setFlag(0)
        }
    },[flag])

    const [user, setUser] = useState();
    const [title, setTitle] = useState("");
    const [link, setLink] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState();
    const [endDate, setEndDate] = useState();
    const [amount, setAmount] = useState();

    const [advertisements, setAdvertisements] = useState([]);
    const [adsBox, setAdsBox] = useState([]);
    const [adsNum, setAdsNum] = useState(0);
    useEffect(() => {
        askPermission();
    }, []);
    
    const askPermission = async () => {
        const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
        setHasCameraRollPermission(status === "granted");
    };
    const _pickImage = async () => {
        try {
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          if (!result.cancelled) {
            setImage(result.uri);
          }
    
          console.log(result);
        } catch (E) {
          console.log(E);
        }
    };
    const uploadImage = async (id) =>{
        const response = await fetch(image);
        const blob = await response.blob();
        const upload = await firebase
          .storage()
          .ref()
          .child("advertisements/"+ id)
          .put(blob);
        const url = await firebase.storage()
        .ref()
        .child("advertisements/"+ id)
        .getDownloadURL();
        db.collection("advertisements").doc(id).update({
          image: url,
          id
        })
    }    
    useEffect(()=>{
        getUserObject()
    },[])
    useEffect(() =>{
        calculation()
    },[date, endDate])
    const getUserObject = async () =>{
        let useracc = await db.collection("users").doc(firebase.auth().currentUser.uid).get()
        setUser(useracc.data())
    }
    const calculation = () =>{
        let a = moment(date)
        let b = moment(endDate)
        if(b.diff(a, 'days') == 0){
            setAmount(30)
        }else{
            let result = 30*b.diff(a, 'days')
            setAmount(result)
        }
    }

    const submit = () => {
        if(image === null ){
            alert("please choose an image")
        } else if( amount < 0){
            alert("please set the start date before the end date")
        } else if( title === ""|| link === "" || description ==""){
            alert("please fill the text fileds")
        } else{
        db.collection("advertisements").add({
          title: title,
          startDate: new Date(date),
          endDate: new Date(endDate),
          image: null,
          description: description,
          user: user,
          link: link,
          status: "pending",
          clickers: 0,
          amount: amount,
        }).then(doc => {uploadImage(doc.id)})
        setTitle(null)
        setDate(null)
        setEndDate(null)
        setImage(null)
        setDescription(null)
        setAmount(30);
        setLink("");
        }
      }

      useEffect(() =>{
        db.collection("advertisements").where('status','==', "pending").onSnapshot(querySnapshot => {
            const advertisements = [];
            querySnapshot.forEach(doc => {
                advertisements.push({ id: doc.id, ...doc.data() });
            });
            
            setAdvertisements([...advertisements]);
        });

      },[])

      const approve = (doc, dissection) =>{
            db.collection("advertisements").doc(doc).update({status: dissection, handledBy: firebase.auth().currentUser.uid})
      }

      useEffect(() =>{
        db.collection("advertisements").where('status','==', "approved").onSnapshot(querySnapshot => {
            const adsBox = [];
            querySnapshot.forEach(doc => {
                adsBox.push({ id: doc.id, ...doc.data() });
            });
            setAdsNum(Math.floor(Math.random() * Math.floor(adsBox.length)))
            setAdsBox([...adsBox]);
          });

      },[])


      const openLink = async () => {
        const increment = firebase.firestore.FieldValue.increment(1);
        let doc = db.collection("advertisements").doc(adsBox[adsNum].id);
        doc.update({ clickers: increment });
        Linking.openURL(`https://${adsBox[adsNum].link}`)
      }
      
  return (
      <View style={styles.container}>
          <View style={{flex: 1}}>
              <Button onPress={() => setFlag(flag+1)}>switch</Button>
          </View>
          {flag == 0? <View style={{flex: 10}}>
              {advertisements.map((item, index) =>(
                  <View key= {index}>
                      <Text>{item.title}</Text>
                      <Text>{item.description}</Text>
                      <Text>{item.link}</Text>
                      <Text>{moment(item.endDate.toDate()).format('L')}</Text>
                      <Text>{moment(item.startDate.toDate()).format('L')}</Text>
                        {item.image != null?
                            <Image
                            source={{ uri: item.image }}
                            style={{ width: 100, height: 100 }}
                        />: null}
                        <TouchableOpacity
                            onPress={() => approve(item.id, "approved")}
                        >
                            <Text>approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => approve(item.id, "denied")}
                        >
                            <Text>denied</Text>
                        </TouchableOpacity>
                  </View>
              ))}
          </View> 
          :flag == 1 ?
          <View style={{flex: 10}}>
            <TextInput
                style={{ height: 40, width: 200, borderColor: "gray", borderWidth: 1 }}
                onChangeText={setTitle}
                placeholder="Enter Title"
                value={title}
            />
            <TextInput
                style={{ height: 40, width: 200, borderColor: "gray", borderWidth: 1 }}
                onChangeText={setLink}
                placeholder="Enter Link"
                value={link}
            />
            <TextInput
                style={{ height: 40, width: 200, borderColor: "gray", borderWidth: 1 }}
                onChangeText={setDescription}
                placeholder="Enter description"
                value={description}
            />
            <DatePicker
                style={{width: 200}}
                date={date}
                mode="date"
                placeholder="select published date"
                format="YYYY-MM-DD"
                minDate={moment(new Date).format("YYYY-MM-DD")}
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
                onDateChange={(date) => setDate(date)}
            />
            <DatePicker
                style={{width: 200}}
                date={endDate}
                mode="date"
                placeholder="select end date"
                format="YYYY-MM-DD"
                minDate={moment(date).format("YYYY-MM-DD")}
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
                onDateChange={(endDate) => setEndDate(endDate)}
            />
            <Text>total price: {amount > 0 ? amount : "choose the start date to be before end date"}</Text>
            <TouchableOpacity
                onPress={_pickImage}
            >
            <Text>Pick an image from camera roll</Text>
            </TouchableOpacity>
            {image != null?
            <Image
            source={{ uri: image }}
            style={{ width: 100, height: 100 }}
            />: null}
            <TouchableOpacity
                onPress={() => submit()}
            >
                <Text>submit</Text>
            </TouchableOpacity>
        </View> : flag === 2 ? <View style={{flex: 10}}>
            <TouchableOpacity
                onPress={() => openLink()}
            >
                <Image
                source={{ uri: adsBox[adsNum].image }}
                style={{ width: 100, height: 100 }}
                />
                
            </TouchableOpacity>
            
            
            </View> : <SubscriptionsScreen style={{flex: 10}}/>}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

AdvertismentsPage.navigationOptions = {
  title: null,
  tabBarIcon: () => {
    <Icon name="Advertisments" type="font-awesome" size={24} />
  },
};
