import firebase from "firebase/app";
import "firebase/firestore";

export const config = {
  apiKey: "AIzaSyCNgNO3plGbuqqepOxMbldcI_k-sHStZ0c",
  authDomain: "capstone2020-b64fd.firebaseapp.com",
  databaseURL: "https://capstone2020-b64fd.firebaseio.com",
  projectId: "capstone2020-b64fd",
  storageBucket: "capstone2020-b64fd.appspot.com",
  messagingSenderId: "930744827368",
  appId: "1:930744827368:web:6f2a6287721546d272785d",
};

firebase.initializeApp(config);

export default firebase.firestore();
