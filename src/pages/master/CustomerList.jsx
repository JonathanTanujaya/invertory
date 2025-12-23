import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import CustomerForm from './CustomerForm';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/axios';

export default function CustomerList() {
  const { hasPermission } = useAuthStore();
  const canCreate = hasPermission('master-data.create');
  const canEdit = hasPermission('master-data.edit');
  const canDelete = hasPermission('master-data.delete');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mode, setMode] = useState('create');
  const [searchQuery, setSearchQuery] = useState('');

  const [areaMap, setAreaMap] = useState({});

  const columns = [
    {
      key: 'kode',
      label: 'Kode',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-sm font-semibold text-primary-600">
          {val}
        </span>
      )
    },
    {
      key: 'nama',
      label: 'Nama Customer',
      sortable: true,
      render: (val) => (
        <span className="font-medium text-gray-900">{val}</span>
      )
    },
    {
      key: 'area',
      label: 'Area',
      sortable: true,
      render: (val) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {val}
        </span>
      )
    },
    {
      key: 'telepon',
      label: 'No Telp',
      render: (val) => (
        <span className="text-sm text-gray-600">{val}</span>
      )
    },
    {
      key: 'kontak_person',
      label: 'Kontak Person',
      render: (val) => (
        <span className="text-sm text-gray-600">{val}</span>
      )
    },
    {
      key: 'actions',
      label: 'Aksi',
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleView(row)}><Eye className="w-4 h-4" /></Button>
          {canEdit && (
            <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}><Edit className="w-4 h-4" /></Button>
          )}
          {canDelete && (
            <Button size="sm" variant="ghost" onClick={() => handleDelete(row)}><Trash2 className="w-4 h-4 text-error-500" /></Button>
          )}
        </div>
      )
    }
  ];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [customersRes, areasRes] = await Promise.all([
        api.get('/customers'),
        api.get('/areas'),
      ]);

      const areas = Array.isArray(areasRes.data) ? areasRes.data : [];
      const nextAreaMap = areas.reduce((acc, area) => {
        acc[area.kode_area] = area.nama_area;
        return acc;
      }, {});
      setAreaMap(nextAreaMap);

      const customers = Array.isArray(customersRes.data) ? customersRes.data : [];
      const mappedData = customers.map((item) => ({
        kode: item.kode_customer,
        nama: item.nama_customer,
        alamat: item.alamat,
        telepon: item.telepon,
        kontak_person: item.kontak_person,
        kode_area: item.kode_area,
        area: nextAreaMap[item.kode_area] || item.kode_area,
      }));
      setData(mappedData);
    } catch (error) {
      toast.error('Gagal memuat data customer');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!canCreate) {
      toast.error('Anda tidak memiliki akses untuk menambah customer');
      return;
    }
    setMode('create');
    setSelectedItem(null);
    setShowModal(true);
  };
  const handleEdit = (item) => {
    if (!canEdit) {
      toast.error('Anda tidak memiliki akses untuk mengubah customer');
      return;
    }
    setMode('edit');
    setSelectedItem(item);
    setShowModal(true);
  };
  const handleView = (item) => { setMode('view'); setSelectedItem(item); setShowModal(true); };
  const handleDelete = (item) => {
    if (!canDelete) {
      toast.error('Anda tidak memiliki akses untuk menghapus customer');
      return;
    }
    if (window.confirm(`Hapus customer ${item.nama}?`)) {
      api
        .delete(`/customers/${item.kode}`)
        .then(() => {
          toast.success('Customer berhasil dihapus');
          fetchData();
        })
        .catch((error) => {
          const msg = error?.response?.data?.error;
          toast.error(msg || 'Gagal menghapus customer');
        });
    }
  };
  const handleSubmit = async (values) => {
    if (mode === 'create' && !canCreate) {
      toast.error('Anda tidak memiliki akses untuk menambah customer');
      return;
    }
    if (mode === 'edit' && !canEdit) {
      toast.error('Anda tidak memiliki akses untuk mengubah customer');
      return;
    }

    try {
      if (mode === 'create') {
        await api.post('/customers', {
          kode_customer: values.kode,
          nama_customer: values.nama,
          kode_area: values.kode_area,
          telepon: values.telepon,
          alamat: values.alamat,
        });
        toast.success('Customer berhasil ditambahkan');
      }

      if (mode === 'edit') {
        await api.put(`/customers/${selectedItem.kode}`, {
          nama_customer: values.nama,
          kode_area: values.kode_area,
          telepon: values.telepon,
          alamat: values.alamat,
        });
        toast.success('Customer berhasil diperbarui');
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      const msg = error?.response?.data?.error;
      toast.error(msg || 'Gagal menyimpan customer');
    }
  };

  // Filter sederhana berdasarkan kode, nama, telepon, area
  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.kode?.toLowerCase().includes(q) ||
      item.nama?.toLowerCase().includes(q) ||
      item.telepon?.toLowerCase().includes(q) ||
      item.area?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-40px)]">
      <Card className="flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Cari customer (kode, nama, telepon, area)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startIcon={<Search className="w-4 h-4" />}
            />
          </div>
          {canCreate && (
            <Button onClick={handleCreate} startIcon={<Plus className="w-4 h-4" />}>Tambah Customer</Button>
          )}
        </div>
      </Card>
      <Card padding={false} className="flex-1 overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredData}
          loading={loading}
          pagination={false}
          stickyHeader
          maxHeight="100%"
        />
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