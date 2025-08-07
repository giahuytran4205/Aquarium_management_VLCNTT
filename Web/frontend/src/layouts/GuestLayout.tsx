import { Outlet } from "react-router-dom";
import "../assets/styles/global.css";
import "./GuestLayout.css";
import Background from "../components/Background";

export default function GuestLayout() {
    return (
        <div className="guest-layout">
            <Background />
            <Outlet />
        </div>
    );
}