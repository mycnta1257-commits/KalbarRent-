import { useState } from 'react';
import {
  Check,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Sparkles,
  Star,
  Store,
  X,
  ZoomIn,
} from 'lucide-react';
import { ALL_SIZES } from '../data/catalog';
import { GarmentItem, GarmentSize } from '../types';
import { formatRupiah } from '../utils/format';
import { ResilientImage } from './ResilientImage';

interface ProductDetailModalProps {
  item: GarmentItem | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onStartBooking: (item: GarmentItem, size: GarmentSize) => void;
  onChatVendor: (item: GarmentItem) => void;
  onOpenMap?: (location: string) => void;
}

export function ProductDetailModal({
  item,
  isFavorite,
  onClose,
  onToggleFavorite,
  onStartBooking,
  onChatVendor,
  onOpenMap,
}: ProductDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState<GarmentSize>(
    item?.sizes[0] ?? 'M'
  );
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!item) return null;

  const activeSize = item.sizes.includes(selectedSize)
    ? selectedSize
    : item.sizes[0];
  const gallery =
    item.galleryImages.length > 0
      ? item.galleryImages
      : [{ url: item.image, caption: item.name, objectPosition: 'top' }];
  const currentPhoto = gallery[activePhotoIndex] ?? gallery[0];

  const getPositionClass = (pos?: string) => {
    if (!pos) return 'object-top';
    if (pos.includes('42%')) return 'object-center';
    if (pos.includes('22%') || pos.includes('25%')) return 'object-[center_22%]';
    if (pos.includes('left')) return 'object-left';
    if (pos.includes('right')) return 'object-right';
    return 'object-top';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/55 backdrop-blur-xs md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-5xl bg-white rounded-t-3xl md:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#E6E2D8] flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-2 text-xs text-zinc-500 truncate">
            <span className="font-medium text-[#0F5132]">{item.category}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{item.vendorName}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onToggleFavorite(item.id)}
              aria-label={isFavorite ? 'Hapus dari favorit' : 'Simpan ke favorit'}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100"
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup detail pakaian"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
            {/* Left: Large Clear Photo Gallery (76.2% survey focus) */}
            <div className="md:col-span-6 space-y-3">
              <div className="relative aspect-[3/4] bg-[#F3F1EC] rounded-2xl overflow-hidden border border-[#E6E2D8]">
                <ResilientImage
                  src={currentPhoto.url}
                  alt={currentPhoto.caption}
                  positionClass={getPositionClass(currentPhoto.objectPosition)}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setIsZoomed((prev) => !prev)}
                  aria-label={isZoomed ? 'Perkecil foto' : 'Perbesar detail foto'}
                  className="absolute bottom-3 right-3 min-h-[40px] px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-[#E6E2D8] rounded-lg text-xs font-medium text-zinc-800 inline-flex items-center gap-1.5 hover:bg-white"
                >
                  <ZoomIn className="w-4 h-4" aria-hidden="true" />
                  <span>{isZoomed ? 'Normal' : 'Perbesar Detail'}</span>
                </button>
              </div>

              <p className="text-xs text-zinc-500">{currentPhoto.caption}</p>

              {gallery.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {gallery.map((photo, index) => (
                    <button
                      key={`${photo.url}-${index}`}
                      type="button"
                      onClick={() => {
                        setActivePhotoIndex(index);
                        setIsZoomed(false);
                      }}
                      className={`w-16 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        activePhotoIndex === index
                          ? 'border-[#0F5132]'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`Lihat foto ${index + 1}`}
                    >
                      <ResilientImage
                        src={photo.url}
                        alt={photo.caption}
                        positionClass={getPositionClass(photo.objectPosition)}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Contiguous Purchase & Specification Module */}
            <div className="md:col-span-6 flex flex-col">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-600">
                <span className="inline-flex items-center gap-1 font-medium text-zinc-900">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                  <span className="tabular-nums">{item.rating.toFixed(1)}</span>
                  <span className="text-zinc-500 font-normal">({item.reviewCount} ulasan)</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{item.rentedCount} kali disewa</span>
              </div>

              <h1
                id="pdp-title"
                className="mt-2 font-display text-2xl sm:text-[1.75rem] font-semibold text-zinc-900 leading-tight"
              >
                {item.name}
              </h1>

              <div className="mt-4 pb-4 border-b border-[#E6E2D8] flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <p className="text-2xl font-bold text-zinc-900 tabular-nums">
                    {formatRupiah(item.pricePerDay)}
                    <span className="text-sm font-normal text-zinc-500"> / hari</span>
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                  <Clock className="w-4 h-4 text-[#0F5132]" aria-hidden="true" />
                  <span className="tabular-nums">Durasi sewa minimal {item.minDurationDays} hari</span>
                </div>
              </div>

              {/* Vendor & Location */}
              <div className="py-4 border-b border-[#E6E2D8] space-y-2 text-sm">
                <div className="flex items-start gap-2.5">
                  <Store className="w-4 h-4 text-[#0F5132] mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-zinc-900">{item.vendorName}</p>
                    <p className="text-xs text-zinc-500">
                      Mitra UMKM sejak {item.vendorSince}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs sm:text-sm text-zinc-600">
                      {item.location} — {item.address}
                    </p>
                    {onOpenMap && (
                      <button
                        type="button"
                        onClick={() => onOpenMap(item.location)}
                        className="mt-1 text-xs font-medium text-[#0F5132] hover:underline"
                      >
                        Cari toko & rute sekitar {item.location} di Peta →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Size Picker (XS - XXL) */}
              <div className="py-4 border-b border-[#E6E2D8]">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-sm font-semibold text-zinc-900">
                    Pilih Ukuran
                  </span>
                  <span className="text-xs text-zinc-500">
                    Dipilih: <strong className="text-zinc-900">{activeSize}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {ALL_SIZES.map((sz) => {
                    const available = item.sizes.includes(sz);
                    const isSelected = activeSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        disabled={!available}
                        onClick={() => setSelectedSize(sz)}
                        className={`min-h-[44px] rounded-lg text-xs font-semibold border transition-colors ${
                          !available
                            ? 'bg-zinc-100 text-zinc-300 border-zinc-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-[#0F5132] text-white border-[#0F5132]'
                            : 'bg-white text-zinc-800 border-[#DCD7CA] hover:border-[#0F5132]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                  {item.fitNotes}
                </p>
              </div>

              {/* Kelengkapan Aksesoris */}
              <div className="py-4 border-b border-[#E6E2D8]">
                <h2 className="text-sm font-semibold text-zinc-900 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0F5132]" aria-hidden="true" />
                  <span>Kelengkapan Aksesoris yang Disertakan</span>
                </h2>
                <ul className="space-y-1.5">
                  {item.accessories.map((acc) => (
                    <li key={acc} className="flex items-start gap-2 text-sm text-zinc-700">
                      <Check className="w-4 h-4 text-[#0F5132] mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{acc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Description & Material */}
              <div className="py-4 border-b border-[#E6E2D8] space-y-2">
                <h2 className="text-sm font-semibold text-zinc-900">Deskripsi Busana</h2>
                <p className="text-sm text-zinc-600 leading-relaxed">{item.description}</p>
                <p className="text-xs text-zinc-500">
                  <strong className="text-zinc-700 font-medium">Bahan:</strong> {item.material}
                </p>
              </div>

              {/* Reviews */}
              <div className="pt-4">
                <h2 className="text-sm font-semibold text-zinc-900 mb-3">
                  Ulasan Penyewa ({item.reviews.length})
                </h2>
                <div className="space-y-3">
                  {item.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 bg-[#FAFAF8] border border-[#E6E2D8] rounded-xl"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-900">
                          {rev.author} · {rev.city}
                        </span>
                        <span className="text-zinc-500">{rev.date}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-600">
                        <span className="inline-flex items-center gap-0.5 text-amber-600 font-medium tabular-nums">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" aria-hidden="true" />
                          {rev.rating}.0
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Ukuran {rev.rentedSize}</span>
                      </div>
                      <p className="mt-1.5 text-xs sm:text-sm text-zinc-700 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom CTA */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-[#E6E2D8] bg-white flex items-center gap-3 pb-safe">
          <button
            type="button"
            onClick={() => onChatVendor(item)}
            className="min-h-[48px] px-4 sm:px-5 py-2.5 border border-[#0F5132] text-[#0F5132] hover:bg-[#0F5132]/5 rounded-xl text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            <span>Chat Penyedia</span>
          </button>

          <button
            type="button"
            onClick={() => onStartBooking(item, activeSize)}
            className="flex-1 min-h-[48px] px-5 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
          >
            Sewa Sekarang · Ukuran {activeSize}
          </button>
        </div>
      </div>
    </div>
  );
}
