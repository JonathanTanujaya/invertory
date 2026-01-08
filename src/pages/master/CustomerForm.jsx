import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import api from '@/api/axios';

export default function CustomerForm({ initialData, mode = 'create', onSubmit, onCancel }) {
  const emptyDefaults = { kode: '', nama: '', alamat: '', telepon: '', kontak_person: '', kode_area: '' };

  const { control, register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    defaultValues: initialData || emptyDefaults
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
    // Ensure edit form always reflects the selected customer (including Area)
    reset(initialData || emptyDefaults);
  }, [initialData, reset]);

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
    <form onSubmit={handleSubmit(submitHandler)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input type="hidden" {...register('kode', { required: 'Kode wajib diisi' })} />
      <Input
        label="Nama Customer"
        placeholder="Nama Pelanggan"
        disabled={readOnly}
        {...register('nama', { required: 'Nama wajib diisi' })}
        error={errors.nama?.message}
        containerClassName="md:col-span-2"
        required
      />

      <div className="md:col-span-2">
        <Input
          label="Alamat"
          placeholder="Alamat lengkap"
          disabled={readOnly}
          {...register('alamat', { required: 'Alamat wajib diisi' })}
          error={errors.alamat?.message}
          required
        />
      </div>

      <Input
        label="No Telp"
        type="text"
        inputMode="numeric"
        maxLength={13}
        placeholder="081234567890"
        disabled={readOnly}
        onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, ''); }}
        {...register('telepon', {
          required: 'No Telp wajib diisi',
          setValueAs: (v) => String(v ?? '').replace(/\D+/g, ''),
          minLength: { value: 10, message: 'No Telp minimal 10 digit' },
          maxLength: { value: 13, message: 'No Telp maksimal 13 digit' },
          pattern: { value: /^\d{10,13}$/, message: 'No Telp harus 10–13 digit angka' },
        })}
        error={errors.telepon?.message}
        required
      />
      <Input
        label="Kontak Person"
        placeholder="Nama kontak person"
        disabled={readOnly}
        {...register('kontak_person', { required: 'Kontak person wajib diisi' })}
        error={errors.kontak_person?.message}
        required
      />

      <div className="md:col-span-2">
        <Controller
          name="kode_area"
          control={control}
          rules={{ required: 'Area wajib dipilih' }}
          render={({ field }) => (
            <Select
              label="Area"
              placeholder="Pilih Area"
              disabled={readOnly}
              options={areaOptions}
              error={errors.kode_area?.message}
              required
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value)}
            />
          )}
        />
      </div>

      {!readOnly && (
        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
          <Button type="submit">Simpan</Button>
        </div>
      )}
    </form>
  );
}