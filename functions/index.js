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

exports.initUser = functions.https.onRequest(async (request, response) => {
  console.log("request", request.query.uid);
  const email = (await admin.auth().getUser(request.query.uid)).email.split(
    "@"
  );

  const result = await admin.auth().updateUser(request.query.uid, {
    displayName: request.query.displayName,
    photoURL:
      "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png",
    phoneNumber: `+974${request.query.phoneNumber}`,
  });
  console.log("after set", result);

  const listUsersResult = await admin.auth().listUsers(1000);

  listUsersResult.users.forEach((userRecord) => {
    console.log("user", userRecord.toJSON());
  });

  response.send("All done ");
});

exports.addCard = functions.https.onCall(async (data, response) => {
  db.collection("users").doc(data.uid).collection("cards").add(data.cardInfo);
});

exports.deleteUser = functions.https.onRequest(async (request, response) => {
  await admin.auth().deleteUser(request.query.uid);

  response.send("All done");
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



exports.handleBooking = functions.https.onCall(async (data, context) => {
  //user, asset, startDateTime, endDateTime, card, promotionCode,dateTime, status(true for complete, false for pay later), totalAmount
  //create booking
  console.log(" in functions")
  var assetBooking = {
    user: data.user,
    asset: data.asset,
    startDateTime: data.startDateTime,
    endDateTime: data.endDateTime,
  }
  var bId= ""
  var getId = await db.collection("assets").doc(data.asset.id).collection("assetBookings").add(assetBooking).then(docRef => 
    bId = docRef.id
  )
  assetBooking.id = bId
 console.log("booking added")
  for( let i =0 ; i < data.serviceBooking.length ; i++){
    console.log("add service")
    var serviceBooking = {
      service:data.serviceBooking[i].service,
    assetBooking: assetBooking,
    dateTime: data.serviceBooking[i].day+"T"+data.serviceBooking[i].time,
    worker:data.serviceBooking[i].worker,
    completed: false
    }
    //add service booking
    var sId= ""
    var getServiceBookingId = db.collection("services").doc(data.serviceBooking[i].service.id).collection("serviceBookings").add(serviceBooking).then(docRef => 
      sId = docRef.id
    )
    serviceBooking.id = sId
    //update worker schedule
    db.collection("users").doc(data.serviceBooking[i].worker).collection("schedules").add({
      serviceBooking,
      dateTime: data.serviceBooking[i].day+"T"+data.serviceBooking[i].time,
      worker:data.serviceBooking[i].worker,
      completed: false
    })
  }
console.log("payment")
  db.collection("payments")
        .add({
          user: data.user,
          card:data.card,
          assetBooking:assetBooking,
          serviceBooking: null,
          totalAmount: data.totalAmount,
          dateTime: data.dateTime,
          status: data.status,
          promotionCode: null,
        });

  if( data.addCreditCard){
    db.collection("users").doc(data.uid).collection("cards").add(data.card)
  }
});