import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import api from '@/api/axios';

export default function CustomerForm({ initialData, mode = 'create', onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: initialData || { kode: '', nama: '', alamat: '', telepon: '', kontak_person: '', kode_area: '' }
  });

  const [areaOptions, setAreaOptions] = useState([]);

  useEffect(() => {
    let active = true;
    api
      .get('/areas')
      .then((res) => {
        if (!active) return;
        const areas = Array.isArray(res.data) ? res.data : [];
        setAreaOptions(areas.map((area) => ({ value: area.kode_area, label: area.nama_area })));
      })
      .catch(() => {
        // silent: keep empty options
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (mode === 'create' && !initialData) {
      // Auto-generate kode customer
      const generateKode = () => {
        const random = Math.floor(Math.random() * 1000);
        return `CST${String(random).padStart(3, '0')}`;
      };
      setValue('kode', generateKode());
    }
  }, [mode, initialData, setValue]);

  const submitHandler = (values) => onSubmit?.(values);
  const readOnly = mode === 'view';

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <Input
        label="Kode Customer"
        placeholder="CST001"
        disabled={readOnly || mode === 'edit'}
        readOnly={mode === 'create' || mode === 'edit'}
        className={mode === 'create' || mode === 'edit' ? 'bg-gray-50' : ''}
        {...register('kode', { required: 'Kode wajib diisi' })}
        error={errors.kode?.message}
      />
      <Input
        label="Nama Customer"
        placeholder="Nama Pelanggan"
        disabled={readOnly}
        {...register('nama', { required: 'Nama wajib diisi' })}
        error={errors.nama?.message}
      />
      <Input
        label="Alamat"
        placeholder="Alamat lengkap"
        disabled={readOnly}
        {...register('alamat', { required: 'Alamat wajib diisi' })}
        error={errors.alamat?.message}
      />
      <Input
        label="No Telp"
        placeholder="021-xxxxxxx"
        disabled={readOnly}
        {...register('telepon', { required: 'No Telp wajib diisi' })}
        error={errors.telepon?.message}
      />
      <Input
        label="Kontak Person"
        placeholder="Nama kontak person"
        disabled={readOnly}
        {...register('kontak_person')}
      />
      <Select
        label="Area"
        placeholder="Pilih Area"
        disabled={readOnly}
        options={areaOptions}
        {...register('kode_area', { required: 'Area wajib dipilih' })}
        error={errors.kode_area?.message}
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