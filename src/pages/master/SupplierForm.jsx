import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function SupplierForm({ initialData, mode = 'create', onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: initialData || { 
      kode_supplier: '', 
      nama_supplier: '', 
      alamat: '', 
      telepon: '', 
      email: '' 
    }
  });

  useEffect(() => {
    if (mode === 'create' && !initialData) {
      // Auto-generate kode supplier
      // TODO: Replace with actual API call to get last kode from backend
      const generateKode = () => {
        const random = Math.floor(Math.random() * 1000);
        return `SUP${String(random).padStart(3, '0')}`;
      };
      setValue('kode_supplier', generateKode());
    }
  }, [mode, initialData, setValue]);

  const submitHandler = (values) => onSubmit?.(values);
  const readOnly = mode === 'view';

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Kode Supplier"
          placeholder="SUP001"
          disabled={readOnly || mode === 'edit'}
          readOnly={mode === 'create' || mode === 'edit'}
          className={mode === 'create' || mode === 'edit' ? 'bg-gray-50' : ''}
          {...register('kode_supplier', { required: 'Kode supplier wajib diisi' })}
          error={errors.kode_supplier?.message}
          helperText={mode === 'create' ? 'Kode akan di-generate otomatis (SUP###)' : ''}
        />

        <Input
          label="Nama Supplier"
          placeholder="PT Sumber Sparepart"
          disabled={readOnly}
          {...register('nama_supplier', { 
            required: 'Nama supplier wajib diisi',
            minLength: { value: 3, message: 'Nama supplier minimal 3 karakter' }
          })}
          error={errors.nama_supplier?.message}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Alamat
        </label>
        <textarea
          placeholder="Jl. Sudirman No. 123, Jakarta Selatan"
          disabled={readOnly}
          rows={3}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
            readOnly ? 'bg-gray-50 text-gray-500' : ''
          } ${errors.alamat ? 'border-error-500' : ''}`}
          {...register('alamat')}
        />
        {errors.alamat && (
          <p className="text-sm text-error-600">{errors.alamat.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Telepon"
          type="tel"
          placeholder="021-12345678 atau 08123456789"
          disabled={readOnly}
          {...register('telepon', { 
            required: 'Telepon wajib diisi',
            pattern: {
              value: /^[0-9-+().\s]+$/,
              message: 'Format telepon tidak valid'
            }
          })}
          error={errors.telepon?.message}
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