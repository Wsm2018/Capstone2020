import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Image,
  Platform,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Picker,
  Modal,
} from "react-native";
import firebase from "firebase/app";
import "firebase/functions";
import "firebase/auth";
import db from "../../db";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import { AsyncStorage } from "react-native";
import { CheckBox } from "react-native-elements";

export default function Payment(props) {
  // use 24 time format or 12 !!!!!!
  const assetBooking = props.navigation.getParam(
    "assetBooking",
    "some default value"
  );
  const serviceBooking = props.navigation.getParam(
    "serviceBooking",
    "some default value"
  );
  const partial = props.navigation.getParam("partial", "not found");
  const extension = props.navigation.getParam("oldPayment", "not found");
  const total = props.navigation.getParam("totalAmount", "some default value");
  //const [serviceBooking, setServiceBooking] = useState({ asset: { id: "5uhqZwCDvQDH13OhKBJf", price: 100 }, startDateTime: "2020-05-15T01:00", endDateTime: "2020-05-16T08:00"})
  const [card, setCard] = useState({});
  const [cards, setCards] = useState([]);

  const [cardNumber, setCardNumber] = useState();
  const [year, setYear] = useState();
  const [month, setMonth] = useState();
  const [CVC, setCVC] = useState();
  const [name, setName] = useState();
  const [cardType, setCardType] = useState("");
  const [yearsList, setYearsList] = useState();
  const [monthList, setMonthList] = useState([
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ]);
  const [addCreditCard, setAddCreditCard] = useState(true);
  const [promotion, setPromotion] = useState({});
  const [Promotions, setPromotions] = useState([]);
  const [code, setCode] = useState("");
  const [promotionValid, setPromotionValid] = useState("");
  const [totalAmount, setTotalAmount] = useState(total);
  const [other, setOther] = useState(false);
  const [checked, setChecked] = useState("");
  const [user, setUser] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  //const [balanceToUse, setBalanceToUse] = useState(0);
  const [usedBalance, setUsedBalance] = useState(0);
  const [useBalance, setUseBalance] = useState(false);

  useEffect(() => {
    calculation();
  }, [promotionValid]);

  const calculation = () => {
    let t = total;
    if (promotionValid === true) {
      t = total - (total * promotion.percentage) / 100;
    } else {
      t = total;
    }

    setTotalAmount(Math.round((t - usedBalance) * 100) / 100);
  };

  useEffect(() => {
    db.collection("promotionCodes").onSnapshot((querySnapshot) => {
      const Promotions = [];
      querySnapshot.forEach((doc) => {
        Promotions.push({ id: doc.id, ...doc.data() });
      });
      console.log(" Current Promotions: ", Promotions);
      setPromotions([...Promotions]);
    });
  }, []);

  const handlePromotion = (code) => {
    if (
      Promotions.filter((p) => p.code === code).length > 0 &&
      new Date().getTime() <
        Promotions.filter((p) => p.code === code)[0]
          .expiryDate.toDate()
          .getTime()
    ) {
      setPromotionValid(true);
      setPromotion(Promotions.filter((p) => p.code === code)[0]);
    } else {
      setPromotionValid(false);
      setPromotion({});
    }
  };
  const getUser = async () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((querySnap) => {
        const data = querySnap.data();
        setUser(data);
      });
  };
  useEffect(() => {

    getUser();
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("cards")
      .onSnapshot((querySnapshot) => {
        const cards = [];
        querySnapshot.forEach((doc) => {
          cards.push({ id: doc.id, ...doc.data() });
        });
        // console.log(cards);
        setCards([...cards]);
      });

    var years = [];
    for (let i = 0; i <= 10; i++) {
      years.push(moment().add(i, "years").format("YYYY"));
    }
    setYearsList(years);
  }, []);

  const pay = async () => {
    console.log("154")
    const handleBooking = firebase.functions().httpsCallable("handleBooking");
    const editBooking = firebase.functions().httpsCallable("editBooking");
    const assetManager = firebase.functions().httpsCallable("assetManager");
    var user = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    //user, asset, startDateTime, endDateTime, card, promotionCode,dateTime, status(true for complete, false for pay later)
    
    let c = {};
    if (other) {
      c = {
        cardNumber: cardNumber,
        expiryDate: year + "/" + month,
        cvc : CVC,
        cardType: cardType,
        holderName: name,
      };
    } else {
      c = card;
    }
    //console.log("174",addCreditCard, totalAmount,usedBalance , firebase.auth().currentUser.uid)
    let u = user.data()
    u.id = firebase.auth().currentUser.uid;
    u.balance = u.balance - usedBalance;
    console.log("175")
    if( partial != "not found" ){
      console.log("177")
      var toUpd = partial
      toUpd.status = true
      toUpd.card = c
      console.log("ehhee",toUpd.status ,partial.id, toUpd.card , total , u )
      const response = await assetManager({
        doc: partial.id,
        type: "update", 
        collection:"payments",
        obj: toUpd
      });
      console.log("188")
    }
    else if( extension != "not found"){
      console.log("191")
      //console.log("ehhee",extension.id ,assetBooking.endDateTime, c , total , u )
      const response = await editBooking({
        paymentId: extension.id,
        card: c, 
        endDateTime:  assetBooking.endDateTime,
        assetBooking: assetBooking,
        totalAmount: total,
        status: true,
        serviceBooking: serviceBooking,
        user: u
      });
      console.log("203")
    }
    else{
      console.log("206")
      const response = await handleBooking({
        user: u,
        asset: assetBooking.asset,
        startDateTime: assetBooking.startDateTime,
        endDateTime: assetBooking.endDateTime,
        card: c,
        promotionCode: null,
        dateTime: moment().format("YYYY-MM-DD T HH:mm"),
        status: true,
        addCreditCard: addCreditCard,
        uid: firebase.auth().currentUser.uid,
        totalAmount: total,
        status: true,
        serviceBooking,
      });
      console.log("222")
      //props.navigation.navigate("Home");
    }
    
    console.log("126")
    props.navigation.navigate("Home");
  };
  const handleCardSelect = (card) => {
    setChecked(card.id);
    setCard(card);

    setOther(card.id === 1 ? true : false);
  };

  const handleUseBalance = () => {
    calculation();
    setModalVisible(false);
    setUseBalance(true);
  };
  return (
    <View style={{ paddingTop: 10 }}>
      <ScrollView>
        <Text>
          Total Amount:{" "}
          {promotionValid === true ? (
            <Text>
              <Text
                style={{
                  textDecorationLine: "line-through",
                  textDecorationStyle: "solid",
                  color: "gray",
                }}
              >
                {total}
              </Text>{" "}
              {total - (total * promotion.percentage) / 100}
            </Text>
          ) : (
            total
          )}{" "}
          QAR
        </Text>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <TextInput
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              width: "90%",
              textAlign: "center",
              marginTop: "5%",
              backgroundColor: "white",
            }}
            onChangeText={setCode}
            onSubmitEditing={() => handlePromotion(code)}
            placeholder="Promotion"
            value={code}
          />
          {promotionValid === true ? (
            <Text>The promotion is valid</Text>
          ) : promotionValid === false ? (
            <Text>The promotion is NOT valid</Text>
          ) : (
            <Text></Text>
          )}
        </View>
        <View>
          <Text>Balance available: {user.balance - usedBalance} QAR</Text>
          <Button title="use" onPress={() => setModalVisible(true)} />
          {useBalance && (
            <View>
              <Text>Used balance: {usedBalance} QAR</Text>
              <Text>Amount to pay: {totalAmount} QAR</Text>
            </View>
          )}
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          <View style={{ marginTop: 22 }}>
            <View
              style={{
                marginTop: 22,
                backgroundColor: "#919191",
                margin: "5%",
                padding: "5%",
                // paddingTop: "1%",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 5,
                ...Platform.select({
                  ios: {
                    paddingTop: 50,
                    margin: "15%",
                    minHeight: 300,
                    width: "70%",
                  },
                  android: {
                    minHeight: 200,
                  },
                }),
              }}
            >
              <Text>Balance available: {user.balance} QAR</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(text) => setUsedBalance(text)}
                placeholder="Balance To Use"
                value={cardNumber}
              />
              <Button
                title="Use"
                disabled={usedBalance > user.balance ? true : false}
                onPress={() => handleUseBalance()}
              />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>

        <View>
          {cards &&
            cards.map((card) => (
              <CheckBox
                title={card.cardNumber}
                checked={checked === card.id ? true : false}
                onPress={() => {
                  handleCardSelect(card);
                }}
              />
            ))}
          <CheckBox
            title="Other"
            checked={checked === 1 ? true : false}
            onPress={() => {
              handleCardSelect({ id: 1 });
            }}
          />
        </View>
        {other && (
          <View>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setName(text)}
              placeholder="Name"
              value={name}
            />

            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onChangeText={(text) => setCardNumber(text)}
              placeholder="Card Number"
              value={cardNumber}
              maxLength={16}
            />

            <View style={{ flexDirection: "row" }}>
              {yearsList ? (
                <Picker
                  selectedValue={year}
                  itemStyle={{ height: 60 }}
                  style={{
                    height: 50,
                    width: 200,
                    fontSize: 20,
                    backgroundColor: "#DCDCDC",
                    marginBottom: 4,
                    marginTop: 4,
                    marginRight: "auto",
                    marginLeft: "auto",
                  }}
                  onValueChange={(itemValue) => setYear(itemValue)}
                >
                  <Picker.Item label={"Year"} value={""} />
                  {yearsList.map((y) => (
                    <Picker.Item label={y} value={y} />
                  ))}
                </Picker>
              ) : null}

              <Picker
                selectedValue={month}
                itemStyle={{ height: 60 }}
                style={{
                  height: 50,
                  width: 200,
                  fontSize: 20,
                  backgroundColor: "#DCDCDC",
                  marginBottom: 4,
                  marginTop: 4,
                  marginRight: "auto",
                  marginLeft: "auto",
                }}
                onValueChange={(itemValue) => setMonth(itemValue)}
              >
                <Picker.Item label={"Month"} value={""} />
                {monthList.map((y) => (
                  <Picker.Item label={y} value={y} />
                ))}
              </Picker>
            </View>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setCVC(text)}
              keyboardType="numeric"
              placeholder="CVC"
              maxLength={3}
              value={CVC}
            />
            <Picker
              selectedValue={cardType}
              style={{ width: 200 }}
              onValueChange={(itemValue) => setCardType(itemValue)}
            >
              <Picker.Item label="Select Card Type" value="" />
              <Picker.Item label="Visa" value="visa" />
              <Picker.Item label="Amex" value="amex" />
              <Picker.Item label="Mastercard" value="mastercard" />
            </Picker>

            <CheckBox
              title="Save Card"
              checked={addCreditCard}
              onPress={() => setAddCreditCard(!addCreditCard)}
            />
          </View>
        )}
        <View style={{ width: "30%", marginLeft: "auto", marginRight: "auto" }}>
          <Button
            title="Pay"
            onPress={() => pay()}
            disabled={
              (name && cardNumber && month && year && CVC) || other === false
                ? false
                : true
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

Payment.navigationOptions = {
  title: "Payment",
};
//
const styles = StyleSheet.create({});