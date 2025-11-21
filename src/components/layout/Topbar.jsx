import { Bell, Search, User, LogOut, Moon, Sun, Menu } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function Topbar() {
  const { mode, toggleTheme, toggleSidebar } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 z-30">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md w-96">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Cari barang, transaksi..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {mode === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-md hover:bg-gray-100">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">{user?.name || 'Admin'}</div>
                <div className="text-xs text-gray-500">{user?.role || 'Administrator'}</div>
              </div>
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                <button
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  onClick={() => {
                    setShowUserMenu(false);
                    // Navigate to profile
                  }}
                >
                  <User className="w-4 h-4" />
                  Profil
                </button>
                <hr className="my-1" />
                <button
                  className="flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-gray-100 w-full"
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
