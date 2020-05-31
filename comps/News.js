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
  View
} from "react-native";

import db from "../db.js";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";
import moment from "moment";
import * as ImagePicker from 'expo-image-picker';
import DatePicker from 'react-native-datepicker'
export default ({ item }) => {
  const [editFlag, setEditFlag] = useState(true);
  const [titleEdit, setTitleEdit] = useState(item.title);
  const [descriptionEdit, setDescriptionEdit] = useState(item.description);
  const [dateEdit, setDateEdit] = useState(moment(item.datePublished.toDate()).format('L'));
  const [endDateEdit, setEndDateEdit] = useState(moment(item.endDate.toDate()).format('L'));
  const [imageEdit, setImageEdit] = useState(item.image);

  const handleDelete = item => {
    db.collection("news")
      .doc(item.id)
      .delete();

    const storage = firebase.storage();
    const desertRef = storage.refFromURL(item.image)

    // Delete the file
    desertRef.delete().then(function() {
      // File deleted successfully
    }).catch(function(error) {
      // Uh-oh, an error occurred!
    });
  };

  const handleEdit = () =>{
    db.collection("news").doc(item.id).update({
      title: titleEdit,
      description: descriptionEdit,
      datePublished: new Date(dateEdit),
      endDate: new Date(endDateEdit)
    })
    setEditFlag(!editFlag)
  }

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

  const uploadImage = async (newImage) =>{
    console.log("start uploading")
    const response = await fetch(newImage);
    const blob = await response.blob();
    const upload = await firebase
      .storage()
      .ref()
      .child("news/"+ item.id)
      .put(blob);
      console.log("finished uploading")
  }


  return (
    editFlag ? 
    <View style={{ paddingTop: 50, flexDirection: 'column' }}>
      <Text >Title: {item.title}</Text>
      <Text >Description: {item.description}</Text>
      <Text >Published: {moment(item.datePublished.toDate()).format('L')}</Text>
      <Text >End Date: {moment(item.endDate.toDate()).format('L')}</Text>
      {item.image == null ? null:
      <Image
      source={{ uri: item.image }}
      style={{ width: 100, height: 100 }}
      />
      }
      
      <Button title="Edit" onPress={() => setEditFlag(!editFlag)} />
      <Button title="X" onPress={() => handleDelete(item)} />
    </View>
    :
    <View style={{ paddingTop: 50, flexDirection: 'column' }}>
      <TextInput
          style={{ height: 40, width: 200, borderColor: "gray", borderWidth: 1 }}
          onChangeText={setTitleEdit}
          placeholder={""+item.title}
          value={titleEdit}
      />
      <TextInput
          style={{ height: 40, width: 200, borderColor: "gray", borderWidth: 1 }}
          onChangeText={setDescriptionEdit}
          placeholder={""+item.description}
          value={descriptionEdit}
      />
      <DatePicker
        style={{width: 200}}
        date={dateEdit}
        mode="date"
        placeholder="Published date "
        format="MM/DD/YYYY"
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
        onDateChange={(dateEdit) => setDateEdit(dateEdit)}
      />
      <DatePicker
        style={{width: 200}}
        date={endDateEdit}
        mode="date"
        placeholder="Published date "
        format="MM/DD/YYYY"
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
        onDateChange={(endDateEdit) => setEndDateEdit(endDateEdit)}
      />
      {imageEdit != null?
      <Image
      source={{ uri: imageEdit }}
      style={{ width: 100, height: 100 }}
    />: null}
      <TouchableOpacity
        onPress={_pickImage}
      >
        <Text>Pick an image from camera roll</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setEditFlag(!editFlag)}
      >
        <Text>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleEdit()}
      >
        <Text>Edit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center"
  },
  contentContainer: {
    paddingTop: 30
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10
  },
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50
  },
  homeScreenFilename: {
    marginVertical: 7
  },
  codeHighlightText: {
    color: "rgba(96,100,109, 0.8)"
  },
  codeHighlightContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    paddingHorizontal: 4
  },
  getStartedText: {
    fontSize: 24,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center"
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
        shadowRadius: 3
      },
      android: {
        elevation: 20
      }
    }),
    alignItems: "center",
    backgroundColor: "#fbfbfb",
    paddingVertical: 20
  },
  tabBarInfoText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    textAlign: "center"
  },
  navigationFilename: {
    marginTop: 5
  },
  helpContainer: {
    marginTop: 15,
    alignItems: "center"
  },
  helpLink: {
    paddingVertical: 15
  },
  helpLinkText: {
    fontSize: 14,
    color: "#2e78b7"
  }
});
