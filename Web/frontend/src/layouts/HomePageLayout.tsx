import { Outlet } from "react-router-dom";
import "../assets/styles/global.css";
import "./MainLayout.css";
import Background from "../components/Background";
import AppBar from "../components/AppBar";

const navList = [
    { path: "/home", name: "Home" },
    { path: "/aquarium-status", name: "Aquarium status" },
    { path: "/feeding", name: "Feeding" },
    { path: "/analysis", name: "Analysis" },
    { path: "/customize-widget", name: "Customize widget" },
]

const userMenuList = [
    { path: "/user/profile", name: "Profile" },
    { path: "/user/change-password", name: "Change password" },
    { path: "/auth/log-out", name: "Log out" },
]

export default function HomePageLayout() {

    return (
        <div className="main-layout">
            <Background />
            <AppBar navList={navList} userMenuList={userMenuList} />
            <Outlet />
        </div>

    );
}