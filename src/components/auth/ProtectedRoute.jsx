import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute({ children, permission }) {
    const { isAuthenticated, hasPermission } = useAuthStore();
    const location = useLocation();

    // Jika belum login, redirect ke login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Jika ada permission yang dibutuhkan dan user tidak punya akses
    if (permission && !hasPermission(permission)) {
        return <Navigate to="/" replace />;
    }

    return children;
}
