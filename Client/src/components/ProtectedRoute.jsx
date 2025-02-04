import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = useSelector((state) => state.auth.token);
    const userRole = useSelector((state) => state.auth.user?.role);
    // Si no hay token, redirige al login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Si el rol no está permitido, redirige a una página de acceso denegado o a home
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default ProtectedRoute;
