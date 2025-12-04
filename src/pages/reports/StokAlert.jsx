import { useEffect, useState, useMemo } from 'react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import {
  Search, RefreshCcw, Download, Loader2, X,
  Package, AlertTriangle, XCircle, Filter,
  LayoutGrid, List, Phone, User, MapPin, FileText,
  ShoppingCart, TrendingDown, Truck
} from 'lucide-react';
import { formatNumber, formatCurrency, formatDate } from '@/utils/helpers';

// Import data
import kategoriData from '@/data/dummy/m_kategori.json';
import barangData from '@/data/dummy/m_barang.json';
import supplierData from '@/data/dummy/m_supplier.json';
import stokMasukData from '@/data/dummy/t_stok_masuk.json';

// Fungsi untuk mendapatkan nama kategori dari ID
const getKategoriNama = (kategoriId) => {
  const kat = kategoriData.find(k => k.kode_kategori === kategoriId);
  return kat ? kat.nama_kategori : kategoriId;
};

// Fungsi untuk mendapatkan supplier history untuk suatu barang
const getSupplierHistory = (kodeBarang) => {
  const history = [];

  stokMasukData.forEach(transaksi => {
    const item = transaksi.items.find(i => i.kode_barang === kodeBarang);
    if (item) {
      const supplier = supplierData.find(s => s.kode_supplier === transaksi.kode_supplier);
      if (supplier) {
        // Check if supplier already in history
        const existingIndex = history.findIndex(h => h.kode_supplier === supplier.kode_supplier);
        if (existingIndex >= 0) {
          // Update if this transaction is newer
          if (new Date(transaksi.tanggal) > new Date(history[existingIndex].tanggal_terakhir)) {
            history[existingIndex].tanggal_terakhir = transaksi.tanggal;
            history[existingIndex].harga_terakhir = item.harga;
            history[existingIndex].jumlah_terakhir = item.jumlah;
          }
          history[existingIndex].total_transaksi += 1;
          history[existingIndex].total_qty += item.jumlah;
        } else {
          history.push({
            kode_supplier: supplier.kode_supplier,
            nama_supplier: supplier.nama_supplier,
            alamat: supplier.alamat,
            telepon: supplier.telepon,
            kontak: supplier.kontak,
            tanggal_terakhir: transaksi.tanggal,
            harga_terakhir: item.harga,
            jumlah_terakhir: item.jumlah,
            total_transaksi: 1,
            total_qty: item.jumlah
          });
        }
      }
    }
  });

  // Sort by tanggal_terakhir descending
  return history.sort((a, b) => new Date(b.tanggal_terakhir) - new Date(a.tanggal_terakhir));
};

export default function StokAlert() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all'); // all | habis | rendah
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState('table'); // table | grid

  // Modal states
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [supplierHistory, setSupplierHistory] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Export dropdown
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter only items that need attention (stok <= stok_minimal)
    const alertItems = barangData
      .filter(item => item.stok <= item.stok_minimal)
      .map(item => ({
        ...item,
        kategori_nama: getKategoriNama(item.kategori_id),
        kekurangan: Math.max(0, item.stok_minimal - item.stok),
        habis: item.stok === 0,
        rendah: item.stok > 0 && item.stok <= item.stok_minimal,
        estimasi_restock: (item.stok_minimal * 2 - item.stok) * item.harga_beli
      }));

    setData(alertItems);
    setLoading(false);
  };

  const resetFilters = () => {
    setSearch('');
    setKategori('');
    setUrgencyFilter('all');
    setCurrentPage(1);
  };

  // Quick filter dari stat card
  const handleQuickFilter = (urgency) => {
    setUrgencyFilter(urgency);
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    return data.filter(item => {
      // Search filter
      const txt = (item.kode_barang + item.nama_barang).toLowerCase();
      if (search && !txt.includes(search.toLowerCase())) return false;

      // Kategori filter
      if (kategori && item.kategori_id !== kategori) return false;

      // Urgency filter
      if (urgencyFilter === 'habis' && !item.habis) return false;
      if (urgencyFilter === 'rendah' && !item.rendah) return false;

      return true;
    });
  }, [data, search, kategori, urgencyFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Stats summary
  const stats = useMemo(() => {
    const habis = data.filter(i => i.habis).length;
    const rendah = data.filter(i => i.rendah).length;
    const total = data.length;
    const estimasiRestock = data.reduce((sum, i) => sum + i.estimasi_restock, 0);
    return { habis, rendah, total, estimasiRestock };
  }, [data]);

  // Handle supplier modal
  const openSupplierModal = (item) => {
    setSelectedItem(item);
    const history = getSupplierHistory(item.kode_barang);
    setSupplierHistory(history);
    setShowSupplierModal(true);
  };

  // Table columns
  const columns = [
    {
      key: 'kode_barang',
      label: 'Kode',
      sortable: true,
      render: val => (
        <span className="font-mono font-semibold text-primary-600">{val}</span>
      )
    },
    {
      key: 'nama_barang',
      label: 'Nama Barang',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-medium text-gray-900">{val}</div>
          <div className="text-xs text-gray-500">{row.kategori_nama}</div>
        </div>
      )
    },
    {
      key: 'stok',
      label: 'Stok',
      align: 'center',
      sortable: true,
      render: (val, row) => (
        <div className="text-center">
          <span className={`font-bold text-lg ${row.habis ? 'text-error-600' : 'text-warning-600'}`}>
            {formatNumber(val)}
          </span>
          <span className="text-gray-400 text-xs ml-1">/ {row.stok_minimal}</span>
        </div>
      )
    },
    {
      key: 'kekurangan',
      label: 'Kekurangan',
      align: 'center',
      render: (val) => (
        <span className="font-semibold text-error-600">
          -{formatNumber(val)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (_, row) => {
        if (row.habis) return <Badge variant="error" startIcon={<XCircle className="w-3 h-3" />}>Habis</Badge>;
        return <Badge variant="warning" startIcon={<AlertTriangle className="w-3 h-3" />}>Rendah</Badge>;
      }
    },
    {
      key: 'actions',
      label: 'Supplier',
      align: 'center',
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          startIcon={<Truck className="w-4 h-4" />}
          onClick={() => openSupplierModal(row)}
        >
          Lihat
        </Button>
      )
    }
  ];

  // Export functions
  const exportCsv = () => {
    const headerLine = 'Kode,Nama Barang,Kategori,Stok,Min,Kekurangan,Status';
    const lines = filtered.map(r => {
      const status = r.habis ? 'Habis' : 'Rendah';
      return [
        r.kode_barang,
        `"${r.nama_barang}"`,
        `"${r.kategori_nama}"`,
        r.stok,
        r.stok_minimal,
        r.kekurangan,
        status
      ].join(',');
    });
    const csv = [headerLine, ...lines].join('\n');
    downloadFile(csv, `stok-alert-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
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
  const StatCard = ({ title, value, subtitle, icon: Icon, color, isActive, onClick }) => {
    const colorClasses = {
      primary: { bg: 'bg-primary-50', icon: 'bg-primary-100 text-primary-600', text: 'text-primary-600', ring: 'ring-primary-500' },
      warning: { bg: 'bg-warning-50', icon: 'bg-warning-100 text-warning-600', text: 'text-warning-600', ring: 'ring-warning-500' },
      error: { bg: 'bg-error-50', icon: 'bg-error-100 text-error-600', text: 'text-error-600', ring: 'ring-error-500' },
      success: { bg: 'bg-success-50', icon: 'bg-success-100 text-success-600', text: 'text-success-600', ring: 'ring-success-500' },
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
            {subtitle && (
              <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
            )}
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
    return (
      <div
        className={`bg-white rounded-xl border-2 p-4 transition-all hover:shadow-md ${item.habis ? 'border-error-200' : 'border-warning-200'
          }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="font-mono text-xs text-primary-600 font-semibold">{item.kode_barang}</span>
            <h3 className="font-medium text-gray-900 mt-1">{item.nama_barang}</h3>
            <span className="text-xs text-gray-500">{item.kategori_nama}</span>
          </div>
          {item.habis
            ? <Badge variant="error" startIcon={<XCircle className="w-3 h-3" />}>Habis</Badge>
            : <Badge variant="warning" startIcon={<AlertTriangle className="w-3 h-3" />}>Rendah</Badge>
          }
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Stok Saat Ini</span>
            <span className={`font-bold text-lg ${item.habis ? 'text-error-600' : 'text-warning-600'}`}>
              {formatNumber(item.stok)} <span className="text-xs font-normal text-gray-400">{item.satuan}</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Stok Minimal</span>
            <span className="font-medium">{formatNumber(item.stok_minimal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Kekurangan</span>
            <span className="font-semibold text-error-600">-{formatNumber(item.kekurangan)}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            startIcon={<Truck className="w-4 h-4" />}
            onClick={() => openSupplierModal(item)}
          >
            Lihat Supplier
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
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
                placeholder="Cari kode/nama barang..."
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
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={exportCsv}
                  >
                    <FileText className="w-4 h-4" />
                    Export CSV
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                <Select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'Semua Status' },
                    { value: 'habis', label: 'Stok Habis' },
                    { value: 'rendah', label: 'Stok Rendah' }
                  ]}
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
                <p>Tidak ada data alert yang ditemukan</p>
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

      {/* Supplier History Modal */}
      <Modal
        open={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        title={selectedItem ? `Supplier untuk ${selectedItem.nama_barang}` : 'Supplier History'}
        size="xl"
      >
        {selectedItem && (
          <div className="space-y-4">
            {/* Item Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm text-primary-600">{selectedItem.kode_barang}</span>
                  <h3 className="font-semibold text-lg text-gray-900">{selectedItem.nama_barang}</h3>
                  <span className="text-sm text-gray-500">{selectedItem.kategori_nama}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Stok Saat Ini</div>
                  <div className={`text-2xl font-bold ${selectedItem.habis ? 'text-error-600' : 'text-warning-600'}`}>
                    {formatNumber(selectedItem.stok)}
                  </div>
                  <div className="text-xs text-gray-400">Min: {selectedItem.stok_minimal}</div>
                </div>
              </div>
            </div>

            {/* Supplier List */}
            {supplierHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Belum ada riwayat supplier untuk barang ini</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Daftar Supplier ({supplierHistory.length})</h4>
                {supplierHistory.map((supplier, index) => (
                  <div
                    key={supplier.kode_supplier}
                    className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${index === 0 ? 'border-primary-200 bg-primary-50/50' : 'border-gray-200'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-gray-900">{supplier.nama_supplier}</h5>
                          {index === 0 && (
                            <Badge variant="primary" size="sm">Terakhir</Badge>
                          )}
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{supplier.kontak}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{supplier.telepon}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span>{supplier.alamat}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xs text-gray-500">Harga Terakhir</div>
                        <div className="font-semibold text-gray-900">{formatCurrency(supplier.harga_terakhir)}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(supplier.tanggal_terakhir)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {supplier.total_transaksi}x transaksi • {formatNumber(supplier.total_qty)} {selectedItem.satuan}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        startIcon={<ShoppingCart className="w-4 h-4" />}
                        onClick={() => {
                          // TODO: Navigate to create PO with supplier pre-selected
                          alert(`Buat PO ke ${supplier.nama_supplier}`);
                        }}
                      >
                        Buat PO
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        startIcon={<Phone className="w-4 h-4" />}
                        onClick={() => {
                          window.location.href = `tel:${supplier.telepon}`;
                        }}
                      >
                        Hubungi
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}