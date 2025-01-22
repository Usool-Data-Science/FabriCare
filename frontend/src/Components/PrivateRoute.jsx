import { useUser } from '../Contexts/UserProvider'
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const { user, loadingUser } = useUser();
    const location = useLocation();

    if (loadingUser) {
        return <span className="loading loading-ring loading-lg"></span>;
    } else if (user) {
        return children
    } else {
        const url = location.pathname + location.search + location.hash;
        return <Navigate to="/login" state={{ next: url }} />
    }
}

export default PrivateRoute