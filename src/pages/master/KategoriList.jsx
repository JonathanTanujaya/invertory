import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import KategoriForm from './KategoriForm';
import AreaForm from './AreaForm';
import { toast } from 'react-toastify';
import kategoriJson from '@/data/dummy/m_kategori.json';
import areaJson from '@/data/dummy/m_area.json';

export default function KategoriList() {
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
          <Button size="sm" variant="ghost" onClick={() => handleEditKategori(row)}><Edit className="w-4 h-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => handleDeleteKategori(row)}><Trash2 className="w-4 h-4 text-error-500" /></Button>
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
          <Button size="sm" variant="ghost" onClick={() => handleEditArea(row)}><Edit className="w-4 h-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => handleDeleteArea(row)}><Trash2 className="w-4 h-4 text-error-500" /></Button>
        </div>
      )
    }
  ];

  useEffect(() => {
    fetchKategoriData();
    fetchAreaData();
  }, []);

  const fetchKategoriData = () => {
    setKategoriLoading(true);
    setTimeout(() => {
      setKategoriData(kategoriJson);
      setKategoriLoading(false);
    }, 300);
  };

  const fetchAreaData = () => {
    setAreaLoading(true);
    setTimeout(() => {
      setAreaData(areaJson);
      setAreaLoading(false);
    }, 300);
  };

  // Kategori handlers
  const handleCreateKategori = () => { setKategoriMode('create'); setSelectedKategori(null); setShowKategoriModal(true); };
  const handleEditKategori = (item) => { setKategoriMode('edit'); setSelectedKategori(item); setShowKategoriModal(true); };
  const handleDeleteKategori = (item) => {
    if (window.confirm(`Hapus kategori ${item.nama_kategori}?\n\nPerhatian: Pastikan tidak ada barang yang menggunakan kategori ini.`)) {
      toast.success('Kategori berhasil dihapus');
      fetchKategoriData();
    }
  };
  const handleKategoriSubmit = (values) => {
    if (kategoriMode === 'create') toast.success('Kategori berhasil ditambahkan');
    if (kategoriMode === 'edit') toast.success('Kategori berhasil diperbarui');
    setShowKategoriModal(false);
    fetchKategoriData();
  };

  // Area handlers
  const handleCreateArea = () => { setAreaMode('create'); setSelectedArea(null); setShowAreaModal(true); };
  const handleEditArea = (item) => { setAreaMode('edit'); setSelectedArea(item); setShowAreaModal(true); };
  const handleDeleteArea = (item) => {
    if (window.confirm(`Hapus area ${item.nama_area}?\n\nPerhatian: Pastikan tidak ada customer yang menggunakan area ini.`)) {
      toast.success('Area berhasil dihapus');
      fetchAreaData();
    }
  };
  const handleAreaSubmit = (values) => {
    if (areaMode === 'create') toast.success('Area berhasil ditambahkan');
    if (areaMode === 'edit') toast.success('Area berhasil diperbarui');
    setShowAreaModal(false);
    fetchAreaData();
  };

  return (
    <div className="h-[calc(100vh-120px)] pb-4">
      <div className="grid grid-cols-2 gap-6 h-full">
        {/* Kategori Section */}
        <div className="flex flex-col h-full overflow-hidden bg-white rounded-lg shadow-soft border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">Kategori Barang</h2>
            <Button onClick={handleCreateKategori} startIcon={<Plus className="w-4 h-4" />}>
              Tambah Kategori
            </Button>
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
                        <Button size="sm" variant="ghost" onClick={() => handleEditKategori(row)}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteKategori(row)}><Trash2 className="w-4 h-4 text-error-500" /></Button>
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
            <Button onClick={handleCreateArea} startIcon={<Plus className="w-4 h-4" />}>
              Tambah Area
            </Button>
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
                        <Button size="sm" variant="ghost" onClick={() => handleEditArea(row)}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteArea(row)}><Trash2 className="w-4 h-4 text-error-500" /></Button>
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