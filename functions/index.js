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
