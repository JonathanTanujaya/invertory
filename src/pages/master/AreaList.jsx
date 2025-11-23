import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import AreaForm from './AreaForm';
import { toast } from 'react-toastify';

export default function AreaList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mode, setMode] = useState('create'); // create | edit | view
  const [searchQuery, setSearchQuery] = useState('');

  const columns = [
    { 
      key: 'kode_area', 
      label: 'Kode', 
      sortable: true,
      render: (value) => (
        <span className="font-mono font-semibold text-primary-600">{value}</span>
      ),
    },
    { key: 'nama_area', label: 'Nama Area', sortable: true },
    {
      key: 'actions',
      label: 'Aksi',
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleView(row)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row)}>
            <Trash2 className="w-4 h-4 text-error-500" />
          </Button>
        </div>
      )
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    // Dummy data - replace with actual API call
    setTimeout(() => {
      const dummy = [
        { kode_area: 'JKT', nama_area: 'Jakarta' },
        { kode_area: 'BDG', nama_area: 'Bandung' },
        { kode_area: 'SBY', nama_area: 'Surabaya' },
        { kode_area: 'YGY', nama_area: 'Yogyakarta' },
        { kode_area: 'SMG', nama_area: 'Semarang' },
      ];
      setData(dummy);
      setLoading(false);
    }, 300);
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

  const handleDelete = (item) => {
    // TODO: Check if area has customers
    // const customersCount = checkCustomersInArea(item.kode_area);
    // if (customersCount > 0) {
    //   toast.error(`Area tidak dapat dihapus, masih digunakan oleh ${customersCount} customer`);
    //   return;
    // }
    
    if (window.confirm(`Hapus area ${item.nama_area}?`)) {
      toast.success('Area berhasil dihapus (dummy)');
      fetchData();
    }
  };

  const handleSubmit = (values) => {
    if (mode === 'create') {
      toast.success('Area berhasil ditambahkan (dummy)');
    } else if (mode === 'edit') {
      toast.success('Area berhasil diperbarui (dummy)');
    }
    setShowModal(false);
    fetchData();
  };

  const filteredData = data.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.kode_area?.toLowerCase().includes(query) ||
      item.nama_area?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>
          Tambah Area
        </Button>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Cari kode atau nama area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startIcon={<Search className="w-4 h-4 text-gray-500" />}
        />
      </Card>

      {/* Table */}
      <Card padding={false}>
        <DataTable
          columns={columns}
          data={filteredData}
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={
          mode === 'create'
            ? 'Tambah Area'
            : mode === 'edit'
            ? 'Edit Area'
            : 'Detail Area'
        }
      >
        <AreaForm
          initialData={selectedItem}
          mode={mode}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
