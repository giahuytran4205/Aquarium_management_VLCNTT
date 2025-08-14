import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import Button from "../components/Button";
import Input from "../components/Input";
import "./SignUpPage.css";
import { FirebaseError } from "@firebase/util";
import Dialog, { showNotification } from "../components/Dialog";
import LoaderCircle from "../components/LoaderCircle";
import { Check, CircleX } from "lucide-react";
import { useNavigate } from "react-router-dom";


const auth = getAuth();

export default function SignUpPage() {
    const [state, setState] = useState<"idle" | "pending" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [reEnterPassword, setReEnterPassword] = useState("");
    const [passwordWarning, setPasswordWarning] = useState("");
    const [reEnterPasswordWarning, setReEnterPasswordWarning] = useState("");
    const [agreePolicy, setAgreePolicy] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        setReEnterPasswordWarning(password !== reEnterPassword ? "Re-enter password is incorrect" : "");
        setPasswordWarning(password.length > 0 && password.length < 6 ? "Password is too weak (at least 6 characters)" : "");
    }, [password, reEnterPassword]);

    function isFormValid() {
        return (password.length >= 6 && agreePolicy)
    }

    async function register(email: string, password: string) {
        if (!isFormValid())
            return;

        setState("pending");
        await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            setState("success");
            navigate("/auth/login");
        })
        .catch((error) => {
            if (error instanceof FirebaseError) {
                if (error.code === "auth/email-already-in-use") {
                    setMessage("Email already in use.");
                } else if (error.code === "auth/invalid-email") {
                    setMessage("Invalid email.");
                } else if (error.code === "auth/weak-password") {
                    setMessage("");
                } else {
                    setMessage("Error! Please try again.");
                }
            }
        });
    }

    function handleSubmit(e: React.FormEvent<HTMLDivElement>) {
        e.preventDefault();
        register(email, password);
    }

    function handleState() {
        if (state === "pending") {
            const children = (
                <>
                    <LoaderCircle />
                    Processing
                </>
            );
            showNotification({ children: children, style: {gap: "10px"} });
        }
        if (state === "success") {
            setState("idle");
            const children = (
                <>
                    <Check />
                    Success. Login to your account.
                </>
            )
            showNotification({ children: children, duration: 1000, style: {gap: "10px"} });
        }
        if (state === "error") {
            const children = (
                <>
                    <CircleX />
                    Success. Login to your account.
                </>
            )
            showNotification({ children: children, duration: 1000, style: {gap: "10px"} });
        }
    }

    useEffect(handleState, [state]);

    return (
        <div className="sign-up-page" onSubmit={handleSubmit}>
            <form className="sign-up-form">
                <Input label="Email" name="email" type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <Input label="Password" name="password" type="password" value={password}
                    warning={passwordWarning}
                    onChange={e => setPassword(e.target.value)}
                />
                <Input label="Re-enter password" name="re-enter-password" type="password" value={reEnterPassword}
                    warning={reEnterPasswordWarning}
                    onChange={e => setReEnterPassword(e.target.value)}
                />
                <Input label="Agree to our Terms & Privacy Policy" name="policy" type="checkbox" labelPos="last" 
                    checked={agreePolicy}
                    labelStyle={{
                        fontSize: "10px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center"
                    }}
                    onChange={e => setAgreePolicy(e.target.checked)}
                />
                <p className="warning">{message}</p>
                <Button type="submit" disabled={!agreePolicy}>Sign up</Button>
            </form>
        </div>
    );
}