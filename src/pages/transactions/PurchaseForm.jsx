import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Search } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ItemSelector from '@/components/shared/ItemSelector';
import { formatCurrency, formatNumber, calculateSubtotal } from '@/utils/helpers';
import { toast } from 'react-toastify';

export default function PurchaseForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues: {
      no_faktur: '',
      kode_supplier: '',
      tanggal_pembelian: new Date().toISOString().split('T')[0],
      catatan: '',
    },
  });

  const [items, setItems] = useState([]);
  const [showItemSelector, setShowItemSelector] = useState(false);

  const supplierOptions = [
    { value: 'SUP001', label: 'PT Supplier Jaya' },
    { value: 'SUP002', label: 'CV Maju Jaya' },
    { value: 'SUP003', label: 'PT Berkah Selalu' },
  ];

  const handleAddItem = (item) => {
    const existing = items.find((i) => i.kode_barang === item.kode_barang);
    if (existing) {
      toast.warning('Item sudah ditambahkan');
      return;
    }

    setItems([
      ...items,
      {
        ...item,
        jumlah: 1,
        harga_satuan: item.harga_beli || 0,
      },
    ]);
    setShowItemSelector(false);
  };

  const handleUpdateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = parseFloat(value) || 0;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getTotalHarga = () => {
    return items.reduce((total, item) => {
      return total + item.jumlah * item.harga_satuan;
    }, 0);
  };

  const onSubmit = async (data) => {
    if (items.length === 0) {
      toast.error('Minimal tambahkan 1 item');
      return;
    }

    const payload = {
      ...data,
      total_harga: getTotalHarga(),
      items,
    };

    try {
      // API call
      console.log('Submit:', payload);
      toast.success('Pembelian berhasil disimpan');
      // Reset or redirect
    } catch (error) {
      toast.error('Gagal menyimpan pembelian');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stok Masuk (Pembelian)</h1>
        <p className="text-gray-500 mt-1">Catat transaksi pembelian barang dari supplier</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Info */}
        <Card title="Informasi Pembelian">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="No. Faktur"
              {...register('no_faktur', { required: 'No. faktur wajib diisi' })}
              error={errors.no_faktur?.message}
              placeholder="PO-2024-001"
              required
            />
            <Select
              label="Supplier"
              {...register('kode_supplier', { required: 'Supplier wajib dipilih' })}
              options={supplierOptions}
              error={errors.kode_supplier?.message}
              required
            />
            <Input
              label="Tanggal Pembelian"
              type="date"
              {...register('tanggal_pembelian', { required: 'Tanggal wajib diisi' })}
              error={errors.tanggal_pembelian?.message}
              required
            />
            <Input
              label="Catatan"
              {...register('catatan')}
              placeholder="Catatan tambahan (opsional)"
            />
          </div>
        </Card>

        {/* Items */}
        <Card
          title="Daftar Barang"
          actions={
            <Button
              type="button"
              size="sm"
              onClick={() => setShowItemSelector(true)}
              startIcon={<Plus className="w-4 h-4" />}
            >
              Tambah Item
            </Button>
          }
        >
          {items.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              Belum ada item. Klik "Tambah Item" untuk menambahkan.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-md font-semibold text-sm text-gray-700">
                <div className="col-span-3">Barang</div>
                <div className="col-span-2 text-center">Jumlah</div>
                <div className="col-span-3 text-right">Harga Satuan</div>
                <div className="col-span-3 text-right">Subtotal</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items */}
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-200 rounded-md hover:border-primary-300 transition-colors"
                >
                  <div className="md:col-span-3">
                    <div className="font-medium text-gray-900">{item.nama_barang}</div>
                    <div className="text-sm text-gray-500">{item.kode_barang}</div>
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      type="number"
                      value={item.jumlah}
                      onChange={(e) => handleUpdateItem(index, 'jumlah', e.target.value)}
                      min="1"
                      className="text-center"
                    />
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      Satuan: {item.satuan}
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <Input
                      type="number"
                      value={item.harga_satuan}
                      onChange={(e) => handleUpdateItem(index, 'harga_satuan', e.target.value)}
                      min="0"
                      className="text-right"
                    />
                  </div>

                  <div className="md:col-span-3 flex items-center justify-end">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(item.jumlah * item.harga_satuan)}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-1 flex items-center justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="w-4 h-4 text-error-500" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Total Pembelian</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(getTotalHarga())}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Actions */}
        <Card>
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline">
              Batal
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Simpan Pembelian
            </Button>
          </div>
        </Card>
      </form>

      {/* Item Selector Modal */}
      {showItemSelector && (
        <ItemSelector
          onSelect={handleAddItem}
          onClose={() => setShowItemSelector(false)}
        />
      )}
    </div>
  );
}
