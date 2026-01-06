import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function KategoriForm({ initialData, mode = 'create', onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: initialData || { kode: '', nama: '' }
  });

  useEffect(() => {
    if (mode === 'create' && !initialData) {
      // Auto-generate kode kategori
      // TODO: Replace with actual API call to get last kode
      const generateKode = () => {
        const random = Math.floor(Math.random() * 1000);
        return `KTG${String(random).padStart(3, '0')}`;
      };
      setValue('kode', generateKode());
    }
  }, [mode, initialData, setValue]);

  const submitHandler = (values) => {
    onSubmit?.(values);
  };

  const readOnly = mode === 'view';

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <input type="hidden" {...register('kode', { required: 'Kode wajib diisi' })} />
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