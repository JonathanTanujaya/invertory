import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { fetchItemMovements, formatMovementType } from '@/api/movements';
import { Search, RefreshCcw, Download } from 'lucide-react';
import { formatNumber } from '@/utils/helpers';
import { toast } from 'react-toastify';

export default function KartuStok() {
  const [kodeBarang, setKodeBarang] = useState('BRG-001');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [tipe, setTipe] = useState('');
  const [loading, setLoading] = useState(false);
  const [header, setHeader] = useState(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchItemMovements(kodeBarang, { from, to, type: tipe || undefined });
      setHeader({
        kode_barang: res.kode_barang,
        nama_barang: res.nama_barang,
        satuan: res.satuan,
        stok_awal: res.stok_awal,
        stok_akhir: res.stok_akhir,
      });
      setRows(res.movements);
    } catch (err) {
      toast.error('Gagal memuat kartu stok');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => loadData();
  const handleExport = () => {
    // Simple CSV export placeholder
    const headerLine = 'Waktu,Ref,Tipe,Masuk,Keluar,Saldo,User,Catatan';
    const dataLines = rows.map(r => [r.waktu, r.ref, r.tipe, r.masuk, r.keluar, r.saldo, r.user, r.catatan || ''].join(','));
    const csv = [headerLine, ...dataLines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `kartu-stok-${kodeBarang}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'waktu', label: 'Waktu', sortable: true },
    { key: 'ref', label: 'Referensi', sortable: true },
    { key: 'tipe', label: 'Tipe', sortable: true, render: (val) => <Badge>{formatMovementType(val)}</Badge> },
    { key: 'masuk', label: 'Masuk', align: 'right', render: (val, row) => val ? formatNumber(val) + ' ' + header?.satuan : '-' },
    { key: 'keluar', label: 'Keluar', align: 'right', render: (val, row) => val ? formatNumber(val) + ' ' + header?.satuan : '-' },
    { key: 'saldo', label: 'Saldo', align: 'right', render: (val) => <span className="font-mono">{formatNumber(val)}</span> },
    { key: 'user', label: 'User', align: 'center' },
    { key: 'catatan', label: 'Catatan' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kartu Stok</h1>
        <p className="text-gray-500 mt-1">Riwayat lengkap pergerakan stok barang per item</p>
      </div>

      {/* Filter Panel */}
      <Card>
        <div className="grid md:grid-cols-6 gap-4">
          <Input
            label="Kode Barang"
            placeholder="BRG-001"
            value={kodeBarang}
            onChange={(e) => setKodeBarang(e.target.value)}
          />
          <Input
            type="date"
            label="Dari"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
            <Input
            type="date"
            label="Sampai"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <Select
            label="Tipe"
            value={tipe}
            onChange={(e) => setTipe(e.target.value)}
            options={[
              { value: '', label: 'Semua' },
              { value: 'IN', label: 'Stok Masuk' },
              { value: 'OUT', label: 'Stok Keluar' },
              { value: 'RET_IN', label: 'Retur Pembelian' },
              { value: 'RET_OUT', label: 'Retur Penjualan' },
              { value: 'BONUS_IN', label: 'Bonus Pembelian' },
              { value: 'BONUS_OUT', label: 'Bonus Penjualan' },
              { value: 'CLAIM_OUT', label: 'Customer Claim' },
              { value: 'ADJ', label: 'Adjustment' },
            ]}
          />
          <div className="flex items-end gap-2">
            <Button variant="outline" startIcon={<Search className="w-4 h-4" />} onClick={loadData}>Cari</Button>
            <Button variant="outline" startIcon={<RefreshCcw className="w-4 h-4" />} onClick={handleRefresh}>Reset</Button>
          </div>
          <div className="flex items-end">
            <Button startIcon={<Download className="w-4 h-4" />} onClick={handleExport}>Export CSV</Button>
          </div>
        </div>
      </Card>

      {/* Header Info */}
      {header && (
        <Card>
          <div className="grid md:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Kode Barang</div>
              <div className="font-medium">{header.kode_barang}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-gray-500">Nama Barang</div>
              <div className="font-medium">{header.nama_barang}</div>
            </div>
            <div>
              <div className="text-gray-500">Stok Awal</div>
              <div className="font-medium">{formatNumber(header.stok_awal)} {header.satuan}</div>
            </div>
            <div>
              <div className="text-gray-500">Stok Akhir</div>
              <div className="font-medium">{formatNumber(header.stok_akhir)} {header.satuan}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card padding={false}>
        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
}