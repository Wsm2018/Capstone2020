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
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
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
  const [promotions, setPromotions] = useState([]);
  const askPermission = async () => {
    const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
    setHasCameraRollPermission(status === "granted");
  };
  const [user, setUser] = useState(null);

  useEffect(() => {
    askPermission();
    getUser();
  }, []);

  const getUser = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((querySnap) => {
        setUser(querySnap.data());
      });
  };

  useEffect(() => {
    callNews();
  }, [promotions]);

  useEffect(() => {
    db.collection("promotionCodes").onSnapshot((query) => {
      let codes = [];
      query.forEach((doc) => {
        codes.push({
          datePublished: doc.data().expiryDate,
          endDate: doc.data().expiryDate,
          title: `Promotion Code ${doc.data().code}`,
          description: `${doc.data().percentage}% OFF!`,
          image:
            "https://firebasestorage.googleapis.com/v0/b/capstone2020-b64fd.appspot.com/o/advertisements%2Fpromotion.jpg?alt=media&token=c8dbaa7b-311f-4030-a374-1aa772bdfdaf",
          isPromo: true,
        });
      });
      setPromotions(codes);
    });
  }, []);

  const getUser = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((doc) => setUser({ id: doc.id, ...doc.data() }));
  };

  const callNews = () => {
    db.collection("news").onSnapshot((onSnapshot) => {
      let data = [];
      onSnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data(), isPromo: false });
      });
      promotions.forEach((p) => {
        console.log("promo", p);

        data.push(p);
      });

      // console.log("promotions", promotions);
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
        {news.map((item, i) =>
          user.activeRole === "admin" ? (
            !item.isPromo ? (
              <News key={i} item={item} user={user} />
            ) : null
          ) : (
            <News key={i} item={item} user={user} />
          )
        )}
      </ScrollView>
      {user && user.activeRole === "admin" ? (
        <TouchableOpacity
          style={{
            backgroundColor: "#3ea3a3",
            height: responsiveScreenHeight(5),
            width: "50%",
            alignItems: "center",
            alignContent: "center",

            flexDirection: "row",
            justifyContent: "center",
            alignSelf: "center",
            // paddingLeft: 0,
            marginTop: 10,
            // marginLeft: "20%",
            // marginEnd: "20%",
            borderRadius: 8,
            marginBottom: 10,
          }}
          onPress={() => {
            setCreateFlag(!createFlag);
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: responsiveFontSize(2),
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
      ) : null}
    </View>
  ) : (
    <View style={styles.container2}>
      <View
        style={{
          // /  paddingTop: "15%",
          borderWidth: 2,
          borderRadius: 20,
          borderColor: "#185a9d",
          width: "90%",
          height: "95%",
          alignContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {/* <View
          style={{
            // paddingTop: "15%",
            borderBottomWidth: 1,
            borderTopRightRadius: 18,
            borderTopLeftRadius: 18,
            borderColor: "#185a9d",
            width: "100%",
            // height: "10%",
            alignContent: "center",
            alignItems: "center",
            flexDirection: "column",
            marginBottom: "5%",
            backgroundColor: "#185a9d",
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
          <Text
            style={{
              fontSize: responsiveFontSize(3),
              color: "#fff",
              paddingBottom: "5%",
            }}
          >
            Create News
          </Text>
        </View> */}
        <View
          style={{
            borderWidth: 2,
            borderColor: "#185a9d",
            width: "30%",
            height: "17%",
            alignContent: "center",
            alignItems: "center",
            position: "relative",
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
                size={70}
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
              color="#3ea3a3"
            />
          </Text>
        </TouchableOpacity>

        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{
            alignContent: "center",
            alignItems: "center",
            flexDirection: "column",
            backgroundColor: "white",
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
              borderColor: "#185a9d",
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
              borderColor: "#185a9d",
              height: "20%",
              width: "80%",
              color: "#185a9d",
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
                borderColor: "#185a9d",
                borderRadius: 10,
                borderWidth: 0,
                width: "70%",
                height: "80%",
                color: "#185a9d",
                fontSize: 18,
                paddingLeft: "1%",
              },
              dateText: {
                color: "#185a9d",
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
              borderColor: "#185a9d",
              height: "20%",
              width: "80%",
              color: "#185a9d",
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
            //     color="#185a9d"
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
                borderColor: "#185a9d",
                borderRadius: 10,
                borderWidth: 0,
                width: "70%",
                height: "80%",
                color: "#185a9d",
                fontSize: 18,
                paddingLeft: "1%",
              },
              dateText: {
                color: "#185a9d",
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
              borderColor: "#185a9d",
              height: "30%",
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
              color: "#185a9d",
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
            borderBottomWidth: 0,
            borderBottomRightRadius: 18,
            borderBottomLeftRadius: 18,
            borderColor: "#185a9d",
            width: "100%",
            height: "10%",
            alignContent: "center",
            alignItems: "center",
            flexDirection: "column",
            //   marginBottom: "5%",185a9d
            backgroundColor: "#fff",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#3ea3a3",
              // height: '20%',
              width: "26%",
              alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
              marginStart: "2%",
              marginEnd: "3%",
              paddingBottom: "3%",
              borderRadius: 8,
              borderColor: "#185a9d",
              // marginBottom: 0,
              // marginTop: "4%",
            }}
            onPress={submitNews}
          >
            <Text
              style={{
                fontSize: 20,
                color: "#fff",
                //  paddingBottom: "10%"
              }}
            >
              Upload
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3e3e3",
    alignItems: "center",
    justifyContent: "center",
  },
  container2: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
});

NewsPage.navigationOptions = {
  title: "News ",
  headerStyle: {
    backgroundColor: "#185a9d",
  },
  headerTintColor: "#fff",
  headerTitleStyle: {
    fontWeight: "bold",
  },
  tabBarIcon: () => {
    <Icon name="news" type="font-awesome" size={24} color={"black"} />;
  },
};
