import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import KategoriForm from './KategoriForm';
import AreaForm from './AreaForm';
import { toast } from 'react-toastify';

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
      key: 'kode', 
      label: 'Kode', 
      sortable: true,
      render: (value) => (
        <span className="font-mono font-semibold text-primary-600">{value}</span>
      ),
    },
    { key: 'nama', label: 'Nama Kategori', sortable: true },
    {
      key: 'actions',
      label: 'Aksi',
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleViewKategori(row)}><Eye className="w-4 h-4" /></Button>
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
          <Button size="sm" variant="ghost" onClick={() => handleViewArea(row)}><Eye className="w-4 h-4" /></Button>
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
      const dummy = [
        { kode: 'KTG001', nama: 'Elektronik' },
        { kode: 'KTG002', nama: 'Mekanik' },
        { kode: 'KTG003', nama: 'Aksesoris' }
      ];
      setKategoriData(dummy);
      setKategoriLoading(false);
    }, 300);
  };

  const fetchAreaData = () => {
    setAreaLoading(true);
    setTimeout(() => {
      const dummy = [
        { kode_area: 'JKT', nama_area: 'Jakarta' },
        { kode_area: 'BDG', nama_area: 'Bandung' },
        { kode_area: 'SBY', nama_area: 'Surabaya' },
        { kode_area: 'YGY', nama_area: 'Yogyakarta' },
        { kode_area: 'SMG', nama_area: 'Semarang' }
      ];
      setAreaData(dummy);
      setAreaLoading(false);
    }, 300);
  };

  // Kategori handlers
  const handleCreateKategori = () => { setKategoriMode('create'); setSelectedKategori(null); setShowKategoriModal(true); };
  const handleEditKategori = (item) => { setKategoriMode('edit'); setSelectedKategori(item); setShowKategoriModal(true); };
  const handleViewKategori = (item) => { setKategoriMode('view'); setSelectedKategori(item); setShowKategoriModal(true); };
  const handleDeleteKategori = (item) => {
    if (window.confirm(`Hapus kategori ${item.nama}?\n\nPerhatian: Pastikan tidak ada barang yang menggunakan kategori ini.`)) {
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
  const handleViewArea = (item) => { setAreaMode('view'); setSelectedArea(item); setShowAreaModal(true); };
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kategori & Area</h1>
        <p className="text-gray-500 mt-1">Kelola kategori barang dan area customer</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Kategori Section */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Kategori Barang</h2>
            <Button onClick={handleCreateKategori} startIcon={<Plus className="w-4 h-4" />}>
              Tambah Kategori
            </Button>
          </div>
          <DataTable columns={kategoriColumns} data={kategoriData} loading={kategoriLoading} pagination={false} />
        </Card>

        {/* Area Section */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Area Customer</h2>
            <Button onClick={handleCreateArea} startIcon={<Plus className="w-4 h-4" />}>
              Tambah Area
            </Button>
          </div>
          <DataTable columns={areaColumns} data={areaData} loading={areaLoading} pagination={false} />
        </Card>
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