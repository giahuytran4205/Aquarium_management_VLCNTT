import "./LoginPage.css";
import { app, requestPermission } from "../services/auth/firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { isSafari } from "../utils/browser";
import Input from "../components/Input";
import Button from "../components/Button";
import { useEffect, useState } from "react";
import { FirebaseError } from "@firebase/util";
import Dialog, { cancelNotification, showNotification } from "../components/Dialog";
import LoaderCircle from "../components/LoaderCircle";
import { Check, CircleX, X } from "lucide-react";

const auth = getAuth(app);

export default function LoginPage() {
    const navigate = useNavigate();
    const [state, setState] = useState<"idle" | "pending" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailWarning, setEmailWarning] = useState("");
    const [passwordWaring, setPasswordWarning] = useState("");

    useEffect(() => {
        if (email !== "")
            setEmailWarning("");
        if (password !== "")
            setPasswordWarning("");

    }, [email, password])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (email === "" || password === "") {
            if (email === "") {
                setEmailWarning("Email cannot be empty");
            }
            if (password === "") {
                setPasswordWarning("Password cannot be empty");
            }
            return;
        }

        setState("pending");
        await signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // Signed in
                setState("success");
                // alert("login ok");

                const fcmToken = await requestPermission();
                // alert(fcmToken);
                console.log(fcmToken);

                if (fcmToken) {
                    // Gửi token này lên backend
                    await fetch(`http://localhost:3000/api/save-fcm-token`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${await userCredential.user.getIdToken()}`
                        },
                        body: JSON.stringify({ fcmToken })
                    });
                    console.log("Sent");
                }

                navigate("/aquarium-status");
            })
            .catch((error) => {
                setState("error");
                if (error instanceof FirebaseError && error.code === "auth/invalid-credential")
                    setMessage("Wrong email or password. Please try again.");
                else
                    setMessage("Error! Please try again.");
            });
    }

    function handleFocus(e: React.FocusEvent) {
        if (isSafari())
            return;

        setTimeout(() => {
            e.preventDefault();
            e.target.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }, 1000);
    }

    function handleState() {
        if (state === "pending") {
            const children = (
                <>
                    <LoaderCircle />
                    Processing
                </>
            );
            showNotification({ children: children, style: { gap: "10px" } });
        }
        if (state === "success") {
            setState("idle");
            const children = (
                <>
                    <Check />
                    Logged in
                </>
            )
            showNotification({ children: children, duration: 1000, style: { gap: "10px" } });

        }
        if (state === "error") {
            const children = (
                <>
                    <X />
                    Error
                </>
            )
            showNotification({ children: children, duration: 1000, style: { gap: "10px" } });
        }
    }

    useEffect(handleState, [state]);

    return (
        <div className="login-page">
            <form className="glassmorphism login-form" onSubmit={handleSubmit}>
                <Input label="Email" name="email" type="email" value={email} onFocus={handleFocus} warning={emailWarning}
                    onChange={e => setEmail(e.target.value)}
                />
                <Input label="Password" name="password" type="password" value={password} onFocus={handleFocus} warning={passwordWaring}
                    onChange={e => setPassword(e.target.value)}
                />
                <p className="warning">{message}</p>
                <Button type="submit">Login</Button>
                <div>
                    <a className="link" href="/auth/forgot-password">Forgot password?</a>
                </div>
            </form>
            <div>
                Don't you have any account?{' '}
                <a className="link" href="/auth/sign-up">Sign up</a>
            </div>
        </div>
    );
}
