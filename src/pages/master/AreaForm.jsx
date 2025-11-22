import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function AreaForm({ initialData, mode = 'create', onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || { 
      kode_area: '', 
      nama_area: '' 
    }
  });

  const submitHandler = (values) => {
    // Convert kode_area to uppercase
    values.kode_area = values.kode_area.toUpperCase();
    onSubmit?.(values);
  };

  const readOnly = mode === 'view';

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <Input
        label="Kode Area"
        placeholder="JKT, BDG, SBY"
        disabled={readOnly || mode === 'edit'}
        readOnly={mode === 'edit'}
        className={mode === 'edit' ? 'bg-gray-50' : ''}
        {...register('kode_area', { 
          required: 'Kode area wajib diisi',
          maxLength: { value: 10, message: 'Kode maksimal 10 karakter' },
          pattern: {
            value: /^[A-Z0-9]+$/i,
            message: 'Hanya huruf dan angka'
          }
        })}
        error={errors.kode_area?.message}
        helperText={!readOnly && mode === 'create' ? 'Contoh: JKT, BDG, YGY (akan otomatis uppercase)' : ''}
        required
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
