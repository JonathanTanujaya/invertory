import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Search, 
  Package 
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Select from '@components/ui/Select';
import Card from '@components/ui/Card';
import Modal from '@components/ui/Modal';

// Dummy data services
const fetchCustomers = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { kode_customer: 'CUST001', nama: 'Toko Makmur', kontak: '081234567890' },
        { kode_customer: 'CUST002', nama: 'CV Jaya Abadi', kontak: '081234567891' },
        { kode_customer: 'CUST003', nama: 'UD Berkah', kontak: '081234567892' },
      ]);
    }, 300);
  });
};

const fetchBarang = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { 
          kode_barang: 'BRG001', 
          nama_barang: 'Bearing 6205', 
          kode_kategori: 'KTG001',
          stok: 150, 
          minimal: 20 
        },
        { 
          kode_barang: 'BRG002', 
          nama_barang: 'Seal Kit AHM', 
          kode_kategori: 'KTG001',
          stok: 80, 
          minimal: 15 
        },
        { 
          kode_barang: 'BRG003', 
          nama_barang: 'Oil Filter KTM', 
          kode_kategori: 'KTG002',
          stok: 200, 
          minimal: 30 
        },
      ]);
    }, 300);
  });
};

// Item selector modal component
function ItemSelector({ isOpen, onClose, onSelect }) {
  const [barangList, setBarangList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchBarang().then(data => {
        setBarangList(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  const filteredBarang = barangList.filter(item =>
    item.kode_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pilih Barang"
      size="lg"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Cari kode atau nama barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Memuat data...
            </div>
          ) : filteredBarang.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada barang ditemukan
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBarang.map(item => (
                <button
                  key={item.kode_barang}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.kode_barang}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.nama_barang}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        Stok: {item.stok}
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {item.minimal}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function SalesForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      no_faktur: '',
      kode_customer: '',
      tanggal_penjualan: new Date().toISOString().split('T')[0],
      status: 'pending',
      catatan: '',
    }
  });

  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers().then(setCustomers);
    
    // Generate invoice number
    const today = new Date();
    const invoiceNo = `PJ${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    reset({ 
      no_faktur: invoiceNo,
      tanggal_penjualan: today.toISOString().split('T')[0],
      status: 'pending'
    });
  }, [reset]);

  const handleAddItem = (barang) => {
    // Check if item already exists
    const exists = items.find(item => item.kode_barang === barang.kode_barang);
    if (exists) {
      alert('Barang sudah ditambahkan. Silakan ubah jumlah jika perlu.');
      return;
    }

    setItems([...items, {
      kode_barang: barang.kode_barang,
      nama_barang: barang.nama_barang,
      stok_tersedia: barang.stok,
      jumlah: 1,
      harga_satuan: 0,
      diskon: 0,
      subtotal: 0
    }]);
  };

  const handleRemoveItem = (kode_barang) => {
    setItems(items.filter(item => item.kode_barang !== kode_barang));
  };

  const handleItemChange = (kode_barang, field, value) => {
    setItems(items.map(item => {
      if (item.kode_barang === kode_barang) {
        const updated = { ...item, [field]: parseFloat(value) || 0 };
        
        // Recalculate subtotal
        const beforeDiscount = updated.jumlah * updated.harga_satuan;
        const discountAmount = (beforeDiscount * updated.diskon) / 100;
        updated.subtotal = beforeDiscount - discountAmount;
        
        return updated;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const onSubmit = async (data) => {
    if (items.length === 0) {
      alert('Tambahkan minimal 1 barang');
      return;
    }

    // Validate stock
    const stockIssues = items.filter(item => item.jumlah > item.stok_tersedia);
    if (stockIssues.length > 0) {
      alert(`Stok tidak mencukupi untuk: ${stockIssues.map(i => i.nama_barang).join(', ')}`);
      return;
    }

    setLoading(true);

    const payload = {
      ...data,
      total_harga: calculateTotal(),
      detail_items: items.map(item => ({
        kode_barang: item.kode_barang,
        jumlah: item.jumlah,
        harga_satuan: item.harga_satuan,
        diskon: item.diskon,
        subtotal: item.subtotal
      }))
    };

    try {
      // TODO: Replace with actual API call
      console.log('Submitting penjualan:', payload);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Penjualan berhasil disimpan!');
      navigate('/transactions/penjualan/list');
    } catch (error) {
      console.error('Error saving penjualan:', error);
      alert('Gagal menyimpan penjualan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button
          variant="ghost"
          onClick={() => navigate('/transactions/penjualan/list')}
        >
          <X className="w-4 h-4 mr-2" />
          Batal
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Information */}
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Penjualan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="No. Faktur"
                {...register('no_faktur', { required: 'No. faktur wajib diisi' })}
                error={errors.no_faktur?.message}
                readOnly
                className="bg-gray-50"
              />

              <Select
                label="Customer"
                {...register('kode_customer', { required: 'Customer wajib dipilih' })}
                error={errors.kode_customer?.message}
              >
                <option value="">-- Pilih Customer --</option>
                {customers.map(customer => (
                  <option key={customer.kode_customer} value={customer.kode_customer}>
                    {customer.kode_customer} - {customer.nama}
                  </option>
                ))}
              </Select>

              <Input
                label="Tanggal Penjualan"
                type="date"
                {...register('tanggal_penjualan', { required: 'Tanggal wajib diisi' })}
                error={errors.tanggal_penjualan?.message}
              />

              <Select
                label="Status"
                {...register('status', { required: 'Status wajib dipilih' })}
                error={errors.status?.message}
              >
                <option value="pending">Pending</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan
              </label>
              <textarea
                {...register('catatan')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Catatan tambahan (opsional)"
              />
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Detail Barang</h2>
              <Button
                type="button"
                variant="primary"
                onClick={() => setShowItemSelector(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Barang
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Belum ada barang ditambahkan</p>
                <p className="text-sm text-gray-500 mt-1">
                  Klik tombol "Tambah Barang" untuk menambahkan barang
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Kode Barang
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Nama Barang
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Stok
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Jumlah
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Harga Satuan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Diskon (%)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Subtotal
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map(item => (
                      <tr key={item.kode_barang}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.kode_barang}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {item.nama_barang}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {item.stok_tersedia}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            max={item.stok_tersedia}
                            value={item.jumlah}
                            onChange={(e) => handleItemChange(item.kode_barang, 'jumlah', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.harga_satuan}
                            onChange={(e) => handleItemChange(item.kode_barang, 'harga_satuan', e.target.value)}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.diskon}
                            onChange={(e) => handleItemChange(item.kode_barang, 'diskon', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          Rp {item.subtotal.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.kode_barang)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {items.length > 0 && (
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="text-2xl font-bold text-gray-900">
                    Rp {calculateTotal().toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/transactions/penjualan/list')}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan Penjualan'}
          </Button>
        </div>
      </form>

      <ItemSelector
        isOpen={showItemSelector}
        onClose={() => setShowItemSelector(false)}
        onSelect={handleAddItem}
      />
    </div>
  );
}
