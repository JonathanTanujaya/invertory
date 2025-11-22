import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  AlertCircle, 
  Package,
  TrendingUp,
  TrendingDown,
  CheckCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Select from '@components/ui/Select';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';

// Dummy data service
const fetchBarang = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { 
          kode_barang: 'BRG001', 
          nama_barang: 'Bearing 6205', 
          stok_sistem: 150,
          minimal: 20 
        },
        { 
          kode_barang: 'BRG002', 
          nama_barang: 'Seal Kit AHM', 
          stok_sistem: 80,
          minimal: 15 
        },
        { 
          kode_barang: 'BRG003', 
          nama_barang: 'Oil Filter KTM', 
          stok_sistem: 200,
          minimal: 30 
        },
      ]);
    }, 300);
  });
};

const saveStokOpname = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Saving stok opname:', data);
      resolve({ success: true });
    }, 1000);
  });
};

export default function StokOpnameForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      kode_barang: '',
      tanggal_opname: new Date().toISOString().split('T')[0],
      stok_fisik: 0,
      keterangan: '',
    }
  });

  const [barangList, setBarangList] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [loading, setLoading] = useState(false);

  const stok_fisik = watch('stok_fisik');

  useEffect(() => {
    fetchBarang().then(setBarangList);
  }, []);

  const handleBarangChange = (e) => {
    const kode = e.target.value;
    const barang = barangList.find(b => b.kode_barang === kode);
    setSelectedBarang(barang || null);
    
    if (barang) {
      setValue('stok_fisik', barang.stok_sistem);
    }
  };

  const getSelisih = () => {
    if (!selectedBarang) return 0;
    return parseInt(stok_fisik || 0) - selectedBarang.stok_sistem;
  };

  const getSelisihStatus = () => {
    const selisih = getSelisih();
    if (selisih === 0) return { type: 'success', label: 'Sesuai', icon: CheckCircle };
    if (selisih > 0) return { type: 'warning', label: 'Lebih', icon: TrendingUp };
    return { type: 'error', label: 'Kurang', icon: TrendingDown };
  };

  const onSubmit = async (data) => {
    if (!selectedBarang) {
      alert('Pilih barang terlebih dahulu');
      return;
    }

    setLoading(true);

    const payload = {
      ...data,
      nama_barang: selectedBarang.nama_barang,
      stok_sistem: selectedBarang.stok_sistem,
      stok_fisik: parseInt(data.stok_fisik),
      selisih: getSelisih()
    };

    try {
      await saveStokOpname(payload);
      alert('Stok opname berhasil disimpan!');
      navigate('/transactions/stok-opname/list');
    } catch (error) {
      console.error('Error saving stok opname:', error);
      alert('Gagal menyimpan stok opname');
    } finally {
      setLoading(false);
    }
  };

  const selisihStatus = getSelisihStatus();
  const SelisihIcon = selisihStatus.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Stok Opname</h1>
          <p className="text-gray-600 mt-1">Rekonsiliasi stok sistem dengan stok fisik</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Form Input */}
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Opname</h2>
            
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
                label="Tanggal Opname"
                type="date"
                {...register('tanggal_opname', { required: 'Tanggal wajib diisi' })}
                error={errors.tanggal_opname?.message}
              />
            </div>

            {selectedBarang && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 mb-1">Stok Sistem</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {selectedBarang.stok_sistem}
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Stok Fisik"
                      type="number"
                      min="0"
                      {...register('stok_fisik', { 
                        required: 'Stok fisik wajib diisi',
                        min: { value: 0, message: 'Stok tidak boleh negatif' }
                      })}
                      error={errors.stok_fisik?.message}
                    />
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    selisihStatus.type === 'success' ? 'bg-green-50 border-green-200' :
                    selisihStatus.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                  }`}>
                    <div className={`text-sm mb-1 ${
                      selisihStatus.type === 'success' ? 'text-green-600' :
                      selisihStatus.type === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      Selisih
                    </div>
                    <div className="flex items-center space-x-2">
                      <SelisihIcon className={`w-6 h-6 ${
                        selisihStatus.type === 'success' ? 'text-green-600' :
                        selisihStatus.type === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`} />
                      <div className={`text-2xl font-bold ${
                        selisihStatus.type === 'success' ? 'text-green-900' :
                        selisihStatus.type === 'warning' ? 'text-yellow-900' :
                        'text-red-900'
                      }`}>
                        {getSelisih() > 0 ? '+' : ''}{getSelisih()}
                      </div>
                    </div>
                    <Badge variant={selisihStatus.type} className="mt-2">
                      {selisihStatus.label}
                    </Badge>
                  </div>
                </div>

                {getSelisih() !== 0 && (
                  <div className={`flex items-start space-x-3 p-4 rounded-lg ${
                    getSelisih() > 0 ? 'bg-yellow-50' : 'bg-red-50'
                  }`}>
                    <AlertCircle className={`w-5 h-5 mt-0.5 ${
                      getSelisih() > 0 ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                    <div>
                      <div className={`font-medium ${
                        getSelisih() > 0 ? 'text-yellow-900' : 'text-red-900'
                      }`}>
                        {getSelisih() > 0 ? 'Stok Lebih' : 'Stok Kurang'}
                      </div>
                      <div className={`text-sm mt-1 ${
                        getSelisih() > 0 ? 'text-yellow-700' : 'text-red-700'
                      }`}>
                        {getSelisih() > 0 
                          ? `Terdapat kelebihan stok sebanyak ${Math.abs(getSelisih())} unit. Pastikan untuk mencatat sumber kelebihan stok.`
                          : `Terdapat kekurangan stok sebanyak ${Math.abs(getSelisih())} unit. Periksa kemungkinan kehilangan atau pencurian.`
                        }
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keterangan
              </label>
              <textarea
                {...register('keterangan')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Catatan tambahan tentang hasil opname..."
              />
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Tentang Stok Opname</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Stok opname adalah proses penghitungan fisik barang di gudang</li>
                  <li>• Bandingkan hasil hitungan fisik dengan catatan sistem</li>
                  <li>• Selisih positif (+) berarti stok fisik lebih banyak dari sistem</li>
                  <li>• Selisih negatif (-) berarti stok fisik lebih sedikit dari sistem</li>
                  <li>• Catat penyebab selisih pada kolom keterangan</li>
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
            onClick={() => navigate('/transactions/stok-opname/list')}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !selectedBarang}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan Opname'}
          </Button>
        </div>
      </form>
    </div>
  );
}
