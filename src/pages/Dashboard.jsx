import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatNumber } from '@/utils/helpers';
import api from '@/api/axios';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSKU: 0,
    stokMasukHariIni: 0,
    stokKeluarHariIni: 0,
    stokAlertCount: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [comparison, setComparison] = useState({
    stokMasuk: { value: 0, percent: 0 },
    stokKeluar: { value: 0, percent: 0 },
    totalTransaksi: { value: 0, percent: 0 },
  });
  const [topItems, setTopItems] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const labelForIsoDate = (isoDate) => {
      const d = new Date(`${isoDate}T00:00:00`);
      const idx = Number.isFinite(d.getTime()) ? d.getDay() : null;
      return idx == null ? isoDate : dayLabels[idx] || isoDate;
    };

    const formatTimeAgo = (value) => {
      const raw = String(value ?? '').trim();
      if (!raw) return '';

      const d = raw.length === 10 ? new Date(`${raw}T00:00:00`) : new Date(raw);
      if (!Number.isFinite(d.getTime())) return raw;

      return formatDistanceToNow(d, { addSuffix: true, locale: localeId });
    };

    (async () => {
      try {
        setLoading(true);
        setLoadError(false);

        const res = await api.get('/reports/dashboard-summary');
        if (cancelled) return;

        const data = res.data || {};
        const newStats = data.stats || {};
        setStats({
          totalSKU: Number(newStats.totalSKU ?? 0),
          stokMasukHariIni: Number(newStats.stokMasukHariIni ?? 0),
          stokKeluarHariIni: Number(newStats.stokKeluarHariIni ?? 0),
          stokAlertCount: Number(newStats.stokAlertCount ?? 0),
        });

        const rawChart = Array.isArray(data.chart) ? data.chart : [];
        setChartData(
          rawChart.map((p) => ({
            name: labelForIsoDate(p.date),
            masuk: Number(p.masuk ?? 0),
            keluar: Number(p.keluar ?? 0),
          }))
        );

        setComparison({
          stokMasuk: {
            value: Number(data.comparison?.stokMasuk?.value ?? 0),
            percent: Number(data.comparison?.stokMasuk?.percent ?? 0),
          },
          stokKeluar: {
            value: Number(data.comparison?.stokKeluar?.value ?? 0),
            percent: Number(data.comparison?.stokKeluar?.percent ?? 0),
          },
          totalTransaksi: {
            value: Number(data.comparison?.totalTransaksi?.value ?? 0),
            percent: Number(data.comparison?.totalTransaksi?.percent ?? 0),
          },
        });

        setTopItems(Array.isArray(data.topItems) ? data.topItems : []);
        setRecentActivity(
          (Array.isArray(data.recentActivity) ? data.recentActivity : []).map((a) => ({
            ...a,
            time: formatTimeAgo(a.time),
          }))
        );
      } catch (e) {
        if (cancelled) return;
        setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'masuk': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'keluar': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'opname': return <Package className="w-4 h-4 text-blue-500" />;
      case 'claim': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {loadError && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
          Gagal memuat data dashboard. Silakan refresh.
        </div>
      )}
      {/* BARIS 1: Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Barang"
          value={formatNumber(stats.totalSKU)}
          subtitle="SKU terdaftar"
          icon={Package}
          color="primary"
          href="/master/sparepart"
        />
        <StatCard
          title="Stok Masuk"
          value={loading ? '-' : stats.stokMasukHariIni}
          subtitle="Hari ini"
          icon={TrendingUp}
          color="success"
          href="/transactions/pembelian"
        />
        <StatCard
          title="Stok Keluar"
          value={loading ? '-' : stats.stokKeluarHariIni}
          subtitle="Hari ini"
          icon={TrendingDown}
          color="info"
          href="/transactions/penjualan"
        />
        <StatCard
          title="Stok Alert"
          value={loading ? '-' : stats.stokAlertCount}
          subtitle="Perlu restock"
          icon={AlertTriangle}
          color="warning"
          isAlert={stats.stokAlertCount > 0}
          href="/reports/stok-alert"
        />
      </div>

      {/* BARIS 2: Chart + Comparison + Top 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:items-stretch">
        {/* Grafik Pergerakan Stok */}
        <div className="lg:col-span-2 flex">
          <Card title="Pergerakan Stok" subtitle="7 hari terakhir" className="flex-1">
            <div className="h-[260px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={2} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 2px 4px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      padding: '8px 12px'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }}
                    iconSize={10}
                  />
                  <Bar
                    dataKey="masuk"
                    name="Masuk"
                    fill="#10b981"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="keluar"
                    name="Keluar"
                    fill="#6366f1"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Ringkasan */}
        <Card title="Ringkasan" subtitle="Bulan ini" className="h-full">
          <div className="space-y-3">
            <ComparisonItem
              label="Stok Masuk"
              value={comparison.stokMasuk.value}
              percent={comparison.stokMasuk.percent}
              isPositive={comparison.stokMasuk.percent >= 0}
            />
            <ComparisonItem
              label="Stok Keluar"
              value={comparison.stokKeluar.value}
              percent={comparison.stokKeluar.percent}
              isPositive={comparison.stokKeluar.percent >= 0}
            />
            <ComparisonItem
              label="Transaksi"
              value={comparison.totalTransaksi.value}
              percent={comparison.totalTransaksi.percent}
              isPositive={comparison.totalTransaksi.percent >= 0}
            />
          </div>
        </Card>

        {/* Top 5 Barang Terlaris */}
        <Card
          title="Top 5 Terlaris"
          subtitle="Bulan ini"
          actions={<Trophy className="w-4 h-4 text-amber-500" />}
          className="h-full"
        >
          <div className="space-y-2">
            {topItems.map((item) => (
              <div
                key={item.kode}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${item.rank === 1 ? 'bg-amber-100 text-amber-700' :
                  item.rank === 2 ? 'bg-gray-200 text-gray-700' :
                    item.rank === 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                  }`}>
                  {item.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{item.nama}</div>
                </div>
                <div className="text-sm font-semibold text-gray-900">{item.qty}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* BARIS 3: Activity */}
      <div className="grid grid-cols-1 gap-4">

        {/* Aktivitas Terakhir */}
        <Card
          title="Aktivitas Terakhir"
          subtitle="Real-time"
          actions={<Clock className="w-5 h-5 text-gray-400" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border-l-2 border-gray-200 hover:border-primary-500 hover:bg-gray-50 transition-colors"
                >
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate">{activity.desc}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{activity.time}</div>
                  </div>
                  {activity.qty && (
                    <div
                      className={`text-sm font-medium ${activity.qty.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                      {activity.qty}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {recentActivity.slice(5, 10).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border-l-2 border-gray-200 hover:border-primary-500 hover:bg-gray-50 transition-colors"
                >
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate">{activity.desc}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{activity.time}</div>
                  </div>
                  {activity.qty && (
                    <div
                      className={`text-sm font-medium ${activity.qty.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                      {activity.qty}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom padding */}
      <div className="pb-6"></div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', isAlert = false, href }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-500',
    success: 'bg-green-50 text-green-500',
    warning: 'bg-amber-50 text-amber-500',
    error: 'bg-red-50 text-red-500',
    info: 'bg-indigo-50 text-indigo-500',
  };

  const content = (
    <div className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl ${colors[color]} ${isAlert ? 'animate-pulse' : ''}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href}>
        <Card padding={false} className="cursor-pointer hover:shadow-md hover:border-primary-300 transition-all">
          {content}
        </Card>
      </Link>
    );
  }

  return (
    <Card padding={false}>
      {content}
    </Card>
  );
}

function ComparisonItem({ label, value, percent, isPositive }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <div className="text-sm text-gray-600">{label}</div>
        <div className="text-lg font-bold text-gray-900">{formatNumber(value)}</div>
      </div>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${isPositive
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700'
        }`}>
        {isPositive ? (
          <ArrowUpRight className="w-4 h-4" />
        ) : (
          <ArrowDownRight className="w-4 h-4" />
        )}
        {Math.abs(percent)}%
      </div>
    </div>
  );
}
