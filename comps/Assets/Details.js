//@refresh reset
import {Button, Input, Rating} from "react-native-elements"
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
  KeyboardAvoidingView,
  
} from "react-native";
import Textarea from 'react-native-textarea';

import 'firebase/functions'
import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db.js";
require("firebase/firestore");

export default function Details(props) {
  const tName=props.navigation.getParam("tName",'failed')
  const sName=props.navigation.getParam("sName",'failed')
  const asset = props.navigation.getParam("asset",'failed');
  const startDateTime = props.navigation.getParam("startDateTime",'failed');
  const endDateTime = props.navigation.getParam("endDateTime",'failed');
  const [reviews, setReviews] = useState([]); 
  const [newReview, setNewReview] = useState(''); 
  const [rating, setRating] = useState(0); 
  const [user,setUser] = useState(null);

    
  useEffect(() => {
    getReviews();
  }, [asset]);

  useEffect(() => {
    console.log(rating)
  }, [rating]);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const user = await db.collection('users').doc(firebase.auth().currentUser.uid).get();
    // console.log('user: ',user.data())
    setUser(user.data());
  } 

  const getReviews = async () => {
    const temp = [];
    
    db.collection('assets').doc(asset.id).collection('reviews').onSnapshot((snapshot) => {
      snapshot.forEach(doc => {
        temp.push({id:doc.id,...doc.data()})
      })
    
    // console.log(temp)
    setReviews(temp);
    })
}

  const handleAddReview = async () => {
    console.log('before')
    const addReview = firebase
      .functions()
      .httpsCallable("addReview");
    const result = await addReview({
      comment: newReview,
      displayName: user.displayName,
      uid:firebase.auth().currentUser.uid,
      aid:asset.id,
      rating:rating
    });
    console.log('after')

  };

  return (
    <View style={styles.container}>
      <ScrollView>
      {/* {console.log('asset return',asset)} */}
      {/* {console.log('startD return',startDateTime)} */}
      {/* {console.log('endD return',endDateTime)} */}
      <KeyboardAvoidingView>
        {asset?
        <View>
          <Text > {asset.description}</Text>
        <Text> Price Per Hour {asset.price}</Text>
        {
          startDateTime === '0000-00-00'? null:
          <>
          <Text>{startDateTime}</Text>
          <Text>{endDateTime}</Text>
          </>
        }
        <Text style={{textAlign:'center'}}>Reviews</Text>
        <View>
        <Textarea
          containerStyle={styles.textareaContainer}
          style={styles.textarea}
          maxLength={80}
          onChangeText={setNewReview}
          defaultValue={newReview}
          placeholder={'Write Your Review Here'}
          placeholderTextColor={'#c7c7c7'}
          underlineColorAndroid={'transparent'}
        />
        <Text style={{textAlign:"center"}}>Slide to add rating</Text>
        <Rating
          type='star'
          ratingCount={5}
          imageSize={30}
          startingValue={rating}
          onFinishRating={setRating}
        />
        
        <Button 
          title={'Add Review'} 
          onPress={handleAddReview}
        />

        </View>
        
          {reviews.map((r,i) =>(
            <View style={{marginTop:50}}>
              <Text>From: {r.displayName}</Text>
              <Text>Comment: {r.comment}</Text>
              <Rating
                
                type='star'
                ratingCount={5}
                startingValue={r.rating}
                imageSize={20}
                readonly
                onFinishRating={setRating}
              />
            </View>
          ))}
        
        </View>
   
  :
        <Text>Loading</Text>
  }
    
      </KeyboardAvoidingView>
      </ScrollView>
    </View>
  )
}

Details.navigationOptions = (props) => ({
    title: "Details",
    headerStyle: { backgroundColor: "white" },
    headerTintColor: "black",
    headerTintStyle: { fontWeight: "bold" }
})

const styles = StyleSheet.create({
  textareaContainer: {
    height: 180,
    padding: 5,
    backgroundColor: '#F5FCFF',
  },
  textarea: {
    textAlignVertical: 'top',  // hack android
    height: 170,
    fontSize: 14,
    color: '#333',
  },
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
  TypesFilename: {
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
