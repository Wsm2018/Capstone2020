const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });

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

  const result = await admin.auth().updateUser(request.query.uid, {
    displayName: request.query.displayName,
    photoURL:
      "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png",
    phoneNumber: `+974${request.query.phoneNumber}`,
  });
  console.log("after set", result);

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

  await db
    .collection("users")
    .doc(request.query.uid)
    .set({
      outstandingBalance: 0,
      balance: 0,
      email: result.email,
      role: "user",
      qrCode: "",
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
        "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png",
      profileBackground:
        "https://c4.wallpaperflare.com/wallpaper/843/694/407/palm-trees-sky-sea-horizon-wallpaper-preview.jpg",
    });

  if (request.query.referralStatus === "true") {
    const referralDoc = await users
      .where("referralCode", "==", request.query.referral)
      .get();
    referralDoc.forEach((doc) => {
      db.collection("users").doc(doc.id).collection("referrer").doc().set({
        referrerCode: referralCode,
        status: false,
      });
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

exports.addFriend = functions.https.onCall(async (data, context) => {
  console.log("data", data);
  db.collection("users")
    .doc(data.user.id)
    .collection("friends")
    .doc(data.friend.id)
    .set({ displayName: data.friend.displayName, status: "pending" });

  db.collection("users")
    .doc(data.friend.id)
    .collection("friends")
    .doc(data.user.id)
    .set({ displayName: data.user.displayName, status: "requested" });
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
    dateTime: new Date(),
  });
});

exports.handleBooking = functions.https.onCall(async (data, context) => {
  //user, asset, startDateTime, endDateTime, card, promotionCode,dateTime, status(true for complete, false for pay later), totalAmount
  //create booking
  var booking = {
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
    .add(booking)
    .then((docRef) => (bId = docRef.id));

  booking.id = bId;

  db.collection("payments").add({
    user: data.user,
    card: data.card,
    assetBooking: booking,
    serviceBooking: null,
    totalAmount: data.totalAmount,
    dateTime: data.dateTime,
    status: data.status,
    promotionCode: null,
  });

  if (data.addCreditCard) {
    db.collection("users").doc(data.uid).collection("cards").add(data.card);
  }
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
      outstandingBalance: 0,
      balance: 0,
      email: data.email,
      role: data.role + "undone",
      qrCode: "",
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
  const result = await admin.auth().updateUser(data.id, {
    password: data.password,
  });
  console.log("after set", result);
});

exports.getAllUndoneUsers = functions.https.onCall(async (data, context) => {
  let listResult = await admin.auth().listUsers();
  let users = [];
  listResult.users.forEach((user) => {});
});

exports.test = functions.https.onCall(async (data, context) => {
  console.log("data.id", data.id);
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
  let userId = data.id;
  let additionalClaims = {
    premiumAccount: true,
  };

  admin
    .auth()
    .createCustomToken(userId, additionalClaims)
    .then(function (customToken) {
      return customToken;
    })
    .catch(function (error) {
      console.log("Error creating custom token:", error);
    });
});
