const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });
const fetch = require("node-fetch");

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "capstonecorona@gmail.com",
    pass: "12Pass34!!",
  },
});

exports.updateUser = functions.https.onCall(async (data, context) => {
  console.log("updateUser data", data);
  const result = await admin.auth().updateUser(data.uid, {
    displayName: data.displayName,
    photoURL: data.photoURL,
    phoneNumber: `+974${data.phoneNumber}`,
  });
  console.log("after set", result);
});

exports.updatePhoto = functions.https.onCall(async (data, context) => {
  console.log("updatePhoto data", data);
  const result = await admin.auth().updateUser(data.uid, {
    photoURL: data.photoURL,
  });

  await db.collection("users").doc(data.uid).update({
    photoURL: data.photoURL,
  });
});

exports.updateDisplayName = functions.https.onCall(async (data, context) => {
  console.log("updateDisplayName data", data);
  const result = await admin.auth().updateUser(data.uid, {
    displayName: data.displayName,
  });

  await db.collection("users").doc(data.uid).update({
    displayName: data.displayName,
  });
});

exports.sendGift = functions.https.onCall(async (data, context) => {
  const giftBalance = data.giftBalance;

  const decrement = admin.firestore.FieldValue.increment(-giftBalance);
  // updating the balance in the user document by sending the decrement variable to it
  db.collection("users").doc(data.uid).update({ balance: decrement });

  // generate a random 6 digits gift code number using Math.random()
  let giftCode = String(Math.floor(Math.random() * 100000000));

  if (giftCode.length < 8) {
    while (giftCode < 8) {
      giftCode = "0" + giftCode;
    }
  }

  // creating a 3 day expire date
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 3);

  // setting a new gift document inside the user gifts subcollection that has the giftcode,
  // giftbalance and expiryDate. The status is = to false its if the user completely finished
  // using it and used its for if the user used the code but the booking and the process
  // of the parking is still not finished
  db.collection("users").doc(data.uid).collection("gifts").doc().set({
    email: data.email,
    code: giftCode,
    giftBalance: data.giftBalance,
    status: false,
    expiryDate,
    used: false,
    race: [],
  });

  const response = await fetch(
    `https://us-central1-capstone2020-b64fd.cloudfunctions.net/sendMail?dest=${data.email}&sub=Gift Code&body=<p style="font-size: 16px;">You got a gift code worth ${giftBalance}QR from ${data.displayName}<br />Your Code is: ${giftCode}<br />The gift code will expire in 3 Days on ${expiryDate}</p>`
  );
});

// Maybe gonna remove these two

exports.updatePhoto = functions.https.onCall(async (data, context) => {
  console.log("updatePhoto data", data);
  await db.collection("users").doc(data.uid).update({
    profileBackground: data.profileBackground,
  });
});

// exports.updateDisplayName = functions.https.onCall(async (data, context) => {
//   console.log("updateDisplayName data", data);
//   const result = await admin.auth().updateUser(data.uid, {
//     displayName: data.displayName,
//   });

//   await db.collection("users").doc(data.uid).update({
//     displayName: data.displayName,
//   });
// });

exports.updateUserInfo = functions.https.onCall(async (data, context) => {
  const result = await admin.auth().updateUser(data.uid, {
    displayName: data.displayName,
    photoURL: data.photoURL,
  });

  await db.collection("users").doc(data.uid).update({
    displayName: data.displayName,
    photoURL: data.photoURL,
  });
  return result;
});

exports.addCar = functions.https.onCall(async (data, context) => {
  console.log("addCar data", data);

  if (data.selectedCar === 0) {
    await db.collection("users").doc(data.uid).collection("cars").add({
      brand: data.brand,
      plate: data.plate,
      model: data.model,
      isSelected: true,
    });
  } else {
    await db.collection("users").doc(data.uid).collection("cars").add({
      brand: data.brand,
      plate: data.plate,
      model: data.model,
      isSelected: false,
    });
  }
});

exports.initUser = functions.https.onRequest(async (request, response) => {
  console.log("request", request.query.uid);
  let result;
  if (request.query.role !== "guest") {
    result = await admin.auth().updateUser(request.query.uid, {
      displayName: request.query.displayName,
      photoURL:
        "https://toppng.com/uploads/preview/user-account-management-logo-user-icon-11562867145a56rus2zwu.png",
      phoneNumber: `+974${request.query.phoneNumber}`,
    });
    console.log("after set", result);
  }

  // generating a random 6 digit referralCode
  let referralCode = String(Math.floor(Math.random() * 1000000));

  while (referralCode.length < 6) {
    referralCode = "0" + referralCode;
  }

  const users = db.collection("users");

  const usersCollection = await users.get();
  const usersDocs = [];
  usersCollection.forEach((doc) => {
    usersDocs.push(doc.data().referralCode);
  });

  // checking if any other user has the generated referralCode and waiting because its
  // checking all the users document
  let refResult = usersDocs.includes(referralCode);
  // while there is any user with that referralCode it will generate a new code and try
  // again till it returns 0 documents

  while (refResult) {
    referralCode = String(Math.floor(Math.random() * 1000000));

    while (referralCode.length < 6) {
      referralCode = "0" + referralCode;
    }

    refResult = usersDocs.includes(referralCode);
  }
  let path = String(request.query.path);
  let accessDoc;
  if (request.query.role === "guest") {
    path = path.split("/");
    accessDoc = await db
      .collection(path[0])
      .doc(path[1])
      .collection(path[2])
      .doc(path[3])
      .get();
  }

  await db
    .collection("users")
    .doc(request.query.uid)
    .set({
      outstandingBalance: 0,
      balance:
        request.query.role === "guest" ? accessDoc.data().giftBalance : 0,
      email:
        request.query.role === "guest" ? accessDoc.data().email : result.email,
      role: request.query.role === "guest" ? "guest" : "customer",
      qrCode: `http://chart.apis.google.com/chart?cht=qr&chs=300x300&chl=${request.query.uid}`,
      displayName: request.query.displayName,
      phone: `+974${request.query.phoneNumber}`,
      referralCode,
      loyaltyCode: "",
      tokens: request.query.referralStatus === "true" ? 1 : 0,
      location: null,
      privacy: {
        emailP: false,
        nameP: false,
        locationP: false,
        carsP: false,
      },
      favorite: [],
      reputation: 0,
      points: 0,
      photoURL:
        "https://toppng.com/uploads/preview/user-account-management-logo-user-icon-11562867145a56rus2zwu.png",
      profileBackground:
        "https://c4.wallpaperflare.com/wallpaper/843/694/407/palm-trees-sky-sea-horizon-wallpaper-preview.jpg",
      activeRole: null,
    });

  if (request.query.referralStatus === "true") {
    const referralDoc = await users
      .where("referralCode", "==", request.query.referral)
      .get();
    referralDoc.forEach((doc) => {
      if (doc.data().email !== "DELETED") {
        db.collection("users").doc(doc.id).collection("referrer").doc().set({
          referrerCode: referralCode,
          status: false,
        });
      }
    });
  }

  response.send("All done ");
});

exports.addCard = functions.https.onCall(async (data, context) => {
  const result = await db
    .collection("users")
    .doc(data.uid)
    .collection("cards")
    .add(data.cardInfo);
  return result;
});

exports.deleteUser = functions.https.onRequest(async (request, context) => {
  await admin.auth().deleteUser(request.query.uid);

  response.send("All done");
});

exports.deleteCard = functions.https.onCall(async (data, context) => {
  const result = await db
    .collection("users")
    .doc(data.uid)
    .collection("cards")
    .doc(data.cardId)
    .delete();
  return result;
});

exports.sendMail = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    // getting dest email by query string
    const dest = request.query.dest;
    const sub = request.query.sub;
    const body = request.query.body;

    const mailOptions = {
      from: "Capstone Corona <capstonecorona@gmail.com>", // Something like: Jane Doe <janedoe@gmail.com>
      to: dest,
      subject: sub, // email subject
      html: body, // email content in HTML
    };

    // returning result
    return transporter.sendMail(mailOptions, (erro, info) => {
      if (erro) {
        return response.send(erro.toString());
      }
      return response.send("Sent");
    });
  });
});

exports.assetManager = functions.https.onCall(async (data, context) => {
  if (data.type === "add") {
    db.collection(data.collection).add(data.obj);
  } else if (data.type === "update") {
    db.collection(data.collection).doc(data.doc).set(data.obj);
  } else {
    db.collection(data.collection).doc(data.doc).delete();
  }
});

exports.editBooking = functions.https.onCall(async (data, context) => {
  var newAssetBooking = data.assetBooking;
  newAssetBooking.endDateTime = data.endDateTime;
  db.collection("payments").doc(data.paymentId).update({
    totalAmount: data.totalAmount,
    assetBooking: newAssetBooking,
    status: data.status,
  });
  db.collection("assets")
    .doc(data.assetBooking.asset.id)
    .collection("assetBookings")
    .doc(data.assetBooking.id)
    .update({ endDateTime: data.endDateTime });

  for (let i = 0; i < data.serviceBooking.length; i++) {
    var serviceBooking = {
      service: data.serviceBooking[i].service,
      assetBooking: newAssetBooking,
      dateTime: data.serviceBooking[i].day + "T" + data.serviceBooking[i].time,
      worker: data.serviceBooking[i].worker,
      completed: false,
    };

    var sId = "";
    var getServiceBookingId = db
      .collection("services")
      .doc(data.serviceBooking[i].service.id)
      .collection("serviceBookings")
      .add(serviceBooking)
      .then((docRef) => (sId = docRef.id));
    serviceBooking.id = sId;

    db.collection("users")
      .doc(data.serviceBooking[i].worker)
      .collection("schedules")
      .add({
        serviceBooking,
        dateTime:
          data.serviceBooking[i].day + "T" + data.serviceBooking[i].time,
        worker: data.serviceBooking[i].worker,
        completed: false,
      });
  }
});

exports.manageServices = functions.https.onCall(async (data, context) => {
  if (data.status === "add") {
    var sId = "";
    let add = await db
      .collection("services")
      .add(data.obj)
      .then((docRef) => (sId = docRef.id));
    for (let i = 0; i < data.weekDays.length; i++) {
      if (data.weekDays[i].hours.length > 0) {
        db.collection("services")
          .doc(sId)
          .collection("workingDays")
          .doc(data.weekDays.day)
          .set({ hours: data.weekDays[i].hours });
      }
    }
  }

  if (data.status === "update") {
    db.collection("services")
      .doc(data.selectedService.service.id)
      .update(data.obj);

    for (let i = 0; i < data.serviceWorkHoursDays.length; i++) {
      if (
        data.serviceWorkHoursDays[i].service === data.selectedService.service
      ) {
        for (
          let k = 0;
          k < data.serviceWorkHoursDays[i].workingDays.length;
          k++
        ) {
          if (data.serviceWorkHoursDays[i].workingDays[k].hours.length > 0) {
            db.collection("services")
              .doc(data.selectedService.service.id)
              .collection("workingDays")
              .doc(data.serviceWorkHoursDays[i].workingDays[k].day)
              .set({
                hours: data.serviceWorkHoursDays[i].workingDays[k].hours,
              });
          } else {
            db.collection("services")
              .doc(data.selectedService.service.id)
              .collection("workingDays")
              .doc(data.serviceWorkHoursDays[i].workingDays[k].day)
              .delete();
          }
        }
      }
    }
  }
});

exports.manageServiceWorkers = functions.https.onCall(async (data, context) => {
  db.collection("users").doc(data.user.id).update(data.user);
});
exports.addFriend = functions.https.onCall(async (data, context) => {
  console.log("data", data);
  db.collection("users")
    .doc(data.user.id)
    .collection("friends")
    .doc(data.friend.id)
    .set({
      displayName: data.friend.displayName,
      status: "pending",
      photoURL: data.friend.photoURL,
    });

  db.collection("users")
    .doc(data.friend.id)
    .collection("friends")
    .doc(data.user.id)
    .set({
      displayName: data.user.displayName,
      status: "requested",
      photoURL: data.user.photoURL,
    });
});

exports.acceptFriend = functions.https.onCall((data, context) => {
  console.log("data", data);
  db.collection("users")
    .doc(data.user.id)
    .collection("friends")
    .doc(data.friend.id)
    .update({ status: "accepted" });

  db.collection("users")
    .doc(data.friend.id)
    .collection("friends")
    .doc(data.user.id)
    .update({ status: "accepted" });
});

exports.removeFriend = functions.https.onCall((data, context) => {
  console.log("data", data);
  db.collection("users")
    .doc(data.user.id)
    .collection("friends")
    .doc(data.friend.id)
    .delete();

  db.collection("users")
    .doc(data.friend.id)
    .collection("friends")
    .doc(data.user.id)
    .delete();
});

exports.sendMessage = functions.https.onCall((data, context) => {
  console.log("data", data);
  console.log("new date", new Date());
  db.collection("chats").add({
    to: data.to,
    from: data.from,
    text: data.text,
    status: "unread",
    dateTime: new Date(),
  });
});
exports.handleBooking = functions.https.onCall(async (data, context) => {
  //user, asset, startDateTime, endDateTime, card, promotionCode,dateTime, status(true for complete, false for pay later), totalAmount
  //create booking
  console.log(" in functions");
  var assetBooking = {
    user: data.user,
    asset: data.asset,
    startDateTime: data.startDateTime,
    endDateTime: data.endDateTime,
  };
  var bId = "";
  var getId = await db
    .collection("assets")
    .doc(data.asset.id)
    .collection("assetBookings")
    .add(assetBooking)
    .then((docRef) => (bId = docRef.id));
  assetBooking.id = bId;
  console.log("booking added");
  for (let i = 0; i < data.serviceBooking.length; i++) {
    console.log("add service");
    var serviceBooking = {
      service: data.serviceBooking[i].service,
      assetBooking: assetBooking,
      dateTime: data.serviceBooking[i].day + "T" + data.serviceBooking[i].time,
      worker: data.serviceBooking[i].worker,
      completed: false,
    };
    //add service booking
    var sId = "";
    var getServiceBookingId = db
      .collection("services")
      .doc(data.serviceBooking[i].service.id)
      .collection("serviceBookings")
      .add(serviceBooking)
      .then((docRef) => (sId = docRef.id));
    serviceBooking.id = sId;
    //update worker schedule
    db.collection("users")
      .doc(data.serviceBooking[i].worker)
      .collection("schedules")
      .add({
        serviceBooking,
        dateTime:
          data.serviceBooking[i].day + "T" + data.serviceBooking[i].time,
        worker: data.serviceBooking[i].worker,
        completed: false,
      });
  }
  console.log("payment");
  db.collection("payments").add({
    user: data.user,
    card: data.card,
    assetBooking: assetBooking,
    serviceBooking: null,
    totalAmount: data.totalAmount,
    dateTime: data.dateTime,
    status: data.status,
    promotionCode: null,
  });
  // var u = data.user;
  // u.points = u.points + 10;
  db.collection("users").doc(data.user.id).update(data.user);

  if (data.addCreditCard) {
    db.collection("users").doc(data.uid).collection("cards").add(data.card);
  }
});

exports.handlePointsExchange = functions.https.onCall(async (data, context) => {
  db.collection("users").doc(data.user.id).update(data.user);
});
exports.createEmployee = functions.https.onCall(async (data, context) => {
  // ---------------------------------Referral Code---------------------------------
  // generating a random 6 digit referralCode
  let referralCode = String(Math.floor(Math.random() * 1000000));

  while (referralCode.length < 6) {
    referralCode = "0" + referralCode;
  }

  const usersCollection = await db.collection("users").get();
  const usersDocs = [];
  usersCollection.forEach((doc) => {
    usersDocs.push(doc.data().referralCode);
  });

  // checking if any other user has the generated referralCode and waiting because its
  // checking all the users document
  let refResult = usersDocs.includes(referralCode);
  // while there is any user with that referralCode it will generate a new code and try
  // again till it returns 0 documents

  while (refResult) {
    referralCode = String(Math.floor(Math.random() * 1000000));

    while (referralCode.length < 6) {
      referralCode = "0" + referralCode;
    }

    refResult = usersDocs.includes(referralCode);
  }

  // ----------------------------------Creation--------------------------------
  let password = Math.random().toString(36).slice(-8);

  let account = await admin.auth().createUser({
    email: data.email,
    password,
  });

  await db
    .collection("users")
    .doc(account.uid)
    .set({
      activeRole: null,
      firstName: data.firstName,
      lastName: data.lastName,
      country: data.country,
      dateOfBirth: data.dateOfBirth,
      outstandingBalance: 0,
      balance: 0,
      email: data.email,
      role:
        data.role === "manager" || data.role.slice(-7) === "handler"
          ? `${data.role} (request)`
          : `${data.role} (incomplete)`,
      qrCode: `http://chart.apis.google.com/chart?cht=qr&chs=300x300&chl=${account.uid}`,
      displayName: data.displayName,
      phone: null,
      referralCode,
      loyaltyCode: "",
      tokens: 0,
      location: null,
      privacy: {
        emailP: false,
        nameP: false,
        locationP: false,
        carsP: false,
      },
      favorite: [],
      reputation: 0,
      points: 0,
      photoURL:
        "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png",
      profileBackground:
        "https://c4.wallpaperflare.com/wallpaper/843/694/407/palm-trees-sky-sea-horizon-wallpaper-preview.jpg",
    });

  return { id: account.uid, password };
});

exports.updatePassword = functions.https.onCall(async (data, context) => {
  console.log("updatePassword data", data);
  const result = await admin.auth().updateUser(data.user.id, {
    password: data.password,
  });
  console.log("after set", result);
});

exports.getAllUndoneUsers = functions.https.onCall(async (data, context) => {
  let listResult = await admin.auth().listUsers();
  let users = [];
  listResult.users.forEach((user) => {});
});

exports.resetEmployeePassword = functions.https.onCall(
  async (data, context) => {
    let password = Math.random().toString(36).slice(-8);
    let role = data.user.role;
    if (data.user.role.slice(-12) !== "(incomplete)") {
      role = role + " (incomplete)";
    }

    const result = await admin.auth().updateUser(data.user.id, {
      password,
    });

    await db.collection("users").doc(data.user.id).update({ role });

    console.log("result", result);
    return { password };
  }
);

exports.setEmployeeAuthentication = functions.https.onCall(
  async (data, context) => {
    console.log("setEmployeeAuthentication data", data);
    const result = await admin.auth().updateUser(data.user.id, {
      password: data.password,
    });

    let role = data.user.role.slice(0, data.user.role.length - 13);

    await db
      .collection("users")
      .doc(data.user.id)
      .update({ role, phone: `+974${data.phone}`, activeRole: role });
    console.log("after set", result);
  }
);

exports.allowEmployeeCreation = functions.https.onCall(
  async (data, context) => {
    console.log("managerAllow data", data);
    let role = data.user.role.slice(0, data.user.role.length - 10);
    let result = await db
      .collection("users")
      .doc(data.user.id)
      .update({ role: `${role} (allowed)` });
    console.log("after set", result);
  }
);

exports.roleToIncomplete = functions.https.onCall(async (data, context) => {
  console.log("managerAllow data", data);
  let role = data.user.role.slice(0, data.user.role.length - 10);
  let result = await db
    .collection("users")
    .doc(data.user.id)
    .update({ role: `${role} (incomplete)` });
  console.log("after set", result);
});

exports.testJose = functions.https.onCall(async (data, context) => {
  console.log("testJose data", data);
  console.log("testJose it started");
  let passwordCode = Math.random().toString(36).slice(-8);
  let doc = await db
    .collection("users")
    .doc(firebase.auth().currentUser.uid)
    .get();

  let resetPasswordArr;
  if (
    doc.data().resetPassword === undefined ||
    doc.data().resetPassword === null
  ) {
    resetPasswordArr = [];
  }

  resetPasswordArr = doc.data().resetPassword;

  db.collection("users")
    .doc(data.id)
    .update({ resetPassword: true, passwordCode });

  setTimeout(() => {
    db.collection("users")
      .doc(data.id)
      .update({ resetPassword: false, passwordCode: null });
    console.log("testJose it's done");
  }, 1000 * 10);
  // let userId = data.id;
  // let additionalClaims = {
  //   done: false,
  // };
  // let response = await admin.auth().createCustomToken(userId, additionalClaims);
  // console.log("response", response);
  // Set admin privilege on the user corresponding to uid.
  // try {
  //   let response = await admin
  //     .auth()
  //     .setCustomUserClaims(data.id, { admin: true });
  //   console.log(response);
  // } catch (error) {
  //   console.log(error);
  // }
  // let userId = data.id;
  // let additionalClaims = {
  //   premiumAccount: true,
  // };

  // admin
  //   .auth()
  //   .createCustomToken(userId, additionalClaims)
  //   .then(function (customToken) {
  //     return customToken;
  //   })
  //   .catch(function (error) {
  //     console.log("Error creating custom token:", error);
  //   });
});

exports.deleteFavorite = functions.https.onCall(async (data, context) => {
  console.log("deleteFavorite   ", data);
  const res = await db
    .collection("users")
    .doc(data.uid)
    .collection("favorites")
    .doc(data.assetId)
    .delete();
  return res;
});

exports.addFavorite = functions.https.onCall(async (data, context) => {
  // const user = (await db.collection("users").doc(data.uid).get()).data();
  // const userFavorite = user.favorite;
  // if (userFavorite.includes(data.assetId)) return "Exists";

  // userFavorite.push(data.assetId);
  // const response = await db.collection("users").doc(data.uid).update({
  //   favorite: userFavorite,
  // });
  // return response;
  console.log("data", data);
  const status = await checkFavorites(data.uid, data.asset.id);
  console.log("status", status);
  if (!status) {
    const response = await db
      .collection("users")
      .doc(data.uid)
      .collection("favorites")
      .doc(data.asset)
      .set({ asset: data.asset });
    console.log("response ", response);
    return response;
  } else {
    return "Exists";
  }
});

const checkFavorites = async (id, assetId) => {
  console.log("id ,", id);
  const favorites = await db
    .collection("users")
    .doc(id)
    .collection("favorites")
    .get();
  const ids = [];
  favorites.forEach((doc) => {
    ids.push(doc.id);
  });
  console.log("ids ", ids);
  return ids.includes(assetId);
};

exports.getAdmin = functions.https.onCall(async (data, context) => {
  if (context.auth.token.moderator !== true) {
    return {
      error:
        "Request Not authorized. User must be an admin to make this request",
    };
  }
  const email = data.email;
  return grantAdminRole(email).then(async () => {
    const user = await admin.auth().getUserByEmail(email);
    return {
      result: user.customClaims,
    };
  });
});

exports.makeAdmin = functions.https.onCall(async (data, context) => {
  const email = data.email;
  console.log(email);
  return grantAdminRole(email).then(async () => {
    const user = await admin.auth().getUserByEmail(email);
    console.log("user", user);
    return {
      result: user.customClaims,
    };
  });
});

async function grantAdminRole(email) {
  const user = await admin.auth().getUserByEmail(email);

  return admin.auth().setCustomUserClaims(user.uid, {
    moderator: true,
  });
}
exports.giftsExpCheck = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("Asia/Qatar")
  .onRun(async (context) => {
    const result = await db
      .collectionGroup("gifts")
      .where("expiryDate", "<=", new Date())
      .where("status", "==", false)
      .get();
    result.forEach((doc) => {
      const path = doc.ref.path.split("/");
      const giftBalance = doc.data().giftBalance;
      const increment = admin.firestore.FieldValue.increment(giftBalance);

      db.collection("users").doc(path[1]).update({ balance: increment });

      console.log(doc.data(), "Deleted");
      doc.ref.delete();
    });
    return null;
  });

exports.deleteGuestUser = functions.https.onRequest(
  async (request, response) => {
    db.collection("users").doc(request.query.uid).update({
      displayName: "DELETED",
      email: "DELETED",
      phone: "DELETED",
      photoURL:
        "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png",
      profileBackground:
        "https://c4.wallpaperflare.com/wallpaper/843/694/407/palm-trees-sky-sea-horizon-wallpaper-preview.jpg",
      location: null,
      qrCode: "",
    });
    await admin.auth().deleteUser(request.query.uid);

    response.send("All done");
  }
);
//-------------Ticket---------------//
exports.sendSupportMessage = functions.https.onCall(async (data, context) => {
  console.log("data", data);
  db.collection("customerSupport")
    .doc(data.ticket.id)
    .collection("liveChat")
    .add({
      from: data.user.id,
      name: data.user.displayName,
      text: data.text,
      dateTime: new Date(),
    });
});
exports.addTicket = functions.https.onCall(async (data, context) => {
  console.log("data", data);
  const response = await db.collection("customerSupport").add({
    userId: data.user.id,
    title: data.title,
    description: data.description,
    dateOpen: new Date(),
    dateClose: "",
    target: data.selectedValue,
    status: "pending",
    state: "onView",
    supportAgentUid: "",
    agentsContributed: [],
    extraInfo: data.other,
    priority: data.priority,
  });
  response.collection("liveChat").add({
    from: "Auto Reply",
    name: "Support Bot",
    text: "Please wait until a Support Agent Joins!",
    dateTime: new Date(),
  });
  return response;
});
exports.updateTicket = functions.https.onCall(async (data, context) => {
  console.log("data", data);
  if (data.query === "take") {
    db.collection("customerSupport").doc(data.ticket.id).update({
      status: "in Process",
      supportAgentUid: data.user.id,
      agentsContributed: data.agents,
    });
  } else if (data.query === "Approve") {
    db.collection("customerSupport").doc(data.ticket.id).update({
      reportedUserUid: data.target,
      dateClose: new Date(),
      status: "Closed",
      state: "Approved",
    });
  } else if (data.query === "close") {
    db.collection("customerSupport").doc(data.ticket.id).update({
      status: "Closed",
      dateClose: new Date(),
      state: "Approved",
    });
  } else if (data.query === "transfare") {
    db.collection("customerSupport").doc(data.ticket.id).update({
      supportAgentUid: data.user.id,
      agentsContributed: data.agents,
    });
  }
});
//--------------FAQ---------------//
exports.FAQ = functions.https.onCall(async (data, context) => {
  console.log("data", data);
  if (data.query === "update") {
    db.collection("faq").doc(data.id).update({
      answer: data.answer,
      answeredBy: data.answeredBy,
      status: "approved",
    });
  }
  if (data.query === "create") {
    db.collection("faq").add({
      date: new Date(),
      question: data.question,
      userId: data.user.id,
      userDisplayName: data.user.displayName,
      answer: "",
      answeredBy: "",
      status: "pending",
    });
  }
  if (data.query === "delete") {
    db.collection("faq").doc(data.id).delete();
  }
});
//----------Reputation------------//
exports.ReputationCalculation = functions.pubsub
  .schedule("every 43800 minutes")
  .onRun(async (context) => {
    let users = [];
    const info = await db.collection("users").get();
    info.forEach((doc) => {
      users.push({ id: doc.id, reputation: doc.data().reputation });
    });
    console.log("Fetched Users", users);
    users.forEach(async (user) => {
      console.log("Fetched User", user);
      const reports = await db
        .collectionGroup("customerSupport")
        .where("reportedUserId", "==", user.id)
        .where("state", "==", "Approved")
        .get();
      console.log("Report Index", reports);
      if (reports.size !== 0) {
        reports.forEach(async (report) => {
          let msDiff =
            report.dateClosed.toDate().getTime() - new Date().getTime();
          let calculatedDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));
          if (calculatedDiff > -30) {
            await db
              .collection("users")
              .doc(user.id)
              .update({
                reputation: user.reputation - 1,
              });
          }
        });
      } else {
        await db
          .collection("users")
          .doc(user.id)
          .update({
            reputation: user.reputation + 1,
          });
      }
    });
    return null;
  });
//--------------------------------//

exports.redeemGiftCode = functions.https.onRequest(
  async (request, response) => {
    let path = String(request.query.path);
    path = path.split("/");
    let giftDoc = await db
      .collection(path[0])
      .doc(path[1])
      .collection(path[2])
      .doc(path[3])
      .get();
    await giftDoc.ref.update({
      status: true,
      race: admin.firestore.FieldValue.arrayUnion(request.query.uid),
    });

    giftDoc = await db
      .collection(path[0])
      .doc(path[1])
      .collection(path[2])
      .doc(path[3])
      .get();

    if (giftDoc.data().race[0] === request.query.uid) {
      const userDoc = await db.collection("users").doc(request.query.uid).get();
      const increment = admin.firestore.FieldValue.increment(
        giftDoc.data().giftBalance
      );
      userDoc.ref.update({ balance: increment });

      response.send("true");
    } else {
      response.send("false");
    }
  }
);

exports.resetUserPassword = functions.https.onCall(async (data, context) => {
  const result = await admin.auth().updateUser(data.user.id, {
    password: data.password,
  });

  return { result };
});

exports.adminUpdateUser = functions.https.onCall(async (data, context) => {
  if (data.user.email !== data.email) {
    await admin.auth().updateUser(data.user.id, {
      email: data.email,
      emailVerified: true,
    });
  }
  if (data.user.displayName !== data.displayName) {
    await admin.auth().updateUser(data.user.id, {
      displayName: data.displayName,
    });
  }
  if (data.user.phone !== data.phone) {
    await admin.auth().updateUser(data.user.id, {
      phoneNumber: "+974" + data.phone,
    });
  }

  db.collection("users")
    .doc(data.user.id)
    .update({
      role: data.selectedRole,
      email: data.email,
      displayName: data.displayName,
      phone: "+974" + data.phone,
      balance: parseInt(data.balance),
      tokens: parseInt(data.tokens),
      reputation: parseInt(data.reputation),
    });
});

exports.updateToRead = functions.https.onCall(async (data, context) => {
  console.log("updateToRead data", data);
  const response = await data.messages.forEach((message) =>
    db.collection("chats").doc(message.id).update({ status: "read" })
  );
  console.log("after update", response);
});

exports.deleteCar = functions.https.onCall(async (data, context) => {
  console.log("delete car ", data);
  const response = await db
    .collection("users")
    .doc(data.uid)
    .collection("cars")
    .doc(data.carId)
    .delete();
  console.log(response);
});

exports.addPromotion = functions.https.onCall(async (data, context) => {
  console.log("addPromotion", data);
  const response = await db.collection("promotionCodes").add({
    code: data.code,
    expiryDate: new Date(data.expiry),
    percentage: data.percentage,
  });
  return response;
});

exports.deletePromotion = functions.https.onCall(async (data, context) => {
  console.log("delete promotion ", data);
  const response = await db.collection("promotionCodes").doc(data.id).delete();
  return response;
});

exports.sendResetPassCode = functions.https.onCall(async (data, context) => {
  console.log("sendResetPassCode data", data);

  let doc = await db
    .collection("users")
    .doc(data.id)
    // .doc(firebase.auth().currentUser.uid)
    .get();

  let resetPasswordArr = doc.data().resetPassword;
  console.log(resetPasswordArr);
  // if never done it or null
  if (resetPasswordArr === undefined || resetPasswordArr === null) {
    resetPasswordArr = [];
  }
  // if more than one code submitted expire all
  if (resetPasswordArr.length > 0) {
    resetPasswordArr.map((item) => {
      item.expired = true;
      return item;
    });
  }
  let passwordCode = Math.random().toString(36).slice(-8);
  let passCode = { passwordCode, expired: false };
  resetPasswordArr.push(passCode);
  let body = `<p style="font-size: 16px;">Enter the code below to reset your password</p><p style="font-size: 32px;">${passwordCode}</p>`;
  const response = await fetch(
    `https://us-central1-capstone2020-b64fd.cloudfunctions.net/sendMail?dest=${
      doc.data().email
    }&sub=Reset Password&body=${body}`
  );
  // console.log(resetPasswordArr);
  db.collection("users")
    .doc(data.id)
    // .doc(firebase.auth().currentUser.uid)
    .update({ resetPassword: resetPasswordArr });
  setTimeout(async () => {
    let doc = await db
      .collection("users")
      .doc(data.id)
      // .doc(firebase.auth().currentUser.uid)
      .get();
    let resetPasswordArr = doc.data().resetPassword;
    resetPasswordArr.shift();
    if (resetPasswordArr.length === 0) {
      resetPasswordArr = null;
    }
    db.collection("users")
      .doc(data.id)
      // .doc(firebase.auth().currentUser.uid)
      .update({ resetPassword: resetPasswordArr });
    console.log("testJose it's done");
  }, 1000 * 120);
});
