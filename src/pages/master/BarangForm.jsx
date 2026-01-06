import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import api from '@/api/axios';

export default function BarangForm({ initialData, mode, onSubmit, onCancel }) {
  const emptyDefaults = {
    kode_barang: '',
    nama_barang: '',
    kategori_id: '',
    satuan: '',
    stok_minimal: 0,
    harga_beli: null,
    harga_jual: null,
  };

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: initialData || emptyDefaults,
  });

  const isViewMode = mode === 'view';

  const [kategoriOptions, setKategoriOptions] = useState([]);

  useEffect(() => {
    // Ensure form always reflects the currently edited item.
    // Some fields (like <select>) can appear blank if values arrive after mount.
    reset(initialData || emptyDefaults);
  }, [initialData, reset]);

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

  const formatRupiahDigits = (value) => {
    if (value == null || value === '') return '';
    const numberValue = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numberValue)) return '';
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(numberValue);
  };

  const parseRupiahDigitsToNumber = (text) => {
    const digits = String(text ?? '').replace(/\D+/g, '');
    if (!digits) return null;
    const numberValue = Number(digits);
    return Number.isFinite(numberValue) ? numberValue : null;
  };

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
        <Controller
          name="kategori_id"
          control={control}
          rules={{ required: 'Kategori wajib dipilih' }}
          render={({ field }) => (
            <Select
              label="Kategori"
              options={kategoriOptions}
              error={errors.kategori_id?.message}
              disabled={isViewMode}
              required
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value)}
            />
          )}
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
        <Controller
          name="harga_beli"
          control={control}
          rules={{
            required: 'Harga beli wajib diisi',
            min: { value: 0, message: 'Harga beli minimal 0' },
          }}
          render={({ field }) => (
            <Input
              label="Harga Beli"
              type="text"
              inputMode="numeric"
              startIcon={<span className="text-sm text-gray-500">Rp.</span>}
              value={formatRupiahDigits(field.value)}
              onChange={(e) => field.onChange(parseRupiahDigitsToNumber(e.target.value))}
              error={errors.harga_beli?.message}
              disabled={isViewMode}
              required
            />
          )}
        />
        <Controller
          name="harga_jual"
          control={control}
          rules={{
            required: 'Harga jual wajib diisi',
            min: { value: 0, message: 'Harga jual minimal 0' },
          }}
          render={({ field }) => (
            <Input
              label="Harga Jual"
              type="text"
              inputMode="numeric"
              startIcon={<span className="text-sm text-gray-500">Rp.</span>}
              value={formatRupiahDigits(field.value)}
              onChange={(e) => field.onChange(parseRupiahDigitsToNumber(e.target.value))}
              error={errors.harga_jual?.message}
              disabled={isViewMode}
              required
            />
          )}
        />
      </div>

      {/* Row 4: Stok Minimal */}
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
