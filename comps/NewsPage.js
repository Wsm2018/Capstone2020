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
import { Icon, Avatar, Button, Image } from "react-native-elements";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import * as ImagePicker from "expo-image-picker";
import "firebase/storage";
import db from "../db";
import News from "./News.js";
import { MaterialIcons } from "@expo/vector-icons";
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

      <ScrollView style={{ flex:1,width:'125%'}} horizontal={false}>
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
      <Text>here</Text>
      <TextInput
        style={{ height: 40, width: 200, borderColor: "gray", borderWidth: 1 }}
        onChangeText={setTitle}
        placeholder="Enter Title"
        value={title}
      />
      <DatePicker
        style={{ width: 200 }}
        date={date}
        mode="date"
        placeholder="select published date"
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
          dateInput: {
            marginLeft: 36,
          },
          // ... You can check the source to find the other keys.
        }}
        onDateChange={(date) => setDate(date)}
      />
      <DatePicker
        style={{ width: 200 }}
        date={endDate}
        mode="date"
        placeholder="select end date"
        format="YYYY-MM-DD"
        minDate={moment(new Date()).format("YYYY-MM-DD")}
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        customStyles={{
          dateIcon: {
            position: "absolute",
            left: 0,
            top: 4,
            marginLeft: 0,
          },
          dateInput: {
            marginLeft: 36,
          },
          // ... You can check the source to find the other keys.
        }}
        onDateChange={(endDate) => setEndDate(endDate)}
      />
      <TextInput
        style={{ height: 150, width: 200, borderColor: "gray", borderWidth: 1 }}
        onChangeText={setDescription}
        placeholder="Enter Description"
        value={description}
      />
      <TouchableOpacity onPress={_pickImage}>
        <Text>Pick an image from camera roll</Text>
      </TouchableOpacity>
      <View>
        <TouchableOpacity onPress={submitNews}>
          <Text>upload</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCreateFlag(!createFlag)}>
          <Text>Back</Text>
        </TouchableOpacity>
      </View>
      {image != null ? (
        <Image source={{ uri: image }} style={{ width: 100, height: 100 }} />
      ) : null}
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
      backgroundColor: '#20365F',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
      fontWeight: 'bold',
  },
  tabBarIcon: () => {
    <Icon name="news" type="font-awesome" size={24} color={"black"} />;
  },
};
