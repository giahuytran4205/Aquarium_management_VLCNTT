import { getAuth, onAuthStateChanged, type User } from "@firebase/auth";
import { initializeApp } from "firebase/app";
import { useEffect, useState } from "react";
// Import SDK Firebase
// import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDyuUQeWWoiWRq3ypT0qIVYiB487Gkt6_w",
    authDomain: "fishinwater-ae103.firebaseapp.com",
    projectId: "fishinwater-ae103",
    storageBucket: "fishinwater-ae103.firebasestorage.app",
    messagingSenderId: "185241742223",
    appId: "1:185241742223:web:1891bf099c9f22342fb9fa"
};

export const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);



export function useFirebaseToken() {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const t = await user.getIdToken();
                setToken(t);
            } else {
                setToken(null);
            }
        });

        return () => unsubscribe();
    }, []);

    return token;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsub = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return [user, loading];
}

export async function requestFCMToken() {
    try {
        const token = await getToken(messaging, {
            vapidKey: "BPVCartrgjs0b7iBfjWWlihHlSw70FMyHIIRynFMoKufzCqJUO6LbfbnJ75VKYH-YTtPL2zxVDCjN8Wcuo7YkZM"
        });
        if (token) {
            console.log("FCM Token:", token);
            // Gửi token này lên backend để lưu vào DB
            await fetch("http://localhost:3000/api/save-fcm-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            });
        } else {
            console.warn("Không lấy được FCM token, cần cho phép thông báo");
        }
    } catch (err) {
        console.error("Lỗi khi lấy FCM token:", err);
    }
}

const VAPID_KEY = "BPVCartrgjs0b7iBfjWWlihHlSw70FMyHIIRynFMoKufzCqJUO6LbfbnJ75VKYH-YTtPL2zxVDCjN8Wcuo7YkZM"

export async function requestPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("Notification permission not granted.");
            return null;
        }

        const messaging = getMessaging(app);
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });

        console.log("FCM Token:", token);
        // TODO: Gửi token này lên backend để lưu lại gắn với user
        return token;
    } catch (err) {
        console.error("Error getting FCM token", err);
        return null;
    }
}
