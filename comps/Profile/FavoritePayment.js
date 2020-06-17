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
  const [checker, setChecker] = useState("");
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
  const [subscription, setSubscription] = useState(false);
  const [pointsChart, setPointsChart] = useState([]);
  const [points, setPoints] = useState(0);
  const tName = props.navigation.getParam("tName", "failed");

  /////////////////////////////Front-End//////////////////////////////////
  const [promoView, setPromoView] = useState(false);
  const [tokenView, setTokenView] = useState(false);
  const [clicked, setClicked] = useState(false);

  const [discountType, setDiscountType] = useState(true);
  const [useToken, setUseToken] = useState(false);

  //////////////////////////////////////////////////////////////////////

  useEffect(() => {
    console.log("totalllllllllllll", total);
    calculation();
  }, [promotionValid]);

  const calculation = () => {
    let t = total;
    if (promotionValid === true) {
      t = total - (total * promotion.percentage) / 100;
    } else if (useToken === true) {
      t = total - (total * 5) / 100;
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

    db.collection("pointsChart").onSnapshot((querySnapshot) => {
      const pointsChart = [];
      querySnapshot.forEach((doc) => {
        pointsChart.push({ id: doc.id, ...doc.data() });
      });
      setPointsChart([...pointsChart]);
      console.log("--------------pointsChart---------", pointsChart);
    });

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
        setChecked(cards[0] ? cards[0].id : 1);
        setOther(cards[0] ? false : true);
        setCard(cards[0] ? cards[0] : {});
      });

    var years = [];
    for (let i = 0; i <= 10; i++) {
      years.push(moment().add(i, "years").format("YYYY"));
    }
    setYearsList(years);
  }, []);

  useEffect(() => {
    setTimeout(cPoints, 2000);
  }, [pointsChart]);

  const cPoints = () => {
    console.log("********pointsChart********", pointsChart);
    const subscriptionType =
      subscription && subscription[0] && subscription[0].type
        ? subscription[0].type
        : "normal";

    const pointsChartE =
      pointsChart.length > 0 &&
      pointsChart.filter((p) => p.subscriptionType === subscriptionType)[0];

    const points =
      pointsChart.length > 0
        ? (total / pointsChartE.spentValue) * pointsChartE.points
        : 0;
    setPoints(points);
  };

  const pay = async () => {
    setClicked(true);
    var bookingTemp = [];
    var bookings = await db
      .collection("assets")
      .doc(assetBooking.asset.id)
      .collection("assetBookings")
      .get();
    // console.log(" ehh", bookings)
    if (bookings) {
      bookings.forEach((b) => {
        bookingTemp.push(b.data());
      });
    }
    //const temp = [];
    //setEmpty(true)
    setChecker(bookingTemp);
  };

  useEffect(() => {
    if (checker && checker.length >= 0) {
      console.log(" got it !!! 3");
      var conflict = false;
      var result = checker.filter((AB) => {
        if (
          AB.startDateTime >= assetBooking.startDateTime &&
          AB.startDateTime <= assetBooking.endDateTime
        ) {
          console.log(
            " 1 ",
            AB.startDateTime,
            assetBooking.startDateTime,
            AB.endDateTime,
            assetBooking.startDateTime
          );
          conflict = true;
          //break
        } else if (
          AB.endDateTime >= assetBooking.endDateTime &&
          AB.endDateTime <= assetBooking.endDateTime
        ) {
          console.log(
            " 2 ",
            AB.startDateTime,
            assetBooking.endDateTime,
            AB.endDateTime,
            assetBooking.endDateTime
          );
          conflict = true;
          // break
        } else if (
          AB.startDateTime == assetBooking.startDateTime ||
          AB.endDateTime == assetBooking.endDateTime
        ) {
          console.log(
            " 3 ",
            AB.startDateTime,
            assetBooking.startDateTime,
            AB.endDateTime,
            assetBooking.endDateTime
          );
          conflict = true;
          // break
        }
      });

      if (!conflict) {
        add();
      } else {
        alert("Sorry, Booking Can't be added!!");
        props.navigation.navigate("Profile");
      }
    }
  }, [checker]);

  const add = async () => {
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
        cvc: CVC,
        cardType: cardType,
        holderName: name,
      };
    } else {
      c = card;
    }
    console.log(
      "174",
      addCreditCard,
      totalAmount,
      usedBalance,
      firebase.auth().currentUser.uid
    );

    let u = user.data();
    u.id = firebase.auth().currentUser.uid;
    u.balance = u.balance - usedBalance;

    const subscriptionType =
      subscription && subscription[0] && subscription[0].type
        ? subscription[0].type
        : "normal";

    const pointsChartE = pointsChart.filter(
      (p) => p.subscriptionType === subscriptionType
    )[0];

    const points = (total / pointsChartE.spentValue) * pointsChartE.points;
    u.points = u.points + points + u.reputation;

    if (useToken === true) {
      u.tokens = u.tokens - 1;
    }

    if (partial != "not found") {
      console.log("177");
      var toUpd = partial;
      toUpd.status = true;
      toUpd.card = c;
      console.log("ehhee", toUpd.status, partial.id, toUpd.card, total, u);
      const response = await assetManager({
        doc: partial.id,
        type: "update",
        collection: "payments",
        obj: toUpd,
      });
      console.log("188");
    } else if (extension != "not found") {
      console.log("ehhee", extension.id, assetBooking.endDateTime, c, total, u);
      const response = await editBooking({
        paymentId: extension.id,
        card: c,
        endDateTime: assetBooking.endDateTime,
        assetBooking: assetBooking,
        totalAmount: totalAmount > 0 ? totalAmount : 0,
        status: true,
        serviceBooking: serviceBooking,
        user: u,
      });
    } else {
      console.log("--------------------------", u);
      var temp = assetBooking.asset;
      temp.assetBookings = [];
      const response = await handleBooking({
        user: u,
        asset: temp,
        startDateTime: assetBooking.startDateTime,
        endDateTime: assetBooking.endDateTime,
        card: c,
        promotionCode: promotionValid ? promotion : null,
        dateTime: moment().format("YYYY-MM-DD T HH:mm"),
        status: true,
        addCreditCard: addCreditCard && other,
        uid: firebase.auth().currentUser.uid,
        totalAmount: totalAmount > 0 ? totalAmount : 0,
        // status: true,
        serviceBooking: serviceBooking,
      });
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
      localNotification.body = `Your payment of ${
        totalAmount > 0 ? totalAmount : 0
      } QAR for the ${tName} was completed successfully!`;
      Notifications.presentLocalNotificationAsync(localNotification);
      props.navigation.navigate("BookingHistory");
    }
    db.collection("users").doc(user.id).update(u);
    console.log("192");

    // props.navigation.navigate("Types");
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

  useEffect(() => {
    calculation();
  }, [useToken]);

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

    setMargin(250);
  };

  const _keyboardDidHide = () => {
    // console.log("keyyyyyyyyyyyyyyyHide");
    setMargin(0);
  };

  const [marginVal, setMargin] = useState(0);
  /////////////////////////////////////////////////////////////////////////////////////
  return (
    <View style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
      <View
        style={{
          flex: 8,
          marginBottom: Platform.OS === "ios" ? marginVal : 0,
        }}
      >
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
              width: "100%",
              flexDirection: "row",
              // flex: 1.5,
              // justifyContent: "space-between",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                // margin: "4%",
                padding: "3%",
                // borderRadius: 10,
                borderWidth: 1,
                borderColor: "lightgray",
                alignItems: "center",
                width: "50%",
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
                backgroundColor: "white",
                // margin: "4%",
                padding: "3%",
                // borderRadius: 10,
                borderWidth: 1,
                borderColor: "lightgray",
                alignItems: "center",
                width: "50%",
                // flex: 1.5,
                // justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 27, fontWeight: "bold" }}>
                {user.tokens}
                <Text style={{ fontSize: 18 }}> Tokens </Text>
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#185a9d",
                  fontWeight: "bold",
                  paddingTop: 4,
                }}
              >
                AVAILABLE TOKENS
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
          </View>

          <View
            style={{
              width: "100%",
              flexDirection: "row",
              // flex: 1.5,
              // justifyContent: "space-between",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                // margin: "4%",
                padding: "3%",
                // borderRadius: 10,
                borderWidth: 1,
                borderColor: "lightgray",
                alignItems: "center",
                width: "50%",
                // flex: 1.5,
                // justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 27, fontWeight: "bold" }}>
                {points}
                <Text style={{ fontSize: 18 }}> Points</Text>
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#185a9d",
                  fontWeight: "bold",
                  paddingTop: 4,
                }}
              >
                Points Earned From Booking
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
                backgroundColor: "white",
                // margin: "4%",
                padding: "3%",
                // borderRadius: 10,
                borderWidth: 1,
                borderColor: "lightgray",
                alignItems: "center",
                width: "50%",
                // flex: 1.5,
                // justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 27, fontWeight: "bold" }}>
                {user.reputation}
                <Text style={{ fontSize: 18 }}> Points </Text>
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#185a9d",
                  fontWeight: "bold",
                  paddingTop: 4,
                }}
              >
                Reputation Points
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
              <CheckBox
                title="+ Add New Card"
                checked={checked === 1 ? true : false}
                onPress={() => {
                  handleCardSelect({ id: 1 });
                }}
                textStyle={{ color: "black" }}
                containerStyle={{ borderColor: "#e3e3e3", borderWidth: 1.5 }}
              />
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
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    onChangeText={(text) => setCardNumber(text)}
                    placeholder="Card Number"
                    value={cardNumber}
                    maxLength={16}
                  />
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) => setName(text)}
                    placeholder="Card Holder Name"
                    value={name}
                  />
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
                          selectedValue={year}
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
                          onValueChange={(itemValue) => setYear(itemValue)}
                        >
                          <Picker.Item label={"Select Year"} value={""} />
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
                          width: "50%",
                          fontSize: 20,
                          backgroundColor: "transparent",
                          marginBottom: 4,
                          marginTop: 4,
                          marginRight: "auto",
                          marginLeft: "auto",
                        }}
                        onValueChange={(itemValue) => setMonth(itemValue)}
                      >
                        <Picker.Item label={"Select Month"} value={""} />
                        {monthList.map((y) => (
                          <Picker.Item label={y} value={y} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) => setCVC(text)}
                    keyboardType="numeric"
                    placeholder="CVC"
                    maxLength={3}
                    value={CVC}
                  />
                  <View
                    style={{
                      borderWidth: 1.5,
                      borderColor: "gray",
                      marginBottom: 5,
                    }}
                  >
                    <Picker
                      selectedValue={cardType}
                      style={{ width: "100%", borderWidth: 1.5 }}
                      onValueChange={(itemValue) => setCardType(itemValue)}
                    >
                      <Picker.Item label="Select Card Type" value="" />
                      <Picker.Item label="Visa" value="visa" />
                      <Picker.Item label="Amex" value="amex" />
                      <Picker.Item label="Mastercard" value="mastercard" />
                    </Picker>
                  </View>

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
              EXTRAS
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
            {!promotionValid && !useToken && (
              <View
                style={{
                  textAlign: "left",
                  // paddingStart: "2%",
                  padding: "0%",
                  // paddingTop: "2%",
                  flexDirection: "row",
                  backgroundColor: "#ababab",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                <TouchableOpacity
                  onPress={() => setDiscountType(true)}
                  style={{
                    // backgroundColor: "red",
                    width: "50%",
                    height: 30,
                    // justifyContent: "center",
                    alignItems: "center",
                    paddingStart: "3%",
                    flexDirection: "row",
                    borderWidth: 1,
                    borderColor: "lightgray",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "left",
                      // paddingStart: "2%",
                      padding: "2%",
                      // paddingTop: "2%",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    Use Promo Code
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setDiscountType(false)}
                  style={{
                    // backgroundColor: "red",
                    width: "50%",
                    height: 30,
                    // justifyContent: "center",
                    alignItems: "center",
                    paddingStart: "3%",
                    flexDirection: "row",
                    borderWidth: 1,
                    borderColor: "lightgray",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "left",
                      // paddingStart: "2%",
                      padding: "2%",
                      // paddingTop: "2%",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    Use a Token
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {discountType && (
              <View>
                <TouchableOpacity
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
                >
                  {promotionValid ? (
                    <MaterialIcons name="done" size={25} color={"#3ea3a3"} />
                  ) : promoView ? (
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

                  <Text style={{ paddingLeft: 5 }}>
                    Promo Code{" "}
                    {promotionValid === true && (
                      <Text style={{ color: "#3ea3a3" }}>(Code Used)</Text>
                    )}
                  </Text>
                </TouchableOpacity>
                {promoView && !promotionValid && (
                  <View
                    style={{
                      width: "90%",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingBottom: "5%",
                      alignSelf: "center",
                    }}
                  >
                    <TextInput
                      style={{
                        height: 50,
                        borderColor: "gray",
                        borderWidth: 1.5,
                        width: "90%",
                        textAlign: "center",
                        marginTop: "5%",
                        backgroundColor: "white",
                      }}
                      onChangeText={setCode}
                      onSubmitEditing={() => handlePromotion(code)}
                      placeholder="Enter Promotion Code"
                      // placeholderTextColor="gray"
                      value={code}
                    />

                    {promotionValid === true ? (
                      <Text
                        style={{
                          color: "#3ea3a3",
                          marginTop: 5,
                          marginBottom: 10,
                        }}
                      >
                        Code Valid
                      </Text>
                    ) : promotionValid === false ? (
                      <Text
                        style={{ color: "red", marginTop: 5, marginBottom: 10 }}
                      >
                        Code Invalid
                      </Text>
                    ) : (
                      <Text></Text>
                    )}
                  </View>
                )}
              </View>
            )}
            {!discountType && (
              <View>
                <TouchableOpacity
                  onPress={() => setTokenView(!tokenView)}
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
                  disabled={useToken === true ? true : false}
                >
                  {useToken ? (
                    <MaterialIcons name="done" size={25} color={"#3ea3a3"} />
                  ) : tokenView ? (
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

                  <Text style={{ paddingLeft: 5 }}>Use a Token</Text>
                </TouchableOpacity>
                {tokenView && !useToken && (
                  <View
                    style={{
                      width: "90%",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingBottom: "5%",
                      alignSelf: "center",
                    }}
                  >
                    <Text style={{ fontSize: 15, color: "#878787" }}>
                      Using a token gives you 5% discount
                    </Text>
                    <TouchableOpacity
                      disabled={user.tokens <= 0}
                      onPress={() => setUseToken(true)}
                      style={{
                        backgroundColor:
                          user.tokens <= 0 ? "lightgray" : "#3ea3a3",
                        width: "90%",
                        borderRadius: 8,
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 10,
                        marginTop: 10,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        Use Token
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
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
                {totalAmount > 0 ? totalAmount : 0}
              </Text>
            ) : useToken ? (
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
                {totalAmount > 0 ? totalAmount : 0}
              </Text>
            ) : (
              <Text style={{ fontWeight: "bold", fontSize: 22 }}>
                {" "}
                {totalAmount > 0 ? totalAmount : 0}
              </Text>
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
              (name && cardNumber && month && year && CVC) ||
              (other === false && checked != "")
                ? clicked
                  ? true
                  : false
                : true
            }
            style={{
              backgroundColor:
                (name && cardNumber && month && year && CVC) ||
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

          {(name && cardNumber && month && year && CVC) ||
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
