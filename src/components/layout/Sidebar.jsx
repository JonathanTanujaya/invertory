import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-toastify';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  Building2,
  Tags,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  MessageSquareWarning,
  Boxes,
  AlertTriangle,
  FileBarChart,
  History,
  Settings,
  LogOut,
  ChevronUp,
  UserCog,
  ClipboardList,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';

// Inventory-only navigation (finance & non-inventory masters removed)
const allMenuItems = [
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    permission: 'dashboard',
  },
  {
    title: 'Master Data',
    icon: Package,
    permission: 'master-data',
    submenu: [
      { title: 'Kategori & Area', path: '/master/kategori', icon: Tags },
      { title: 'Data Barang', path: '/master/sparepart', icon: Package },
      { title: 'Supplier', path: '/master/supplier', icon: Building2 },
      { title: 'Customer', path: '/master/customer', icon: Users },
    ],
  },
  {
    title: 'Transaksi',
    icon: ShoppingCart,
    permission: 'transaksi',
    submenu: [
      { title: 'Stok Masuk', path: '/transactions/pembelian', icon: TrendingUp },
      { title: 'Stok Keluar', path: '/transactions/penjualan', icon: TrendingDown },
      { title: 'Stok Opname', path: '/transactions/stok-opname', icon: ClipboardCheck },
      { title: 'Customer Claim', path: '/transactions/customer-claim', icon: MessageSquareWarning },
    ],
  },
  {
    title: 'Laporan',
    icon: FileText,
    permission: 'laporan',
    submenu: [
      { title: 'Stok Barang', path: '/reports/stok-barang', icon: Boxes },
      { title: 'Stok Alert', path: '/reports/stok-alert', icon: AlertTriangle },
      { title: 'Kartu Stok', path: '/reports/kartu-stok', icon: FileBarChart },
      { title: 'Riwayat Transaksi', path: '/reports/riwayat-transaksi', icon: History },
    ],
  },
  {
    title: 'Pengaturan',
    icon: Settings,
    permission: 'settings',
    submenu: [
      { title: 'Manajemen User', path: '/settings/users', icon: UserCog },
      { title: 'Log Aktivitas', path: '/settings/activity-log', icon: ClipboardList },
      { title: 'Backup & Restore', path: '/settings/backup-restore', icon: FileText },
    ],
  },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useThemeStore();
  const { user, logout, hasPermission, getRoleLabel, changeOwnPassword } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Filter menu items based on user permissions
  const menuItems = allMenuItems.filter(item => hasPermission(item.permission));

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const openPasswordModal = () => {
    setDropdownOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsPasswordModalOpen(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }

    const result = await changeOwnPassword?.(currentPassword, newPassword);
    if (result?.ok) {
      toast.success(result.message || 'Password berhasil diubah');
      setIsPasswordModalOpen(false);
      return;
    }

    toast.error(result?.message || 'Gagal mengubah password');
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 flex flex-col',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
        {!sidebarCollapsed && (
          <h1 className="text-xl font-bold text-primary-600">STOIR</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Menu - Scrollable */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            item={item}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>

      {/* User Panel Footer with Dropdown */}
      <div className="flex-shrink-0 border-t border-gray-200 p-3 relative" ref={dropdownRef}>
        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div
            className={clsx(
              'absolute bottom-full left-3 right-3 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden',
              sidebarCollapsed && 'left-1 right-1'
            )}
          >
            <button
              onClick={openPasswordModal}
              className="flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors text-amber-700 w-full"
            >
              <KeyRound className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-sm">Reset Password</span>}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600 w-full"
            >
              <LogOut className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-sm">Keluar</span>}
            </button>
          </div>
        )}

        {/* User Button */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={clsx(
            'flex items-center gap-3 p-2 rounded-lg transition-colors w-full',
            dropdownOpen ? 'bg-gray-100' : 'hover:bg-gray-100',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <div
            className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
            style={{ backgroundColor: user?.avatar || '#6366f1' }}
          >
            {getInitials(user?.nama)}
          </div>
          {!sidebarCollapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium text-gray-900 truncate">{user?.nama || 'User'}</div>
                <div className="text-xs text-gray-500">{getRoleLabel()}</div>
              </div>
              <ChevronUp
                className={clsx(
                  'w-4 h-4 text-gray-400 transition-transform',
                  !dropdownOpen && 'rotate-180'
                )}
              />
            </>
          )}
        </button>
      </div>

      {/* Self Change Password Modal */}
      <Modal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Reset Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="relative">
            <Input
              label="Password Saat Ini"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan password saat ini"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Password Baru"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Masukkan password baru"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Konfirmasi Password Baru"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPasswordModalOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </aside>
  );
}

function MenuItem({ item, collapsed }) {
  const Icon = item.icon;

  if (item.submenu) {
    return (
      <div className="mb-2">
        {!collapsed && (
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
            {item.title}
          </div>
        )}
        {item.submenu.map((subitem, index) => (
          <SubMenuItem key={index} item={subitem} collapsed={collapsed} />
        ))}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-4 py-3 mx-2 rounded-md transition-colors',
          isActive
            ? 'bg-primary-50 text-primary-600'
            : 'text-gray-700 hover:bg-gray-100'
        )
      }
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span className="font-medium">{item.title}</span>}
    </NavLink>
  );
}

function SubMenuItem({ item, collapsed }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-4 py-2 mx-2 rounded-md transition-colors',
          isActive
            ? 'bg-primary-50 text-primary-600'
            : 'text-gray-600 hover:bg-gray-100',
          collapsed && 'justify-center'
        )
      }
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {!Icon && !collapsed && <span className="w-4" />}
      {!collapsed && <span className="text-sm">{item.title}</span>}
    </NavLink>
  );
}
