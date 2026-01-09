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
import api from '@/api/axios';

export default function StokAlert() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kategoriOptions, setKategoriOptions] = useState([]);

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
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = [10, 25, 50, 100];

  // Export dropdown
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        api.get('/reports/stok-alert'),
        api.get('/categories'),
      ]);

      const items = Array.isArray(itemsRes?.data) ? itemsRes.data : [];
      const categories = Array.isArray(categoriesRes?.data) ? categoriesRes.data : [];
      setKategoriOptions(
        categories.map((k) => ({ value: k.kode_kategori, label: k.nama_kategori }))
      );
      setData(
        items.map((i) => ({
          ...i,
          habis: Boolean(i.habis),
          rendah: Boolean(i.rendah),
        }))
      );
    } catch (err) {
      setData([]);
    }
    setLoading(false);
  };

  const resetFilters = () => {
    setSearch('');
    setKategori('');
    setUrgencyFilter('all');
    setCurrentPage(1);
    setPageSize(10);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize));
    setCurrentPage(1); // Reset ke halaman pertama
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
  const openSupplierModal = async (item) => {
    setSelectedItem(item);
    setSupplierHistory([]);
    setShowSupplierModal(true);
    try {
      const res = await api.get(`/reports/stok-alert/${item.kode_barang}/suppliers`);
      const history = Array.isArray(res?.data) ? res.data : [];
      setSupplierHistory(history);
    } catch (_) {
      setSupplierHistory([]);
    }
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
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* Filter Section - Separate Card */}
      <Card className="flex-shrink-0 mb-6">
        <div className="space-y-3">
          {/* Search Bar + Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kode/nama barang..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 h-[42px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
            <Button
              variant={showAdvancedFilters ? 'primary' : 'outline'}
              className="h-[42px]"
              startIcon={<Filter className="w-4 h-4" />}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              Filter
            </Button>
            <Button
              variant="outline"
              className="h-[42px]"
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
                className="h-[42px]"
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
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 h-[42px]">
              <button
                className={`p-2 rounded ${viewMode === 'table' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
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
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <Select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    options={[
                      { value: '', label: 'Semua Kategori' },
                      ...kategoriOptions,
                    ]}
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Select
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value)}
                    options={[
                      { value: 'all', label: 'Semua Status' },
                      { value: 'habis', label: 'Stok Habis' },
                      { value: 'rendah', label: 'Stok Rendah' }
                    ]}
                  />
                </div>
                <div className="col-span-4 flex justify-end">
                  <Button
                    variant="outline"
                    className="h-[42px]"
                    startIcon={<X className="w-4 h-4" />}
                    onClick={resetFilters}
                  >
                    Reset Filter
                  </Button>
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tampilkan
                  </label>
                  <Select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(e.target.value)}
                    options={pageSizeOptions.map(size => ({ value: size, label: `${size} per halaman` }))}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Table Section - Separate Card */}
      {viewMode === 'table' && (
        <Card padding={false} className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ minHeight: '400px' }}>
          <div className="flex-1 min-h-0 overflow-auto">
            <DataTable
              columns={columns}
              data={filtered}
              loading={loading}
              stickyHeader
              maxHeight="100%"
              pagination={false}
            />
          </div>
        </Card>
      )}

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
                <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Menampilkan {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length} item</span>
                    <span className="text-gray-400">|</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500"
                    >
                      {pageSizeOptions.map(size => (
                        <option key={size} value={size}>{size} / hal</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
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