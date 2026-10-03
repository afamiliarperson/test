import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải...</div>;

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;
