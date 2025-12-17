import { useState, useMemo, useEffect } from 'react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Search, RefreshCcw, Eye, FileText, Calendar } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/utils/helpers';

// Import data transaksi
import stokMasukData from '@/data/dummy/t_stok_masuk.json';
import stokKeluarData from '@/data/dummy/t_stok_keluar.json';
import supplierData from '@/data/dummy/m_supplier.json';
import customerData from '@/data/dummy/m_customer.json';

// Dummy data untuk retur (karena file belum ada)
const returPembelianData = [];
const returPenjualanData = [];

export default function RiwayatTransaksi() {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tipeFilter, setTipeFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const pageSize = 15;

  // Buat mapping supplier dan customer
  const supplierMap = useMemo(() => {
    return supplierData.reduce((acc, sup) => {
      acc[sup.kode_supplier] = sup.nama_supplier;
      return acc;
    }, {});
  }, []);

  const customerMap = useMemo(() => {
    return customerData.reduce((acc, cust) => {
      acc[cust.kode_customer] = cust.nama_customer;
      return acc;
    }, {});
  }, []);

  // Gabungkan semua transaksi dengan format unified
  const allTransactions = useMemo(() => {
    const transactions = [];

    // Stok Masuk (Pembelian)
    stokMasukData.forEach(item => {
      transactions.push({
        no_faktur: item.no_faktur,
        tanggal: item.tanggal,
        tipe: 'pembelian',
        tipe_label: 'Pembelian',
        partner: supplierMap[item.kode_supplier] || item.kode_supplier,
        partner_type: 'Supplier',
        total: item.total,
        status: item.status || 'Selesai',
        items: item.items,
        raw_data: item
      });
    });

    // Stok Keluar (Penjualan)
    stokKeluarData.forEach(item => {
      transactions.push({
        no_faktur: item.no_faktur,
        tanggal: item.tanggal,
        tipe: 'penjualan',
        tipe_label: 'Penjualan',
        partner: customerMap[item.kode_customer] || item.kode_customer,
        partner_type: 'Customer',
        total: item.total,
        status: item.status || 'Selesai',
        items: item.items,
        raw_data: item
      });
    });

    // Retur Pembelian
    returPembelianData.forEach(item => {
      transactions.push({
        no_faktur: item.no_retur,
        tanggal: item.tanggal_retur,
        tipe: 'retur-pembelian',
        tipe_label: 'Retur Pembelian',
        partner: supplierMap[item.kode_supplier] || item.kode_supplier,
        partner_type: 'Supplier',
        total: item.total,
        status: 'Selesai',
        items: item.detail_items,
        raw_data: item
      });
    });

    // Retur Penjualan
    returPenjualanData.forEach(item => {
      transactions.push({
        no_faktur: item.no_retur,
        tanggal: item.tanggal_retur,
        tipe: 'retur-penjualan',
        tipe_label: 'Retur Penjualan',
        partner: customerMap[item.kode_customer] || item.kode_customer,
        partner_type: 'Customer',
        total: item.total,
        status: 'Selesai',
        items: item.detail_items,
        raw_data: item
      });
    });

    // Sort by tanggal (newest first)
    return transactions.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  }, [supplierMap, customerMap]);

  // Filter transaksi
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(trx => {
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
  }, [allTransactions, search, tipeFilter, dateFrom, dateTo]);

  const handleReset = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setTipeFilter('all');
    setCurrentPage(1);
  };

  const handleViewDetail = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
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
          'retur-pembelian': 'warning',
          'retur-penjualan': 'warning'
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
    <div className="h-full flex flex-col gap-4">
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
                { value: 'retur-pembelian', label: 'Retur Pembelian' },
                { value: 'retur-penjualan', label: 'Retur Penjualan' },
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
          onRowClick={(row) => handleViewDetail(row)}
        />
      </Card>

      {/* Modal Detail */}
      {showModal && selectedTransaction && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
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

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Kode
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Nama Barang
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                      Harga
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedTransaction.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm font-mono text-primary-600">
                        {item.kode_barang}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.nama_barang}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-center">
                        {formatNumber(item.jumlah)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        {formatCurrency(item.harga)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900">
                      Grand Total:
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-lg text-primary-600">
                      {formatCurrency(selectedTransaction.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
