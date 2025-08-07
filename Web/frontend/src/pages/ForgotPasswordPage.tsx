import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import "./ForgotPasswordPage.css"
import { useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { FirebaseError } from "@firebase/util";

const auth = getAuth();

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        resetPassword(email);
    }

    async function resetPassword(email: string) {
        await sendPasswordResetEmail(auth, email)
        .then(() => {
            navigate("/auth/login");
        })
        .catch((error) => {
            if (error instanceof FirebaseError && error.code === "auth/invalid-email") {

            }
        })
    }

    return (
        <div className="forgot-password-page">
            <form className="glassmorphism" onSubmit={handleSubmit}>
                <Input label="Email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                <Button type="submit">Send code</Button>
            </form>
        </div>
    )
}