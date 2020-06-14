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
  Keyboard,
} from "react-native";
import { CreditCardInput } from "react-native-credit-card-input";
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveScreenFontSize,
} from "react-native-responsive-dimensions";
import firebase from "firebase/app";
import "firebase/functions";
import "firebase/auth";
import db from "../../db";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import { AsyncStorage } from "react-native";
import { CheckBox } from "react-native-elements";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { Notifications } from "expo";

export default function Payment(props) {
  // use 24 time format or 12 !!!!!!
  // const assetBooking = props.navigation.getParam(
  //   "assetBooking",
  //   "some default value"
  // );
  // const serviceBooking = props.navigation.getParam(
  //   "serviceBooking",
  //   "some default value"
  // );
  // const partial = props.navigation.getParam("partial", "not found");
  // const extension = props.navigation.getParam("oldPayment", "not found");
  const total = props.navigation.getParam("totalAmount", "some default value");
  const ad = props.navigation.getParam("ad", "some default value");

  //const [serviceBooking, setServiceBooking] = useState({ asset: { id: "5uhqZwCDvQDH13OhKBJf", price: 100 }, startDateTime: "2020-05-15T01:00", endDateTime: "2020-05-16T08:00"})
  const [card, setCard] = useState({});
  const [cards, setCards] = useState([]);

  // const [cardNumber, setCardNumber] = useState({ value: "", error: false, error2: false });
  // const [year, setYear] = useState({ value: "", error: false });
  // const [month, setMonth] = useState({ value: "", error: false });
  // const [CVC, setCVC] = useState({ value: "", error: false });
  // const [name, setName] = useState({ value: "", error: false });
  // const [cardType, setCardType] = useState({ value: "", error: false });

  const [cardNumber, setCardNumber] = useState();
  const [expiryDate, setExpiryDate] = useState();
  const [CVC, setCVC] = useState();
  const [name, setName] = useState();
  const [cardType, setCardType] = useState();
  const labels = {
    number: "CARD NUMBER",
    expiry: "EXPIRY",
    name: "NAME",
    cvc: "CVC",
  };
  const placeHolders = {
    number: "1234 5678 1234 5678",
    name: "NAME",
    expiry: "MM/YY",
    cvc: "CVC",
  };
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
  const [subscription, setSubscription] = useState(false);
  const [pointsChart, setPointsChart] = useState([]);
  // const tName = props.navigation.getParam("tName", "failed");

  /////////////////////////////Front-End//////////////////////////////////
  const [promoView, setPromoView] = useState(false);
  const [clicked, setClicked] = useState(false);

  //////////////////////////////////////////////////////////////////////

  useEffect(() => {
    getCards();
  }, []);

  const getCards = () => {
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("cards")
      .onSnapshot((querySnapshot) => {
        const cards = [];
        querySnapshot.forEach((doc) => {
          let data = doc.data();
          cards.push(data.cardNumber);
        });
        setCards([...cards]);
      });
  };

  // useEffect(() => {
  //   console.log("totalllllllllllll", total);
  //   calculation();
  // }, [promotionValid]);

  const calculation = () => {
    let t = total;
    if (promotionValid === true) {
      t = total - (total * promotion.percentage) / 100;
    } else {
      t = total;
    }

    setTotalAmount(Math.round((t - usedBalance) * 100) / 100);
  };

  // useEffect(() => {
  //   db.collection("promotionCodes").onSnapshot((querySnapshot) => {
  //     const Promotions = [];
  //     querySnapshot.forEach((doc) => {
  //       Promotions.push({ id: doc.id, ...doc.data() });
  //     });
  //     console.log(" Current Promotions: ", Promotions);
  //     setPromotions([...Promotions]);
  //   });
  // }, []);

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
    // db.collection("pointsChart").onSnapshot((querySnapshot) => {
    //   const pointsChart = [];
    //   querySnapshot.forEach((doc) => {
    //     pointsChart.push({ id: doc.id, ...doc.data() });
    //   });
    //   setPointsChart([...pointsChart]);
    // });

    // --------------------------------SUBSCRIPTION----------------------------------
    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("subscription")
      .onSnapshot((querySnapshot) => {
        const subscription = [];
        querySnapshot.forEach((doc) => {
          subscription.push({ id: doc.id, ...doc.data() });
        });
        // console.log(subscription);
        setSubscription([...subscription]);
      });
    getUser();

    // --------------------------------CARDS----------------------------------
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
        setChecked(cards[0] ? cards[0].id : 1);
        // if there is a card other is false
        setOther(cards[0] ? false : true);
        setCard(cards[0] ? cards[0] : {});
      });

    var years = [];
    for (let i = 0; i <= 10; i++) {
      years.push(moment().add(i, "years").format("YYYY"));
    }
    setYearsList(years);
  }, []);

  //////////////////////////Validate//////////////////////////////////
  // const validated = () => {
  //   let count = 0;



  //   if (name.value === "") {
  //     console.log("name can't be empty");
  //     setName({ value: name.value, error: true });
  //   } else {
  //     console.log("name is good");
  //     count++;
  //   }

  //   if (CVC.value === "") {
  //     console.log("CVC can't be empty");
  //     setCVC({ value: CVC.value, error: true });
  //   } else {
  //     console.log("CVC is good");
  //     count++;
  //   }

  //   if (month.value === "") {
  //     console.log("month can't be empty");
  //     setMonth({ value: month.value, error: true });
  //   } else {
  //     console.log("month is good");
  //     count++;
  //   }

  //   if (year.value === "") {
  //     console.log("year can't be empty");
  //     setYear({ value: year.value, error: true });
  //   } else {
  //     console.log("year is good");
  //     count++;
  //   }

  //   if (cardType.value === "") {
  //     console.log("cardType can't be empty");
  //     setCardType({ value: cardType.value, error: true });
  //   } else {
  //     console.log("cardType is good");
  //     count++;
  //   }

  //   if (cardNumber.value === "") {
  //     console.log("cardNumber can't be empty");
  //     setCardNumber({ value: cardNumber.value, error: true, error2: false });
  //   }
  //   else {
  //     if (cardType.value === "amex") {
  //       if (cardNumber.value.length != 18) {
  //         console.log("cardNumber is must be 18 digits for Amex");
  //         setCardNumber({ value: cardNumber.value, error: false, error2: true, error3: false });
  //       }
  //       else {
  //         console.log("cardNumber good");
  //         count++;
  //       }
  //     }
  //     else if (cardType.value === "visa" || cardType.value === "mastercard") {
  //       if (cardNumber.value.length != 16) {
  //         console.log("cardNumber is must be 16 digits for Visa or Mastercard");
  //         setCardNumber({ value: cardNumber.value, error: false, error2: false, error3: true });
  //       }
  //       else {
  //         console.log("cardNumber good");
  //         count++;
  //       }
  //     } else {
  //       alert("please choose a card type")
  //     }
  //   }


  //   // rer
  //   console.log('before', count);
  //   if (count === 1) {
  //     console.log('inside', count)
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };


  const validateForm = () => {
    if (cardNumber === "") {
      alert("Enter Card Number");
      return false;
    }

    if (name === "") {
      alert("Enter Name");
      return false;
    }

    if (cardType === "") {
      alert("Select Card Type");
      return false;
    }

    if (expiryDate === moment().format("MM/YY")) {
      alert("Enter Card Expiry Date");
      return false;
    }

    if (CVC === "") {
      alert("Enter CVC Number");
      validate = false;
      return false;
    } else {
      if (CVC.length < 3) {
        alert("Enter a valid CVC number");
        return false;
      }
    }

    if (cards.includes(cardNumber)) {
      alert("Card already exists");
      return false;
    }

    return true;
  };

  const handleCard = (form) => {
    console.log(form);
    if (
      form.status.cvc === "valid" &&
      form.status.expiry === "valid" &&
      form.status.name === "valid" &&
      form.status.number === "valid"
    ) {
      setCVC(form.values.cvc);
      setCardNumber(form.values.number);
      setName(form.values.name);
      setExpiryDate(form.values.expiry);
      setCardType(form.values.type);
    }
  };

  // --------------------------------PAY----------------------------------
  const pay = async () => {
    if (validateForm()) {
      console.log("Good Input")
    } else {
      console.log("Bad Input")
    }

    //setClicked(true);
    console.log("154");

    var user = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    //user, asset, startDateTime, endDateTime, card, promotionCode,dateTime, status(true for complete, false for pay later)

    // ---CARD---
    let c = {};
    if (other) {
      c = {
        cardNumber: cardNumber,
        expiryDate: expiryDate,
        cvc: CVC,
        cardType: cardType,
        holderName: name,
      };
    } else {
      c = card;
    }

    console.log("cccc", c)

    console.log(
      "174",
      addCreditCard,
      totalAmount,
      usedBalance,
      firebase.auth().currentUser.uid
    );

    // ---USER---
    let u = user.data();
    u.id = firebase.auth().currentUser.uid;
    u.balance = u.balance - usedBalance;

    let localNotification = {
      title: null,
      body: null,
      ios: {
        sound: true,
        _displayInForeground: true,
      },
      android: {
        // icon:
        //   "https://med.virginia.edu/cme/wp-content/uploads/sites/262/2015/10/free-vector-parking-available-sign-clip-art_116878_Parking_Available_Sign_clip_art_hight.png",
        // color: "#276b9c",
        vibrate: true,
      },
    };
    localNotification.title = "Payment complete";
    localNotification.body = `Your payment of ${totalAmount} QAR for the $ {tName?} was completed successfully!`;
    Notifications.presentLocalNotificationAsync(localNotification);
    // props.navigation.navigate("Types");

    db.collection("advertisements")
      .doc(ad.id)
      .update({ paid: true, datePaid: new Date(), card: c });

    db.collection("users").doc(user.id).update(u);
    console.log("card.id", card.id);
    console.log("addCreditCard", addCreditCard);
    // i removed this from the condition below (&& card.id === 1)
    if (addCreditCard) {
      db.collection("users")
        .doc(firebase.auth().currentUser.uid)
        .collection("cards")
        .add(c);
    }

    console.log("192");

    props.navigation.goBack();
  };
  const handleCardSelect = (card) => {
    setChecked(card.id);
    setCard(card);

    // if selected add new card other is true
    setOther(card.id === 1 ? true : false);
  };

  const handleUseBalance = () => {
    calculation();
    setModalVisible(false);
    setUseBalance(true);
  };



  ///////////////////////////////Font-End////////////////////////////////

  useEffect(() => {
    Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
      Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
    };
  }, []);

  const _keyboardDidShow = () => {
    // console.log("keyyyyyyyyyyyyyyyShow");

    setMargin(300);
  };

  const _keyboardDidHide = () => {
    // console.log("keyyyyyyyyyyyyyyyHide");
    setMargin(0);
  };

  const [marginVal, setMargin] = useState(0);
  /////////////////////////////////////////////////////////////////////////////////////
  return (
    <View style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
      <View style={{ flex: 8, marginTop: marginVal === 0 ? 0 : -200 }}>
        <ScrollView>
          {/* <Text>
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
          </Text> */}
          <View
            style={{
              backgroundColor: "white",
              // margin: "4%",
              padding: "3%",
              // borderRadius: 10,
              borderWidth: 1,
              borderColor: "lightgray",
              alignItems: "center",
              // flex: 1.5,
              // justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 27, fontWeight: "bold" }}>
              {user.balance}
              <Text style={{ fontSize: 18 }}> QAR</Text>
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#185a9d",
                fontWeight: "bold",
                paddingTop: 4,
              }}
            >
              CURRENT BALANCE
            </Text>

            {/* <Button
              title="Deduct From Balance"
              onPress={() => setModalVisible(true)}
            /> */}
            {/* {useBalance && (
              <View>
                <Text>Used balance: {usedBalance} QAR</Text>
                <Text>Amount to pay: {totalAmount} QAR</Text>
              </View>
            )} */}
          </View>
          <View
            style={{
              // alignItems: "center",
              // justifyContent: "center",x\\
              // width: "100%",
              backgroundColor: "white",
              marginTop: "3%",
              paddingBottom: "5%",
            }}
          >
            <Text
              style={{
                textAlign: "left",
                // paddingStart: "2%",
                padding: "2%",
                // paddingTop: "2%",

                backgroundColor: "#185a9d",
                color: "white",
                fontWeight: "bold",
              }}
            >
              SELECT A CARD
            </Text>
            {/*  */}
            <View
              style={{
                width: "100%",
                backgroundColor: "white",
                marginTop: "2%",
              }}
            >
              {/* <Text style={{ padding: "2%" }}>Select a Card: </Text> */}
              {/* {console.log(cards)} */}
              {/* card part */}
              {cards &&
                cards.map((card) => (
                  <CheckBox
                    title={
                      <Text
                        style={{
                          textTransform: "uppercase",
                          paddingLeft: "2%",
                          fontWeight: "bold",
                        }}
                      >
                        <FontAwesome
                          name="credit-card"
                          size={22}
                          color={"#3ea3a3"}
                        />
                        {"  "}
                        {
                          card.cardType + " | " + card.cardNumber
                          // +
                          // " | " +
                          // card.expiryDate
                        }
                      </Text>
                    }
                    checked={checked === card.id ? true : false}
                    onPress={() => {
                      handleCardSelect(card);
                    }}
                    containerStyle={{
                      borderColor: "#e3e3e3",
                      borderWidth: 1.5,
                      justifyContent: "center",
                    }}
                  />
                ))}
              {/* check part */}
              <CheckBox
                title="+ Add New Card"
                checked={checked === 1 ? true : false}
                onPress={() => {
                  handleCardSelect({ id: 1 });
                }}
                textStyle={{ color: "black" }}
                containerStyle={{ borderColor: "#e3e3e3", borderWidth: 1.5 }}
              />
              {/* other part */}
              {other && (
                <View
                  style={{
                    // width: "100%",
                    margin: "2%",
                    // marginTop: 0,
                    padding: "2%",
                    paddingTop: "4%",
                    // backgroundColor: "#e3e3e3",
                    borderWidth: 1.5,
                    borderColor: "#e3e3e3",
                  }}
                >
                  <View
                    style={{
                      flex: 3,
                      width: "90%",
                      marginTop: "15%",
                      justifyContent: "center",
                    }}
                  >
                    <CreditCardInput
                      elevation={5}
                      labels={labels}
                      requiresName={true}
                      onChange={handleCard}
                      allowScroll={true}
                      // labelStyle={{ fontSize: responsiveScreenFontSize(2) }}
                      inputStyle={{
                        //
                        borderBottomWidth: 1,
                        backgroundColor: "white",
                        height: responsiveScreenHeight(5.5),
                        width: responsiveScreenWidth(70),

                        fontSize: responsiveScreenFontSize(1.5),
                        paddingStart: 10,
                        // marginStart: 2,
                        // borderRadius: 5,
                        // 4796416651443066177
                      }}
                      inputContainerStyle={
                        {
                          // marginTop: 60,
                        }
                      }
                      labelStyle={{ color: "gray" }}
                      cardImageFront={require("../../assets/images/dark1.jpg")}
                      cardImageBack={require("../../assets/images/dark2.png")}
                    />
                  </View>
                  {/* <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    onChangeText={(text) => setCardNumber({ value: text, error: false })}
                    placeholder="Card Number"
                    value={cardNumber.value}
                    maxLength={18}
                  />
                  {cardNumber.error ? <Text
                    style={{
                      color: "red",
                      marginLeft: "9%",
                    }
                    }
                  >
                    * cardNumber is required
                  </Text> : null}
                  {cardNumber.error2 ? <Text
                    style={{
                      color: "red",
                      marginLeft: "9%",
                    }
                    }
                  >
                    * cardNumber must be 18 digits for Amex
                  </Text> : null}
                  {cardNumber.error3 ? <Text
                    style={{
                      color: "red",
                      marginLeft: "9%",
                    }
                    }
                  >
                    * cardNumber must be 16 digits for Visa and Mastercard
                  </Text> : null}
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) => setName({ value: text, error: false })}
                    placeholder="Card Holder Name"
                    value={name.value}
                  />
                  {name.error ? <Text
                    style={{
                      color: "red",
                      marginLeft: "9%",
                    }
                    }
                  >
                    * name is required
                  </Text> : null}
                  <View
                    style={{
                      borderWidth: 1.5,
                      paddingLeft: "2%",
                      marginBottom: 10,
                      borderColor: "gray",
                      minHeight: 70,
                    }}
                  >
                    <Text style={{ color: "gray", marginTop: 5 }}>
                      Expiry Date:
                      {Platform.OS === "ios" && (
                        <Text style={{ fontSize: 10 }}>
                          {" "}
                          (Scroll to Select)
                        </Text>
                      )}
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      {yearsList ? (
                        <Picker
                          selectedValue={year.value}
                          itemStyle={{ height: 60 }}
                          style={{
                            height: 50,
                            width: "50%",
                            fontSize: 20,
                            backgroundColor: "transparent",
                            marginBottom: 4,
                            marginTop: 4,
                            marginRight: "auto",
                            marginLeft: "auto",
                          }}
                          onValueChange={(itemValue) => setYear({ value: itemValue, error: false })}
                        >
                          <Picker.Item label={"Select Year"} value={""} />
                          {yearsList.map((y) => (
                            <Picker.Item label={y} value={y} />
                          ))}
                        </Picker>
                      ) : null}

                      <Picker
                        selectedValue={month.value}
                        itemStyle={{ height: 60 }}
                        style={{
                          height: 50,
                          width: "50%",
                          fontSize: 20,
                          backgroundColor: "transparent",
                          marginBottom: 4,
                          marginTop: 4,
                          marginRight: "auto",
                          marginLeft: "auto",
                        }}
                        onValueChange={(itemValue) => setMonth({ value: itemValue, error: false })}
                      >
                        <Picker.Item label={"Select Month"} value={""} />
                        {monthList.map((y) => (
                          <Picker.Item label={y} value={y} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                  {month.error || year.error ? <Text
                    style={{
                      color: "red",
                      marginLeft: "9%",
                    }
                    }
                  >
                    * Please enter a valid date
                  </Text> : null}
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) => setCVC({ value: text, error: false })}
                    keyboardType="numeric"
                    placeholder="CVC"
                    maxLength={3}
                    value={CVC.value}
                  />
                  {CVC.error ? <Text
                    style={{
                      color: "red",
                      marginLeft: "9%",
                    }
                    }
                  >
                    * CVC is required
                  </Text> : null} */}
                  {/* <View
                    style={{
                      borderWidth: 1.5,
                      borderColor: "gray",
                      marginBottom: 5,
                    }}
                  >
                    <Picker
                      selectedValue={cardType.value}
                      style={{ width: "100%", borderWidth: 1.5 }}
                      onValueChange={(itemValue) => setCardType({ value: itemValue, error: false })}
                    >
                      <Picker.Item label="Select Card Type" value="" />
                      <Picker.Item label="Visa" value="visa" />
                      <Picker.Item label="Amex" value="amex" />
                      <Picker.Item label="Mastercard" value="mastercard" />
                    </Picker>
                  </View>
                  {cardType.error ? <Text
                    style={{
                      color: "red",
                      marginLeft: "9%",
                    }
                    }
                  >
                    * cardType is required
                  </Text> : null} */}

                  <CheckBox
                    title="Save Card"
                    checked={addCreditCard}
                    onPress={() => setAddCreditCard(!addCreditCard)}
                    containerStyle={{
                      borderColor: "#e3e3e3",
                      borderWidth: 1.5,
                      alignItems: "center",
                      width: "50%",
                      alignSelf: "center",
                    }}
                  />
                </View>
              )}
            </View>
          </View>
          <View
            style={{
              // alignItems: "center",
              // justifyContent: "center",
              // width: "100%",
              backgroundColor: "white",
              marginTop: "4%",
              // paddingBottom: "5%",
            }}
          >
            <Text
              style={{
                textAlign: "left",
                // paddingStart: "2%",
                padding: "2%",
                // paddingTop: "2%",

                backgroundColor: "#185a9d",
                color: "white",
                fontWeight: "bold",
              }}
            >
              PAY WITH BALANCE
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(!modalVisible)}
              style={{
                // backgroundColor: "red",
                width: "100%",
                height: 50,
                // justifyContent: "center",
                alignItems: "center",
                paddingStart: "3%",
                flexDirection: "row",
                borderWidth: 1,
                borderColor: "lightgray",
              }}
            // disabled={promotionValid === true ? true : false}
            >
              {/* useBalance part */}
              {useBalance && usedBalance > 0 ? (
                <MaterialIcons name="done" size={25} color={"#3ea3a3"} />
              ) : modalVisible ? (
                <MaterialCommunityIcons
                  name="minus"
                  size={25}
                  color={"#3ea3a3"}
                />
              ) : (
                    <MaterialCommunityIcons
                      name="plus"
                      size={25}
                      color={"#3ea3a3"}
                    />
                  )}

              {/* <Text style={{ paddingLeft: 5 }}>
                Promo Code{" "}
                {promotionValid === true && (
                  <Text style={{ color: "#3ea3a3" }}>(Deducte Added)</Text>
                )}
              </Text> */}
              <Text style={{ paddingLeft: 5 }}>
                Deduct From Balance
                {useBalance && usedBalance > 0 && (
                  <Text style={{ color: "#3ea3a3" }}>
                    {" "}
                    (Deduct Amount: {usedBalance} QAR)
                  </Text>
                )}
              </Text>
            </TouchableOpacity>
            {modalVisible && (
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  padding: "3%",
                  paddingBottom: "10%",
                  justifyContent: "center",
                }}
              >
                <TextInput
                  style={{
                    width: "90%",
                    borderWidth: 1.5,
                    padding: 5,
                    borderColor: "gray",
                    textAlign: "center",
                    height: 50,
                  }}
                  keyboardType="numeric"
                  onChangeText={(text) =>
                    // !text.includes("-") &&
                    setUsedBalance(text)
                  }
                  placeholder="Enter Amount to Deduct"
                  value={usedBalance}
                />
                {/* <Button
                title="Use"
                disabled={usedBalance > user.balance ? true : false}
                onPress={() => handleUseBalance()}
              /> */}
                <TouchableOpacity
                  disabled={
                    usedBalance && usedBalance.includes("-")
                      ? "lightgray"
                      : usedBalance > user.balance && usedBalance <= 0
                        ? true
                        : (promotionValid === true &&
                          usedBalance >
                          total - (total * promotion.percentage) / 100) ||
                          usedBalance > total
                          ? true
                          : false
                  }
                  onPress={() => handleUseBalance()}
                  style={{
                    backgroundColor:
                      (usedBalance && usedBalance.includes("-")
                        ? "lightgray"
                        : usedBalance > user.balance) || usedBalance <= 0
                        ? "lightgray"
                        : (promotionValid === true &&
                          usedBalance >
                          total - (total * promotion.percentage) / 100) ||
                          usedBalance > total
                          ? "lightgray"
                          : "#3ea3a3",
                    width: "90%",
                    borderRadius: 8,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 10,
                    marginTop: 10,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    Deduct
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {/* recent cut */}
            {/* recent cut 2 */}
          </View>

          {/* <Modal
            animationType="fade"
            transparent={true}
            // visible={modalVisible}
            visible={false}
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
          </Modal> */}
        </ScrollView>
      </View>
      <View
        style={{
          flex: 1.2,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderColor: "lightgray",
          flexDirection: "row",
        }}
      >
        <View
          style={{
            width: "60%",
            paddingLeft: "4%",
            justifyContent: "center",
            // backgroundColor: "red",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: "#185a9d",
              fontWeight: "bold",
              // marginBottom: "2%",
            }}
          >
            TOTAL DUE
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: 16, paddingLeft: 5 }}>
            {promotionValid === true ? (
              <Text style={{ fontWeight: "bold", fontSize: 22 }}>
                <Text
                  style={{
                    textDecorationLine: "line-through",
                    textDecorationStyle: "solid",
                    color: "gray",
                  }}
                >
                  {total}
                </Text>{" "}
                {/* totalAmount part */}
                {totalAmount}
              </Text>
            ) : (
                totalAmount
              )}{" "}
            QAR
          </Text>
        </View>
        <View
          style={{
            width: "40%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => pay()}
            disabled={
              (name && cardNumber && expiryDate && CVC) ||
                (other === false && checked != "")
                ? clicked
                  ? true
                  : false
                : true
            }
            style={{
              backgroundColor:
                (name && cardNumber && expiryDate && CVC) ||
                  (other === false && checked != "")
                  ? clicked
                    ? "lightgray"
                    : "#3ea3a3"
                  : "lightgray",
              height: 40,
              width: "90%",
              // alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
              // marginStart: "2%",
              marginEnd: "5%",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              {clicked ? "PROCESSING.." : "PAY"}
            </Text>
          </TouchableOpacity>

          {(name && cardNumber && expiryDate && CVC) ||
            (other === false && checked != "")
            ? null
            : marginVal === 0 && (
              <Text
                style={{
                  fontSize: 12,
                  // marginEnd: "11%",
                  // marginTop: marginVal === 0 ? "1%" : 0,
                  color: "gray",
                  textAlign: "center",
                }}
              >
                (Incomplete Details)
              </Text>
            )}
        </View>
      </View>
    </View>
  );
}

Payment.navigationOptions = {
  title: "Payment",
  headerStyle: { backgroundColor: "#185a9d" },
  headerTintColor: "white",
};
//
const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: "gray",
    marginBottom: 10,
    paddingLeft: 5,
  },
});

{
  /* <TouchableOpacity
  onPress={() => setPromoView(!promoView)}
  style={{
    // backgroundColor: "red",
    width: "100%",
    height: 50,
    // justifyContent: "center",
    alignItems: "center",
    paddingStart: "3%",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "lightgray",
  }}
  disabled={promotionValid === true ? true : false}
> */
}
{
  /* promotionValid part */
}
{
  /* {promotionValid ? (
    <MaterialIcons name="done" size={25} color={"#3ea3a3"} />
  ) : promoView ? (
    <MaterialCommunityIcons name="minus" size={25} color={"#3ea3a3"} />
  ) : (
    <MaterialCommunityIcons name="plus" size={25} color={"#3ea3a3"} />
  )} */
}

{
  /* <Text style={{ paddingLeft: 5 }}>
    Promo Code{" "}
    {promotionValid === true && (
      <Text style={{ color: "#3ea3a3" }}>(Code Used)</Text>
    )}
  </Text>
</TouchableOpacity>; */
}

// {promoView && !promotionValid && (
//   <View
//     style={{
//       width: "90%",
//       alignItems: "center",
//       justifyContent: "center",
//       paddingBottom: "5%",
//       alignSelf: "center",
//     }}
//   >
//     <TextInput
//       style={{
//         height: 50,
//         borderColor: "gray",
//         borderWidth: 1.5,
//         width: "90%",
//         textAlign: "center",
//         marginTop: "5%",
//         backgroundColor: "white",
//       }}
//       onChangeText={setCode}
//       onSubmitEditing={() => handlePromotion(code)}
//       placeholder="Enter Promotion Code"
//       // placeholderTextColor="gray"
//       value={code}
//     />

//     {promotionValid === true ? (
//       <Text
//         style={{ color: "#3ea3a3", marginTop: 5, marginBottom: 10 }}
//       >
//         Code Valid
//       </Text>
//     ) : promotionValid === false ? (
//       <Text
//         style={{ color: "red", marginTop: 5, marginBottom: 10 }}
//       >
//         Code Invalid
//       </Text>
//     ) : (
//       <Text></Text>
//     )}
//   </View>
// )}
