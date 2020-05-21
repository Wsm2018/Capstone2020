import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import { Divider, Card as Cards } from "react-native-elements";
import { Octicons } from "@expo/vector-icons";

export default function Card(props) {
  const cardInfo = props.card;

  const handleDelete = async () => {
    const deleteCard = firebase.functions().httpsCallable("deleteCard");
    const response = await deleteCard({
      uid: firebase.auth().currentUser.uid,
      cardId: cardInfo.id,
    });
    if (response.data !== null) {
      alert("Card removed");
    }
  };

  const handleDeleteAlert = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete ?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => handleDelete() },
      ],
      { cancelable: false }
    );
  };

  return (
    // <View style={styles.container}>
    //   <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
    //     {/* <Cards
    //       elevation={2}
    //       style={{
    //         width: "100%",
    //         // flex: 1,
    //         borderWidth: 1,
    //         // borderTopWidth: 0,
    //         borderColor: "darkgray",
    //       }}
    //     >
    //       <Text>{cardInfo.cardNumber}</Text>
    //       <TouchableOpacity onPress={() => handleDelete()}>
    //         <Text>X</Text>
    //       </TouchableOpacity>
    //     </Cards> */}

    <Cards containerStyle={styles.card}>
      <View
        style={{
          marginBottom: 10,
          flexDirection: "row-reverse",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.notes}>abcd</Text>

        <TouchableOpacity onPress={() => handleDeleteAlert()}>
          {/* <Text style={styles.notes}>X</Text> */}
          <Octicons name="trashcan" size={27} color="#ede9eb" />
        </TouchableOpacity>
      </View>
      <View
        style={{
          // flexDirection: "row",
          justifyContent: "space-between",
          // alignItems: "center",
          alignItems: "flex-start",
        }}
      >
        <Image
          style={{ width: 50, height: 50, marginTop: 10 }}
          source={require("../../../assets/images/chip.png")}
        />
        <Text style={styles.time}>{cardInfo.cardNumber}</Text>
      </View>

      <Divider style={{ backgroundColor: "#dfe6e9", marginVertical: 10 }} />

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.notes}>{cardInfo.holderName}</Text>
        <Text style={styles.notes}>{cardInfo.expiryDate}</Text>
      </View>
    </Cards>
    //   </View>
    // </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "yellow",
    // justifyContent: "center",
    // alignItems: "center",
  },
  card: {
    // backgroundColor: "rgb(221,216,216)",
    backgroundColor: "rgb(26,148,149)",
    borderWidth: 0,
    borderRadius: 20,
  },

  time: {
    marginTop: 5,
    fontSize: 30,
    color: "white",
  },
  notes: {
    // alignItems: "flex-end",
    fontSize: 18,
    color: "white",
    textTransform: "capitalize",
  },
});

Card.navigationOptions = {
  headerStyle: { backgroundColor: "#20365F" },
  headerTintColor: "white",
};
