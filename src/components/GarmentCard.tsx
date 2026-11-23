import { Heart, Star } from 'lucide-react';
import { GarmentItem } from '../types';
import { formatRupiah } from '../utils/format';
import { ResilientImage } from './ResilientImage';

interface GarmentCardProps {
  item: GarmentItem;
  isFavorite: boolean;
  onToggleFavorite: (itemId: string) => void;
  onSelect: (item: GarmentItem) => void;
}

export function GarmentCard({
  item,
  isFavorite,
  onToggleFavorite,
  onSelect,
}: GarmentCardProps) {
  const sizeSummary =
    item.sizes.length > 1
      ? `${item.sizes[0]}–${item.sizes[item.sizes.length - 1]}`
      : item.sizes[0];

  return (
    <article className="group bg-white border border-[#E6E2D8] rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-zinc-900/5">
      <div className="relative aspect-[3/4] bg-[#F3F1EC] overflow-hidden">
        <button
          type="button"
          onClick={() => onSelect(item)}
          className="block w-full h-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0F5132]"
          aria-label={`Lihat detail ${item.name}`}
        >
          <ResilientImage
            src={item.image}
            alt={`${item.name} oleh ${item.vendorName}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            positionClass="object-top"
          />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          aria-label={isFavorite ? `Hapus ${item.name} dari favorit` : `Simpan ${item.name} ke favorit`}
          aria-pressed={isFavorite}
          className="absolute top-2.5 right-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-[#E6E2D8] text-zinc-700 hover:text-rose-600 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132]"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`}
            strokeWidth={1.8}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onSelect(item)}
        className="flex-1 p-4 flex flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0F5132]"
      >
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="truncate font-medium text-[#0F5132]">{item.category}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{item.location}</span>
        </div>

        <h3 className="mt-1.5 text-[15px] sm:text-base font-semibold text-zinc-900 leading-snug line-clamp-2">
          {item.name}
        </h3>

        <p className="mt-1 text-xs text-zinc-500 truncate">{item.vendorName}</p>

        <div className="mt-2.5 flex items-center gap-2 text-xs text-zinc-600">
          <span className="inline-flex items-center gap-1 font-medium text-zinc-800 tabular-nums">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
            {item.rating.toFixed(1)}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">Ukuran {sizeSummary}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">Min {item.minDurationDays} hr</span>
        </div>

        <div className="mt-auto pt-3 border-t border-[#F1EFE9] w-full flex items-baseline justify-between gap-2">
          <p className="text-[15px] sm:text-base font-semibold text-zinc-900 tabular-nums">
            {formatRupiah(item.pricePerDay)}
            <span className="text-xs font-normal text-zinc-500"> / hari</span>
          </p>
          <span className="text-xs font-medium text-[#0F5132] whitespace-nowrap">
            Detail →
          </span>
        </div>
      </button>
    </article>
  );
}
