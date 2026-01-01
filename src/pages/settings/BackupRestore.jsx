import { useEffect, useMemo, useRef, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import api from '@/api/axios';

function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n < 0) return '-';
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

export default function BackupRestore() {
  const [info, setInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [restoreResult, setRestoreResult] = useState(null);
  const [resetResult, setResetResult] = useState(null);
  const fileInputRef = useRef(null);

  const canRestart = useMemo(() => typeof window !== 'undefined' && window.stoir?.restartApp, []);
  const canDevReset = info?.isPackaged === false;

  const loadInfo = async () => {
    setLoadingInfo(true);
    try {
      const res = await api.get('/admin/db/info');
      setInfo(res?.data || null);
    } catch {
      setInfo(null);
    }
    setLoadingInfo(false);
  };

  useEffect(() => {
    loadInfo();
  }, []);

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await api.get('/admin/db/backup', { responseType: 'blob' });
      const blob = res?.data;
      const url = window.URL.createObjectURL(blob);

      const cd = res?.headers?.['content-disposition'] || res?.headers?.['Content-Disposition'];
      let filename = 'stoir-backup.sqlite';
      const match = cd && String(cd).match(/filename=\"?([^\";]+)\"?/i);
      if (match && match[1]) filename = match[1];

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) return;

    setRestoreLoading(true);
    setRestoreResult(null);

    try {
      const buf = await selectedFile.arrayBuffer();
      const res = await api.post('/admin/db/restore', buf, {
        headers: { 'Content-Type': 'application/octet-stream' },
      });
      setRestoreResult(res?.data || { ok: true, requiresRestart: true });
      await loadInfo();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Gagal restore database.';
      setRestoreResult({ ok: false, message: msg, requiresRestart: false });
    }

    setRestoreLoading(false);
  };

  const handleRestart = async (redirectTo) => {
    if (!window.stoir?.restartApp) return;
    await window.stoir.restartApp(redirectTo ? { redirectTo } : undefined);
  };

  const handleDevReset = async () => {
    const ok = window.confirm(
      'DEV RESET: Ini akan menghapus database dan menghapus semua data aplikasi. Lanjutkan?'
    );
    if (!ok) return;

    setResetLoading(true);
    setResetResult(null);

    try {
      const res = await api.post('/admin/db/reset');
      const data = res?.data || { ok: true, requiresRestart: true };
      setResetResult(data);

      // Wipe persisted client state (auth, logs, etc)
      try {
        window.localStorage?.removeItem?.('auth-storage');
        window.localStorage?.removeItem?.('activity-log-storage');
        window.localStorage?.removeItem?.('theme-storage');
      } catch {
        // ignore
      }

      if (data?.requiresRestart && canRestart) {
        await handleRestart('/setup-owner');
        return;
      }

      // If restart is not available (or fails), ensure we don't end up on a protected blank state.
      window.location.href = '/setup-owner';
    } catch (err) {
      const msg = err?.response?.data?.error || 'Gagal reset aplikasi.';
      setResetResult({ ok: false, message: msg, requiresRestart: false });
    }

    setResetLoading(false);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setRestoreResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Backup & Restore Database</h2>
            <p className="text-sm text-gray-600 mt-1">
              Khusus Owner. Restore membutuhkan restart aplikasi.
            </p>
          </div>
          <Button variant="outline" onClick={loadInfo} disabled={loadingInfo}>
            Refresh Info
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-8">
            <div className="text-xs text-gray-500">Lokasi DB</div>
            <div className="text-sm font-mono text-gray-900 break-all">
              {info?.dbPath || (loadingInfo ? 'Memuat...' : '-')}
            </div>
          </div>
          <div className="col-span-6 md:col-span-2">
            <div className="text-xs text-gray-500">Ukuran</div>
            <div className="text-sm font-semibold text-gray-900">
              {info?.size != null ? formatBytes(info.size) : (loadingInfo ? '...' : '-')}
            </div>
          </div>
          <div className="col-span-6 md:col-span-2">
            <div className="text-xs text-gray-500">Restart After Restore</div>
            <div className="mt-1">
              <Badge variant={info?.requiresRestartAfterRestore ? 'warning' : 'success'}>
                {info?.requiresRestartAfterRestore ? 'Ya' : 'Tidak'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-base font-semibold text-gray-900">Backup</h3>
        <p className="text-sm text-gray-600 mt-1">
          Download file database (.sqlite) sebagai cadangan.
        </p>
        <div className="mt-4">
          <Button onClick={handleBackup} disabled={backupLoading}>
            {backupLoading ? 'Memproses...' : 'Download Backup'}
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-base font-semibold text-gray-900">Restore</h3>
        <p className="text-sm text-gray-600 mt-1">
          Pilih file backup (.sqlite) untuk mengganti database sekarang. Sistem akan membuat backup otomatis sebelum restore.
        </p>

        <div className="mt-4 grid grid-cols-12 gap-3 items-end">
          <div className="col-span-12">
            <label className="block text-sm font-medium text-gray-700 mb-1">File Backup</label>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".sqlite,.db"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />

              <Button
                type="button"
                variant="outline"
                className="h-[42px] md:w-[160px] justify-center"
                onClick={() => fileInputRef.current?.click()}
                disabled={restoreLoading}
              >
                Pilih File
              </Button>

              <Input
                value={selectedFile ? selectedFile.name : ''}
                readOnly
                placeholder="Belum ada file dipilih"
                helperText={selectedFile ? `${formatBytes(selectedFile.size)}` : 'Format yang didukung: .sqlite / .db'}
              />
            </div>
          </div>

          <div className="col-span-12 flex flex-col md:flex-row gap-2 md:justify-end">
            <Button
              variant="danger"
              onClick={handleRestore}
              disabled={!selectedFile || restoreLoading}
              loading={restoreLoading}
            >
              Restore DB
            </Button>

            <Button
              variant="outline"
              onClick={clearSelectedFile}
              disabled={restoreLoading}
            >
              Reset
            </Button>
          </div>
        </div>

        {restoreResult ? (
          <div className="mt-4">
            <Badge variant={restoreResult.ok ? 'success' : 'error'}>
              {restoreResult.ok ? 'Restore Berhasil' : 'Restore Gagal'}
            </Badge>
            <div className="text-sm text-gray-700 mt-2">
              {restoreResult.message || (restoreResult.ok ? 'Database berhasil diganti.' : 'Terjadi kesalahan.')}
            </div>

            {restoreResult.ok && restoreResult.requiresRestart ? (
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="warning">Wajib Restart</Badge>
                {canRestart ? (
                  <Button variant="outline" onClick={handleRestart}>
                    Restart Aplikasi
                  </Button>
                ) : (
                  <div className="text-sm text-gray-600">Tutup dan buka ulang aplikasi.</div>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>

      {canDevReset ? (
        <Card>
          <h3 className="text-base font-semibold text-gray-900">Dev Reset (Hapus Semua Data)</h3>
          <p className="text-sm text-gray-600 mt-1">
            Khusus mode development. Ini akan menghapus database dan mengulang aplikasi dari awal.
          </p>

          <div className="mt-4 flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
            <Button variant="danger" onClick={handleDevReset} disabled={resetLoading}>
              {resetLoading ? 'Memproses...' : 'Reset Aplikasi & Hapus Database'}
            </Button>

            {resetResult ? (
              <div className="flex items-center gap-2">
                <Badge variant={resetResult.ok ? 'warning' : 'error'}>
                  {resetResult.ok ? 'Perlu Restart' : 'Gagal'}
                </Badge>
                <div className="text-sm text-gray-700">
                  {resetResult.message || (resetResult.ok ? 'Reset sukses. Restart aplikasi untuk mulai dari awal.' : 'Terjadi kesalahan.')}
                </div>
              </div>
            ) : null}
          </div>

          {resetResult?.ok && resetResult?.requiresRestart && !canRestart ? (
            <div className="mt-3 text-sm text-gray-600">Tutup dan buka ulang aplikasi.</div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
