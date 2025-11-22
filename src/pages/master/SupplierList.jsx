import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
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

  const columns = [
    { key: 'kode', label: 'Kode', sortable: true },
    { key: 'nama', label: 'Nama Supplier', sortable: true },
    { key: 'kontak', label: 'Kontak' },
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
        { kode: 'SUP001', nama: 'PT Sumber Sparepart', kontak: '08123456789' },
        { kode: 'SUP002', nama: 'CV Mekanik Jaya', kontak: '08129876543' }
      ];
      setData(dummy);
      setLoading(false);
    }, 300);
  };

  const handleCreate = () => { setMode('create'); setSelectedItem(null); setShowModal(true); };
  const handleEdit = (item) => { setMode('edit'); setSelectedItem(item); setShowModal(true); };
  const handleView = (item) => { setMode('view'); setSelectedItem(item); setShowModal(true); };
  const handleDelete = (item) => {
    if (window.confirm(`Hapus supplier ${item.nama}?`)) {
      toast.success('Supplier dihapus (dummy)');
      fetchData();
    }
  };
  const handleSubmit = (values) => {
    if (mode === 'create') toast.success('Supplier ditambahkan (dummy)');
    if (mode === 'edit') toast.success('Supplier diperbarui (dummy)');
    setShowModal(false);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier</h1>
          <p className="text-gray-500 mt-1">Kelola data pemasok</p>
        </div>
        <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>Tambah Supplier</Button>
      </div>
      <Card padding={false}>
        <DataTable columns={columns} data={data} loading={loading} pagination={false} />
      </Card>
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={mode === 'create' ? 'Tambah Supplier' : mode === 'edit' ? 'Edit Supplier' : 'Detail Supplier'}
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