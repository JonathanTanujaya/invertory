import { useEffect, useState, useMemo } from 'react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { fetchItemMovements, formatMovementType, getAvailableItems } from '@/api/movements';
import {
  Search,
  RefreshCcw,
  Download,
  TrendingUp,
  TrendingDown,
  Package,
  Calendar,
  X,
  Filter,
  FileDown,
  FileText,
  ClipboardList,
  ArrowRight
} from 'lucide-react';
import { formatNumber } from '@/utils/helpers';
import { toast } from 'react-toastify';

export default function KartuStok() {
  const today = new Date().toISOString().split('T')[0];
  const [kodeBarang, setKodeBarang] = useState('');
  const [searchItem, setSearchItem] = useState('');
  const [showItemList, setShowItemList] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [tipe, setTipe] = useState('');
  const [loading, setLoading] = useState(false);
  const [header, setHeader] = useState(null);
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Get available items from movements API
  const availableItems = useMemo(() => getAvailableItems(), []);

  // Filter barang berdasarkan pencarian
  const filteredBarang = useMemo(() => {
    if (!searchItem) return availableItems;
    const search = searchItem.toLowerCase();
    return availableItems.filter(item =>
      item.kode.toLowerCase().includes(search) ||
      item.nama.toLowerCase().includes(search)
    );
  }, [searchItem, availableItems]);

  // Hitung statistik
  const stats = useMemo(() => {
    const totalMasuk = rows.reduce((sum, r) => sum + (r.masuk || 0), 0);
    const totalKeluar = rows.reduce((sum, r) => sum + (r.keluar || 0), 0);
    const totalTransaksi = rows.length;
    return { totalMasuk, totalKeluar, totalTransaksi };
  }, [rows]);

  useEffect(() => {
    if (kodeBarang) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kodeBarang]);

  const loadData = async () => {
    if (!kodeBarang) return;
    setLoading(true);
    try {
      const res = await fetchItemMovements(kodeBarang, { from: from || undefined, to: to || undefined, type: tipe || undefined });
      if (res) {
        setHeader({
          kode_barang: res.kode_barang,
          nama_barang: res.nama_barang,
          satuan: res.satuan,
          stok_awal: res.stok_awal,
          stok_akhir: res.stok_akhir,
        });
        setRows(res.movements);
      } else {
        setHeader(null);
        setRows([]);
        toast.error('Data barang tidak ditemukan');
      }
      setCurrentPage(1);
    } catch (err) {
      toast.error('Gagal memuat kartu stok');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setKodeBarang('');
    setSearchItem('');
    setFrom('');
    setTo('');
    setTipe('');
    setHeader(null);
    setRows([]);
  };

  const handleSelectItem = (item) => {
    setKodeBarang(item.kode);
    setSearchItem('');
    setShowItemList(false);
  };

  const setDateRange = (days) => {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - days);
    setFrom(past.toISOString().split('T')[0]);
    setTo(today.toISOString().split('T')[0]);
  };

  const handleExportCSV = () => {
    const headerLine = 'Waktu,Ref,Tipe,Masuk,Keluar,Saldo,User,Catatan';
    const dataLines = rows.map(r => [
      r.waktu,
      r.ref,
      formatMovementType(r.tipe),
      r.masuk || 0,
      r.keluar || 0,
      r.saldo,
      r.user,
      r.catatan || ''
    ].join(','));
    const csv = [headerLine, ...dataLines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kartu-stok-${kodeBarang}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data berhasil di-export');
  };

  const columns = [
    {
      key: 'waktu',
      label: 'Waktu',
      sortable: true,
      className: 'px-3 py-2.5',
      render: (val) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{val.split(' ')[0]}</div>
          <div className="text-xs text-gray-500">{val.split(' ')[1]}</div>
        </div>
      )
    },
    {
      key: 'ref',
      label: 'Referensi',
      sortable: true,
      className: 'px-3 py-2.5',
      render: (val) => <span className="font-mono text-sm text-blue-600">{val}</span>
    },
    {
      key: 'tipe',
      label: 'Tipe',
      sortable: true,
      className: 'px-3 py-2.5',
      render: (val) => {
        const types = {
          'IN': 'success',
          'OUT': 'error',
          'RET_IN': 'warning',
          'RET_OUT': 'warning',
          'BONUS_IN': 'info',
          'BONUS_OUT': 'info',
          'CLAIM_OUT': 'error',
          'ADJ': 'default'
        };
        return <Badge variant={types[val] || 'default'}>{formatMovementType(val)}</Badge>;
      }
    },
    {
      key: 'masuk',
      label: 'Masuk',
      align: 'right',
      className: 'px-3 py-2.5',
      render: (val, row) => val ? (
        <span className="text-sm font-medium text-green-600">
          +{formatNumber(val)} {header?.satuan}
        </span>
      ) : <span className="text-gray-400 text-sm">-</span>
    },
    {
      key: 'keluar',
      label: 'Keluar',
      align: 'right',
      className: 'px-3 py-2.5',
      render: (val, row) => val ? (
        <span className="text-sm font-medium text-red-600">
          -{formatNumber(val)} {header?.satuan}
        </span>
      ) : <span className="text-gray-400 text-sm">-</span>
    },
    {
      key: 'saldo',
      label: 'Saldo',
      align: 'right',
      className: 'px-3 py-2.5',
      render: (val) => (
        <span className="font-mono text-sm font-semibold text-gray-900">
          {formatNumber(val)}
        </span>
      )
    },
    {
      key: 'user',
      label: 'User',
      align: 'center',
      className: 'px-3 py-2.5',
      render: (val) => (
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
            {val.substring(0, 2).toUpperCase()}
          </span>
        </div>
      )
    },
    {
      key: 'catatan',
      label: 'Catatan',
      className: 'px-3 py-2.5',
      render: (val) => (
        <span className="text-sm text-gray-600 line-clamp-1">
          {val || <span className="text-gray-400">-</span>}
        </span>
      )
    },
  ];

  // Badge untuk tipe filter aktif
  const activeFilters = [];
  if (from) activeFilters.push({ label: `Dari: ${from}`, clear: () => setFrom('') });
  if (to) activeFilters.push({ label: `Sampai: ${to}`, clear: () => setTo('') });
  if (tipe) activeFilters.push({
    label: `Tipe: ${formatMovementType(tipe)}`,
    clear: () => setTipe('')
  });

  return (
    <div className="space-y-6">
      {/* Compact Filter - Single Row */}
      <Card>
        <div className="grid grid-cols-12 gap-3 items-end">
          {/* Item Search/Select */}
          <div className="col-span-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Barang
            </label>
            <div className="relative">
              <Input
                placeholder="Cari kode atau nama barang..."
                value={searchItem}
                onChange={(e) => {
                  setSearchItem(e.target.value);
                  setShowItemList(true);
                }}
                onFocus={() => setShowItemList(true)}
                startIcon={<Search className="w-4 h-4" />}
              />
              {showItemList && filteredBarang.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredBarang.slice(0, 10).map((item) => (
                    <button
                      key={item.kode}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      onClick={() => handleSelectItem(item)}
                    >
                      <div className="font-medium text-sm text-gray-900">{item.kode}</div>
                      <div className="text-xs text-gray-500">{item.nama}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* From Date */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dari Tanggal
            </label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          {/* To Date */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sampai Tanggal
            </label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          {/* Type */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe
            </label>
            <Select
              value={tipe}
              onChange={(e) => setTipe(e.target.value)}
              options={[
                { value: '', label: 'Semua' },
                { value: 'IN', label: 'Masuk' },
                { value: 'OUT', label: 'Keluar' },
                { value: 'RET_IN', label: 'Retur Beli' },
                { value: 'RET_OUT', label: 'Retur Jual' },
                { value: 'BONUS_IN', label: 'Bonus Beli' },
                { value: 'BONUS_OUT', label: 'Bonus Jual' },
                { value: 'CLAIM_OUT', label: 'Claim' },
                { value: 'ADJ', label: 'Adjustment' },
              ]}
            />
          </div>

          {/* Action Buttons */}
          <div className="col-span-2 flex items-end">
            <Button
              className="h-[42px] w-full"
              variant="outline"
              onClick={handleRefresh}
              title="Reset"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Empty State - Belum Pilih Barang */}
      {!kodeBarang && !loading && (
        <Card className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Ilustrasi */}
            <div className="relative mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <ClipboardList className="w-16 h-16 text-blue-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Search className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Pilih Barang untuk Melihat Kartu Stok
            </h3>
            <p className="text-gray-500 max-w-md mb-6">
              Gunakan kolom pencarian di atas untuk memilih barang yang ingin dilihat riwayat transaksinya. 
              Kartu stok akan menampilkan semua pergerakan stok secara kronologis.
            </p>
            
            {/* Quick Select Buttons */}
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-500 mb-3">Pilih cepat:</span>
              <div className="flex flex-wrap gap-2 justify-center">
                {availableItems.slice(0, 5).map((item) => (
                  <button
                    key={item.kode}
                    onClick={() => setKodeBarang(item.kode)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-blue-600">{item.kode}</span>
                      <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 text-left">{item.nama}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Header Info & Stats */}
      {header && kodeBarang && (
        <div className="grid md:grid-cols-12 gap-6">
          {/* Item Info */}
          <Card className="md:col-span-5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-1">Informasi Barang</div>
                <div className="font-semibold text-gray-900">{header.nama_barang}</div>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-mono">{header.kode_barang}</span>
                  <span className="mx-2">•</span>
                  <span>{header.satuan}</span>
                </div>
              </div>
              <div className="flex gap-6 flex-shrink-0">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Stok Awal</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatNumber(header.stok_awal)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Stok Akhir</div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatNumber(header.stok_akhir)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Statistics Cards */}
          <div className="md:col-span-7 grid md:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total Masuk</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(stats.totalMasuk)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{header.satuan}</div>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total Keluar</div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatNumber(stats.totalKeluar)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{header.satuan}</div>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total Transaksi</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(stats.totalTransaksi)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">transaksi</div>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Table with Export */}
      {header && (
        <Card padding={false}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Riwayat Transaksi</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Menampilkan {rows.length} transaksi
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              startIcon={<FileDown className="w-4 h-4" />}
              onClick={handleExportCSV}
              disabled={rows.length === 0}
            >
              Export CSV
            </Button>
          </div>
          
          {/* Empty State - Tidak Ada Transaksi */}
          {rows.length === 0 && !loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-1">
                Belum Ada Transaksi
              </h4>
              <p className="text-gray-500 text-sm max-w-sm">
                Barang ini belum memiliki riwayat transaksi pada periode yang dipilih.
                Coba ubah filter tanggal atau tipe transaksi.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleRefresh}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reset Filter
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              loading={loading}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
            />
          )}
        </Card>
      )}
    </div>
  );
}