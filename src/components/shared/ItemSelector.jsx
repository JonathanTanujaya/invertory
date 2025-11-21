import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/helpers';

export default function ItemSelector({ onSelect, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [searchQuery]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        const dummyData = [
          {
            kode_barang: 'BRG001',
            nama_barang: 'Sparepart A',
            kategori: 'Elektronik',
            satuan: 'pcs',
            stok: 100,
            harga_beli: 50000,
            harga_jual: 75000,
          },
          {
            kode_barang: 'BRG002',
            nama_barang: 'Sparepart B',
            kategori: 'Mekanik',
            satuan: 'pcs',
            stok: 5,
            harga_beli: 120000,
            harga_jual: 180000,
          },
          {
            kode_barang: 'BRG003',
            nama_barang: 'Sparepart C',
            kategori: 'Elektronik',
            satuan: 'box',
            stok: 50,
            harga_beli: 35000,
            harga_jual: 52500,
          },
        ];

        const filtered = searchQuery
          ? dummyData.filter(
              (item) =>
                item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.kode_barang.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : dummyData;

        setItems(filtered);
        setLoading(false);
      }, 300);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Pilih Barang"
      size="lg"
    >
      <div className="space-y-4">
        {/* Search */}
        <Input
          placeholder="Cari kode/nama barang..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startIcon={<Search className="w-4 h-4 text-gray-500" />}
          endIcon={
            searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )
          }
        />

        {/* Items List */}
        <div className="max-h-96 overflow-y-auto space-y-2 scrollbar-thin">
          {loading ? (
            <div className="py-8 text-center text-gray-500">Memuat data...</div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Tidak ada barang ditemukan
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.kode_barang}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer"
                onClick={() => onSelect(item)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{item.nama_barang}</span>
                    <Badge variant="default" size="sm">
                      {item.kategori}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Kode: {item.kode_barang} • Stok: {item.stok} {item.satuan}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    Harga Beli: {formatCurrency(item.harga_beli)} • Harga Jual:{' '}
                    {formatCurrency(item.harga_jual)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
