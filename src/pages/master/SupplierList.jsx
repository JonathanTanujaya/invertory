import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import SupplierForm from './SupplierForm';
import { toast } from 'react-toastify';

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
    { key: 'nama_supplier', label: 'Nama Supplier', sortable: true },
    { 
      key: 'alamat', 
      label: 'Alamat',
      render: (value) => (
        <span className="text-sm text-gray-600 line-clamp-2">{value || '-'}</span>
      ),
    },
    { key: 'telepon', label: 'Telepon' },
    { key: 'email', label: 'Email', render: (value) => value || '-' },
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
      const dummy = [
        { 
          kode_supplier: 'SUP001', 
          nama_supplier: 'PT Sumber Sparepart', 
          alamat: 'Jl. Sudirman No. 123, Jakarta Selatan',
          telepon: '021-12345678',
          email: 'info@sumbersparepart.com'
        },
        { 
          kode_supplier: 'SUP002', 
          nama_supplier: 'CV Mekanik Jaya', 
          alamat: 'Jl. Gatot Subroto No. 45, Jakarta Pusat',
          telepon: '08123456789',
          email: 'contact@mekanikjaya.com'
        },
        { 
          kode_supplier: 'SUP003', 
          nama_supplier: 'UD Elektronik Sejahtera', 
          alamat: 'Jl. Ahmad Yani No. 78, Bandung',
          telepon: '022-87654321',
          email: null
        },
      ];
      setData(dummy);
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
      item.email?.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
          Tambah Supplier
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Cari supplier (kode, nama, alamat, telepon, email)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            startIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </Card>

      <Card padding={false}>
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
          <>
            <DataTable 
              columns={columns} 
              data={paginatedData} 
              loading={loading} 
              pagination={false} 
            />
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-700">
                  Menampilkan {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredData.length)} dari {filteredData.length} data
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </>
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