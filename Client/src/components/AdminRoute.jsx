
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const user = useSelector((state) => state.auth.user);
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if ( user.role !== 'admin') {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default AdminRoute;
