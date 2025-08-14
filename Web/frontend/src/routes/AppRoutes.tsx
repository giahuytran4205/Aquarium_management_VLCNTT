import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import IntroductionPage from "../pages/IntroductionPage";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import GuestLayout from "../layouts/GuestLayout";
import HomePage from "../pages/HomePage";
import AquariumStatusPage from "../pages/AquariumStatusPage";
import FeedingPage from "../pages/FeedingPage";
import AnalysisPage from "../pages/AnalysisPage";
import CustomizeWidgetPage from "../pages/CustomizeWidgetPage";
import ProfilePage from "../pages/ProfilePage";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import ProtectedRoute from "./ProtectedRoute";
import LogOutPage from "../pages/LogOutPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ChatBotPage from "../pages/ChatbotPage";
import DeviceManagerLayout from "../layouts/DeviceManagerLayout";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <GuestLayout />,
        children: [
            { index: true, element: <IntroductionPage /> }
        ]
    },
    {
        path: "/auth",
        element: <GuestLayout />,
        children: [
            { path: "login", element: <LoginPage /> },
            { path: "sign-up", element: <SignUpPage /> },
            { path: "log-out", element: <LogOutPage /> },
            { path: "forgot-password", element: <ForgotPasswordPage />}
        ]
    },
    {
        path: "",
        element: <ProtectedRoute />,
        children: [
            {
                path: "",
                element: <MainLayout />,
                children: [
                    {
                        path: "/user",
                        children: [
                            { path: "profile", element: <ProfilePage /> },
                            { path: "change-password", element: <ChangePasswordPage /> },
                        ]
                    },
                    { path: "/home", element: <HomePage /> },
                    { path: "/", element: <DeviceManagerLayout />, children: [
                        { path: "/aquarium-status", element: <AquariumStatusPage /> },
                        { path: "/feeding", element: <FeedingPage /> },
                        { path: "/analysis", element: <AnalysisPage /> },
                        { path: "/customize-widget", element: <CustomizeWidgetPage /> },
                        { path: "/chatbot", element: <ChatBotPage /> }
                    ]}
                ]
            },
        ]
    },
    {

    }
]);