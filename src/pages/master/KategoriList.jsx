import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import KategoriForm from './KategoriForm';
import AreaForm from './AreaForm';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/axios';

export default function KategoriList() {
  const { hasPermission } = useAuthStore();
  const canCreate = hasPermission('master-data.create');
  const canEdit = hasPermission('master-data.edit');
  const canDelete = hasPermission('master-data.delete');

  const [kategoriData, setKategoriData] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [kategoriLoading, setKategoriLoading] = useState(false);
  const [areaLoading, setAreaLoading] = useState(false);
  const [showKategoriModal, setShowKategoriModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [kategoriMode, setKategoriMode] = useState('create');
  const [areaMode, setAreaMode] = useState('create');

  const kategoriColumns = [
    {
      key: 'kode_kategori',
      label: 'Kode',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-semibold text-primary-600">{value}</span>
      ),
    },
    { key: 'nama_kategori', label: 'Nama Kategori', sortable: true },
    {
      key: 'actions',
      label: 'Aksi',
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          {canEdit && (
            <Button size="sm" variant="ghost" onClick={() => handleEditKategori(row)}><Edit className="w-4 h-4" /></Button>
          )}
          {canDelete && (
            <Button size="sm" variant="ghost" onClick={() => handleDeleteKategori(row)}><Trash2 className="w-4 h-4 text-error-500" /></Button>
          )}
        </div>
      )
    }
  ];

  const areaColumns = [
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
          {canEdit && (
            <Button size="sm" variant="ghost" onClick={() => handleEditArea(row)}><Edit className="w-4 h-4" /></Button>
          )}
          {canDelete && (
            <Button size="sm" variant="ghost" onClick={() => handleDeleteArea(row)}><Trash2 className="w-4 h-4 text-error-500" /></Button>
          )}
        </div>
      )
    }
  ];

  useEffect(() => {
    fetchKategoriData();
    fetchAreaData();
  }, []);

  const fetchKategoriData = async () => {
    setKategoriLoading(true);
    try {
      const res = await api.get('/categories');
      setKategoriData(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error('Gagal memuat kategori');
    } finally {
      setKategoriLoading(false);
    }
  };

  const fetchAreaData = async () => {
    setAreaLoading(true);
    try {
      const res = await api.get('/areas');
      setAreaData(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error('Gagal memuat area');
    } finally {
      setAreaLoading(false);
    }
  };

  // Kategori handlers
  const handleCreateKategori = () => {
    if (!canCreate) {
      toast.error('Anda tidak memiliki akses untuk menambah kategori');
      return;
    }
    setKategoriMode('create');
    setSelectedKategori(null);
    setShowKategoriModal(true);
  };

  const handleEditKategori = (item) => {
    if (!canEdit) {
      toast.error('Anda tidak memiliki akses untuk mengubah kategori');
      return;
    }
    setKategoriMode('edit');
    setSelectedKategori(item);
    setShowKategoriModal(true);
  };
  const handleDeleteKategori = (item) => {
    if (!canDelete) {
      toast.error('Anda tidak memiliki akses untuk menghapus kategori');
      return;
    }
    if (window.confirm(`Hapus kategori ${item.nama_kategori}?`)) {
      api
        .delete(`/categories/${item.kode_kategori}`)
        .then(() => {
          toast.success('Kategori berhasil dihapus');
          fetchKategoriData();
        })
        .catch((error) => {
          const msg = error?.response?.data?.error;
          if (error?.response?.status === 409) {
            toast.error(msg || 'Kategori tidak dapat dihapus karena masih digunakan');
            return;
          }
          toast.error(msg || 'Gagal menghapus kategori');
        });
    }
  };
  const handleKategoriSubmit = async (values) => {
    if (kategoriMode === 'create' && !canCreate) {
      toast.error('Anda tidak memiliki akses untuk menambah kategori');
      return;
    }
    if (kategoriMode === 'edit' && !canEdit) {
      toast.error('Anda tidak memiliki akses untuk mengubah kategori');
      return;
    }

    try {
      if (kategoriMode === 'create') {
        await api.post('/categories', {
          kode_kategori: values.kode,
          nama_kategori: values.nama,
        });
        toast.success('Kategori berhasil ditambahkan');
      } else if (kategoriMode === 'edit') {
        await api.put(`/categories/${selectedKategori.kode_kategori}`, {
          nama_kategori: values.nama,
        });
        toast.success('Kategori berhasil diperbarui');
      }
      setShowKategoriModal(false);
      fetchKategoriData();
    } catch (error) {
      const msg = error?.response?.data?.error;
      toast.error(msg || 'Gagal menyimpan kategori');
    }
  };

  // Area handlers
  const handleCreateArea = () => {
    if (!canCreate) {
      toast.error('Anda tidak memiliki akses untuk menambah area');
      return;
    }
    setAreaMode('create');
    setSelectedArea(null);
    setShowAreaModal(true);
  };

  const handleEditArea = (item) => {
    if (!canEdit) {
      toast.error('Anda tidak memiliki akses untuk mengubah area');
      return;
    }
    setAreaMode('edit');
    setSelectedArea(item);
    setShowAreaModal(true);
  };
  const handleDeleteArea = (item) => {
    if (!canDelete) {
      toast.error('Anda tidak memiliki akses untuk menghapus area');
      return;
    }
    if (window.confirm(`Hapus area ${item.nama_area}?`)) {
      api
        .delete(`/areas/${item.kode_area}`)
        .then(() => {
          toast.success('Area berhasil dihapus');
          fetchAreaData();
        })
        .catch((error) => {
          const msg = error?.response?.data?.error;
          if (error?.response?.status === 409) {
            toast.error(msg || 'Area tidak dapat dihapus karena masih digunakan');
            return;
          }
          toast.error(msg || 'Gagal menghapus area');
        });
    }
  };
  const handleAreaSubmit = async (values) => {
    if (areaMode === 'create' && !canCreate) {
      toast.error('Anda tidak memiliki akses untuk menambah area');
      return;
    }
    if (areaMode === 'edit' && !canEdit) {
      toast.error('Anda tidak memiliki akses untuk mengubah area');
      return;
    }

    try {
      if (areaMode === 'create') {
        await api.post('/areas', values);
        toast.success('Area berhasil ditambahkan');
      } else if (areaMode === 'edit') {
        await api.put(`/areas/${selectedArea.kode_area}`, {
          nama_area: values.nama_area,
        });
        toast.success('Area berhasil diperbarui');
      }
      setShowAreaModal(false);
      fetchAreaData();
    } catch (error) {
      const msg = error?.response?.data?.error;
      toast.error(msg || 'Gagal menyimpan area');
    }
  };

  return (
    <div className="h-[calc(100vh-30px)] pb-4">
      <div className="grid grid-cols-2 gap-6 h-full">
        {/* Kategori Section */}
        <div className="flex flex-col h-full overflow-hidden bg-white rounded-lg shadow-soft border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">Kategori Barang</h2>
            {canCreate && (
              <Button onClick={handleCreateKategori} startIcon={<Plus className="w-4 h-4" />}>
                Tambah Kategori
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kategori</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kategoriData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <span className="font-mono font-semibold text-primary-600">{row.kode_kategori}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.nama_kategori}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {canEdit && (
                          <Button size="sm" variant="ghost" onClick={() => handleEditKategori(row)}><Edit className="w-4 h-4" /></Button>
                        )}
                        {canDelete && (
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteKategori(row)}><Trash2 className="w-4 h-4 text-error-500" /></Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Area Section */}
        <div className="flex flex-col h-full overflow-hidden bg-white rounded-lg shadow-soft border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">Area Customer</h2>
            {canCreate && (
              <Button onClick={handleCreateArea} startIcon={<Plus className="w-4 h-4" />}>
                Tambah Area
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Area</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {areaData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <span className="font-mono font-semibold text-primary-600">{row.kode_area}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.nama_area}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {canEdit && (
                          <Button size="sm" variant="ghost" onClick={() => handleEditArea(row)}><Edit className="w-4 h-4" /></Button>
                        )}
                        {canDelete && (
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteArea(row)}><Trash2 className="w-4 h-4 text-error-500" /></Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Kategori Modal */}
      <Modal
        open={showKategoriModal}
        onClose={() => setShowKategoriModal(false)}
        title={kategoriMode === 'create' ? 'Tambah Kategori' : kategoriMode === 'edit' ? 'Edit Kategori' : 'Detail Kategori'}
      >
        <KategoriForm
          initialData={selectedKategori}
          mode={kategoriMode}
          onSubmit={handleKategoriSubmit}
          onCancel={() => setShowKategoriModal(false)}
        />
      </Modal>

      {/* Area Modal */}
      <Modal
        open={showAreaModal}
        onClose={() => setShowAreaModal(false)}
        title={areaMode === 'create' ? 'Tambah Area' : areaMode === 'edit' ? 'Edit Area' : 'Detail Area'}
      >
        <AreaForm
          initialData={selectedArea}
          mode={areaMode}
          onSubmit={handleAreaSubmit}
          onCancel={() => setShowAreaModal(false)}
        />
      </Modal>
    </div>
  );
}