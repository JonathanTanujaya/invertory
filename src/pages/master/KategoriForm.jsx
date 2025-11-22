import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function KategoriForm({ initialData, mode = 'create', onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || { kode: '', nama: '' }
  });

  const submitHandler = (values) => {
    onSubmit?.(values);
  };

  const readOnly = mode === 'view';

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <Input
        label="Kode Kategori"
        placeholder="KTG001"
        disabled={readOnly}
        {...register('kode', { required: 'Kode wajib diisi' })}
        error={errors.kode?.message}
      />
      <Input
        label="Nama Kategori"
        placeholder="Contoh: Elektronik"
        disabled={readOnly}
        {...register('nama', { required: 'Nama wajib diisi' })}
        error={errors.nama?.message}
      />
      {!readOnly && (
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
          <Button type="submit">Simpan</Button>
        </div>
      )}
    </form>
  );
}