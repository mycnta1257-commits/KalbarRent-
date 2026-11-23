import { Heart } from 'lucide-react';
import { GarmentItem } from '../types';
import { GarmentCard } from './GarmentCard';

interface FavoritesViewProps {
  items: GarmentItem[];
  onToggleFavorite: (id: string) => void;
  onSelectItem: (item: GarmentItem) => void;
  onBackToCatalog: () => void;
}

export function FavoritesView({
  items,
  onToggleFavorite,
  onSelectItem,
  onBackToCatalog,
}: FavoritesViewProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 min-h-[65vh]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E6E2D8]">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-900">
            Pakaian Favorit Anda
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Simpan dan bandingkan pakaian pilihan dari berbagai penyedia UMKM sebelum memesan.
          </p>
        </div>
        <span className="text-sm font-medium text-zinc-600 tabular-nums">
          {items.length} pakaian tersimpan
        </span>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {items.map((item) => (
            <GarmentCard
              key={item.id}
              item={item}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectItem}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 py-16 px-4 bg-white border border-[#E6E2D8] rounded-2xl text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#F4F1EA] text-zinc-500 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6" strokeWidth={1.6} />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Belum ada pakaian favorit
          </h2>
          <p className="mt-1.5 text-sm text-zinc-600">
            Tekan ikon hati pada pakaian yang Anda minati di katalog untuk menyimpannya di sini.
          </p>
          <button
            type="button"
            onClick={onBackToCatalog}
            className="mt-5 min-h-[44px] px-5 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white text-sm font-medium rounded-xl transition-colors"
          >
            Jelajahi Katalog
          </button>
        </div>
      )}
    </section>
  );
}
