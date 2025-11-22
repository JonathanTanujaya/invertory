import { useEffect, useState, useMemo } from 'react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Search, RefreshCcw, Download, Eye, X, Loader2, FileText } from 'lucide-react';
import { formatNumber } from '@/utils/helpers';
import BarangForm from '@/pages/master/BarangForm';

// Dummy fetch (replace with axios to backend later)
function fetchStokBarang() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { kode_barang: 'BRG001', nama_barang: 'Sparepart A', kategori: 'Elektronik', satuan: 'pcs', stok: 100, stok_minimal: 10, lokasi_rak: 'A1-01' },
        { kode_barang: 'BRG002', nama_barang: 'Sparepart B', kategori: 'Mekanik', satuan: 'pcs', stok: 5, stok_minimal: 15, lokasi_rak: 'B2-05' },
        { kode_barang: 'BRG003', nama_barang: 'Sparepart C', kategori: 'Elektronik', satuan: 'box', stok: 22, stok_minimal: 20, lokasi_rak: 'A1-02' },
        { kode_barang: 'BRG004', nama_barang: 'Sparepart D', kategori: 'Aksesoris', satuan: 'pcs', stok: 18, stok_minimal: 10, lokasi_rak: 'C3-11' },
        { kode_barang: 'BRG005', nama_barang: 'Sparepart E', kategori: 'Mekanik', satuan: 'pcs', stok: 50, stok_minimal: 10, lokasi_rak: 'D4-07' },
        { kode_barang: 'BRG006', nama_barang: 'Sparepart F', kategori: 'Elektronik', satuan: 'unit', stok: 75, stok_minimal: 20, lokasi_rak: 'A1-03' },
        { kode_barang: 'BRG007', nama_barang: 'Sparepart G', kategori: 'Aksesoris', satuan: 'pcs', stok: 0, stok_minimal: 5, lokasi_rak: 'C3-12' },
        { kode_barang: 'BRG008', nama_barang: 'Sparepart H', kategori: 'Mekanik', satuan: 'box', stok: 30, stok_minimal: 15, lokasi_rak: 'B2-06' },
      ]);
    }, 400);
  });
}

export default function StokBarang() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | habis | rendah | normal
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const items = await fetchStokBarang();
    setData(items);
    setLoading(false);
  };

  const resetFilters = () => {
    setSearch('');
    setKategori('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    return data.filter(item => {
      const txt = (item.kode_barang + item.nama_barang).toLowerCase();
      if (search && !txt.includes(search.toLowerCase())) return false;
      if (kategori && item.kategori.toLowerCase() !== kategori.toLowerCase()) return false;
      
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
    }));
  }, [data, search, kategori, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    { key: 'kode_barang', label: 'Kode', sortable: true, render: val => <span className="font-mono font-semibold text-primary-600">{val}</span> },
    { key: 'nama_barang', label: 'Nama Barang', sortable: true },
    { key: 'kategori', label: 'Kategori', sortable: true, render: val => <Badge variant="default">{val}</Badge> },
    { key: 'stok', label: 'Stok', align: 'center', sortable: true, render: (val, row) => {
      let variant = 'success';
      if (row.habis) variant = 'error';
      else if (row.rendah) variant = 'warning';
      return <Badge variant={variant}>{formatNumber(val)} {row.satuan}</Badge>;
    }},
    { key: 'stok_minimal', label: 'Min', align: 'center', render: (val, row) => <span className="text-sm text-gray-600">{formatNumber(val)}</span> },
    { key: 'lokasi_rak', label: 'Lokasi', align: 'center' },
    { key: 'actions', label: 'Aksi', align: 'center', render: (_, row) => (
      <Button size="sm" variant="ghost" onClick={() => { setSelected(row); setShowModal(true); }}>
        <Eye className="w-4 h-4" />
      </Button>
    )}
  ];

  const exportCsv = () => {
    const headerLine = 'Kode,Nama,Kategori,Stok,Satuan,Min,Lokasi';
    const lines = filtered.map(r => [r.kode_barang, r.nama_barang, r.kategori, r.stok, r.satuan, r.stok_minimal, r.lokasi_rak].join(','));
    const csv = [headerLine, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `stok-barang-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  // Stats summary
  const stats = useMemo(() => {
    const total = data.length;
    const habis = data.filter(i => i.stok === 0).length;
    const rendah = data.filter(i => i.stok > 0 && i.stok < i.stok_minimal).length;
    const normal = total - habis - rendah;
    return { total, habis, rendah, normal };
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stok Barang</h1>
        <p className="text-gray-500 mt-1">Laporan lengkap stok semua barang</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total Item</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Stok Normal</div>
              <div className="text-2xl font-bold text-success-600">{stats.normal}</div>
            </div>
            <div className="p-3 bg-success-100 rounded-lg">
              <Badge variant="success" className="text-lg">OK</Badge>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Stok Rendah</div>
              <div className="text-2xl font-bold text-warning-600">{stats.rendah}</div>
            </div>
            <div className="p-3 bg-warning-100 rounded-lg">
              <Badge variant="warning" className="text-lg">⚠</Badge>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Stok Habis</div>
              <div className="text-2xl font-bold text-error-600">{stats.habis}</div>
            </div>
            <div className="p-3 bg-error-100 rounded-lg">
              <Badge variant="error" className="text-lg">!</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Cari kode/nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              label="Pencarian"
            />
            <Select
              label="Kategori"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              options={[
                { value: '', label: 'Semua' },
                { value: 'Elektronik', label: 'Elektronik' },
                { value: 'Mekanik', label: 'Mekanik' },
                { value: 'Aksesoris', label: 'Aksesoris' },
              ]}
            />
            <Select
              label="Status Stok"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Semua' },
                { value: 'normal', label: 'Normal' },
                { value: 'rendah', label: 'Rendah' },
                { value: 'habis', label: 'Habis' },
              ]}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              startIcon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              onClick={load}
              disabled={loading}
            >
              {loading ? 'Memuat...' : 'Cari'}
            </Button>
            <Button
              variant="outline"
              startIcon={<X className="w-4 h-4" />}
              onClick={resetFilters}
              disabled={loading}
            >
              Bersihkan
            </Button>
            <Button
              variant="outline"
              startIcon={<RefreshCcw className="w-4 h-4" />}
              onClick={load}
              disabled={loading}
            >
              Muat Ulang
            </Button>
            <Button
              variant="outline"
              startIcon={<Download className="w-4 h-4" />}
              onClick={exportCsv}
              disabled={loading || filtered.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              startIcon={<FileText className="w-4 h-4" />}
              onClick={printReport}
              disabled={loading || filtered.length === 0}
            >
              Print
            </Button>
            <div className="ml-auto text-sm text-gray-600">
              Menampilkan: <span className="font-semibold">{filtered.length}</span> dari <span className="font-semibold">{data.length}</span> item
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
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
      </Card>

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
              kategori: selected.kategori,
              satuan: selected.satuan,
              stok: selected.stok,
              stok_minimal: selected.stok_minimal,
              lokasi_rak: selected.lokasi_rak,
            }}
            mode="view"
            onCancel={() => setShowModal(false)}
          />
        )}
      </Modal>
    </div>
  );
}
