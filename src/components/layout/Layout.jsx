import { Outlet } from 'react-router-dom';
import { clsx } from 'clsx';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useThemeStore } from '@/store/themeStore';

export default function Layout() {
  const { sidebarCollapsed } = useThemeStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />
      
      <main
        className={clsx(
          'pt-16 transition-all duration-300',
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
