import { Navigate } from "react-router-dom";
import { useUser } from "../Contexts/UserProvider";

const PublicRoute = ({ children }) => {
    const { user, adminUser, loadingUser } = useUser();

    if (loadingUser) {
        return <span className="loading loading-ring loading-lg"></span>
    }
    if (user) {
        if (adminUser) {
            return <Navigate to='/admin' />;
        }
        return <Navigate to='/home' />;
    }
    // Allow unauthenticated users to access the route
    return children;
};

export default PublicRoute;
