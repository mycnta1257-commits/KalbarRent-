import { Search, X } from 'lucide-react';
import { HERO_IMAGE } from '../data/catalog';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onExploreClick: () => void;
  totalGarments: number;
  totalVendors: number;
}

export function HeroSection({
  searchQuery,
  onSearchChange,
  onExploreClick,
  totalGarments,
  totalVendors,
}: HeroSectionProps) {
  return (
    <section className="border-b border-[#E6E2D8] bg-[#F4F1EA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="text-xs sm:text-sm font-medium text-[#0F5132] tracking-wide mb-3">
              Kalimantan Barat · {totalVendors} UMKM Sewa Busana · {totalGarments} Koleksi Terkurasi
            </p>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-zinc-900 leading-[1.15] tracking-tight text-balance max-w-2xl">
              Satu Aplikasi, Semua Pakaian Khas Kalimantan Barat
            </h1>

            <p className="mt-4 text-sm sm:text-base text-zinc-600 leading-relaxed max-w-xl">
              Temukan, bandingkan model, ukuran XS–XXL, dan kelengkapan aksesoris dari berbagai
              penyedia sewa pakaian lokal—mulai dari Baju Adat Dayak, Melayu, Mandarin, hingga
              Kebaya, Batik, Wedding, dan Jas formal.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onExploreClick();
              }}
              className="mt-6 flex flex-col sm:flex-row gap-3 max-w-xl"
            >
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Cari baju Dayak, songket, kebaya, atau nama UMKM..."
                  aria-label="Cari pakaian, kategori, atau nama penyedia"
                  className="w-full h-12 pl-10 pr-10 bg-white border border-[#DCD7CA] rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    aria-label="Hapus pencarian"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-700 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="h-12 px-6 bg-[#0F5132] hover:bg-[#0B3D26] text-white text-sm font-medium rounded-xl transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] focus-visible:ring-offset-2"
              >
                Cari Pakaian
              </button>
            </form>
          </div>

          <div className="lg:col-span-5">
            <div className="h-56 sm:h-72 lg:h-full min-h-[260px] rounded-2xl overflow-hidden border border-[#E6E2D8] bg-[#E8E4DA]">
              <ResilientImage
                src={HERO_IMAGE}
                alt="Koleksi busana khas Kalimantan Barat: rompi manik Dayak, tenun songket Sambas, dan Batik Corak Insang"
                className="w-full h-full object-cover"
                positionClass="object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
