import { Navigate } from "react-router-dom";
import { useUser } from "../Contexts/UserProvider";

const PublicRoute = ({ children }) => {
    const { user, adminUser, loadingUser } = useUser();

    if (loadingUser) {
        return <span className="loading loading-ring loading-lg"></span>
    }

    if (user) {
        // Redirect to the intended page or default pages
        const nextPage = location.state?.next || (adminUser ? "/admin" : "/home");
        return <Navigate to={nextPage} replace />;
    }

    // Allow unauthenticated users to access the route
    return children;
};

export default PublicRoute;
