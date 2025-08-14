import { Outlet } from "react-router-dom";
import "../assets/styles/global.css";
import "./MainLayout.css";
import Background from "../components/Background";
import AppBar from "../components/AppBar";
import { getDevices } from "../hooks/devices";

const navList = [
    { path: "/home", name: "Home" },
    { path: "/aquarium-status", name: "Aquarium status" },
    { path: "/feeding", name: "Feeding" },
    { path: "/analysis", name: "Analysis" },
    { path: "/customize-widget", name: "Customize widget" },
    { path: "/chatbot", name: "Chatbot" },
]

const userMenuList = [
    { path: "/user/profile", name: "Profile" },
    { path: "/user/change-password", name: "Change password" },
    { path: "/auth/log-out", name: "Log out" },
]

export default function DeviceManagerLayout() {
    const { devices, refetch } = getDevices();

    return (
        <>
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                margin: "20px 10px 10px 10px"
            }}>
                <span className="title">Select device</span>
                <select className="glassmorphism dropdown">
                    {devices.map((value, index) => 
                        <option key={index} value={value.device_id}>
                            {value.name}
                        </option>
                    )}
                </select>
            </div>
            <Outlet />
        </>
    );
}