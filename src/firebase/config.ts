import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAzaLcm2_EozzMFaMzQjnMeKKhHS9C46WI",
    authDomain: "mispagos-33c6c.firebaseapp.com",
    projectId: "mispagos-33c6c",
    storageBucket: "mispagos-33c6c.firebasestorage.app",
    messagingSenderId: "81257150048",
    appId: "1:81257150048:web:2f0fadc1c220cc684e3505",
    measurementId: "G-N54Q9FRRK8"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const firestore = firebase.firestore();

export { firebase, auth, firestore };
