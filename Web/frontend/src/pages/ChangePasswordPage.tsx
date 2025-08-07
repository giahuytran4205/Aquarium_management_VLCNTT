import { useEffect, useState } from "react";
import Input from "../components/Input";
import "./ChangePasswordPage.css"
import Button from "../components/Button";
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { FirebaseError } from "@firebase/util";
import Dialog, { cancelNotification, showNotification } from "../components/Dialog";
import LoaderCircle from "../components/LoaderCircle";
import { Check } from "lucide-react";

export default function ChangePasswordPage() {
    const auth = getAuth();
    const user = auth.currentUser;

    const [state, setState] = useState<"idle" | "pending" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [reEnterNewPassword, setReEnterNewPassword] = useState("");
    const [currentPasswordWarning, setCurrentPasswordWarning] = useState("");
    const [newPasswordWarning, setNewPasswordWarning] = useState("");
    const [reEnterNewPasswordWarning, setReEnterNewPasswordWarning] = useState("");

    const reauthenticate = async (currentPassword: string) => {
        if (!user || !user.email) throw new Error("User not authenticated");

        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        await reauthenticateWithCredential(user, credential);
    };

    const messageColor = (() => {
        if (state === "error")
            return "red";
        if (state === "pending")
            return "";

        return "rgba(19, 255, 62, 1)";
    })();

    useEffect(() => {
        setReEnterNewPasswordWarning(newPassword !== reEnterNewPassword ? "Re-enter password is incorrect" : "");
        if (newPassword !== "")
            setNewPasswordWarning("");
        if (currentPassword !== "")
            setCurrentPasswordWarning("");

    }, [currentPassword, newPassword, reEnterNewPassword]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;

        if (currentPassword === "" || newPassword === "") {
            setState("error");
            if (currentPassword === "")
                setCurrentPasswordWarning("Old password must not be empty");
            if (newPassword === "")
                setNewPasswordWarning("New password must not be empty");

            return;
        }

        setState("pending");
        setMessage("Pending change password");

        try {
            await reauthenticate(currentPassword);
            
            if (newPassword !== reEnterNewPassword) {
                setState("error");
                setMessage("Please re-enter new password correctly")
            }
            else {
                if (user)
                    await updatePassword(user, newPassword);

                setState("success");
                setMessage("Success");
                setTimeout(() => {
                    setMessage("");
                }, 1000);
                form.reset();
            }
        }
        catch (error) {
            setState("error");
            if (error instanceof FirebaseError && error.code === "auth/invalid-credential") {
                setMessage("Old password is incorrect");
            }
            else {
                setMessage("Please try again");
            }
        }
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
                    Success
                </>
            )
            showNotification({ children: children, duration: 1000, style: {gap: "10px"} });
        }
        if (state === "error") {
            cancelNotification();
        }
    }

    useEffect(handleState, [state]);

    return (
        <div className="center change-password-page">
            <form className="glassmorphism" onSubmit={handleSubmit}>
                <Input label="Current password" name="current-password" type="password" warning={currentPasswordWarning}
                    onChange={e => setCurrentPassword(e.target.value)}
                />
                <Input label="New password" name="new-password" type="password" warning={newPasswordWarning}
                    onChange={e => setNewPassword(e.target.value)}
                />
                <Input label="Re-enter new password" name="re-enter-new-password" type="password" warning={reEnterNewPasswordWarning}
                    onChange={e => setReEnterNewPassword(e.target.value)}
                />
                <p className="message" style={{
                    color: messageColor
                }}>
                    {message}
                </p>
                <Button className="change-password-btn">
                    Change password
                </Button>
            </form>
        </div>
    );
}