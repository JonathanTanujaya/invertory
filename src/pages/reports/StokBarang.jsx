import { useEffect, useState, useMemo } from 'react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import {
  Search, RefreshCcw, Download, Eye, X, Loader2, FileText,
  Package, AlertTriangle, CheckCircle, XCircle,
  LayoutGrid, List, Filter, MapPin
} from 'lucide-react';
import { formatNumber, formatCurrency } from '@/utils/helpers';
import BarangForm from '@/pages/master/BarangForm';

// Import data
import kategoriData from '@/data/dummy/m_kategori.json';
import barangData from '@/data/dummy/m_barang.json';

// Fungsi untuk mendapatkan nama kategori dari ID
const getKategoriNama = (kategoriId) => {
  const kat = kategoriData.find(k => k.kode_kategori === kategoriId);
  return kat ? kat.nama_kategori : kategoriId;
};

export default function StokBarang() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState('table'); // table | grid

  // Modal & pagination
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = viewMode === 'grid' ? 8 : 10;

  // Export dropdown
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => { load(); }, []);

  // Reset to page 1 when view mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode]);

  const load = async () => {
    setLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Enrich data with kategori name
    const enrichedData = barangData.map(item => ({
      ...item,
      kategori_nama: getKategoriNama(item.kategori_id),
      nilai_stok: item.stok * item.harga_beli,
    }));

    setData(enrichedData);
    setLoading(false);
  };

  const resetFilters = () => {
    setSearch('');
    setKategori('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  // Quick filter dari stat card
  const handleQuickFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    return data.filter(item => {
      // Search filter
      const txt = (item.kode_barang + item.nama_barang).toLowerCase();
      if (search && !txt.includes(search.toLowerCase())) return false;

      // Kategori filter
      if (kategori && item.kategori_id !== kategori) return false;

      // Date filter (by created_at)
      if (dateFrom) {
        const itemDate = new Date(item.created_at);
        const fromDate = new Date(dateFrom);
        if (itemDate < fromDate) return false;
      }
      if (dateTo) {
        const itemDate = new Date(item.created_at);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59);
        if (itemDate > toDate) return false;
      }

      // Status filter
      const habis = item.stok === 0;
      const rendah = !habis && item.stok < item.stok_minimal;

      if (statusFilter === 'habis' && !habis) return false;
      if (statusFilter === 'rendah' && !rendah) return false;
      if (statusFilter === 'normal' && (habis || rendah)) return false;

      return true;
    }).map(item => ({
      ...item,
      habis: item.stok === 0,
      rendah: item.stok > 0 && item.stok < item.stok_minimal,
      stokPercent: Math.min(100, (item.stok / Math.max(item.stok_minimal * 2, 1)) * 100),
    }));
  }, [data, search, kategori, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Stats summary
  const stats = useMemo(() => {
    const total = data.length;
    const habis = data.filter(i => i.stok === 0).length;
    const rendah = data.filter(i => i.stok > 0 && i.stok < i.stok_minimal).length;
    const normal = total - habis - rendah;
    const totalNilai = data.reduce((sum, i) => sum + (i.stok * i.harga_beli), 0);
    return { total, habis, rendah, normal, totalNilai };
  }, [data]);

  // Table columns
  const columns = [
    {
      key: 'kode_barang',
      label: 'Kode',
      sortable: true,
      className: 'px-3 py-2.5',
      render: val => (
        <span className="font-mono text-sm font-semibold text-primary-600">{val}</span>
      )
    },
    {
      key: 'nama_barang',
      label: 'Nama Barang',
      sortable: true,
      className: 'px-3 py-2.5',
      render: (val, row) => (
        <div>
          <div className="font-medium text-sm text-gray-900">{val}</div>
          <div className="text-xs text-gray-500">{row.kategori_nama}</div>
        </div>
      )
    },
    {
      key: 'stok',
      label: 'Stok',
      align: 'center',
      sortable: true,
      className: 'px-3 py-2.5',
      render: (val, row) => {
        let bgColor = 'bg-success-100';
        let barColor = 'bg-success-500';
        if (row.habis) {
          bgColor = 'bg-error-100';
          barColor = 'bg-error-500';
        } else if (row.rendah) {
          bgColor = 'bg-warning-100';
          barColor = 'bg-warning-500';
        }

        return (
          <div className="w-24 mx-auto">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold">{formatNumber(val)}</span>
              <span className="text-gray-400 text-[11px]">/ {row.stok_minimal}</span>
            </div>
            <div className={`h-1.5 rounded-full ${bgColor}`}>
              <div
                className={`h-full rounded-full ${barColor} transition-all`}
                style={{ width: `${row.stokPercent}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      key: 'satuan',
      label: 'Satuan',
      align: 'center',
      className: 'px-3 py-2.5 text-center',
      render: val => <span className="text-xs text-gray-600">{val}</span>
    },
    {
      key: 'nilai_stok',
      label: 'Nilai Stok',
      align: 'right',
      sortable: true,
      className: 'px-3 py-2.5 text-right',
      render: val => (
        <span className="text-xs font-medium text-gray-900">
          {formatCurrency(val)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      className: 'px-3 py-2.5',
      render: (_, row) => {
        if (row.habis) return <Badge variant="error" className="text-xs">Habis</Badge>;
        if (row.rendah) return <Badge variant="warning" className="text-xs">Rendah</Badge>;
        return <Badge variant="success" className="text-xs">Normal</Badge>;
      }
    },
    {
      key: 'actions',
      label: '',
      align: 'center',
      className: 'px-3 py-2.5',
      render: (_, row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => { setSelected(row); setShowModal(true); }}
        >
          <Eye className="w-4 h-4" />
        </Button>
      )
    }
  ];

  // Export functions
  const exportCsv = () => {
    const headerLine = 'Kode,Nama Barang,Kategori,Stok,Min,Satuan,Harga Beli,Nilai Stok,Status';
    const lines = filtered.map(r => {
      const status = r.habis ? 'Habis' : r.rendah ? 'Rendah' : 'Normal';
      return [
        r.kode_barang,
        `"${r.nama_barang}"`,
        `"${r.kategori_nama}"`,
        r.stok,
        r.stok_minimal,
        r.satuan,
        r.harga_beli,
        r.nilai_stok,
        status
      ].join(',');
    });
    const csv = [headerLine, ...lines].join('\n');
    downloadFile(csv, `stok-barang-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    setShowExportMenu(false);
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
    setShowExportMenu(false);
  };

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, color, isActive, onClick }) => {
    const colorClasses = {
      primary: { bg: 'bg-primary-50', icon: 'bg-primary-100 text-primary-600', text: 'text-primary-600', ring: 'ring-primary-500' },
      success: { bg: 'bg-success-50', icon: 'bg-success-100 text-success-600', text: 'text-success-600', ring: 'ring-success-500' },
      warning: { bg: 'bg-warning-50', icon: 'bg-warning-100 text-warning-600', text: 'text-warning-600', ring: 'ring-warning-500' },
      error: { bg: 'bg-error-50', icon: 'bg-error-100 text-error-600', text: 'text-error-600', ring: 'ring-error-500' },
    };
    const c = colorClasses[color] || colorClasses.primary;

    return (
      <button
        onClick={onClick}
        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isActive
          ? `${c.bg} border-current ${c.text} ring-2 ${c.ring} ring-opacity-50`
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">{title}</div>
            <div className={`text-2xl font-bold ${isActive ? c.text : 'text-gray-900'}`}>
              {value}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${c.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </button>
    );
  };

  // Grid Item Component
  const GridItem = ({ item }) => {
    let statusColor = 'border-success-200 bg-success-50';
    let statusBadge = <Badge variant="success">Normal</Badge>;
    if (item.habis) {
      statusColor = 'border-error-200 bg-error-50';
      statusBadge = <Badge variant="error">Habis</Badge>;
    } else if (item.rendah) {
      statusColor = 'border-warning-200 bg-warning-50';
      statusBadge = <Badge variant="warning">Rendah</Badge>;
    }

    return (
      <div
        className={`p-4 rounded-xl border-2 ${statusColor} hover:shadow-md transition-all cursor-pointer`}
        onClick={() => { setSelected(item); setShowModal(true); }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-mono text-sm text-gray-500">{item.kode_barang}</div>
            <div className="font-semibold text-gray-900 mt-1">{item.nama_barang}</div>
          </div>
          {statusBadge}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Kategori</span>
            <span className="font-medium">{item.kategori_nama}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Lokasi</span>
            <span className="font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {item.lokasi_rak || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Stok</span>
            <span className="font-bold text-lg">{formatNumber(item.stok)} <span className="text-xs font-normal text-gray-400">{item.satuan}</span></span>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Nilai Stok</span>
              <span className="font-semibold text-primary-600">{formatCurrency(item.nilai_stok)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats - Clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Item"
          value={stats.total}
          icon={Package}
          color="primary"
          isActive={statusFilter === 'all'}
          onClick={() => handleQuickFilter('all')}
        />
        <StatCard
          title="Stok Normal"
          value={stats.normal}
          icon={CheckCircle}
          color="success"
          isActive={statusFilter === 'normal'}
          onClick={() => handleQuickFilter('normal')}
        />
        <StatCard
          title="Stok Rendah"
          value={stats.rendah}
          icon={AlertTriangle}
          color="warning"
          isActive={statusFilter === 'rendah'}
          onClick={() => handleQuickFilter('rendah')}
        />
        <StatCard
          title="Stok Habis"
          value={stats.habis}
          icon={XCircle}
          color="error"
          isActive={statusFilter === 'habis'}
          onClick={() => handleQuickFilter('habis')}
        />
      </div>

      {/* Filter + Table Container */}
      <div className="bg-white rounded-lg shadow-soft border border-gray-200 overflow-hidden">
        {/* Filter Section */}
        <div className="px-6 py-3 space-y-3 border-b border-gray-200">
          {/* Search Bar + Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kode/nama..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
            <Button
              variant={showAdvancedFilters ? 'primary' : 'outline'}
              size="sm"
              startIcon={<Filter className="w-4 h-4" />}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              startIcon={<RefreshCcw className="w-4 h-4" />}
              onClick={load}
              disabled={loading}
            >
              Refresh
            </Button>

            {/* Export Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                startIcon={<Download className="w-4 h-4" />}
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={loading || filtered.length === 0}
              >
                Export
              </Button>
              {showExportMenu && (
                <div className="absolute top-full right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={exportCsv}
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={printReport}
                  >
                    <FileText className="w-4 h-4" />
                    Print
                  </button>
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
              <button
                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Advanced Filters - Collapsible */}
          {showAdvancedFilters && (
            <div className="pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  options={[
                    { value: '', label: 'Semua Kategori' },
                    ...kategoriData.map(k => ({
                      value: k.kode_kategori,
                      label: k.nama_kategori
                    }))
                  ]}
                />
                <Input
                  type="date"
                  placeholder="Dari"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <Input
                  type="date"
                  placeholder="Sampai"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  startIcon={<X className="w-4 h-4" />}
                  onClick={resetFilters}
                  className="text-gray-500"
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Table Content */}
        {viewMode === 'table' ? (
          <DataTable
            columns={columns}
            data={paginatedData}
            loading={loading}
            pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filtered.length}
            onPageChange={setCurrentPage}
          />
        ) : null}
      </div>

      {/* Grid View - Outside Container */}
      {viewMode === 'grid' && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : paginatedData.length === 0 ? (
            <Card>
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Tidak ada data yang ditemukan</p>
              </div>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedData.map(item => (
                  <GridItem key={item.kode_barang} item={item} />
                ))}
              </div>

              {/* Pagination for Grid */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </Button>
                  <span className="text-sm text-gray-600">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={selected ? `Detail ${selected.nama_barang}` : 'Detail Barang'}
        size="lg"
      >
        {selected && (
          <BarangForm
            initialData={{
              kode_barang: selected.kode_barang,
              nama_barang: selected.nama_barang,
              kategori: selected.kategori_nama,
              satuan: selected.satuan,
              stok: selected.stok,
              stok_minimal: selected.stok_minimal,
              harga_beli: selected.harga_beli,
              harga_jual: selected.harga_jual,
              lokasi_rak: selected.lokasi_rak,
            }}
            mode="view"
            onCancel={() => setShowModal(false)}
          />
        )}
      </Modal>

      {/* Click outside to close export menu */}
      {showExportMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </div>
  );
}
