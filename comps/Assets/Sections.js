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

import DatePicker from 'react-native-datepicker'

import firebase from "firebase/app";
import "firebase/auth";
import db from "../../db.js";
require("firebase/firestore");



export default function Sections(props) {
  const [assetSections, setAssetSections] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showSections , setShowSections] = useState(false)

  const type = props.navigation.getParam("type", 'failed').id;
  const tName = props.navigation.getParam("type", 'failed').name

  useEffect(() => {
    getSections();
  }, [type]);

  useEffect(() => {
    console.log(startDate);
  }, [startDate]);
  useEffect(() => {
    console.log(endDate);
  }, [endDate]);

  const getSections = async () => {
    const temp = [];

    const sections = await db.collection('assetSections').where("assetType", "==", type).get();
    sections.forEach(doc => {

      temp.push({ id: doc.id, ...doc.data() })
    });
    console.log(temp)
    setAssetSections(temp);
  }

  return (
    <View style={styles.container}>


      {
        !showSections ?
          <View>
            <Text>Choose a start date and time</Text>
            <DatePicker
              style={{ width: 200 }}
              date={startDate}
              mode="datetime"
              placeholder="select a Start date"
              format="YYYY-MM-DD T h:mm:ss"
              minDate="2020-05-07"
              maxDate="2022-01-01"
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
              onDateChange={setStartDate}
            />
            {
              startDate ?
                <Text>
                  Your start date and time is {startDate} now choose an end date
        </Text>
                :
                null
            }

            <DatePicker
              style={{ width: 200 }}
              date={endDate}
              mode="datetime"
              placeholder="select an end date"
              format="YYYY-MM-DD T h:mm:ss"
              minDate={startDate}
              maxDate="2022-01-01"
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
              onDateChange={setEndDate}
              disabled={!startDate}
            />

            <Button title={"Continue"} onPress={()=>setShowSections(true)} disabled={ !startDate || !endDate}/>

          </View>
          :
          <View>
            <Text>You are booking from {startDate} until {endDate} Now Choose a Section</Text>
            {assetSections.map((s, i) => (
              <TouchableOpacity onPress={() => props.navigation.navigate("List", { tName: tName, section: s, startDate: startDate, endDate: endDate, assetTypeId: type })} key={i} style={{ alignItems: "center", borderRadius: 50, height: 20, width: 200, margin: 5, backgroundColor: 'pink' }}>
                <Text >{s.name}</Text>
              </TouchableOpacity>
            ))}
            <Button title={"Change Date and Time"} onPress={()=>setShowSections(false)} />
          </View>

      }






    </View>
  );
}

Sections.navigationOptions = (props) => ({
  title: "Sections",
  headerStyle: { backgroundColor: "white" },
  headerTintColor: "black",
  headerTintStyle: { fontWeight: "bold" }
})

function DevelopmentModeNotice() {
  if (__DEV__) {
    const learnMoreButton = (
      <Text onPress={handleLearnMorePress} style={styles.helpLinkText}>
        Learn more
      </Text>
    );

    return (
      <Text style={styles.developmentModeText}>
        Development mode is enabled: your app will be slower but you can use
        useful development tools. {learnMoreButton}
      </Text>
    );
  } else {
    return (
      <Text style={styles.developmentModeText}>
        You are not in development mode: your app will run at full speed.
      </Text>
    );
  }
}

function handleLearnMorePress() {
  WebBrowser.openBrowserAsync(
    "https://docs.expo.io/versions/latest/workflow/development-mode/"
  );
}

function handleHelpPress() {
  WebBrowser.openBrowserAsync(
    "https://docs.expo.io/versions/latest/workflow/up-and-running/#cant-see-your-changes"
  );
}

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