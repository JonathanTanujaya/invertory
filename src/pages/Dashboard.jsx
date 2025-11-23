import { useEffect, useState } from 'react';
import { Package, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatNumber } from '@/utils/helpers';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSKU: 0,
    totalStockValue: 0,
    lowStockCount: 0,
    todayPurchases: 0,
    todaySales: 0,
  });

  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    // Fetch dashboard data
    // This will be replaced with actual API call
    setStats({
      totalSKU: 1250,
      totalStockValue: 450000000,
      lowStockCount: 15,
      todayPurchases: 8,
      todaySales: 23,
    });

    setLowStockItems([
      { kode: 'BRG001', nama: 'Sparepart A', stok: 5, stok_minimal: 10, kategori: 'Elektronik' },
      { kode: 'BRG002', nama: 'Sparepart B', stok: 2, stok_minimal: 15, kategori: 'Mekanik' },
      { kode: 'BRG003', nama: 'Sparepart C', stok: 8, stok_minimal: 20, kategori: 'Elektronik' },
      { kode: 'BRG004', nama: 'Sparepart D', stok: 3, stok_minimal: 10, kategori: 'Aksesoris' },
      { kode: 'BRG005', nama: 'Sparepart E', stok: 1, stok_minimal: 5, kategori: 'Mekanik' },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total SKU"
          value={formatNumber(stats.totalSKU)}
          icon={Package}
          color="primary"
        />
        <StatCard
          title="Nilai Stok Total"
          value={formatCurrency(stats.totalStockValue)}
          icon={DollarSign}
          color="success"
        />
        <StatCard
          title="Pembelian Hari Ini"
          value={stats.todayPurchases}
          icon={TrendingUp}
          color="info"
        />
        <StatCard
          title="Penjualan Hari Ini"
          value={stats.todaySales}
          icon={TrendingDown}
          color="warning"
        />
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockCount > 0 && (
        <Card
          title="Peringatan Stok Rendah"
          actions={
            <Badge variant="error">
              {stats.lowStockCount} Item
            </Badge>
          }
        >
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div
                key={item.kode}
                className="flex items-center justify-between p-3 bg-error-50 rounded-md border border-error-200"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-error-500" />
                  <div>
                    <div className="font-medium text-gray-900">{item.nama}</div>
                    <div className="text-sm text-gray-500">
                      Kode: {item.kode} • {item.kategori}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-error-600">
                    Stok: {item.stok}
                  </div>
                  <div className="text-xs text-gray-500">
                    Min: {item.stok_minimal}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Pembelian Terbaru">
          <div className="space-y-3">
            <ActivityItem
              title="PO-2024-001"
              subtitle="PT Supplier Jaya"
              date="21 Nov 2024"
              amount={formatCurrency(15000000)}
              status="selesai"
            />
            <ActivityItem
              title="PO-2024-002"
              subtitle="CV Maju Jaya"
              date="21 Nov 2024"
              amount={formatCurrency(8500000)}
              status="pending"
            />
            <ActivityItem
              title="PO-2024-003"
              subtitle="PT Berkah Selalu"
              date="20 Nov 2024"
              amount={formatCurrency(22000000)}
              status="selesai"
            />
          </div>
        </Card>

        <Card title="Penjualan Terbaru">
          <div className="space-y-3">
            <ActivityItem
              title="SO-2024-045"
              subtitle="Toko ABC"
              date="21 Nov 2024"
              amount={formatCurrency(5000000)}
              status="selesai"
            />
            <ActivityItem
              title="SO-2024-046"
              subtitle="Toko XYZ"
              date="21 Nov 2024"
              amount={formatCurrency(3200000)}
              status="pending"
            />
            <ActivityItem
              title="SO-2024-047"
              subtitle="Toko 123"
              date="20 Nov 2024"
              amount={formatCurrency(7800000)}
              status="selesai"
            />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Aksi Cepat">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            icon={TrendingUp}
            title="Stok Masuk"
            href="/transactions/pembelian"
          />
          <QuickAction
            icon={TrendingDown}
            title="Stok Keluar"
            href="/transactions/penjualan"
          />
          <QuickAction
            icon={Package}
            title="Data Barang"
            href="/master/sparepart"
          />
          <QuickAction
            icon={AlertTriangle}
            title="Stok Opname"
            href="/transactions/stok-opname"
          />
        </div>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-500',
    success: 'bg-success-50 text-success-500',
    warning: 'bg-warning-50 text-warning-500',
    error: 'bg-error-50 text-error-500',
    info: 'bg-info-50 text-info-500',
  };

  return (
    <Card padding={false}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function ActivityItem({ title, subtitle, date, amount, status }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition-colors">
      <div>
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-500">{subtitle}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-gray-900">{amount}</div>
        <div className="flex items-center gap-2 justify-end">
          <Badge variant={status === 'selesai' ? 'success' : 'warning'} size="sm">
            {status}
          </Badge>
          <span className="text-xs text-gray-500">{date}</span>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, title, href }) {
  return (
    <a
      href={href}
      className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all"
    >
      <Icon className="w-8 h-8 text-primary-500" />
      <span className="text-sm font-medium text-gray-700">{title}</span>
    </a>
  );
}
