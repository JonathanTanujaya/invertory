import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import CustomerForm from './CustomerForm';
import { toast } from 'react-toastify';

export default function CustomerList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mode, setMode] = useState('create');
  const [searchQuery, setSearchQuery] = useState('');

  const columns = [
    { key: 'kode', label: 'Kode', sortable: true },
    { key: 'nama', label: 'Nama Customer', sortable: true },
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
        { kode: 'CUST001', nama: 'Toko Jaya', kontak: '081255556666' },
        { kode: 'CUST002', nama: 'Bengkel Motor Sejahtera', kontak: '081233344455' }
      ];
      setData(dummy);
      setLoading(false);
    }, 300);
  };

  const handleCreate = () => { setMode('create'); setSelectedItem(null); setShowModal(true); };
  const handleEdit = (item) => { setMode('edit'); setSelectedItem(item); setShowModal(true); };
  const handleView = (item) => { setMode('view'); setSelectedItem(item); setShowModal(true); };
  const handleDelete = (item) => {
    if (window.confirm(`Hapus customer ${item.nama}?`)) {
      toast.success('Customer dihapus (dummy)');
      fetchData();
    }
  };
  const handleSubmit = (values) => {
    if (mode === 'create') toast.success('Customer ditambahkan (dummy)');
    if (mode === 'edit') toast.success('Customer diperbarui (dummy)');
    setShowModal(false);
    fetchData();
  };

  // Filter sederhana berdasarkan kode, nama, kontak
  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.kode?.toLowerCase().includes(q) ||
      item.nama?.toLowerCase().includes(q) ||
      item.kontak?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Cari customer (kode, nama, kontak)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>Tambah Customer</Button>
        </div>
      </Card>
      <Card padding={false}>
        <DataTable columns={columns} data={filteredData} loading={loading} pagination={false} />
      </Card>
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={mode === 'create' ? 'Tambah Customer' : mode === 'edit' ? 'Edit Customer' : 'Detail Customer'}
      >
        <CustomerForm
          initialData={selectedItem}
          mode={mode}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}