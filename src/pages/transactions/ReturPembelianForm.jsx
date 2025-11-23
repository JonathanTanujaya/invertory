import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Select from '@components/ui/Select';
import Card from '@components/ui/Card';

// Dummy data services
const fetchPembelianInvoices = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { 
          no_faktur: 'PB20240115001', 
          kode_supplier: 'SUP001',
          tanggal: '2024-01-15',
          total_harga: 5000000
        },
        { 
          no_faktur: 'PB20240116002', 
          kode_supplier: 'SUP002',
          tanggal: '2024-01-16',
          total_harga: 3500000
        },
      ]);
    }, 300);
  });
};

const fetchPembelianDetail = (no_faktur) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { kode_barang: 'BRG001', nama_barang: 'Bearing 6205', jumlah: 50 },
        { kode_barang: 'BRG002', nama_barang: 'Seal Kit AHM', jumlah: 30 },
      ]);
    }, 300);
  });
};

export default function ReturPembelianForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      no_retur: '',
      no_faktur_pembelian: '',
      tanggal_retur: new Date().toISOString().split('T')[0],
      alasan: '',
    }
  });

  const [invoices, setInvoices] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [returItems, setReturItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  const selectedInvoice = watch('no_faktur_pembelian');

  useEffect(() => {
    fetchPembelianInvoices().then(setInvoices);
    
    // Generate retur number
    const today = new Date();
    const returNo = `RP${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    reset({ 
      no_retur: returNo,
      tanggal_retur: today.toISOString().split('T')[0]
    });
  }, [reset]);

  useEffect(() => {
    if (selectedInvoice) {
      setLoadingItems(true);
      fetchPembelianDetail(selectedInvoice).then(items => {
        setAvailableItems(items);
        setLoadingItems(false);
      });
    } else {
      setAvailableItems([]);
      setReturItems([]);
    }
  }, [selectedInvoice]);

  const handleAddItem = (item) => {
    const exists = returItems.find(r => r.kode_barang === item.kode_barang);
    if (exists) {
      alert('Barang sudah ditambahkan');
      return;
    }

    setReturItems([...returItems, {
      kode_barang: item.kode_barang,
      nama_barang: item.nama_barang,
      jumlah_pembelian: item.jumlah,
      jumlah_retur: 1
    }]);
  };

  const handleRemoveItem = (kode_barang) => {
    setReturItems(returItems.filter(item => item.kode_barang !== kode_barang));
  };

  const handleItemChange = (kode_barang, value) => {
    setReturItems(returItems.map(item => {
      if (item.kode_barang === kode_barang) {
        return { ...item, jumlah_retur: parseInt(value) || 0 };
      }
      return item;
    }));
  };

  const onSubmit = async (data) => {
    if (returItems.length === 0) {
      alert('Tambahkan minimal 1 barang untuk diretur');
      return;
    }

    // Validate quantities
    const invalidItems = returItems.filter(item => 
      item.jumlah_retur <= 0 || item.jumlah_retur > item.jumlah_pembelian
    );
    if (invalidItems.length > 0) {
      alert('Jumlah retur tidak valid untuk beberapa barang');
      return;
    }

    setLoading(true);

    const payload = {
      ...data,
      detail_items: returItems.map(item => ({
        kode_barang: item.kode_barang,
        jumlah: item.jumlah_retur
      }))
    };

    try {
      // TODO: Replace with actual API call
      console.log('Submitting retur pembelian:', payload);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Retur pembelian berhasil disimpan!');
      navigate('/transactions/retur-pembelian/list');
    } catch (error) {
      console.error('Error saving retur pembelian:', error);
      alert('Gagal menyimpan retur pembelian');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button
          variant="ghost"
          onClick={() => navigate('/transactions/retur-pembelian/list')}
        >
          <X className="w-4 h-4 mr-2" />
          Batal
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Information */}
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Retur</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="No. Retur"
                {...register('no_retur', { required: 'No. retur wajib diisi' })}
                error={errors.no_retur?.message}
                readOnly
                className="bg-gray-50"
              />

              <Select
                label="No. Faktur Pembelian"
                {...register('no_faktur_pembelian', { required: 'Faktur pembelian wajib dipilih' })}
                error={errors.no_faktur_pembelian?.message}
              >
                <option value="">-- Pilih Faktur Pembelian --</option>
                {invoices.map(invoice => (
                  <option key={invoice.no_faktur} value={invoice.no_faktur}>
                    {invoice.no_faktur} - {new Date(invoice.tanggal).toLocaleDateString('id-ID')}
                  </option>
                ))}
              </Select>

              <Input
                label="Tanggal Retur"
                type="date"
                {...register('tanggal_retur', { required: 'Tanggal wajib diisi' })}
                error={errors.tanggal_retur?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan Retur <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('alasan', { required: 'Alasan wajib diisi' })}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.alasan ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Jelaskan alasan retur barang..."
              />
              {errors.alasan && (
                <p className="mt-1 text-sm text-red-500">{errors.alasan.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Available Items from Invoice */}
        {selectedInvoice && (
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Barang yang Dibeli</h2>
              
              {loadingItems ? (
                <div className="text-center py-8 text-gray-500">
                  Memuat data barang...
                </div>
              ) : availableItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada data barang
                </div>
              ) : (
                <div className="space-y-2">
                  {availableItems.map(item => {
                    const isAdded = returItems.find(r => r.kode_barang === item.kode_barang);
                    return (
                      <div
                        key={item.kode_barang}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.kode_barang} - {item.nama_barang}
                          </div>
                          <div className="text-sm text-gray-500">
                            Jumlah dibeli: {item.jumlah}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant={isAdded ? 'ghost' : 'primary'}
                          size="sm"
                          onClick={() => handleAddItem(item)}
                          disabled={isAdded}
                        >
                          {isAdded ? 'Sudah Ditambahkan' : 'Tambahkan'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Retur Items */}
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Barang yang Diretur</h2>

            {returItems.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600">Belum ada barang untuk diretur</p>
                <p className="text-sm text-gray-500 mt-1">
                  Pilih faktur pembelian terlebih dahulu, lalu pilih barang yang akan diretur
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
                        Jumlah Dibeli
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Jumlah Retur
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {returItems.map(item => (
                      <tr key={item.kode_barang}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.kode_barang}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {item.nama_barang}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {item.jumlah_pembelian}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            max={item.jumlah_pembelian}
                            value={item.jumlah_retur}
                            onChange={(e) => handleItemChange(item.kode_barang, e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
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
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/transactions/retur-pembelian/list')}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan Retur'}
          </Button>
        </div>
      </form>
    </div>
  );
}
