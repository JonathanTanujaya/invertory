import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function SupplierForm({ initialData, mode = 'create', onSubmit, onCancel }) {
  const emptyDefaults = {
    kode_supplier: '',
    nama_supplier: '',
    alamat: '',
    telepon: '',
    email: ''
  };

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    defaultValues: emptyDefaults
  });

  // Reset form when initialData or mode changes
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      reset(initialData);
    } else if (mode === 'create') {
      const generateKode = () => {
        const random = Math.floor(Math.random() * 1000);
        return `SUP${String(random).padStart(3, '0')}`;
      };
      reset({ ...emptyDefaults, kode_supplier: generateKode() });
    } else if (mode === 'view' && initialData) {
      reset(initialData);
    }
  }, [mode, initialData, reset]);

  const submitHandler = (values) => onSubmit?.(values);
  const readOnly = mode === 'view';

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <input type="hidden" {...register('kode_supplier', { required: 'Kode supplier wajib diisi' })} />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nama Supplier"
          placeholder="PT Sumber Sparepart"
          disabled={readOnly}
          {...register('nama_supplier', {
            required: 'Nama supplier wajib diisi',
            minLength: { value: 3, message: 'Nama supplier minimal 3 karakter' }
          })}
          error={errors.nama_supplier?.message}
          required
          containerClassName="col-span-2"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Alamat
          <span className="text-error-500 ml-1">*</span>
        </label>
        <textarea
          placeholder="Jl. Sudirman No. 123, Jakarta Selatan"
          disabled={readOnly}
          rows={3}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none caret-gray-900 ${readOnly ? 'bg-gray-50 text-gray-500' : ''
            } ${errors.alamat ? 'border-error-500' : ''}`}
          {...register('alamat', { required: 'Alamat wajib diisi' })}
        />
        {errors.alamat && (
          <p className="text-sm text-error-600">{errors.alamat.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Telepon"
          type="text"
          inputMode="numeric"
          maxLength={13}
          placeholder="08123456789"
          disabled={readOnly}
          onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, ''); }}
          {...register('telepon', {
            required: 'Telepon wajib diisi',
            setValueAs: (v) => String(v ?? '').replace(/\D+/g, ''),
            minLength: { value: 10, message: 'Telepon minimal 10 digit' },
            maxLength: { value: 13, message: 'Telepon maksimal 13 digit' },
            pattern: { value: /^\d{10,13}$/, message: 'Telepon harus 10–13 digit angka' },
          })}
          error={errors.telepon?.message}
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="supplier@example.com"
          disabled={readOnly}
          {...register('email', {
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Format email tidak valid'
            }
          })}
          error={errors.email?.message}
          helperText="Opsional"
        />
      </div>

      {!readOnly && (
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit">
            Simpan
          </Button>
        </div>
      )}
    </form>
  );
}