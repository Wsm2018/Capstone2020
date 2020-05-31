import React, { useEffect, useState } from "react";
import { View, Text, Button, Dimensions } from "react-native";
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import db from "../../db";
import { PieChart, BarChart } from "react-native-chart-kit";
import { ScrollView } from "react-native-gesture-handler";

export default function Statistics(props) {
  // --------------------------------------- STATE VARIABLES -----------------------------------------

  const [totalUsers, setTotalUsers] = useState(0);
  const [allAssetTypes, setAllAssetTypes] = useState([]);
  const [allAssetBookings, setAllAssetBookings] = useState([]);
  const [allAssetSections, setAllAssetSections] = useState([]);
  const [assetChartData, setAssetChartData] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [serviceChartData, setServiceChartData] = useState([]);
  const screenWidth = Dimensions.get("window").width;
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

  const data = {
    labels: [
      "parking 01",
      "parking 02",
      "parking 03",
      "parking 04",
      "parking 05",
      "parking 06",
      "parking 07",
      "parking 08",
      "parking 09",
      "parking 10",
      "parking 11",
    ],
    datasets: [
      {
        data: [3, 2, 0, 0, 3, 0, 0, 1, 3, 0, 1],
      },
    ],
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

  const getAllAssetSections = async () => {
    const assetSectionRef = await db.collection("assetSections").get();
    const assetSections = [];
    assetSectionRef.forEach((doc) => {
      assetSections.push({ id: doc.id, ...doc.data() });
    });
    return assetSections;
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
              db.collection("assets")
                .where("assetSection", "==", assetSection.id)
                .onSnapshot((assetSnapshot) => {
                  count += assetSnapshot.docs.length;
                  assetSnapshot.forEach((asset) => {
                    db.collection("assets")
                      .doc(asset.id)
                      .collection("assetBookings")
                      .onSnapshot((assetBookingSnapshot) => {
                        assetBookings.push({
                          bookings: assetBookingSnapshot.docs.length,
                          asset: asset.data().name,
                          assetSection: assetSection.data().name,
                          color: assetSection.data().color,
                        });
                        if (count === assetBookings.length) {
                          setAllAssetBookings([...assetBookings]);
                          setCharData(assetBookings);
                        }
                        // console.log("count ", count);
                        // console.log("booking", assetBookings.length);
                        // console.log(
                        //   `${asset.data().name} ${assetSection.data().name} ${
                        //     assetBookingSnapshot.docs.length
                        //   }`
                        // );
                      });

                    // console.log("asset", assetSnapshot.docs.length);
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

  const setCharData = async (assetBookings) => {
    const assetSection = await getAllAssetSections();
    // console.log("assetsections ", assetSection);
    // console.log("assetBookings", assetBookings);
    let result = [];
    assetSection.map((item) => {
      // let count = 0;
      assetBookings.map((ab) => {
        // if (item.name === ab.assetSection) {
        //   count++;
        // }
        console.log("aslkdnllkmdslkmansdlm", ab);
      });
      // result.push({
      //   name: item.name,
      //   booking: count,
      //   color: item.color,
      //   legendFontColor: "#7F7F7F",
      //   legendFontSize: 15,
      // });
    });
    console.log(result);
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
    // console.log(res);
    const color = `rgb(${res.substring(0, res.length - 1)})`;
    console.log("color", color);
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

  // ----------------------------------------- VIEW -------------------------------------------------

  return (
    <ScrollView style={{ flex: 1 }}>
      <Text>Total Users</Text>
      <Text>{totalUsers}</Text>

      {/* <Text>All Asset Bookings</Text>
      <Text>{allBookings.length}</Text> */}

      <View style={{ alignItems: "center", flex: 1 }}>
        <Text style={{ fontSize: 30 }}>All Assets Bookings</Text>
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

      <View style={{ alignItems: "center", backgroundColor: "white" }}>
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

      <Button title="get color" onPress={() => generateRandomColor()} />
    </ScrollView>
  );
}
