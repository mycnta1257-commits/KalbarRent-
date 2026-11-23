import { useEffect, useMemo, useState } from 'react';
import { BookingFlowModal } from './components/BookingFlowModal';
import { CatalogSection } from './components/CatalogSection';
import { ChatView } from './components/ChatView';
import { FavoritesView } from './components/FavoritesView';
import { FilterSheet } from './components/FilterSheet';
import { HeroSection } from './components/HeroSection';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProfileView } from './components/ProfileView';
import { TopNav } from './components/TopNav';
import { UmkmMapSection } from './components/UmkmMapSection';
import {
  GARMENT_CATALOG,
  INITIAL_ADDRESSES,
  INITIAL_CHAT_THREADS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS,
} from './data/catalog';
import {
  AppView,
  Category,
  ChatThread,
  GarmentItem,
  GarmentSize,
  KalbarLocation,
  NotificationEntry,
  ProfileSubTab,
  RentalOrder,
  SortOption,
  UserAddress,
  WalletTransaction,
} from './types';

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('catalog');
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>('orders');
  const [mapInitialCity, setMapInitialCity] = useState<string>('Pontianak');
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Semua'>('Semua');
  const [selectedLocation, setSelectedLocation] = useState<KalbarLocation | 'Semua'>('Semua');
  const [selectedSize, setSelectedSize] = useState<GarmentSize | 'Semua'>('Semua');
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Detail & Booking modal states
  const [detailItem, setDetailItem] = useState<GarmentItem | null>(null);
  const [bookingState, setBookingState] = useState<{
    item: GarmentItem;
    size: GarmentSize;
  } | null>(null);

  // Persistent user states
  const [favorites, setFavorites] = useState<string[]>(() =>
    loadStored('kalbarrent_favorites', ['dayak-01', 'melayu-01'])
  );
  const [coins, setCoins] = useState<number>(() =>
    loadStored('kalbarrent_coins', 15000)
  );
  const [orders, setOrders] = useState<RentalOrder[]>(() =>
    loadStored('kalbarrent_orders', INITIAL_ORDERS)
  );
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() =>
    loadStored('kalbarrent_transactions', INITIAL_TRANSACTIONS)
  );
  const [addresses, setAddresses] = useState<UserAddress[]>(() =>
    loadStored('kalbarrent_addresses', INITIAL_ADDRESSES)
  );
  const [notifications, setNotifications] = useState<NotificationEntry[]>(() =>
    loadStored('kalbarrent_notifications', INITIAL_NOTIFICATIONS)
  );
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() =>
    loadStored('kalbarrent_chats', INITIAL_CHAT_THREADS)
  );
  const [activeChatVendorId, setActiveChatVendorId] = useState<string>(
    INITIAL_CHAT_THREADS[0]?.vendorId ?? ''
  );

  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('kalbarrent_favorites', JSON.stringify(favorites));
      localStorage.setItem('kalbarrent_coins', JSON.stringify(coins));
      localStorage.setItem('kalbarrent_orders', JSON.stringify(orders));
      localStorage.setItem('kalbarrent_transactions', JSON.stringify(transactions));
      localStorage.setItem('kalbarrent_addresses', JSON.stringify(addresses));
      localStorage.setItem('kalbarrent_notifications', JSON.stringify(notifications));
      localStorage.setItem('kalbarrent_chats', JSON.stringify(chatThreads));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [favorites, coins, orders, transactions, addresses, notifications, chatThreads]);

  const uniqueVendorsCount = useMemo(
    () => new Set(GARMENT_CATALOG.map((item) => item.vendorId)).size,
    []
  );

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = GARMENT_CATALOG.filter((item) => {
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.vendorName.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);
      const matchCat =
        selectedCategory === 'Semua' || item.category === selectedCategory;
      const matchLoc =
        selectedLocation === 'Semua' || item.location === selectedLocation;
      const matchSize =
        selectedSize === 'Semua' || item.sizes.includes(selectedSize);
      const matchPrice = item.pricePerDay <= maxPrice;

      return matchQuery && matchCat && matchLoc && matchSize && matchPrice;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_asc') return a.pricePerDay - b.pricePerDay;
      if (sortBy === 'price_desc') return b.pricePerDay - a.pricePerDay;
      return b.rentedCount - a.rentedCount;
    });
  }, [searchQuery, selectedCategory, selectedLocation, selectedSize, maxPrice, sortBy]);

  const favoriteItems = useMemo(
    () => GARMENT_CATALOG.filter((item) => favorites.includes(item.id)),
    [favorites]
  );

  const activeOrdersCount = useMemo(
    () => orders.filter((o) => o.status !== 'Selesai').length,
    [orders]
  );

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Semua');
    setSelectedLocation('Semua');
    setSelectedSize('Semua');
    setMaxPrice(1000000);
  };

  const handleStartChatFromItem = (item: GarmentItem) => {
    setDetailItem(null);
    setBookingState(null);

    setChatThreads((prev) => {
      const existing = prev.find((t) => t.vendorId === item.vendorId);
      const nowTime = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date());

      const inquiryMsg = {
        id: `msg-${Date.now()}`,
        sender: 'user' as const,
        text: `Halo ${item.vendorName}, saya tertarik menyewa ${item.name}. Apakah stok masih tersedia?`,
        timestamp: nowTime,
        attachedItemId: item.id,
      };

      if (existing) {
        return prev.map((t) =>
          t.vendorId === item.vendorId
            ? { ...t, messages: [...t.messages, inquiryMsg] }
            : t
        );
      }

      const newThread: ChatThread = {
        vendorId: item.vendorId,
        vendorName: item.vendorName,
        location: item.location,
        responseEstimate: 'Biasanya membalas dalam 15 menit',
        messages: [inquiryMsg],
      };
      return [newThread, ...prev];
    });

    setActiveChatVendorId(item.vendorId);
    setActiveView('chat');

    setTimeout(() => {
      const nowTime = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date());
      setChatThreads((prev) =>
        prev.map((t) =>
          t.vendorId === item.vendorId
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  {
                    id: `reply-${Date.now()}`,
                    sender: 'vendor',
                    text: `Halo Kak! Untuk ${item.name} saat ini tersedia ukuran ${item.sizes.join(
                      ', '
                    )} beserta semua aksesoris lengkapnya. Silakan infokan tanggal pemakaiannya ya Kak.`,
                    timestamp: nowTime,
                  },
                ],
              }
            : t
        )
      );
    }, 500);
  };

  const handleSendChatMessage = (vendorId: string, text: string) => {
    const nowTime = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    setChatThreads((prev) =>
      prev.map((t) =>
        t.vendorId === vendorId
          ? {
              ...t,
              messages: [
                ...t.messages,
                {
                  id: `u-${Date.now()}`,
                  sender: 'user',
                  text,
                  timestamp: nowTime,
                },
              ],
            }
          : t
      )
    );

    setTimeout(() => {
      const lower = text.toLowerCase();
      let replyText =
        'Baik Kak, pesan sudah kami terima. Pakaian selalu siap dalam kondisi bersih & rapi. Jika tanggal sudah cocok, Kakak bisa langsung klik Sewa Sekarang ya.';
      if (lower.includes('ukuran') || lower.includes('size')) {
        replyText =
          'Ukuran yang tertera di halaman produk saat ini masih lengkap Kak. Kami juga menyediakan peniti/tali pengatur bila perlu penyesuaian ringan.';
      } else if (lower.includes('aksesoris')) {
        replyText =
          'Betul Kak, seluruh aksesoris yang tercantum di daftar Kelengkapan Aksesoris sudah termasuk dalam harga sewa harian tanpa biaya tambahan.';
      } else if (lower.includes('fitting')) {
        replyText =
          'Boleh sekali Kak! Silakan datang ke gerai kami sesuai alamat yang tertera, atau selesaikan pemesanan lebih dulu untuk mengunci jadwal agar tidak disewa orang lain.';
      }

      setChatThreads((prev) =>
        prev.map((t) =>
          t.vendorId === vendorId
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  {
                    id: `v-${Date.now()}`,
                    sender: 'vendor',
                    text: replyText,
                    timestamp: nowTime,
                  },
                ],
              }
            : t
        )
      );
    }, 450);
  };

  const handleConfirmOrder = (order: RentalOrder) => {
    setOrders((prev) => [order, ...prev]);
    setCoins((prev) => Math.max(0, prev - order.coinsUsed + order.coinsEarned));

    const newTrx: WalletTransaction[] = [
      {
        id: `TRX-${Date.now()}-R`,
        title: `Bonus Koin Sewa #${order.id}`,
        subtitle: `Cashback 2% penyewaan ${order.itemName}`,
        date: 'Hari ini',
        coinDelta: order.coinsEarned,
        type: 'reward',
      },
      {
        id: `TRX-${Date.now()}-P`,
        title: `Pembayaran Sewa #${order.id}`,
        subtitle: `${order.paymentMethod}${
          order.coinsUsed > 0 ? ` · Potongan ${order.coinsUsed} Koin` : ''
        }`,
        date: 'Hari ini',
        amountRupiah: order.totalPaid,
        coinDelta: order.coinsUsed > 0 ? -order.coinsUsed : 0,
        type: 'payment',
      },
    ];
    setTransactions((prev) => [...newTrx, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Pesanan #${order.id} Dikonfirmasi`,
        body: `${order.vendorName} menyiapkan ${order.itemName} (Ukuran ${order.size}) untuk ${order.durationDays} hari.`,
        date: 'Baru saja',
        category: 'pesanan',
        read: false,
      },
      ...prev,
    ]);
  };

  const handleCompleteOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Selesai' } : o))
    );
  };

  const handleChatVendorById = (vendorId: string) => {
    const hasThread = chatThreads.some((t) => t.vendorId === vendorId);
    if (!hasThread) {
      const sampleItem = GARMENT_CATALOG.find((i) => i.vendorId === vendorId);
      if (sampleItem) {
        setChatThreads((prev) => [
          {
            vendorId: sampleItem.vendorId,
            vendorName: sampleItem.vendorName,
            location: sampleItem.location,
            responseEstimate: 'Biasanya membalas dalam 15 menit',
            messages: [
              {
                id: `init-${Date.now()}`,
                sender: 'vendor',
                text: `Halo Kak! Ada yang bisa ${sampleItem.vendorName} bantu mengenai pesanan Anda?`,
                timestamp: 'Sekarang',
              },
            ],
          },
          ...prev,
        ]);
      }
    }
    setActiveChatVendorId(vendorId);
    setActiveView('chat');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-zinc-900 pb-16 md:pb-0">
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <TopNav
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenOrders={() => {
          setProfileSubTab('orders');
          setActiveView('profile');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        favoritesCount={favorites.length}
        unreadChatCount={0}
        activeOrdersCount={activeOrdersCount}
      />

      <main className="flex-1">
        {activeView === 'catalog' && (
          <>
            <HeroSection
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onExploreClick={() => {
                document
                  .getElementById('katalog-pakaian')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              totalGarments={GARMENT_CATALOG.length}
              totalVendors={uniqueVendorsCount}
            />
            <CatalogSection
              items={filteredItems}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedLocation={selectedLocation}
              selectedSize={selectedSize}
              maxPrice={maxPrice}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onOpenFilter={() => setIsFilterOpen(true)}
              onResetFilters={handleResetFilters}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onSelectItem={(item) => setDetailItem(item)}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          </>
        )}

        {activeView === 'map' && <UmkmMapSection initialCity={mapInitialCity} />}

        {activeView === 'favorites' && (
          <FavoritesView
            items={favoriteItems}
            onToggleFavorite={handleToggleFavorite}
            onSelectItem={(item) => setDetailItem(item)}
            onBackToCatalog={() => setActiveView('catalog')}
          />
        )}

        {activeView === 'chat' && (
          <ChatView
            threads={chatThreads}
            activeVendorId={activeChatVendorId}
            onSelectVendor={setActiveChatVendorId}
            onSendMessage={handleSendChatMessage}
            catalog={GARMENT_CATALOG}
            onOpenProduct={(item) => setDetailItem(item)}
          />
        )}

        {activeView === 'profile' && (
          <ProfileView
            activeSubTab={profileSubTab}
            onSelectSubTab={setProfileSubTab}
            coins={coins}
            orders={orders}
            onCompleteOrder={handleCompleteOrder}
            onChatVendorById={handleChatVendorById}
            transactions={transactions}
            addresses={addresses}
            onAddAddress={(addr) =>
              setAddresses((prev) => [
                ...prev,
                { ...addr, id: `addr-${Date.now()}` },
              ])
            }
            onSetDefaultAddress={(id) =>
              setAddresses((prev) =>
                prev.map((a) => ({ ...a, isDefault: a.id === id }))
              )
            }
            onDeleteAddress={(id) =>
              setAddresses((prev) => {
                const filtered = prev.filter((a) => a.id !== id);
                if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
                  filtered[0] = { ...filtered[0], isDefault: true };
                }
                return filtered;
              })
            }
            notifications={notifications}
            onMarkAllRead={() =>
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
            }
            onMarkOneRead={(id) =>
              setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
              )
            }
          />
        )}
      </main>

      <footer className="border-t border-[#E6E2D8] bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-semibold text-zinc-900">
              KalbarRent
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Satu Aplikasi, Semua Pakaian Khas Kalimantan Barat
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-600">
            <button
              type="button"
              onClick={() => setActiveView('catalog')}
              className="hover:text-zinc-900"
            >
              Katalog Busana
            </button>
            <button
              type="button"
              onClick={() => setActiveView('map')}
              className="hover:text-zinc-900"
            >
              Peta UMKM
            </button>
            <button
              type="button"
              onClick={() => {
                setProfileSubTab('coins');
                setActiveView('profile');
              }}
              className="hover:text-zinc-900"
            >
              Koin Saya
            </button>
            <button
              type="button"
              onClick={() => {
                setProfileSubTab('help');
                setActiveView('profile');
              }}
              className="hover:text-zinc-900"
            >
              Pusat Bantuan
            </button>
          </div>
        </div>
      </footer>

      <MobileBottomNav
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        favoritesCount={favorites.length}
        unreadNotifications={unreadNotificationsCount}
      />

      <FilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        onReset={handleResetFilters}
        resultCount={filteredItems.length}
      />

      <ProductDetailModal
        key={detailItem?.id ?? 'closed'}
        item={detailItem}
        isFavorite={detailItem ? favorites.includes(detailItem.id) : false}
        onClose={() => setDetailItem(null)}
        onToggleFavorite={handleToggleFavorite}
        onStartBooking={(item, size) => {
          setDetailItem(null);
          setBookingState({ item, size });
        }}
        onChatVendor={handleStartChatFromItem}
        onOpenMap={(location) => {
          setDetailItem(null);
          setMapInitialCity(location);
          setActiveView('map');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <BookingFlowModal
        key={bookingState ? `${bookingState.item.id}-${bookingState.size}` : 'closed'}
        item={bookingState?.item ?? null}
        initialSize={bookingState?.size ?? 'M'}
        addresses={addresses}
        availableCoins={coins}
        onClose={() => setBookingState(null)}
        onConfirmOrder={handleConfirmOrder}
        onViewOrders={() => {
          setBookingState(null);
          setProfileSubTab('orders');
          setActiveView('profile');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onChatVendor={handleStartChatFromItem}
      />
    </div>
  );
}
