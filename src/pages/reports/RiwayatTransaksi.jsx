import { useState, useMemo, useEffect } from 'react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Search, RefreshCcw } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/utils/helpers';
import api from '@/api/axios';

export default function RiwayatTransaksi() {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tipeFilter, setTipeFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const pageSize = 15;

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/riwayat-transaksi', { params: { limit: 500 } });
      const rows = Array.isArray(res?.data) ? res.data : [];

      setData(
        rows.map((r) => ({
          no_faktur: r.ref_no,
          tanggal: r.tanggal,
          tipe: r.tipe,
          tipe_label: r.tipe_label,
          partner: r.partner,
          partner_type: r.partner_type,
          total: Number(r.total ?? 0),
          status: r.status || 'Selesai',
          ref_id: r.ref_id,
          catatan: r.catatan ?? null,
        }))
      );
    } catch (err) {
      setData([]);
    }
    setLoading(false);
  };

  // Filter transaksi
  const filteredTransactions = useMemo(() => {
    return data.filter(trx => {
      // Search filter
      if (search) {
        const query = search.toLowerCase();
        if (!trx.no_faktur.toLowerCase().includes(query) &&
          !trx.partner.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Tipe filter
      if (tipeFilter !== 'all' && trx.tipe !== tipeFilter) {
        return false;
      }

      // Date filter
      if (dateFrom) {
        const trxDate = new Date(trx.tanggal);
        const fromDate = new Date(dateFrom);
        if (trxDate < fromDate) return false;
      }
      if (dateTo) {
        const trxDate = new Date(trx.tanggal);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59);
        if (trxDate > toDate) return false;
      }

      return true;
    });

    // Jika tidak ada filter tanggal, batasi hanya 100 data terakhir
    const hasDateFilter = dateFrom || dateTo;
    if (!hasDateFilter) {
      return result.slice(0, 100);
    }

    return result;
  }, [data, search, tipeFilter, dateFrom, dateTo]);

  const handleReset = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setTipeFilter('all');
    setCurrentPage(1);
  };

  const handleViewDetail = async (transaction) => {
    setShowModal(true);
    setDetailLoading(true);
    setSelectedTransaction({ ...transaction, items: [] });
    try {
      const res = await api.get(
        `/reports/riwayat-transaksi/${encodeURIComponent(transaction.tipe)}/${transaction.ref_id}`
      );
      const detail = res?.data;
      if (detail && typeof detail === 'object') {
        setSelectedTransaction((prev) => ({
          ...(prev || transaction),
          no_faktur: detail.ref_no ?? prev?.no_faktur ?? transaction.no_faktur,
          tanggal: detail.tanggal ?? prev?.tanggal ?? transaction.tanggal,
          partner: detail.partner ?? prev?.partner ?? transaction.partner,
          partner_type: detail.partner_type ?? prev?.partner_type ?? transaction.partner_type,
          tipe_label: detail.tipe_label ?? prev?.tipe_label ?? transaction.tipe_label,
          total: Number(detail.total ?? prev?.total ?? transaction.total ?? 0),
          items: Array.isArray(detail.items) ? detail.items : [],
          catatan: detail.catatan ?? prev?.catatan ?? transaction.catatan ?? null,
        }));
      }
    } catch (err) {
      // keep modal open with summary-only data
    }
    setDetailLoading(false);
  };

  // Table columns
  const columns = [
    {
      key: 'no_faktur',
      label: 'No. Faktur',
      sortable: true,
      className: 'px-3 py-2.5',
      render: (val) => (
        <span className="font-mono text-sm font-semibold text-primary-600">
          {val}
        </span>
      )
    },
    {
      key: 'tanggal',
      label: 'Tanggal',
      sortable: true,
      className: 'px-3 py-2.5',
      render: (val) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {new Date(val).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(val).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      )
    },
    {
      key: 'tipe',
      label: 'Tipe Transaksi',
      className: 'px-3 py-2.5',
      render: (val, row) => {
        const variants = {
          'pembelian': 'success',
          'penjualan': 'error',
          'opname': 'warning',
          'customer-claim': 'default',
        };
        return <Badge variant={variants[val] || 'default'}>{row.tipe_label}</Badge>;
      }
    },
    {
      key: 'partner',
      label: 'Supplier / Customer',
      className: 'px-3 py-2.5',
      render: (val, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{val}</div>
          <div className="text-xs text-gray-500">{row.partner_type}</div>
        </div>
      )
    },
    {
      key: 'total',
      label: 'Total',
      align: 'right',
      className: 'px-3 py-2.5',
      render: (val) => (
        <span className="text-sm font-semibold text-gray-900">
          {formatCurrency(val)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      className: 'px-3 py-2.5',
      render: (val) => (
        <Badge variant={val === 'Selesai' ? 'success' : 'default'}>
          {val}
        </Badge>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-40px)] min-h-0">
      {/* Filter */}
      <Card className="flex-shrink-0">
        <div className="grid grid-cols-12 gap-3 items-end">
          {/* Search */}
          <div className="col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari Transaksi
            </label>
            <Input
              placeholder="Cari nomor faktur atau nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Date From */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dari Tanggal
            </label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sampai Tanggal
            </label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          {/* Tipe Filter */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Transaksi
            </label>
            <Select
              value={tipeFilter}
              onChange={(e) => setTipeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Semua Tipe' },
                { value: 'pembelian', label: 'Pembelian' },
                { value: 'penjualan', label: 'Penjualan' },
              ]}
            />
          </div>

          {/* Reset Button */}
          <div className="col-span-2 flex items-end">
            <Button
              className="h-[42px] w-full"
              variant="outline"
              onClick={handleReset}
              title="Reset Filter"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding={false} className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredTransactions}
          loading={loading}
          stickyHeader
          maxHeight="100%"
          onRowClick={(row) => handleViewDetail(row)}
        />
      </Card>

      {/* Modal Detail */}
      {showModal && selectedTransaction && (
        <Modal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedTransaction(null);
            setDetailLoading(false);
          }}
          title="Detail Transaksi"
          size="xl"
        >
          <div className="space-y-4">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-xs text-gray-500 mb-1">No. Faktur</div>
                <div className="font-mono font-semibold text-gray-900">
                  {selectedTransaction.no_faktur}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Tanggal</div>
                <div className="font-medium text-gray-900">
                  {new Date(selectedTransaction.tanggal).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Tipe Transaksi</div>
                <Badge variant={
                  selectedTransaction.tipe === 'pembelian' ? 'success' :
                    selectedTransaction.tipe === 'penjualan' ? 'error' : 'warning'
                }>
                  {selectedTransaction.tipe_label}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">{selectedTransaction.partner_type}</div>
                <div className="font-medium text-gray-900">
                  {selectedTransaction.partner}
                </div>
              </div>
            </div>

            {detailLoading ? (
              <div className="text-sm text-gray-500">Memuat detail...</div>
            ) : null}

            {/* Items Table */}
            {selectedTransaction.tipe === 'opname' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Kode</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nama Barang</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Stok Sistem</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Stok Fisik</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Selisih</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(selectedTransaction.items || []).map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm font-mono text-primary-600">{item.kode_barang}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.nama_barang}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">{formatNumber(item.stok_sistem)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">{formatNumber(item.stok_fisik)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-center">{formatNumber(item.selisih)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.keterangan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Kode</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nama Barang</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Harga</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(selectedTransaction.items || []).map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm font-mono text-primary-600">{item.kode_barang}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.nama_barang}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">{formatNumber(item.jumlah)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-right">{formatCurrency(item.harga || 0)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(item.subtotal || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900">Grand Total:</td>
                      <td className="px-4 py-3 text-right font-bold text-lg text-primary-600">
                        {formatCurrency(selectedTransaction.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
