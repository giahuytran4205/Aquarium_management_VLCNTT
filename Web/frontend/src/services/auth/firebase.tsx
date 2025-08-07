import { getAuth, onAuthStateChanged, type User } from "@firebase/auth";
import { initializeApp } from "firebase/app";
import { useEffect, useState } from "react";

const firebaseConfig = {
    apiKey: "AIzaSyAWcAfNuADcWS0823_2iYnUaQYOy-kVHuo",
    authDomain: "aquarium-app-d2b00.firebaseapp.com",
    projectId: "aquarium-app-d2b00",
    storageBucket: "aquarium-app-d2b00.firebasestorage.app",
    messagingSenderId: "269471665026",
    appId: "1:269471665026:web:45db3337c4d8d199b61d9b",
    measurementId: "G-KDJ5EJRXS8"
};

export const app = initializeApp(firebaseConfig);

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

    return [ user, loading ];
}