import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import KategoriForm from './KategoriForm';
import { toast } from 'react-toastify';

export default function KategoriList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mode, setMode] = useState('create'); // create | edit | view

  const columns = [
    { key: 'kode', label: 'Kode', sortable: true },
    { key: 'nama', label: 'Nama Kategori', sortable: true },
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const dummy = [
        { kode: 'KTG001', nama: 'Elektronik' },
        { kode: 'KTG002', nama: 'Mekanik' },
        { kode: 'KTG003', nama: 'Aksesoris' }
      ];
      setData(dummy);
      setLoading(false);
    }, 300);
  };

  const handleCreate = () => { setMode('create'); setSelectedItem(null); setShowModal(true); };
  const handleEdit = (item) => { setMode('edit'); setSelectedItem(item); setShowModal(true); };
  const handleView = (item) => { setMode('view'); setSelectedItem(item); setShowModal(true); };
  const handleDelete = (item) => {
    if (window.confirm(`Hapus kategori ${item.nama}?`)) {
      toast.success('Kategori dihapus (dummy)');
      fetchData();
    }
  };
  const handleSubmit = (values) => {
    if (mode === 'create') toast.success('Kategori ditambahkan (dummy)');
    if (mode === 'edit') toast.success('Kategori diperbarui (dummy)');
    setShowModal(false);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategori</h1>
          <p className="text-gray-500 mt-1">Kelola kategori barang</p>
        </div>
        <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>Tambah Kategori</Button>
      </div>
      <Card padding={false}>
        <DataTable columns={columns} data={data} loading={loading} pagination={false} />
      </Card>
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={mode === 'create' ? 'Tambah Kategori' : mode === 'edit' ? 'Edit Kategori' : 'Detail Kategori'}
      >
        <KategoriForm
          initialData={selectedItem}
          mode={mode}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}