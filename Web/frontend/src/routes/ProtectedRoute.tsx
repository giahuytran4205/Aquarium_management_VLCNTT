import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../services/auth/firebase";

export default function ProtectedRoute() {
    const [ user, isLoading ] = useAuth();

    if (isLoading)
        return <></>;
    
    return user ? <Outlet /> : <Navigate to="/auth/login" />;
}