import { SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES } from '../data/catalog';
import {
  Category,
  GarmentItem,
  GarmentSize,
  KalbarLocation,
  SortOption,
} from '../types';
import { formatRupiah } from '../utils/format';
import { GarmentCard } from './GarmentCard';

interface CatalogSectionProps {
  items: GarmentItem[];
  selectedCategory: Category | 'Semua';
  onSelectCategory: (cat: Category | 'Semua') => void;
  selectedLocation: KalbarLocation | 'Semua';
  selectedSize: GarmentSize | 'Semua';
  maxPrice: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenFilter: () => void;
  onResetFilters: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectItem: (item: GarmentItem) => void;
  searchQuery: string;
  onClearSearch: () => void;
}

export function CatalogSection({
  items,
  selectedCategory,
  onSelectCategory,
  selectedLocation,
  selectedSize,
  maxPrice,
  sortBy,
  onSortChange,
  onOpenFilter,
  onResetFilters,
  favorites,
  onToggleFavorite,
  onSelectItem,
  searchQuery,
  onClearSearch,
}: CatalogSectionProps) {
  const activeFilterCount =
    (selectedCategory !== 'Semua' ? 1 : 0) +
    (selectedLocation !== 'Semua' ? 1 : 0) +
    (selectedSize !== 'Semua' ? 1 : 0) +
    (maxPrice < 1000000 ? 1 : 0);

  return (
    <section id="katalog-pakaian" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
      <div className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
              Koleksi Pakaian & Aksesoris
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Menampilkan <span className="font-semibold text-zinc-900 tabular-nums">{items.length}</span> busana dari UMKM Kalimantan Barat
            </p>
          </div>
        </div>

        {/* Interactive Category Switcher */}
        <div
          role="tablist"
          aria-label="Kategori Pakaian"
          className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {(['Semua', ...CATEGORIES] as const).map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectCategory(cat)}
                className={`min-h-[40px] px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] ${
                  active
                    ? 'bg-[#0F5132] text-white border-[#0F5132]'
                    : 'bg-white text-zinc-700 border-[#E6E2D8] hover:border-zinc-400 hover:text-zinc-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Filter & Sort Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-[#E6E2D8]">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenFilter}
              className="min-h-[42px] px-4 py-2 bg-white border border-[#DCD7CA] hover:border-zinc-400 rounded-lg text-sm font-medium text-zinc-800 inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132]"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#0F5132]" aria-hidden="true" />
              <span>Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
            </button>

            {(activeFilterCount > 0 || searchQuery) && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="inline-flex items-center gap-1 text-zinc-800 hover:text-[#0F5132] font-medium py-1"
                  >
                    <span>Cari: &ldquo;{searchQuery}&rdquo;</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {selectedLocation !== 'Semua' && (
                  <span>Lokasi: <strong className="font-medium text-zinc-900">{selectedLocation}</strong></span>
                )}
                {selectedSize !== 'Semua' && (
                  <span>Ukuran: <strong className="font-medium text-zinc-900">{selectedSize}</strong></span>
                )}
                {maxPrice < 1000000 && (
                  <span className="tabular-nums">
                    Maks: <strong className="font-medium text-zinc-900">{formatRupiah(maxPrice)}/hr</strong>
                  </span>
                )}
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="text-[#0F5132] font-medium hover:underline py-1 whitespace-nowrap"
                >
                  Reset semua
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <label htmlFor="sort-select" className="text-xs text-zinc-500 whitespace-nowrap">
              Urutkan:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="h-10 px-3 bg-white border border-[#DCD7CA] rounded-lg text-xs sm:text-sm font-medium text-zinc-800 focus:outline-none focus:border-[#0F5132]"
            >
              <option value="popular">Paling Banyak Disewa</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-2">
            {items.map((item) => (
              <GarmentCard
                key={item.id}
                item={item}
                isFavorite={favorites.includes(item.id)}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelectItem}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 px-4 text-center bg-white border border-[#E6E2D8] rounded-2xl mt-2">
            <h3 className="text-lg font-semibold text-zinc-900">
              Pakaian tidak ditemukan
            </h3>
            <p className="mt-1.5 text-sm text-zinc-600 max-w-md mx-auto">
              Tidak ada busana yang cocok dengan kombinasi pencarian, lokasi, ukuran, atau rentang harga saat ini.
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-5 min-h-[44px] px-5 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white text-sm font-medium rounded-xl transition-colors"
            >
              Tampilkan Semua Koleksi
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
