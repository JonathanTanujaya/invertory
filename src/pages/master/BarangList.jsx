import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import BarangForm from './BarangForm';
import { formatCurrency, formatNumber } from '@/utils/helpers';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/axios';

export default function BarangList() {
  const { hasPermission } = useAuthStore();
  const canCreate = hasPermission('master-data.create');
  const canEdit = hasPermission('master-data.edit');
  const canDelete = hasPermission('master-data.delete');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [kategoriOptions, setKategoriOptions] = useState([]);
  const [sortBy, setSortBy] = useState('nama_barang');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mode, setMode] = useState('create'); // create, edit

  const columns = [
    {
      key: 'kode_barang',
      label: 'Kode',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-semibold text-primary-600">{value}</span>
      ),
    },
    {
      key: 'nama_barang',
      label: 'Nama Barang',
      sortable: true,
    },
    {
      key: 'kategori',
      label: 'Kategori',
      sortable: true,
      render: (value) => <Badge variant="default">{value}</Badge>,
    },
    {
      key: 'satuan',
      label: 'Satuan',
      sortable: true,
      align: 'center',
    },
    {
      key: 'stok',
      label: 'Stok',
      sortable: true,
      align: 'center',
      render: (value, row) => {
        const isLow = value <= row.stok_minimal;
        return (
          <Badge variant={isLow ? 'error' : 'success'}>
            {formatNumber(value)}
          </Badge>
        );
      },
    },
    {
      key: 'harga_beli',
      label: 'Harga Beli',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-700">
          {value ? formatCurrency(value) : '-'}
        </span>
      ),
    },
    {
      key: 'harga_jual',
      label: 'Harga Jual',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-green-600">
          {value ? formatCurrency(value) : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1">
          {canEdit && (
            <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {canDelete && (
            <Button size="sm" variant="ghost" onClick={() => handleDelete(row)}>
              <Trash2 className="w-4 h-4 text-error-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery, kategoriFilter, sortBy, sortOrder]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        api.get('/items'),
        api.get('/categories'),
      ]);

      const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
      const kategoriMap = Object.fromEntries(
        categories.map((c) => [c.kode_kategori, c.nama_kategori])
      );

      setKategoriOptions(
        categories.map((c) => ({ value: c.kode_kategori, label: c.nama_kategori }))
      );

      const items = Array.isArray(itemsRes.data) ? itemsRes.data : [];

      // Apply filters client-side (same behavior as before)
      const query = (searchQuery || '').toLowerCase();
      const filtered = items.filter((item) => {
        const matchesSearch = !query || item.nama_barang?.toLowerCase().includes(query);
        const matchesKategori = !kategoriFilter || item.kategori_id === kategoriFilter;
        return matchesSearch && matchesKategori;
      });

      const sorted = [...filtered].sort((a, b) => {
        const av = a?.[sortBy];
        const bv = b?.[sortBy];

        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;

        const an = typeof av === 'number' ? av : Number(av);
        const bn = typeof bv === 'number' ? bv : Number(bv);
        const bothNumeric = Number.isFinite(an) && Number.isFinite(bn);

        if (bothNumeric) return an - bn;

        return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
      });

      const finalItems = sortOrder === 'desc' ? sorted.reverse() : sorted;

      const mappedData = finalItems.map((item) => ({
        kode_barang: item.kode_barang,
        nama_barang: item.nama_barang,
        kategori_id: item.kategori_id,
        kategori: kategoriMap[item.kategori_id] || item.kategori_id,
        satuan: item.satuan,
        stok: item.stok,
        stok_minimal: item.stok_minimal,
        harga_beli: item.harga_beli,
        harga_jual: item.harga_jual,
        created_at: item.created_at,
      }));

      setData(mappedData);
      setTotalItems(mappedData.length);
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (columnKey, order) => {
    setSortBy(columnKey);
    setSortOrder(order);
  };

  const handleCreate = () => {
    if (!canCreate) {
      toast.error('Anda tidak memiliki akses untuk menambah data barang');
      return;
    }
    setMode('create');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    if (!canEdit) {
      toast.error('Anda tidak memiliki akses untuk mengubah data barang');
      return;
    }
    setMode('edit');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    if (!canDelete) {
      toast.error('Anda tidak memiliki akses untuk menghapus data barang');
      return;
    }
    if (window.confirm(`Hapus barang ${item.nama_barang}?`)) {
      try {
        await api.delete(`/items/${item.kode_barang}`);
        toast.success('Barang berhasil dihapus');
        fetchData();
      } catch (error) {
        const msg = error?.response?.data?.error;
        toast.error(msg || 'Gagal menghapus barang');
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (mode === 'create') {
        if (!canCreate) {
          toast.error('Anda tidak memiliki akses untuk menambah data barang');
          return;
        }
        await api.post('/items', {
          ...values,
          stok_minimal: Number(values.stok_minimal ?? 0),
          harga_beli: values.harga_beli == null ? null : Number(values.harga_beli),
          harga_jual: values.harga_jual == null ? null : Number(values.harga_jual),
        });
        toast.success('Barang berhasil ditambahkan');
      } else if (mode === 'edit') {
        if (!canEdit) {
          toast.error('Anda tidak memiliki akses untuk mengubah data barang');
          return;
        }
        await api.put(`/items/${selectedItem.kode_barang}`, {
          ...values,
          stok_minimal: Number(values.stok_minimal ?? 0),
          harga_beli: values.harga_beli == null ? null : Number(values.harga_beli),
          harga_jual: values.harga_jual == null ? null : Number(values.harga_jual),
        });
        toast.success('Barang berhasil diupdate');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      const msg = error?.response?.data?.error;
      toast.error(msg || 'Terjadi kesalahan');
    }
  };

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
      {/* Filters */}
      <Card className="shadow-sm ring-1 ring-gray-100 flex-shrink-0">
        <div className="grid grid-cols-[1fr_220px_auto] items-center gap-3">
          <Input
            placeholder="Cari nama barang"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startIcon={<Search className="w-4 h-4 text-gray-500" />}
            className="rounded-lg"
          />
          <Select
            placeholder="Kategori"
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            options={kategoriOptions}
            className="rounded-lg"
          />
          <div className="flex items-center justify-end gap-2">
            {canCreate && (
              <Button
                size="md"
                startIcon={<Plus className="w-4 h-4" />}
                className="rounded-lg shadow-sm px-4"
                onClick={handleCreate}
              >
                Tambah Barang
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding={false} className="flex-1 min-h-0 overflow-hidden">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          pagination={false}
          stickyHeader
          maxHeight="100%"
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </Card>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={mode === 'create' ? 'Tambah Barang' : 'Edit Barang'}
        size="lg"
      >
        <BarangForm
          initialData={selectedItem}
          mode={mode}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
