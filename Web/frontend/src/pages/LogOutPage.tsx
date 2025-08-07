import { getAuth, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LogOutPage.css"
import { showNotification } from "../components/Dialog";
import LoaderCircle from "../components/LoaderCircle";
import { Check } from "lucide-react";

export default function LogOutPage() {
    const navigate = useNavigate();
    const [state, setState] = useState<"idle" | "pending" | "success" | "error">("idle");

    useEffect(() => {
        const auth = getAuth();
        setState("pending");
        signOut(auth)
        .then(() => {
            setState("success");
            navigate("/auth/login");
        })
        .catch((error) => {
            setState("error");
        });
    }, []);

    function handleState() {
        if (state === "pending") {
            const children = (
                <>
                    <LoaderCircle />
                    Logging out
                </>
            );
            showNotification({ children: children, style: {gap: "10px"} });
        }
        if (state === "success") {
            setState("idle");
            const children = (
                <>
                    <Check />
                    Logged out
                </>
            )
            showNotification({ children: children, duration: 1000, style: {gap: "10px"} });
        }
    }

    useEffect(handleState, [state]);

    return (
        <div className="log-out-page">
        </div>
    );
}