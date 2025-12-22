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
import barangData from '@/data/dummy/m_barang.json';
import { useAuthStore } from '@/store/authStore';

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
          <Button size="sm" variant="ghost" onClick={() => handleView(row)}>
            <Eye className="w-4 h-4" />
          </Button>
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
  }, [currentPage, searchQuery, kategoriFilter]);

  // Mapping kategori_id ke nama kategori
  const kategoriMap = {
    'KAT001': 'Bearing & Filter',
    'KAT002': 'Body & Kabel',
    'KAT003': 'Transmisi',
    'KAT004': 'Oli & Pelumas',
    'KAT005': 'Elektrikal',
    'KAT006': 'Ban & Velg',
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        // Map data from JSON file - pastikan semua field ter-include
        const mappedData = barangData.map((item) => ({
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
        console.log('Mapped data:', mappedData); // Debug log
        setData(mappedData);
        setTotalItems(mappedData.length);
        setLoading(false);
      }, 300);
    } catch (error) {
      toast.error('Gagal memuat data');
      setLoading(false);
    }
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

  const handleView = (item) => {
    setMode('view');
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
        if (!canCreate) {
          toast.error('Anda tidak memiliki akses untuk menambah data barang');
          return;
        }
        // API call to create
        toast.success('Barang berhasil ditambahkan');
      } else if (mode === 'edit') {
        if (!canEdit) {
          toast.error('Anda tidak memiliki akses untuk mengubah data barang');
          return;
        }
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
    <div className="flex flex-col gap-4 h-[calc(100vh-42px)]">
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
            options={[
              { value: 'KAT001', label: 'Bearing & Filter' },
              { value: 'KAT002', label: 'Body & Kabel' },
              { value: 'KAT003', label: 'Transmisi' },
              { value: 'KAT004', label: 'Oli & Pelumas' },
              { value: 'KAT005', label: 'Elektrikal' },
              { value: 'KAT006', label: 'Ban & Velg' },
            ]}
            className="rounded-lg"
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="md"
              startIcon={<Filter className="w-4 h-4" />}
              className="rounded-lg shadow-sm border-primary-400 text-primary-600 hover:bg-primary-50"
              onClick={() => { }}
            >
              Filter Lainnya
            </Button>
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
      <Card padding={false} className="flex-1 overflow-hidden">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          pagination={false}
          stickyHeader
          maxHeight="100%"
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
