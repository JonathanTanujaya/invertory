import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import SupplierForm from './SupplierForm';
import { toast } from 'react-toastify';
import supplierData from '@/data/dummy/m_supplier.json';

export default function SupplierList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mode, setMode] = useState('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const columns = [
    {
      key: 'kode_supplier',
      label: 'Kode',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-semibold text-primary-600">{value}</span>
      ),
    },
    {
      key: 'nama_supplier',
      label: 'Nama Supplier',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.alamat}</div>
        </div>
      )
    },
    {
      key: 'telepon',
      label: 'Kontak',
      render: (value, row) => (
        <div className="space-y-1">
          {value && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Telp:</span>
              <a
                href={`tel:${value}`}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                {value}
              </a>
            </div>
          )}
          {row.kontak && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">CP:</span>
              <span className="font-medium text-gray-900">{row.kontak}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Aksi',
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleView(row)}><Eye className="w-4 h-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}><Edit className="w-4 h-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row)}><Trash2 className="w-4 h-4 text-error-500" /></Button>
        </div>
      )
    }
  ];

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(supplierData);
      setLoading(false);
    }, 300);
  };

  const handleCreate = () => { setMode('create'); setSelectedItem(null); setShowModal(true); };
  const handleEdit = (item) => { setMode('edit'); setSelectedItem(item); setShowModal(true); };
  const handleView = (item) => { setMode('view'); setSelectedItem(item); setShowModal(true); };
  const handleDelete = (item) => {
    if (window.confirm(`Hapus supplier ${item.nama_supplier}?\n\nPerhatian: Pastikan tidak ada transaksi pembelian yang terkait dengan supplier ini.`)) {
      // TODO: Check if supplier has related purchases before deleting
      // const hasPurchases = checkSupplierPurchases(item.kode_supplier);
      // if (hasPurchases) {
      //   toast.error('Tidak dapat menghapus supplier yang memiliki riwayat transaksi pembelian');
      //   return;
      // }
      toast.success('Supplier berhasil dihapus');
      fetchData();
    }
  };

  const handleSubmit = (values) => {
    if (mode === 'create') toast.success('Supplier berhasil ditambahkan');
    if (mode === 'edit') toast.success('Supplier berhasil diperbarui');
    setShowModal(false);
    fetchData();
  };

  // Filter data berdasarkan search query
  const filteredData = data.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.kode_supplier?.toLowerCase().includes(query) ||
      item.nama_supplier?.toLowerCase().includes(query) ||
      item.alamat?.toLowerCase().includes(query) ||
      item.telepon?.toLowerCase().includes(query) ||
      item.kontak?.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-40px)]">
      <Card className="flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Cari supplier (kode, nama, telepon, kota)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              startIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
            Tambah Supplier
          </Button>
        </div>
      </Card>

      <Card padding={false} className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data supplier'}
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            loading={loading}
            pagination={false}
            stickyHeader
            maxHeight="100%"
          />
        )}
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={
          mode === 'create'
            ? 'Tambah Supplier'
            : mode === 'edit'
              ? 'Edit Supplier'
              : 'Detail Supplier'
        }
      >
        <SupplierForm
          initialData={selectedItem}
          mode={mode}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}