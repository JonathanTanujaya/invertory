import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  X,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Select from '@components/ui/Select';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';

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
          stok: 150,
        },
        { 
          kode_barang: 'BRG002', 
          nama_barang: 'Seal Kit AHM', 
          stok: 80,
        },
        { 
          kode_barang: 'BRG003', 
          nama_barang: 'Oil Filter KTM', 
          stok: 200,
        },
      ]);
    }, 300);
  });
};

const saveCustomerClaim = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Saving customer claim:', data);
      resolve({ success: true });
    }, 1000);
  });
};

export default function CustomerClaimForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      no_claim: '',
      kode_customer: '',
      kode_barang: '',
      jumlah: 1,
      tanggal_claim: new Date().toISOString().split('T')[0],
      alasan: '',
      status: 'pending',
    }
  });

  const [customers, setCustomers] = useState([]);
  const [barangList, setBarangList] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [loading, setLoading] = useState(false);

  const jumlah = watch('jumlah');

  useEffect(() => {
    fetchCustomers().then(setCustomers);
    fetchBarang().then(setBarangList);
    
    // Generate claim number
    const today = new Date();
    const claimNo = `CL${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    reset({ 
      no_claim: claimNo,
      tanggal_claim: today.toISOString().split('T')[0],
      status: 'pending'
    });
  }, [reset]);

  const handleBarangChange = (e) => {
    const kode = e.target.value;
    const barang = barangList.find(b => b.kode_barang === kode);
    setSelectedBarang(barang || null);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'diproses':
        return <Badge variant="info">Diproses</Badge>;
      case 'selesai':
        return <Badge variant="success">Selesai</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const onSubmit = async (data) => {
    if (!selectedBarang) {
      alert('Pilih barang terlebih dahulu');
      return;
    }

    if (parseInt(data.jumlah) > selectedBarang.stok) {
      if (!confirm(`Jumlah claim (${data.jumlah}) melebihi stok tersedia (${selectedBarang.stok}). Lanjutkan?`)) {
        return;
      }
    }

    setLoading(true);

    const payload = {
      ...data,
      nama_barang: selectedBarang.nama_barang,
      jumlah: parseInt(data.jumlah)
    };

    try {
      await saveCustomerClaim(payload);
      alert('Customer claim berhasil disimpan!');
      navigate('/transactions/customer-claim/list');
    } catch (error) {
      console.error('Error saving customer claim:', error);
      alert('Gagal menyimpan customer claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Customer Claim</h1>
          <p className="text-gray-600 mt-1">Buat klaim baru dari customer</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate('/transactions/customer-claim/list')}
        >
          <X className="w-4 h-4 mr-2" />
          Batal
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Information */}
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Claim</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="No. Claim"
                {...register('no_claim', { required: 'No. claim wajib diisi' })}
                error={errors.no_claim?.message}
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
                label="Tanggal Claim"
                type="date"
                {...register('tanggal_claim', { required: 'Tanggal wajib diisi' })}
                error={errors.tanggal_claim?.message}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-3">
                  <Select
                    {...register('status', { required: 'Status wajib dipilih' })}
                    error={errors.status?.message}
                  >
                    <option value="pending">Pending</option>
                    <option value="diproses">Diproses</option>
                    <option value="selesai">Selesai</option>
                  </Select>
                  {watch('status') && getStatusBadge(watch('status'))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Claim Details */}
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detail Barang</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Barang"
                {...register('kode_barang', { required: 'Barang wajib dipilih' })}
                error={errors.kode_barang?.message}
                onChange={handleBarangChange}
              >
                <option value="">-- Pilih Barang --</option>
                {barangList.map(barang => (
                  <option key={barang.kode_barang} value={barang.kode_barang}>
                    {barang.kode_barang} - {barang.nama_barang}
                  </option>
                ))}
              </Select>

              <Input
                label="Jumlah"
                type="number"
                min="1"
                {...register('jumlah', { 
                  required: 'Jumlah wajib diisi',
                  min: { value: 1, message: 'Jumlah minimal 1' }
                })}
                error={errors.jumlah?.message}
              />
            </div>

            {selectedBarang && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Nama Barang</div>
                    <div className="font-medium text-gray-900">{selectedBarang.nama_barang}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Stok Tersedia</div>
                    <div className="font-medium text-gray-900">{selectedBarang.stok} unit</div>
                  </div>
                </div>

                {parseInt(jumlah) > selectedBarang.stok && (
                  <div className="flex items-start space-x-2 mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-700">
                      Jumlah claim melebihi stok tersedia. Pastikan barang dapat dipenuhi.
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan Claim <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('alasan', { required: 'Alasan wajib diisi' })}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.alasan ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Jelaskan detail alasan claim dari customer (contoh: barang rusak, cacat produksi, salah kirim, dll)..."
              />
              {errors.alasan && (
                <p className="mt-1 text-sm text-red-500">{errors.alasan.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Tentang Customer Claim</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Customer claim adalah pengajuan klaim dari customer atas barang yang bermasalah</li>
                  <li>• Status "Pending" untuk claim yang baru diajukan</li>
                  <li>• Status "Diproses" untuk claim yang sedang ditangani</li>
                  <li>• Status "Selesai" untuk claim yang sudah diselesaikan</li>
                  <li>• Pastikan alasan claim dicatat dengan jelas untuk keperluan analisis</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/transactions/customer-claim/list')}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan Claim'}
          </Button>
        </div>
      </form>
    </div>
  );
}
