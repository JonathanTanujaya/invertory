import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import api from '@/api/axios';

export default function BarangForm({ initialData, mode, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: initialData || {
      kode_barang: '',
      nama_barang: '',
      kategori_id: '',
      satuan: '',
      stok_minimal: 0,
    },
  });

  const isViewMode = mode === 'view';

  const [kategoriOptions, setKategoriOptions] = useState([]);

  useEffect(() => {
    let active = true;
    api
      .get('/categories')
      .then((res) => {
        if (!active) return;
        const categories = Array.isArray(res.data) ? res.data : [];
        setKategoriOptions(categories.map((c) => ({ value: c.kode_kategori, label: c.nama_kategori })));
      })
      .catch(() => {
        // silent
      });
    return () => {
      active = false;
    };
  }, []);

  const satuanOptions = [
    { value: 'pcs', label: 'Pcs' },
    { value: 'box', label: 'Box' },
    { value: 'kg', label: 'Kg' },
    { value: 'liter', label: 'Liter' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Kode Barang"
          {...register('kode_barang', { required: 'Kode barang wajib diisi' })}
          error={errors.kode_barang?.message}
          disabled={isViewMode || mode === 'edit'}
          required
        />
        <Input
          label="Nama Barang"
          {...register('nama_barang', { required: 'Nama barang wajib diisi' })}
          error={errors.nama_barang?.message}
          disabled={isViewMode}
          required
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Kategori"
          {...register('kategori_id', { required: 'Kategori wajib dipilih' })}
          options={kategoriOptions}
          error={errors.kategori_id?.message}
          disabled={isViewMode}
          required
        />
        <Select
          label="Satuan"
          {...register('satuan', { required: 'Satuan wajib dipilih' })}
          options={satuanOptions}
          error={errors.satuan?.message}
          disabled={isViewMode}
          required
        />
      </div>

      {/* Row 3: Stok Minimal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Stok Minimal"
          type="number"
          {...register('stok_minimal', {
            required: 'Stok minimal wajib diisi',
            min: { value: 0, message: 'Stok minimal 0' }
          })}
          error={errors.stok_minimal?.message}
          disabled={isViewMode}
          required
        />
      </div>

      {/* Actions */}
      {!isViewMode && (
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {mode === 'create' ? 'Tambah' : 'Simpan'}
          </Button>
        </div>
      )}

      {isViewMode && (
        <div className="flex items-center justify-end pt-4">
          <Button type="button" onClick={onCancel}>
            Tutup
          </Button>
        </div>
      )}
    </form>
  );
}
