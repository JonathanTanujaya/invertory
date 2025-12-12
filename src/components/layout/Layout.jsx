import { Outlet } from 'react-router-dom';
import { clsx } from 'clsx';
import Sidebar from './Sidebar';
import FullscreenButton from '../ui/FullscreenButton';
import { useThemeStore } from '@/store/themeStore';

export default function Layout() {
  const { sidebarCollapsed } = useThemeStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Sidebar />

      <main
        className={clsx(
          'flex-1 transition-all duration-300 flex flex-col overflow-hidden',
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>

      {/* Floating Fullscreen Button */}
      <FullscreenButton />
    </div>
  );
}
