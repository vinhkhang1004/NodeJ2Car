import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const PrivateRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-white" size={48} />
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
