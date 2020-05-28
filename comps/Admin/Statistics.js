import React, { useEffect, useState } from "react";
import { View, Text, Button, Dimensions } from "react-native";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import db from "../../db";
import { PieChart } from "react-native-chart-kit";

export default function Statistics(props) {
  // --------------------------------------- STATE VARIABLES -----------------------------------------

  const [totalUsers, setTotalUsers] = useState(0);
  const [allAssetTypes, setAllAssetTypes] = useState([]);
  const [allAssetBookings, setAllAssetBookings] = useState([]);
  const [allAssetSections, setAllAssetSections] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [chartData, setChartData] = useState([]);
  const data = [
    {
      booking: 0,
      color: "rgb(42,13,115)",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
      name: "projecter",
    },
    {
      booking: 21,
      color: "rgb(188,125,98)",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
      name: "petrol",
    },
    {
      booking: 2,
      color: "rgb(143,214,170)",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
      name: "carWash",
    },
    {
      booking: 0,
      color: "rgb(163,253,132)",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
      name: "valet",
    },
  ];
  const screenWidth = Dimensions.get("window").width;
  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  // ---------------------------------------- FUNCTIONS ----------------------------------------------

  const getTotalUsers = () => {
    db.collection("users").onSnapshot((querySnap) => {
      setTotalUsers(querySnap.docs.length);
    });
  };

  const getAllAssetTypes = async () => {
    db.collection("assetTypes").onSnapshot((assetTypeSnap) => {
      const assetTypeArr = [];
      assetTypeSnap.forEach((assetType) => {
        assetTypeArr.push({ id: assetType.id, ...assetType.data() });
      });
      setAllAssetTypes([...assetTypeArr]);
    });
  };

  const getAllAssetBookings = () => {
    db.collection("assetTypes").onSnapshot((assetTypeSnapshot) => {
      let count = 0;
      let assetBookings = [];
      assetTypeSnapshot.forEach((assetType) => {
        db.collection("assetSections")
          .where("assetType", "==", assetType.id)
          .onSnapshot((assetSectionSnapshot) => {
            assetSectionSnapshot.forEach((assetSection) => {
              console.log("\n");
              db.collection("assets")
                .where("assetSection", "==", assetSection.id)
                .onSnapshot((assetSnapshot) => {
                  // console.log(assetSnapshot.docs.length);
                  assetSnapshot.forEach((asset) => {
                    console.log(asset.id);
                    // console.log("asset", asset.data());
                  });
                });
            });
          });
      });
    });
    // db.collection("assetTypes").onSnapshot((assetTypeSnap) => {
    //   let count = 0;
    //   let assets = [];
    //   let assetBookings = [];
    //   let assetSections = [];
    //   assetTypeSnap.forEach((at) => {
    //     db.collection("assetSections")
    //       .where("assetType", "==", at.id)
    //       .onSnapshot((assetSectionSnap) => {
    //         assetSectionSnap.forEach((as) => {
    //           assetSections.push({ id: as.id, ...as.data() });
    //           db.collection("assets")
    //             .where("assetSection", "==", as.id)
    //             .onSnapshot((assetSnap) => {
    //               assetSnap.forEach((a) => {
    //                 assets.push({ id: a.id, ...a.data() });
    //                 count++;
    //                 db.collection("assets")
    //                   .doc(a.id)
    //                   .collection("assetBookings")
    //                   .onSnapshot((assetBookingSnap) => {
    //                     assetBookingSnap.forEach((ab) => {
    //                       assetBookings.push({
    //                         assetBooking: ab.data(),
    //                         asset: a.id,
    //                         assetSection: as.id,
    //                         assetType: at.id,
    //                       });
    //                       console.log(2222, count);
    //                       console.log(1111, assetBookings.length);
    //                       if (count === assetBookings.length) {
    //                         // setAllAssetBookings([...assetBookings]);
    //                         // setAllAssetSections([...assetSections]);
    //                         // setAllAssets([...assets]);
    //                         // fixData(assetBookings);
    //                       }
    //                     });
    //                   });
    //               });
    //             });
    //         });
    //       });
    //   });
    // });
    // db.collection("assets").onSnapshot((querySnapshot) => {
    //   let bookings = [];
    //   let count = 0;
    //   querySnapshot.forEach((document) => {
    //     db.collection("assets")
    //       .doc(document.id)
    //       .collection("assetBookings")
    //       .onSnapshot((query) => {
    //         count++;
    //         query.forEach((doc) => {
    //           bookings.push({ id: doc.id, ...doc.data() });
    //         });
    //         if (count === querySnapshot.docs.length) {
    //           setAllBookings([...bookings]);
    //         }
    //       });
    //   });
    // });
  };

  const fixData = (assetBookings) => {
    // if (allAssetTypes.length !== 0) {
    //   console.log("fixData ", allAssetTypes);
    //   console.log("all assets", allAssets);
    // }
    // console.log(1111, assetBookings.length);
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
            // let color = await generateRandomColor();
            chartData.push({
              name: doc.data().name,
              booking: query.docs.length,
              color: doc.data().color,
              legendFontColor: "#7F7F7F",
              legendFontSize: 15,
            });

            if (count === querySnap.docs.length) {
              setChartData([...chartData]);
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
    // console.log(res);
    const color = `rgb(${res.substring(0, res.length - 1)})`;
    // console.log("color", color);
    // return color;
  };

  const fetchAllData = async () => {
    getAllAssetTypes();
    getAllAssetBookings();
    getAllServiceBookings();
  };

  // --------------------------------------- USE EFFECTS --------------------------------------------

  useEffect(() => {
    getTotalUsers();
    fetchAllData();
  }, []);

  useEffect(() => {}, [allAssets]);

  // ----------------------------------------- VIEW -------------------------------------------------

  return (
    <View style={{ flex: 1 }}>
      <Text>Total Users</Text>
      <Text>{totalUsers}</Text>

      {/* <Text>All Asset Bookings</Text>
      <Text>{allBookings.length}</Text> */}

      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 30 }}>All Services Bookings</Text>

        <PieChart
          data={chartData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          accessor="booking"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      <Button title="get color" onPress={() => generateRandomColor()} />
    </View>
  );
}
