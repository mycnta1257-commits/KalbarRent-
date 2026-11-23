import { AppView } from '../types';

interface TopNavProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenOrders: () => void;
  favoritesCount: number;
  unreadChatCount: number;
  activeOrdersCount: number;
}

export function TopNav({
  activeView,
  onNavigate,
  onOpenOrders,
  favoritesCount,
  unreadChatCount,
  activeOrdersCount,
}: TopNavProps) {
  const navItems: { id: AppView; label: string; count?: number }[] = [
    { id: 'catalog', label: 'Katalog' },
    { id: 'map', label: 'Peta UMKM' },
    { id: 'favorites', label: 'Favorit', count: favoritesCount },
    { id: 'chat', label: 'Chat UMKM', count: unreadChatCount },
    { id: 'profile', label: 'Profil' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#E6E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-13 md:h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => onNavigate('catalog')}
          className="font-display text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] rounded"
        >
          KalbarRent
        </button>

        <nav aria-label="Navigasi Utama" className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] rounded ${
                  isActive ? 'text-[#0F5132]' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span>
                  {item.label}
                  {typeof item.count === 'number' && item.count > 0 ? ` (${item.count})` : ''}
                </span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F5132]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenOrders}
            className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#0F5132] hover:bg-[#0B3D26] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] focus-visible:ring-offset-2"
          >
            {activeOrdersCount > 0 ? `Pesanan (${activeOrdersCount})` : 'Pesanan Saya'}
          </button>
        </div>
      </div>
    </header>
  );
}
