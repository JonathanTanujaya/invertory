import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function AreaForm({ initialData, mode = 'create', onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    defaultValues: {
      kode_area: '',
      nama_area: ''
    }
  });

  // Reset form when initialData or mode changes
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      reset({
        kode_area: initialData.kode_area || '',
        nama_area: initialData.nama_area || ''
      });
    } else if (mode === 'create') {
      const generateKode = () => {
        const random = Math.floor(Math.random() * 1000);
        return `AR${String(random).padStart(3, '0')}`;
      };
      reset({ kode_area: generateKode(), nama_area: '' });
    }
  }, [mode, initialData, reset]);

  const submitHandler = (values) => {
    // Convert kode_area to uppercase
    values.kode_area = values.kode_area.toUpperCase();
    onSubmit?.(values);
  };

  const readOnly = mode === 'view';

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <input
        type="hidden"
        {...register('kode_area', {
          required: 'Kode area wajib diisi',
          maxLength: { value: 10, message: 'Kode maksimal 10 karakter' },
          pattern: {
            value: /^[A-Z0-9]+$/i,
            message: 'Hanya huruf dan angka'
          }
        })}
      />
      <Input
        label="Nama Area"
        placeholder="Jakarta, Bandung, Surabaya"
        disabled={readOnly}
        {...register('nama_area', {
          required: 'Nama area wajib diisi',
          minLength: { value: 3, message: 'Nama minimal 3 karakter' }
        })}
        error={errors.nama_area?.message}
        required
      />

      {/* Actions */}
      {!readOnly && (
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit">
            {mode === 'create' ? 'Tambah' : 'Simpan'}
          </Button>
        </div>
      )}

      {readOnly && (
        <div className="flex justify-end pt-2 border-t">
          <Button type="button" onClick={onCancel}>
            Tutup
          </Button>
        </div>
      )}
    </form>
  );
}
