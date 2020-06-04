//@refresh reset
import React, { useState, useEffect } from "react";
import {
  Image,
  Platform,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import db from "../db.js";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";
import moment from "moment";
import * as ImagePicker from "expo-image-picker";
import DatePicker from "react-native-datepicker";
import { Card, Icon, Badge, Input } from "react-native-elements";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
export default ({ item }) => {
  const [editFlag, setEditFlag] = useState(true);
  const [viewNews, setViewNews] = useState(false);
  const [titleEdit, setTitleEdit] = useState(item.title);
  const [descriptionEdit, setDescriptionEdit] = useState(item.description);
  const [dateEdit, setDateEdit] = useState(
    moment(item.datePublished.toDate()).format("L")
  );
  const [endDateEdit, setEndDateEdit] = useState(
    moment(item.endDate.toDate()).format("L")
  );
  const [imageEdit, setImageEdit] = useState(item.image);

  const handleDelete = (item) => {
    console.log("the item: ", item.id);
    db.collection("news").doc(item.id).delete();

    const storage = firebase.storage();
    const desertRef = storage.refFromURL(item.image);

    // Delete the file
    desertRef
      .delete()
      .then(function () {
        // File deleted successfully
      })
      .catch(function (error) {
        // Uh-oh, an error occurred!
      });
  };

  const handleEdit = () => {
    console.log("the item Edit: ", item.id);
    db.collection("news")
      .doc(item.id)
      .update({
        title: titleEdit,
        description: descriptionEdit,
        datePublished: new Date(dateEdit),
        endDate: new Date(endDateEdit),
      });
    setEditFlag(!editFlag);
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
        uploadImage(result.uri);
      }

      //console.log(result);
    } catch (E) {
      console.log(E);
    }
  };

  const uploadImage = async (newImage) => {
    console.log("start uploading");
    const response = await fetch(newImage);
    const blob = await response.blob();
    const upload = await firebase
      .storage()
      .ref()
      .child("news/" + item.id)
      .put(blob);
    console.log("finished uploading");
  };

  return editFlag ? (
    <Animatable.View
      animation="zoomIn"
      style={{ paddingTop: "1%", flexDirection: "column", marginLeft: "12%" }}
    >
      <Card
        title={item.title}
        image={
          item.image == null
            ? require("../assets/cartoon-businessman-hand-holding-newspaper-vector-21307792.jpg")
            : { uri: item.image }
        }
        containerStyle={{
          backgroundColor: "#fff",
          borderColor: "#20365F",
          borderRadius: 10,
          width: "80%",
          shadowOpacity: 20,
          shadowColor: "#20365F",
        }}
        titleStyle={{ color: "#20365F" }}
      >
        <View
          style={{
            flexDirection: "row",
            alignContent: "flex-start",
            justifyContent: "flex-start",
          }}
        >
          {/* <Badge status="primary" containerStyle={{ paddingTop: "1%" }} /> */}
          <Ionicons
            name="ios-time"
            size={20}
            color="#20365F"
            style={{ paddingTop: "0.3%" }}
          />
          <Text style={{ paddingLeft: "3%", fontSize: 18, color: "#20365F" }}>
            {moment(item.datePublished.toDate()).format("LL")}
          </Text>
          {viewNews === true ? (
            <Animatable.View animation="flipInX" style={{ width: "100%" }}>
              <TouchableOpacity
                onPress={() => setViewNews(!viewNews)}
                style={{
                  borderRadius: 5,
                  borderColor: "white",
                  borderWidth: 1,
                  marginLeft: "50%",
                  width: "9%",
                  backgroundColor: "#20365F",
                }}
              >
                <MaterialIcons
                  name="unfold-less"
                  size={24}
                  color="white"
                  style={{
                    paddingLeft: "10%",
                    paddingBottom: "2%",
                    paddingTop: "2%",
                  }}
                />
                {/* <Ionicons
            name="md-more"
            size={24}
            color="white"
            style={{ paddingLeft: "43%" }}
          /> */}
              </TouchableOpacity>
            </Animatable.View>
          ) : (
            <Animatable.View animation="flipInX" style={{ width: "100%" }}>
              <TouchableOpacity
                onPress={() => setViewNews(!viewNews)}
                style={{
                  borderRadius: 5,
                  borderColor: "white",
                  borderWidth: 1,
                  marginLeft: "50%",
                  width: "9%",
                  backgroundColor: "#20365F",
                }}
              >
                <Ionicons
                  name="md-more"
                  size={24}
                  color="white"
                  style={{ paddingLeft: "43%" }}
                />
              </TouchableOpacity>
            </Animatable.View>
          )}

          {/* <MaterialIcons name="unfold-more" size={30} color="black" style={{alignSelf:'flex-end', paddingLeft:'55%'}} /> */}
        </View>
        {viewNews === true && (
          <Animatable.View
            animation="flipInX"
            style={{
              marginTop: "2%",
              marginBottom: "3%",
              flexDirection: "column",
              justifyContent: "space-evenly",
              paddingLeft: "7%",
            }}
          >
            <Text style={{ fontSize: 18 }}>
              {/* Description:  */}
              {item.description}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                paddingTop: "3%",
              }}
            >
              <TouchableOpacity
                style={{
                  alignSelf: "flex-end",
                  paddingRight: "2%",
                  position: "relative",
                }}
                onPress={() => setEditFlag(!editFlag)}
              >
                <Text>
                  <FontAwesome name="edit" size={28} color="#1488BB" />
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ alignSelf: "flex-end", position: "relative" }}
                onPress={() => handleDelete(item)}
              >
                <Text>
                  <MaterialCommunityIcons
                    name="delete-circle-outline"
                    size={28}
                    color="#BB1427"
                  />
                </Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        )}
      </Card>

      {/* <Text>Title: {item.title}</Text>
      <Text>Description: {item.description}</Text>
      <Text>Published: {moment(item.datePublished.toDate()).format("L")}</Text>
      <Text>End Date: {moment(item.endDate.toDate()).format("L")}</Text>
      {item.image == null ? null : (
        <Image
          source={{ uri: item.image }}
          style={{ width: 100, height: 100 }}
        />
      )}

      <Button title="Edit" onPress={() => setEditFlag(!editFlag)} />
      <Button title="X" onPress={() => handleDelete(item)} /> */}
    </Animatable.View>
  ) : (
    <Animatable.View
      animation="flipInY"
      style={{ paddingTop: "1%", flexDirection: "column", marginLeft: "12%" }}
    >
      <Card
        title={
          <View style={{ flexDirection: "row", height: "20%" }}>
            <TouchableOpacity onPress={() => setEditFlag(!editFlag)}>
              <Text>
                <MaterialIcons name="cancel" size={30} color="#BB1427" />
              </Text>
            </TouchableOpacity>
            {/* <Text
              style={{
                color: "#20365F",
                fontSize: 18,
                fontWeight: "bold",
                paddingLeft: "15%",
                paddingTop: "5%",
              }}
            >
              Title:{" "}
            </Text> */}
            {/* <Input
                      inputContainerStyle={{
                        borderBottomWidth: 0,
                        // color: "white",
                      }}
                      leftIcon={
                        <Icon name="email-outline" size={20} color="#20365F" />
                      }
                      containerStyle={styles.Inputs}
                      onChangeText={setRegisterEmail}
                      placeholder="E-mail"
                      value={registerEmail}
                      placeholderTextColor="#20365F"
                      inputStyle={{
                        color: "#20365F",
                        fontSize: 16,
                      }}
                      errorMessage="* Invalid E-mail"
                      errorStyle={{ color: registerEmailError }}
                      renderErrorMessage
                    /> */}
            <Input
              inputContainerStyle={{
                borderBottomWidth: 0,
                // color: "white",
              }}
              containerStyle={{
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#20365F",
                height: "50%",
                width: "50%",
                alignSelf: "center",
                marginLeft: "18%",
                opacity: 0.8,
                paddingLeft: "2%",
                marginTop: "2%",
                //paddingBottom: "1%",
              }}
              label="News Title"
              labelStyle={{ fontSize: 18 }}
              maxLength={28}
              onChangeText={setTitleEdit}
              placeholder={"" + item.title}
              placeholderTextColor={"#20365F"}
              value={titleEdit}
            />
          </View>
        }
        image={item.image == null ? null : { uri: item.image }}
        containerStyle={{
          backgroundColor: "#fff",
          borderColor: "#20365F",
          borderRadius: 10,
          width: "80%",
          shadowOpacity: 20,
          shadowColor: "#20365F",
          borderWidth: 2,
        }}
        titleStyle={{
          color: "#20365F",
          alignSelf: "center",
          paddingLeft: "5%",
        }}
      >
        <Animatable.View
          animation="fadeIn"
          style={{ alignItems: "flex-end", justifyContent: "flex-end" }}
        >
          <TouchableOpacity
            onPress={_pickImage}
            style={
              {
                //   marginLeft: "10%",
              }
            }
          >
            <Text>
              <MaterialCommunityIcons
                name="camera-plus"
                size={30}
                color="#20365F"
              />
            </Text>
          </TouchableOpacity>
        </Animatable.View>
        <View
          style={{
            flexDirection: "row",
            alignContent: "flex-start",
            paddingLeft: "2%",
            // justifyContent: "flex-start",
          }}
        >
          <Text
            style={{
              color: "#94A6AE",
              fontSize: 18,
              fontWeight: "bold",
              paddingTop: "3%",
            }}
          >
            Start Date {"    "}
          </Text>
          <DatePicker
            style={{ width: "50%" }}
            date={dateEdit}
            mode="date"
            placeholder="Published date "
            format="MM/DD/YYYY"
            confirmBtnText="Done"
            cancelBtnText="Cancel"
            customStyles={{
              dateIcon: {
                position: "absolute",
                left: 0,
                top: 4,
                marginLeft: 0,
              },
              btnTextConfirm: {
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
              },
              btnTextCancel: {
                color: "#fff",
                fontSize: 16,
                fontWeight: "bold",
              },

              dateInput: {
                // marginLeft: 36,
                borderColor: "#20365F",
                borderRadius: 10,
                borderWidth: 1,
                width: "50%",
                height: "80%",
                color: "#20365F",
                fontSize: 18,
              },

              // dateTouchBody:{
              //   backgroundColor:'red'
              // },
              datePicker: {
                backgroundColor: "white",
              },
              datePickerCon: {
                backgroundColor: "#20365F",
                borderWidth: 1,
                borderRadius: 25,
                // height:'0%'
              },
              // ... You can check the source to find the other keys.
            }}
            showIcon={true}
            iconComponent={
              <MaterialCommunityIcons
                name="calendar-today"
                size={30}
                color="#20365F"
              />
            }
            onDateChange={(dateEdit) => setDateEdit(dateEdit)}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            alignContent: "flex-start",
            paddingLeft: "2%",
            // justifyContent: "flex-start",
          }}
        >
          <Text
            style={{
              color: "#94A6AE",
              fontSize: 18,
              fontWeight: "bold",
              paddingTop: "3%",
              paddingRight: "2%",
            }}
          >
            End Date {"     "}
          </Text>

          <DatePicker
            style={{ width: "50%" }}
            date={endDateEdit}
            mode="date"
            placeholder="Published date "
            format="MM/DD/YYYY"
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            customStyles={{
              dateIcon: {
                // position: "absolute",
                left: 0,
                top: 4,
                marginLeft: 0,
              },
              dateInput: {
                //  marginLeft: '3.3%',
                borderColor: "#20365F",
                borderRadius: 10,
                borderWidth: 1,
                width: "70%",
                height: "80%",
                color: "#20365F",
                fontSize: 18,
              },
              // ... You can check the source to find the other keys.
            }}
            showIcon={true}
            iconComponent={
              <MaterialCommunityIcons
                name="calendar-outline"
                size={30}
                color="#20365F"
              />
            }
            onDateChange={(endDateEdit) => setEndDateEdit(endDateEdit)}
          />
        </View>

        <View
          style={{
            marginTop: "2%",
            marginBottom: "3%",
            flexDirection: "row",
            // justifyContent: "space-evenly",
            // paddingLeft: "2%",
          }}
        >
          {/* <Text
            style={{
              color: "#20365F",
              fontSize: 18,
              fontWeight: "bold",
              paddingTop: "2%",
            }}
          >
            Description:{" "}
          </Text> */}
          <Input
            inputContainerStyle={{
              borderBottomWidth: 0,
              // color: "white",
            }}
            containerStyle={{
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#20365F",
              height: "100%",
              width: "100%",
              alignSelf: "center",
              // /  marginLeft:'18%',
              opacity: 0.8,
              paddingLeft: "2%",
              paddingBottom: "5%",
              position: "relative",
              //     marginTop: 20,
            }}
            multiline={true}
            label="Update News"
            labelStyle={{ fontSize: 18 }}
            maxLength={400}
            onChangeText={setDescriptionEdit}
            placeholder={"" + item.description}
            value={descriptionEdit}
          />
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: "#20365F",
            // height: '20%',
            width: "26%",
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            marginStart: "2%",
            marginEnd: "3%",
            borderRadius: 10,
            // marginBottom: 0,
            // marginTop: 20,
          }}
          onPress={() => handleEdit()}
        >
          <Text style={{ padding: "10%", fontSize: 18, color: "white" }}>
            Edit
          </Text>
        </TouchableOpacity>
      </Card>
      {/* 
      {imageEdit != null ? (
        <Image
          source={{ uri: imageEdit }}
          style={{ width: 100, height: 100 }}
        />
      ) : null}
      <TouchableOpacity onPress={_pickImage}>
        <Text>Pick an image from camera roll</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setEditFlag(!editFlag)}>
        <Text>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleEdit()}>
        <Text>Edit</Text>
      </TouchableOpacity> */}
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: "rgba(96,100,109, 0.8)",
  },
  codeHighlightContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 24,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center",
  },
  tabBarInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: "center",
    backgroundColor: "#fbfbfb",
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    textAlign: "center",
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
