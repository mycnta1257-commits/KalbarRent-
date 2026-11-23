import { X } from 'lucide-react';
import { ALL_SIZES, CATEGORIES, KALBAR_LOCATIONS } from '../data/catalog';
import { Category, GarmentSize, KalbarLocation } from '../types';
import { formatRupiah } from '../utils/format';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: Category | 'Semua';
  onSelectCategory: (cat: Category | 'Semua') => void;
  selectedLocation: KalbarLocation | 'Semua';
  onSelectLocation: (loc: KalbarLocation | 'Semua') => void;
  selectedSize: GarmentSize | 'Semua';
  onSelectSize: (size: GarmentSize | 'Semua') => void;
  maxPrice: number;
  onMaxPriceChange: (price: number) => void;
  onReset: () => void;
  resultCount: number;
}

export function FilterSheet({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  selectedLocation,
  onSelectLocation,
  selectedSize,
  onSelectSize,
  maxPrice,
  onMaxPriceChange,
  onReset,
  resultCount,
}: FilterSheetProps) {
  if (!isOpen) return null;

  const pricePresets = [
    { label: '≤ Rp 200 rb', value: 200000 },
    { label: '≤ Rp 300 rb', value: 300000 },
    { label: '≤ Rp 700 rb', value: 700000 },
    { label: 'Semua Harga', value: 1000000 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-dialog-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-none sm:rounded-l-2xl max-h-[88vh] sm:max-h-full flex flex-col shadow-xl">
        <div className="sm:hidden w-10 h-1.5 bg-zinc-300 rounded-full mx-auto mt-3" aria-hidden="true" />

        <div className="px-5 py-4 border-b border-[#E6E2D8] flex items-center justify-between">
          <div>
            <h2 id="filter-dialog-title" className="text-lg font-semibold text-zinc-900">
              Filter Pakaian
            </h2>
            <p className="text-xs text-zinc-500">
              Saring berdasarkan lokasi, ukuran XS–XXL, harga, dan kategori
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup filter"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Lokasi */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-2.5">
              Lokasi Penyedia di Kalimantan Barat
            </h3>
            <div className="flex flex-wrap gap-2">
              {(['Semua', ...KALBAR_LOCATIONS] as const).map((loc) => {
                const active = selectedLocation === loc;
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => onSelectLocation(loc)}
                    className={`min-h-[40px] px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-[#0F5132] text-white border-[#0F5132]'
                        : 'bg-[#FAFAF8] text-zinc-700 border-[#E6E2D8] hover:border-zinc-400'
                    }`}
                  >
                    {loc === 'Semua' ? 'Semua Lokasi' : loc}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ukuran */}
          <div>
            <div className="flex items-baseline justify-between mb-2.5">
              <h3 className="text-sm font-semibold text-zinc-900">
                Ukuran Tersedia (XS–XXL)
              </h3>
              <span className="text-xs text-zinc-500">Standar ukuran lokal</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              <button
                type="button"
                onClick={() => onSelectSize('Semua')}
                className={`min-h-[44px] px-2 text-xs font-medium rounded-lg border transition-colors ${
                  selectedSize === 'Semua'
                    ? 'bg-[#0F5132] text-white border-[#0F5132]'
                    : 'bg-[#FAFAF8] text-zinc-700 border-[#E6E2D8] hover:border-zinc-400'
                }`}
              >
                Semua
              </button>
              {ALL_SIZES.map((sz) => {
                const active = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => onSelectSize(sz)}
                    className={`min-h-[44px] px-2 text-xs font-semibold rounded-lg border transition-colors ${
                      active
                        ? 'bg-[#0F5132] text-white border-[#0F5132]'
                        : 'bg-[#FAFAF8] text-zinc-700 border-[#E6E2D8] hover:border-zinc-400'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Harga */}
          <div>
            <div className="flex items-baseline justify-between mb-2.5">
              <h3 className="text-sm font-semibold text-zinc-900">
                Batas Harga Sewa per Hari
              </h3>
              <span className="text-sm font-semibold text-[#0F5132] tabular-nums">
                {maxPrice >= 1000000 ? 'Semua harga' : `Maks ${formatRupiah(maxPrice)}`}
              </span>
            </div>
            <input
              type="range"
              min={150000}
              max={1000000}
              step={25000}
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(Number(e.target.value))}
              aria-label="Batas harga sewa maksimal per hari"
              className="w-full accent-[#0F5132] cursor-pointer"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {pricePresets.map((preset) => {
                const active = maxPrice === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => onMaxPriceChange(preset.value)}
                    className={`min-h-[38px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-[#0F5132] text-white border-[#0F5132]'
                        : 'bg-[#FAFAF8] text-zinc-700 border-[#E6E2D8] hover:border-zinc-400'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kategori */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-2.5">
              Kategori Busana
            </h3>
            <div className="flex flex-wrap gap-2">
              {(['Semua', ...CATEGORIES] as const).map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onSelectCategory(cat)}
                    className={`min-h-[40px] px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-[#0F5132] text-white border-[#0F5132]'
                        : 'bg-[#FAFAF8] text-zinc-700 border-[#E6E2D8] hover:border-zinc-400'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-[#E6E2D8] bg-white flex items-center gap-3 pb-safe">
          <button
            type="button"
            onClick={onReset}
            className="min-h-[46px] px-4 py-2.5 text-sm font-medium text-zinc-700 border border-[#DCD7CA] rounded-xl hover:bg-zinc-50 transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[46px] px-5 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white text-sm font-medium rounded-xl transition-colors tabular-nums"
          >
            Lihat {resultCount} Pakaian
          </button>
        </div>
      </div>
    </div>
  );
}
