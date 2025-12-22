import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute({ children, permission, fallbackTo }) {
    const { isAuthenticated, hasPermission } = useAuthStore();
    const location = useLocation();

    // Jika belum login, redirect ke login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Jika ada permission yang dibutuhkan dan user tidak punya akses
    if (permission && !hasPermission(permission)) {
        const fallback =
            fallbackTo ?? (hasPermission('master-data') ? '/master/kategori' : '/');
        return <Navigate to={fallback} replace />;
    }

    return children;
}
