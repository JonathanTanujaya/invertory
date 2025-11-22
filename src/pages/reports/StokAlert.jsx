import { useEffect, useState, useMemo } from 'react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Search, RefreshCcw, AlertTriangle, Download, Eye, Loader2, X } from 'lucide-react';
import { formatNumber } from '@/utils/helpers';
import Modal from '@/components/ui/Modal';
import BarangForm from '@/pages/master/BarangForm';

// Dummy fetch (replace with axios to backend later)
function fetchBarang() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { kode_barang: 'BRG001', nama_barang: 'Sparepart A', kategori: 'Elektronik', satuan: 'pcs', stok: 100, stok_minimal: 10 },
        { kode_barang: 'BRG002', nama_barang: 'Sparepart B', kategori: 'Mekanik', satuan: 'pcs', stok: 5, stok_minimal: 15 },
        { kode_barang: 'BRG003', nama_barang: 'Sparepart C', kategori: 'Elektronik', satuan: 'box', stok: 22, stok_minimal: 20 },
        { kode_barang: 'BRG004', nama_barang: 'Sparepart D', kategori: 'Aksesoris', satuan: 'pcs', stok: 18, stok_minimal: 10 },
        { kode_barang: 'BRG005', nama_barang: 'Sparepart E', kategori: 'Mekanik', satuan: 'pcs', stok: 11, stok_minimal: 10 },
      ]);
    }, 350);
  });
}

export default function StokAlert() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('');
  const [modeFilter, setModeFilter] = useState('all'); // all | critical | warning
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const items = await fetchBarang();
    setData(items);
    setLoading(false);
  };

  const resetFilters = () => {
    setSearch('');
    setKategori('');
    setModeFilter('all');
  };

  const filtered = useMemo(() => {
    return data.filter(item => {
      const txt = (item.kode_barang + item.nama_barang).toLowerCase();
      if (search && !txt.includes(search.toLowerCase())) return false;
      if (kategori && item.kategori.toLowerCase() !== kategori.toLowerCase()) return false;
      const critical = item.stok < item.stok_minimal;
      const warning = !critical && item.stok <= item.stok_minimal * 1.2;
      if (modeFilter === 'critical' && !critical) return false;
      if (modeFilter === 'warning' && !warning) return false;
      return true;
    }).map(item => {
      const critical = item.stok < item.stok_minimal;
      const warning = !critical && item.stok <= item.stok_minimal * 1.2;
      return { ...item, critical, warning };
    });
  }, [data, search, kategori, modeFilter]);

  const columns = [
    { key: 'kode_barang', label: 'Kode', sortable: true, render: val => <span className="font-mono font-semibold text-primary-600">{val}</span> },
    { key: 'nama_barang', label: 'Nama', sortable: true },
    { key: 'kategori', label: 'Kategori', sortable: true, render: val => <Badge variant="default">{val}</Badge> },
    { key: 'stok', label: 'Stok', align: 'center', render: (val, row) => <span className="font-medium">{formatNumber(val)} {row.satuan}</span> },
    { key: 'stok_minimal', label: 'Min', align: 'center', render: (val, row) => <span className="text-sm text-gray-600">{formatNumber(val)}</span> },
    { key: 'status', label: 'Status', render: (_, row) => {
      if (row.critical) return <Badge variant="error" startIcon={<AlertTriangle className="w-3 h-3" />}>Critical</Badge>;
      if (row.warning) return <Badge variant="warning">Warning</Badge>;
      return <Badge variant="success">OK</Badge>;
    } },
    { key: 'actions', label: 'Aksi', align: 'center', render: (_, row) => (
      <Button size="sm" variant="ghost" onClick={() => { setSelected(row); setShowModal(true); }}>
        <Eye className="w-4 h-4" />
      </Button>
    ) }
  ];

  const exportCsv = () => {
    const headerLine = 'Kode,Nama,Kategori,Stok,Min,Status';
    const lines = filtered.map(r => [r.kode_barang, r.nama_barang, r.kategori, r.stok, r.stok_minimal, r.critical ? 'Critical' : r.warning ? 'Warning' : 'OK'].join(','));
    const csv = [headerLine, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'stok-alert.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stok Alert</h1>
        <p className="text-gray-500 mt-1">Daftar barang mendekati / di bawah batas stok minimal</p>
      </div>

      <Card>
        <div className="space-y-4">
          {/* Filter Row */}
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
              label="Mode"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Semua' },
                { value: 'critical', label: 'Critical saja' },
                { value: 'warning', label: 'Warning saja' },
              ]}
            />
          </div>

          {/* Action Row */}
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
            <div className="ml-auto text-sm text-gray-600">
              Total: <span className="font-semibold">{filtered.length}</span> item
            </div>
          </div>

          {/* Legend */}
          <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center gap-6 text-xs text-gray-500">
            <span className="font-medium text-gray-600">Keterangan:</span>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-error-500" />
              <span>Critical: stok &lt; minimal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-warning-500" />
              <span>Warning: ≤120% batas</span>
            </div>
          </div>
        </div>
      </Card>

      <Card padding={false}>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          pagination={false}
        />
      </Card>

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
            }}
            mode="view"
            onCancel={() => setShowModal(false)}
          />
        )}
      </Modal>
    </div>
  );
}