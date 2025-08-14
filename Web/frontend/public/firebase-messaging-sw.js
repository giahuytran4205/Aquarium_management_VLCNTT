importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCBVeLPpt2PvafCImkZPdzSD7skUuXFVBQ",
    authDomain: "aquarium-b645f.firebaseapp.com",
    projectId: "aquarium-b645f",
    storageBucket: "aquarium-b645f.firebasestorage.app",
    messagingSenderId: "191975887333",
    appId: "1:191975887333:web:cd31a3dc32980b14481f0c",
    measurementId: "G-V4KK2CDKTS"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();


messaging.onBackgroundMessage((payload) => {
  console.log("📩 Received background message ", payload);
  console.log(Notification.permission);

// self.registration.showNotification("Tiêu đề test", { body: "Nội dung test" });

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    // icon: "/icon.png"
  });
});


// import { getMessaging, onMessage } from "firebase/messaging";

// const messaging = getMessaging();
messaging.onMessage((payload) => {
  console.log('Message received. ');
  // self.registration.showNotification(payload.notification.title, {
  //   body: payload.notification.body,
  //   // icon: "/icon.png"
  // });
});
