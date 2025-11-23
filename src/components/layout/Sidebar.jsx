import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { useThemeStore } from '@/store/themeStore';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  Building2,
  MapPin,
  UserCircle,
  CreditCard,
  Tags,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Inventory-only navigation (finance & non-inventory masters removed)
const menuItems = [
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Master Data',
    icon: Package,
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
    submenu: [
      { title: 'Stok Masuk', path: '/transactions/pembelian', icon: TrendingUp },
      { title: 'Stok Keluar', path: '/transactions/penjualan', icon: TrendingDown },
      { title: 'Retur Pembelian', path: '/transactions/retur-pembelian' },
      { title: 'Retur Penjualan', path: '/transactions/retur-penjualan' },
      { title: 'Stok Opname', path: '/transactions/stok-opname' },
      { title: 'Customer Claim', path: '/transactions/customer-claim' },
    ],
  },
  {
    title: 'Laporan',
    icon: FileText,
    submenu: [
      { title: 'Stok Barang', path: '/reports/stok-barang' },
      { title: 'Stok Alert', path: '/reports/stok-alert' },
      { title: 'Kartu Stok', path: '/reports/kartu-stok' },
    ],
  },
  {
    title: 'Pengaturan',
    path: '/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useThemeStore();

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
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

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            item={item}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>
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
