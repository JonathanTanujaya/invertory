import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
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

export default function BarangList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mode, setMode] = useState('create'); // create, edit, view

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
      key: 'stok',
      label: 'Stok',
      align: 'center',
      sortable: true,
      render: (value, row) => {
        const isLow = value <= row.stok_minimal;
        return (
          <Badge variant={isLow ? 'error' : 'success'}>
            {formatNumber(value)} {row.satuan}
          </Badge>
        );
      },
    },
    {
      key: 'harga_beli',
      label: 'Harga Beli',
      align: 'right',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'harga_jual',
      label: 'Harga Jual',
      align: 'right',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'actions',
      label: 'Aksi',
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleView(row)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(row)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(row)}
          >
            <Trash2 className="w-4 h-4 text-error-500" />
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery, kategoriFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        const dummyData = [
          {
            kode_barang: 'BRG001',
            nama_barang: 'Sparepart A',
            kategori: 'Elektronik',
            satuan: 'pcs',
            stok: 100,
            stok_minimal: 10,
            harga_beli: 50000,
            harga_jual: 75000,
          },
          {
            kode_barang: 'BRG002',
            nama_barang: 'Sparepart B',
            kategori: 'Mekanik',
            satuan: 'pcs',
            stok: 5,
            stok_minimal: 15,
            harga_beli: 120000,
            harga_jual: 180000,
          },
          {
            kode_barang: 'BRG003',
            nama_barang: 'Sparepart C',
            kategori: 'Elektronik',
            satuan: 'box',
            stok: 50,
            stok_minimal: 20,
            harga_beli: 35000,
            harga_jual: 52500,
          },
        ];
        setData(dummyData);
        setTotalItems(dummyData.length);
        setLoading(false);
      }, 500);
    } catch (error) {
      toast.error('Gagal memuat data');
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setMode('create');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setMode('edit');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleView = (item) => {
    setMode('view');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Hapus barang ${item.nama_barang}?`)) {
      try {
        // API call to delete
        toast.success('Barang berhasil dihapus');
        fetchData();
      } catch (error) {
        toast.error('Gagal menghapus barang');
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (mode === 'create') {
        // API call to create
        toast.success('Barang berhasil ditambahkan');
      } else if (mode === 'edit') {
        // API call to update
        toast.success('Barang berhasil diupdate');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Barang</h1>
          <p className="text-gray-500 mt-1">Kelola master data barang/sparepart</p>
        </div>
        <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
          Tambah Barang
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Cari kode/nama barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startIcon={<Search className="w-4 h-4 text-gray-500" />}
          />
          <Select
            placeholder="Semua Kategori"
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            options={[
              { value: 'elektronik', label: 'Elektronik' },
              { value: 'mekanik', label: 'Mekanik' },
              { value: 'aksesoris', label: 'Aksesoris' },
            ]}
          />
          <Button variant="outline" startIcon={<Filter className="w-4 h-4" />}>
            Filter Lainnya
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={
          mode === 'create'
            ? 'Tambah Barang'
            : mode === 'edit'
            ? 'Edit Barang'
            : 'Detail Barang'
        }
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
