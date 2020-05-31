//@refresh reset
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import { Icon, Avatar, Button, Image, Input } from "react-native-elements";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import * as ImagePicker from "expo-image-picker";
import "firebase/storage";
import db from "../db";
import News from "./News.js";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
export default function NewsPage() {
  const [hasCameraRollPermission, setHasCameraRollPermission] = useState(false);
  const [image, setImage] = useState(null);
  const [createFlag, setCreateFlag] = useState(true);
  const [editFlag, setEditFlag] = useState(true);
  const [title, setTitle] = useState();
  const [date, setDate] = useState();
  const [endDate, setEndDate] = useState();
  const [description, setDescription] = useState();
  const [news, setNews] = useState([]);
  const askPermission = async () => {
    const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
    setHasCameraRollPermission(status === "granted");
  };

  useEffect(() => {
    askPermission();
  }, []);

  useEffect(() => {
    callNews();
  }, []);

  const callNews = () => {
    db.collection("news").onSnapshot((onSnapshot) => {
      let data = [];
      onSnapshot.forEach((doc) => {
        data.push(doc.data());
      });
      setNews(data);
    });
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

  const uploadImage = async (id) => {
    const response = await fetch(image);
    const blob = await response.blob();
    const upload = await firebase
      .storage()
      .ref()
      .child("news/" + id)
      .put(blob);
    const url = await firebase
      .storage()
      .ref()
      .child("news/" + id)
      .getDownloadURL();
    db.collection("news").doc(id).update({
      image: url,
      id,
    });
  };

  const submitNews = () => {
    db.collection("news")
      .add({
        title: title,
        datePublished: new Date(date),
        endDate: new Date(endDate),
        image: null,
        description: description,
      })
      .then((doc) => {
        uploadImage(doc.id);
      });
    setTitle(null);
    setDate(null);
    setEndDate(null);
    setImage(null);
    setDescription(null);
    setCreateFlag(!createFlag);
  };

  return createFlag ? (
    <View style={styles.container}>
      {/* <Text>Header</Text> */}

      <ScrollView style={{ flex: 1, width: "125%" }} horizontal={false}>
        {news.map((item, i) => (
          <News key={i} item={item} />
        ))}
      </ScrollView>
      <TouchableOpacity
        style={{
          backgroundColor: "#20365F",
          height: 50,
          width: "60%",
          alignItems: "center",
          alignContent: "center",

          flexDirection: "row",
          justifyContent: "center",
          alignSelf: "center",
          // paddingLeft: 0,
          marginTop: 10,
          // marginLeft: "20%",
          // marginEnd: "20%",
          borderRadius: 25,
          marginBottom: 10,
        }}
        onPress={() => {
          setCreateFlag(!createFlag);
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 22,
            paddingLeft: "5%",
            paddingBottom: "2%",
          }}
        >
          Create News
        </Text>
        <Text
          style={{
            paddingBottom: "1%",
          }}
        >
          {"  "}
          <MaterialIcons name="create" size={25} color="white" />
        </Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={styles.container}>
      <View
        style={{
          // /  paddingTop: "15%",
          borderWidth: 2,
          borderRadius: 20,
          borderColor: "#34589C",
          width: "90%",
          height: "90%",
          alignContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <View
          style={{
            // paddingTop: "15%",
            borderBottomWidth: 1,
            borderTopRightRadius: 18,
            borderTopLeftRadius:18,
            borderColor: "#34589C",
            width: "100%",
            // height: "10%",
            alignContent: "center",
            alignItems: "center",
            flexDirection: "column",
            marginBottom: "5%",
            backgroundColor:'#34589C'
          }}
        >
          <TouchableOpacity onPress={() => setCreateFlag(!createFlag)}>
            <Text
              style={{
                alignSelf: "flex-end",
                paddingLeft: "90%",
                paddingTop: "1%",
              }}
            >
              <MaterialIcons name="cancel" size={30} color="#fff" />
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 28, color: "#fff", paddingBottom: "5%" }}>
            Create News
          </Text>
        </View>
        <View
          style={{
            borderWidth: 2,
            borderColor: "#20365F",
            width: "30%",
            height: "17%",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          {image != null ? (
            <Image
              source={{ uri: image }}
              style={{ width: 100, height: 100 }}
            />
          ) : (
            <TouchableOpacity onPress={_pickImage}>
              <MaterialCommunityIcons
                name="image-plus"
                size={80}
                color="darkgrey"
                style={{ paddingTop: "8%" }}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={_pickImage}
          style={{
            marginLeft: "65%",
          }}
        >
          <Text>
            <MaterialCommunityIcons
              name="camera-plus"
              size={30}
              color="#20365F"
            />
          </Text>
        </TouchableOpacity>

        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{
            alignContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Input
            inputContainerStyle={{
              borderBottomWidth: 0,
              // color: "white",
            }}
            leftIcon={<MaterialIcons name="title" size={24} color="darkgrey" />}
            containerStyle={{
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: "#20365F",
              height: "20%",
              width: "80%",
              // alignSelf: "center",

              //paddingBottom: "1%",
            }}
            // label="News Title"
            // labelStyle={{ fontSize: 18 }}
            maxLength={28}
            onChangeText={setTitle}
            placeholder="Enter News Title"
            value={title}
            placeholderTextColor={"#5D626B"}
          />

          {/* <TextInput
          style={{
            height: 40,
            width: 200,
            borderColor: "gray",
            borderWidth: 1,
          }}
          onChangeText={setTitle}
          placeholder="Enter Title"
          value={title}
        /> */}

          <DatePicker
            style={{
              borderRadius: 8,
              borderWidth: 1.5,
              marginTop: "2%",
              borderColor: "#20365F",
              height: "20%",
              width: "80%",
              color: "#20365F",
              fontSize: 18,
            }}
            date={date}
            mode="date"
            placeholder="Select Published-Date"
            format="YYYY-MM-DD"
            minDate={moment(new Date()).format("YYYY-MM-DD")}
            maxDate={moment(new Date()).add(10, "days").format("YYYY-MM-DD")}
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            customStyles={{
              dateIcon: {
                position: "absolute",
                left: 0,
                top: 4,
                marginLeft: 0,
              },
              placeholderText: {
                color: "#5D626B",
                fontSize: 18,
                paddingTop: "2%",
                alignSelf: "flex-start",
              },
              dateInput: {
                marginLeft: 36,
                borderColor: "#20365F",
                borderRadius: 10,
                borderWidth: 0,
                width: "70%",
                height: "80%",
                color: "#20365F",
                fontSize: 18,
                paddingLeft: "1%",
              },
              dateText: {
                color: "#20365F",
                fontSize: 18,
                paddingTop: "2%",
                alignSelf: "flex-start",
              },
              // ... You can check the source to find the other keys.
            }}
            onDateChange={(date) => setDate(date)}
          />
          <DatePicker
            style={{
              // width: 200,
              borderRadius: 8,
              borderWidth: 1.5,
              marginTop: "2%",
              borderColor: "#20365F",
              height: "20%",
              width: "80%",
              color: "#20365F",
              fontSize: 18,
              // paddingTop:'2%',
              //  alignSelf:'flex-start'
            }}
            date={endDate}
            mode="date"
            placeholder="Select End-Date"
            format="YYYY-MM-DD"
            minDate={moment(new Date()).format("YYYY-MM-DD")}
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            // iconComponent={
            //   <MaterialCommunityIcons
            //     name="calendar-outline"
            //     size={30}
            //     color="#20365F"
            //     style={{alignSelf:'flex-start'}}
            //   />
            // }
            customStyles={{
              dateIcon: {
                position: "absolute",
                left: 0,
                top: 4,
                marginLeft: 0,
              },
              placeholderText: {
                color: "#5D626B",
                fontSize: 18,
                paddingTop: "2%",
                alignSelf: "flex-start",
              },
              dateInput: {
                marginLeft: 36,
                borderColor: "#20365F",
                borderRadius: 10,
                borderWidth: 0,
                width: "70%",
                height: "80%",
                color: "#20365F",
                fontSize: 18,
                paddingLeft: "1%",
              },
              dateText: {
                color: "#20365F",
                fontSize: 18,
                paddingTop: "2%",
                alignSelf: "flex-start",
              },
              // ... You can check the source to find the other keys.
            }}
            // showIcon={true}

            onDateChange={(endDate) => setEndDate(endDate)}
          />
          <Input
            inputContainerStyle={{
              borderBottomWidth: 0,
              // color: "white",
            }}
            containerStyle={{
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: "#20365F",
              height: "50%",
              width: "80%",
              alignSelf: "center",
              //justifyContent:'center',
              // /  marginLeft:'18%',
              opacity: 0.8,
              paddingLeft: "2%",
              // paddingBottom: "5%",
              position: "relative",
              marginTop: "2%",
            }}
            multiline={true}
            maxLength={400}
            label={"Add News"}
            labelStyle={{
              color: "#20365F",
              fontSize: 18,
              textDecorationLine: "underline",
              alignSelf: "center",
            }}
            placeholderTextColor={"#5D626B"}
            onChangeText={setDescription}
            placeholder="Enter Description"
            value={description}
          />
          {/* <TextInput
            style={{
              height: 150,
              width: 200,
              borderColor: "gray",
              borderWidth: 1,
            }}
            onChangeText={setDescription}
            placeholder="Enter Description"
            value={description}
          /> */}
        </ScrollView>
        <View
          style={{
            // paddingTop: "15%",
            borderBottomWidth: 1,
            borderBottomRightRadius: 18,
            borderBottomLeftRadius:18,
            borderColor: "#34589C",
            width: "100%",
            height: "10%",
            alignContent: "center",
            alignItems: "center",
            flexDirection: "column",
         //   marginBottom: "5%",34589C
            backgroundColor:'#34589C'
          }}
        >
      
          <TouchableOpacity  
           style={{
            backgroundColor: "#fff",
            // height: '20%',
            width: "26%",
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            marginStart: "2%",
            marginEnd: "3%",
             paddingBottom:'3%',
            borderRadius: 10,
            borderColor:'#20365F',
            // marginBottom: 0,
             marginTop: '4%',
          }}
          onPress={submitNews}>
            <Text style={{  fontSize: 20, color: "#20365F",paddingBottom:'9%' }}>Upload</Text>
          </TouchableOpacity>
        
        </View>
      </View>
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

NewsPage.navigationOptions = {
  title: "News ",
  headerStyle: {
    backgroundColor: "#20365F",
  },
  headerTintColor: "#fff",
  headerTitleStyle: {
    fontWeight: "bold",
  },
  tabBarIcon: () => {
    <Icon name="news" type="font-awesome" size={24} color={"black"} />;
  },
};
