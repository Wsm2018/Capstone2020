import React, { useEffect, useState } from "react";
import { View, Text, Button, Dimensions } from "react-native";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import db from "../../db";
import { PieChart, BarChart } from "react-native-chart-kit";
import { ScrollView } from "react-native-gesture-handler";

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

    const result = {
      labels: [
        "admin",
        "customer",
        "manager",
        "user handler",
        "asset handler",
        "customer support",
        "services employee",
      ],
      datasets: [
        {
          data: [
            admins.length,
            customers.length,
            managers.length,
            userHandlers.length,
            assetHandler.length,
            customerSupport.length,
            serviceEmployee.length,
          ],
        },
      ],
    };

    console.log(result);

    setUserChart(result);
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
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ alignItems: "center", flex: 3 }}>
        <Text style={{ fontSize: 30 }}>Total Users</Text>

        {userChart && (
          <BarChart
            data={userChart}
            width={screenWidth / 1.1}
            height={screenHeight / 1.5}
            chartConfig={{
              backgroundColor: "white",
              backgroundGradientFrom: "white",
              backgroundGradientFromOpacity: 0,
              backgroundGradientTo: "white",
              backgroundGradientToOpacity: 0.5,
              color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
              strokeWidth: 2,
              barPercentage: 1,
              useShadowColorFromDataset: false,
            }}
            verticalLabelRotation={90}
          />
        )}
      </View>

      {/* <Text>{totalUsers}</Text> */}

      {/* <Text>All Asset Bookings</Text>
      <Text>{allBookings.length}</Text> */}

      <View style={{ alignItems: "center", flex: 1 }}>
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
        {/* <BarChart
          // style={{ backgroundColor: "white" }}
          data={data}
          width={screenWidth}
          height={400}
          withInnerLines={false}
          // yAxisLabel="Bookings"
          chartConfig={{
            backgroundColor: "white",
            backgroundGradientFrom: "white",
            // backgroundGradientFromOpacity: 0,
            backgroundGradientTo: "white",
            // backgroundGradientToOpacity: 0.5,
            barPercentage: 1,
            color: () => `rgba(250,0,0,0.6)`,
            style: {
              borderRadius: 16,
            },
          }}
          verticalLabelRotation={90}
          fromZero
        /> */}
      </View>

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

      <Button
        title="GENERATE RANDOM COLOR"
        onPress={() => generateRandomColor()}
      />
    </ScrollView>
  );
}
