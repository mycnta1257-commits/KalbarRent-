import { Compass, Heart, MapPin, MessageCircle, User } from 'lucide-react';
import { AppView } from '../types';

interface MobileBottomNavProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  favoritesCount: number;
  unreadNotifications: number;
}

export function MobileBottomNav({
  activeView,
  onNavigate,
  favoritesCount,
  unreadNotifications,
}: MobileBottomNavProps) {
  const tabs: {
    id: AppView;
    label: string;
    icon: typeof Compass;
    badge?: number;
  }[] = [
    { id: 'catalog', label: 'Jelajah', icon: Compass },
    { id: 'map', label: 'Peta', icon: MapPin },
    { id: 'favorites', label: 'Favorit', icon: Heart, badge: favoritesCount },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'profile', label: 'Profil', icon: User, badge: unreadNotifications },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Seluler"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E6E2D8] pb-safe"
    >
      <div className="grid grid-cols-5 h-14 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`relative min-h-[44px] flex flex-col items-center justify-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0F5132] ${
                isActive ? 'text-[#0F5132]' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className="w-5 h-5"
                  strokeWidth={isActive ? 2.2 : 1.75}
                />
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-[#0F5132] text-white text-[10px] font-semibold rounded-full flex items-center justify-center tabular-nums">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium tracking-tight mt-0.5 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
