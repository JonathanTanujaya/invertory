import { Outlet } from 'react-router-dom';
import { clsx } from 'clsx';
import Sidebar from './Sidebar';
import FullscreenButton from '../ui/FullscreenButton';
import { useThemeStore } from '@/store/themeStore';

export default function Layout() {
  const { sidebarCollapsed } = useThemeStore();

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Sidebar />

      <main
        className={clsx(
          'flex-1 transition-all duration-300 min-h-0 overflow-y-auto overflow-x-hidden',
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <div className="p-6 h-full flex flex-col min-h-0">
          <Outlet />
        </div>
      </main>

      {/* Floating Fullscreen Button */}
      <FullscreenButton />
    </div>
  );
}
