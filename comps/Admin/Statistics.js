import React, { useEffect, useState } from "react";
import { View, Text, Button, Dimensions, StyleSheet } from "react-native";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import db from "../../db";
import { PieChart } from "react-native-chart-kit";
import { ScrollView } from "react-native-gesture-handler";
import AnimatedLoader from "react-native-animated-loader";
import LottieView from "lottie-react-native";
import { BarChart, Grid, YAxis, XAxis } from "react-native-svg-charts";
import * as scale from "d3-scale";
import Swiper from "react-native-swiper";
export default function Statistics(props) {
  // --------------------------------------- STATE VARIABLES -------------------------

  // --------------------------------------- USER STATES -----------------------------

  const [totalUsers, setTotalUsers] = useState([]);
  const [userChart, setUserChart] = useState(null);

  // --------------------------------------- ASSETS STATES --------------------------

  const [allAssetBookings, setAllAssetBookings] = useState([]);
  const [allAssetSections, setAllAssetSections] = useState([]);
  const [assetChartData, setAssetChartData] = useState([]);

  // ----------------------------------------- SERVICE STATES  -----------------------

  const [serviceBookings, setServiceBookings] = useState([]);
  const [serviceChartData, setServiceChartData] = useState([]);

  // ---------------------------- CHART CONFIG ---------------------------------------

  const screenWidth = Dimensions.get("screen").width;
  const screenHeight = Dimensions.get("screen").height;
  const chartConfig = {
    backgroundColor: "white",
    backgroundGradientFrom: "white",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "white",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 1,
    useShadowColorFromDataset: false,
  };

  // ---------------------------------------- FUNCTIONS ----------------------------------------------

  const getTotalUsers = () => {
    db.collection("users").onSnapshot((querySnap) => {
      let users = [];
      querySnap.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      setTotalUsers([...users]);
    });
  };

  const getAllAssetSections = () => {
    db.collection("assetSections").onSnapshot((snapShot) => {
      let assetSection = [];
      snapShot.forEach((document) => {
        assetSection.push({ id: document.id, ...document.data() });
      });
      setAllAssetSections([...assetSection]);
    });
  };

  const getAllServiceBookings = () => {
    db.collection("services").onSnapshot((querySnap) => {
      let serviceBooking = [];
      let chartData = [];
      let count = 0;
      querySnap.forEach((doc) => {
        db.collection("services")
          .doc(doc.id)
          .collection("serviceBookings")
          .onSnapshot(async (query) => {
            count++;
            query.forEach((document) => {
              serviceBooking.push({ id: document.id, ...document.data() });
            });
            chartData.push({
              name: doc.data().name,
              booking: query.docs.length,
              color: doc.data().color,
              legendFontColor: "#7F7F7F",
              legendFontSize: 15,
            });

            if (count === querySnap.docs.length) {
              setServiceChartData([...chartData]);
              setServiceBookings([...serviceBooking]);
            }
          });
      });
    });
  };

  const generateRandomColor = async () => {
    let res = "";
    for (let i = 0; i < 3; i++) {
      const random = Math.floor(Math.random() * 256);
      res += `${random},`;
    }
    const color = `rgb(${res.substring(0, res.length - 1)})`;
    alert(`color ${color}`);
  };

  const getAllAssetBookings = () => {
    db.collection("assets").onSnapshot((querySnapshot) => {
      const assets = [];
      let count = 0;
      querySnapshot.forEach((doc) => {
        count++;
        db.collection("assets")
          .doc(doc.id)
          .collection("assetBookings")
          .onSnapshot((query) => {
            assets.push({
              id: doc.id,
              ...doc.data(),
              bookings: query.docs.length,
            });
            if (assets.length === count) {
              setAllAssetBookings([...assets]);
            }
          });
      });
    });
  };

  const getAssetChartData = () => {
    const result = [];
    allAssetSections.map((assetSection) => {
      allAssetBookings.map((assetBooking) => {
        if (assetBooking.assetSection === assetSection.id) {
          const bookingCount = getBookingCount(assetSection.id);
          result.push({
            name: assetSection.name,
            booking: bookingCount,
            color: assetSection.color,
            legendFontColor: "#7F7F7F",
            legendFontSize: 15,
          });
        }
      });
    });

    const unique = [];
    result.map((x) =>
      unique.filter((a) => a.name === x.name).length > 0 ? null : unique.push(x)
    );
    setAssetChartData([...unique]);
  };

  const getBookingCount = (assetSectionId) => {
    const assetBookings = allAssetBookings.filter(
      (item) => item.assetSection === assetSectionId
    );
    let bookingCount = 0;
    assetBookings.map((item) => (bookingCount += item.bookings));
    return bookingCount;
  };

  {
    /* 
    "admin"
    "manager"
    "user handler"
    "asset handler"
    "customer support"
    "services employee"
    "customer"
  */
  }
  const getUserChart = () => {
    const tempUsers = [...totalUsers];
    const admins = tempUsers.filter((user) => user.role === "admin");
    const customers = tempUsers.filter((user) => user.role === "customer");
    const managers = tempUsers.filter((user) => user.role === "manager");
    const userHandlers = tempUsers.filter(
      (user) => user.role === "user handler"
    );
    const assetHandler = tempUsers.filter(
      (user) => user.role === "asset handler"
    );
    const customerSupport = tempUsers.filter(
      (user) => user.role === "customer support"
    );
    const serviceEmployee = tempUsers.filter(
      (user) => user.role === "services employee"
    );

    // const result = {
    //   labels: [
    //     "admin",
    //     "customer",
    //     "manager",
    //     "user handler",
    //     "asset handler",
    //     "customer support",
    //     "services employee",
    //   ],
    //   datasets: [
    //     {
    //       data: [
    //         admins.length,
    //         customers.length,
    //         managers.length,
    //         userHandlers.length,
    //         assetHandler.length,
    //         customerSupport.length,
    //         serviceEmployee.length,
    //       ],
    //     },
    //   ],
    // };
    const data = [
      {
        value: admins.length,
        label: "Admins",
      },
      {
        value: customers.length,
        label: "Customers",
      },
      {
        value: userHandlers.length,
        label: "User Handlers",
      },
      {
        value: managers.length,
        label: "Managers",
      },
      {
        value: customerSupport.length,
        label: "Customer Support",
      },
      {
        value: serviceEmployee.length,
        label: "Services Employee",
      },
    ];

    // console.log(result);

    setUserChart(data);
  };
  // --------------------------------------- USE EFFECTS --------------------------------------------

  useEffect(() => {
    getTotalUsers();
    getAllServiceBookings();
    getAllAssetSections();
    getAllAssetBookings();
  }, []);

  useEffect(() => {
    if (allAssetSections && allAssetBookings) {
      getAssetChartData();
    }
  }, [allAssetSections, allAssetBookings]);

  useEffect(() => {
    if (totalUsers) {
      getUserChart();
    }
  }, [totalUsers]);

  // ----------------------------------------- VIEW -------------------------------------------------

  return (
    // <View style={{ flex: 1, backgroundColor: "white" }}>
    <Swiper style={styles.wrapper} showsButtons={true}>
      <View style={styles.slide1}>
        {userChart ? (
          <View
            style={{ alignItems: "center", flex: 3, justifyContent: "center" }}
          >
            <Text style={{ fontSize: 30 }}>Total Users</Text>
            <View
              style={{
                flexDirection: "row",
                height: 200,
                paddingVertical: 16,
                width: Dimensions.get("window").width / 1.5,
              }}
            >
              <YAxis
                data={userChart}
                yAccessor={({ index }) => index}
                // scale={scale.scaleBand}
                contentInset={{ top: 10, bottom: 10 }}
                spacing={0.2}
                formatLabel={(item, index) => index}
              />
              <BarChart
                style={{ flex: 1, marginLeft: 8 }}
                data={userChart}
                // horizontal={true}
                yAccessor={({ item }) => item.value}
                svg={{ fill: "rgba(134, 65, 244, 0.8)" }}
                contentInset={{ top: 10, bottom: 10 }}
                spacing={0.2}
                gridMin={0}
              >
                <Grid direction={Grid.Direction.VERTICAL} />
              </BarChart>
            </View>
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LottieView
              width={Dimensions.get("window").width / 3}
              source={require("../../assets/loadingAnimations/890-loading-animation.json")}
              autoPlay
              loop
              style={{
                position: "relative",
                width: "100%",
              }}
            />
          </View>
        )}
      </View>
      <View style={styles.slide2}>
        {/* <Text style={styles.text}>Beautiful</Text> */}

        {assetChartData.length !== 0 ? (
          <View
            style={{ alignItems: "center", flex: 1, justifyContent: "center" }}
          >
            <Text style={{ fontSize: 30 }}>All Assets Bookings</Text>
            <PieChart
              data={assetChartData}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              accessor="booking"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LottieView
              width={Dimensions.get("window").width / 3}
              source={require("../../assets/loadingAnimations/890-loading-animation.json")}
              autoPlay
              loop
              style={{
                position: "relative",
                width: "100%",
              }}
            />
          </View>
        )}
      </View>
      <View style={styles.slide3}>
        {/* <Text style={styles.text}>And simple</Text> */}

        {serviceChartData.length !== 0 ? (
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 30 }}>All Services Bookings</Text>
            <PieChart
              data={serviceChartData}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              accessor="booking"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LottieView
              width={Dimensions.get("window").width / 3}
              source={require("../../assets/loadingAnimations/890-loading-animation.json")}
              autoPlay
              loop
              style={{
                position: "relative",
                width: "100%",
              }}
            />
          </View>
        )}
      </View>
      {/* <Button
        title="GENERATE RANDOM COLOR"
        onPress={() => generateRandomColor()}
      /> */}
    </Swiper>

    // </View>
  );
}

const styles = StyleSheet.create({
  lottie: {
    width: 100,
    height: 100,
  },
  wrapper: {},
  slide1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#9DD6EB",
  },
  slide2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#97CAE5",
  },
  slide3: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#92BBD9",
  },
});
