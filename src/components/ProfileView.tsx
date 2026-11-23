import { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coins,
  HelpCircle,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  Receipt,
  Trash2,
  User,
} from 'lucide-react';
import { FAQ_ITEMS, KALBAR_LOCATIONS } from '../data/catalog';
import {
  KalbarLocation,
  NotificationEntry,
  ProfileSubTab,
  RentalOrder,
  UserAddress,
  WalletTransaction,
} from '../types';
import { formatIndoDate, formatNumber, formatRupiah } from '../utils/format';
import { ResilientImage } from './ResilientImage';

interface ProfileViewProps {
  activeSubTab: ProfileSubTab;
  onSelectSubTab: (tab: ProfileSubTab) => void;
  coins: number;
  orders: RentalOrder[];
  onCompleteOrder: (orderId: string) => void;
  onChatVendorById: (vendorId: string) => void;
  transactions: WalletTransaction[];
  addresses: UserAddress[];
  onAddAddress: (addr: Omit<UserAddress, 'id'>) => void;
  onSetDefaultAddress: (id: string) => void;
  onDeleteAddress: (id: string) => void;
  notifications: NotificationEntry[];
  onMarkAllRead: () => void;
  onMarkOneRead: (id: string) => void;
}

export function ProfileView({
  activeSubTab,
  onSelectSubTab,
  coins,
  orders,
  onCompleteOrder,
  onChatVendorById,
  transactions,
  addresses,
  onAddAddress,
  onSetDefaultAddress,
  onDeleteAddress,
  notifications,
  onMarkAllRead,
  onMarkOneRead,
}: ProfileViewProps) {
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrLabel, setAddrLabel] = useState('');
  const [addrRecipient, setAddrRecipient] = useState('Rani Wijaya');
  const [addrPhone, setAddrPhone] = useState('0812-5678-9012');
  const [addrCity, setAddrCity] = useState<KalbarLocation>('Pontianak Kota');
  const [addrFull, setAddrFull] = useState('');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [supportMsg, setSupportMsg] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const subTabs: { id: ProfileSubTab; label: string; icon: typeof Package }[] = [
    { id: 'orders', label: 'Riwayat Pesanan', icon: Package },
    { id: 'transactions', label: 'Riwayat Transaksi', icon: Receipt },
    { id: 'addresses', label: 'Alamat', icon: MapPin },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'coins', label: 'Koin Saya', icon: Coins },
    { id: 'help', label: 'Bantuan', icon: HelpCircle },
  ];

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrLabel.trim() || !addrFull.trim()) return;
    onAddAddress({
      label: addrLabel.trim(),
      recipient: addrRecipient.trim() || 'Rani Wijaya',
      phone: addrPhone.trim() || '0812-5678-9012',
      city: addrCity,
      fullAddress: addrFull.trim(),
      isDefault: addresses.length === 0,
    });
    setAddrLabel('');
    setAddrFull('');
    setShowAddAddress(false);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 min-h-[70vh]">
      {/* Profile & Coin Header */}
      <div className="bg-white border border-[#E6E2D8] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#0F5132]/10 text-[#0F5132] flex items-center justify-center shrink-0">
            <User className="w-7 h-7" strokeWidth={1.7} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-zinc-900">
              Rani Wijaya
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600">
              Pontianak, Kalimantan Barat · Anggota KalbarRent
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectSubTab('coins')}
          className="p-4 rounded-xl bg-[#F4F1EA] border border-[#E6E2D8] hover:border-[#0F5132] text-left flex items-center justify-between gap-6 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Coins className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-medium text-zinc-600">Koin Saya</p>
              <p className="text-xl font-bold text-zinc-900 tabular-nums">
                {formatNumber(coins)} <span className="text-xs font-medium text-zinc-500">Koin</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-[#0F5132] whitespace-nowrap">
            Detail →
          </span>
        </button>
      </div>

      {/* Sub-navigation Tabs */}
      <div
        role="tablist"
        aria-label="Menu Profil"
        className="mt-6 flex items-center gap-2 overflow-x-auto pb-2"
      >
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelectSubTab(tab.id)}
              className={`min-h-[42px] px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors ${
                active
                  ? 'bg-[#0F5132] text-white border-[#0F5132]'
                  : 'bg-white text-zinc-700 border-[#E6E2D8] hover:border-zinc-400'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>
                {tab.label}
                {tab.id === 'notifications' && unreadCount > 0 ? ` (${unreadCount})` : ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* 1. Riwayat Pesanan */}
        {activeSubTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">
              Riwayat Pesanan ({orders.length})
            </h2>
            {orders.map((order) => {
              const isDone = order.status === 'Selesai';
              return (
                <article
                  key={order.id}
                  className="bg-white border border-[#E6E2D8] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 justify-between"
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-26 rounded-xl overflow-hidden bg-[#EFECE5] shrink-0">
                      <ResilientImage
                        src={order.itemImage}
                        alt={order.itemName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono text-zinc-500">{order.id}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            isDone ? 'text-[#0F5132]' : 'text-amber-700'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                          {order.status}
                        </span>
                      </div>

                      <h3 className="mt-1 text-base font-semibold text-zinc-900">
                        {order.itemName}
                      </h3>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        {order.vendorName} · {order.location}
                      </p>

                      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600 tabular-nums">
                        <span>Ukuran: <strong className="text-zinc-900">{order.size}</strong></span>
                        <span>Durasi: <strong className="text-zinc-900">{order.durationDays} hari</strong></span>
                        <span>
                          Jadwal: <strong className="text-zinc-900">{formatIndoDate(order.startDate)} – {formatIndoDate(order.endDate)}</strong>
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">{order.address}</p>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#F1EFE9] shrink-0">
                    <div className="md:text-right">
                      <p className="text-xs text-zinc-500">{order.paymentMethod}</p>
                      <p className="text-base font-bold text-zinc-900 tabular-nums">
                        {formatRupiah(order.totalPaid)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onChatVendorById(order.vendorId)}
                        className="min-h-[40px] px-3.5 py-2 border border-[#DCD7CA] hover:border-[#0F5132] text-zinc-800 rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#0F5132]" />
                        <span>Chat</span>
                      </button>
                      {!isDone && (
                        <button
                          type="button"
                          onClick={() => onCompleteOrder(order.id)}
                          className="min-h-[40px] px-3.5 py-2 bg-[#0F5132] hover:bg-[#0B3D26] text-white rounded-lg text-xs font-medium"
                        >
                          Selesaikan Sewa
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* 2. Riwayat Transaksi */}
        {activeSubTab === 'transactions' && (
          <div className="bg-white border border-[#E6E2D8] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E6E2D8]">
              <h2 className="text-lg font-semibold text-zinc-900">
                Riwayat Transaksi
              </h2>
            </div>
            <div className="divide-y divide-[#F1EFE9]">
              {transactions.map((trx) => (
                <div
                  key={trx.id}
                  className="px-5 py-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{trx.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {trx.date} · {trx.subtitle}
                    </p>
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    {typeof trx.amountRupiah === 'number' && (
                      <p className="text-sm font-semibold text-zinc-900">
                        {formatRupiah(trx.amountRupiah)}
                      </p>
                    )}
                    {trx.coinDelta !== 0 && (
                      <p
                        className={`text-xs font-semibold ${
                          trx.coinDelta > 0 ? 'text-[#0F5132]' : 'text-amber-700'
                        }`}
                      >
                        {trx.coinDelta > 0 ? '+' : ''}
                        {formatNumber(trx.coinDelta)} Koin
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Alamat */}
        {activeSubTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                Daftar Alamat Pengiriman
              </h2>
              <button
                type="button"
                onClick={() => setShowAddAddress((v) => !v)}
                className="min-h-[42px] px-4 py-2 bg-[#0F5132] hover:bg-[#0B3D26] text-white rounded-xl text-xs sm:text-sm font-medium inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Alamat</span>
              </button>
            </div>

            {showAddAddress && (
              <form
                onSubmit={handleSaveAddress}
                className="bg-white border border-[#E6E2D8] rounded-2xl p-5 space-y-4"
              >
                <h3 className="text-sm font-semibold text-zinc-900">Alamat Baru</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Label Alamat (mis. Rumah, Kampus)
                    </label>
                    <input
                      type="text"
                      required
                      value={addrLabel}
                      onChange={(e) => setAddrLabel(e.target.value)}
                      placeholder="Rumah Orang Tua"
                      className="w-full h-11 px-3.5 border border-[#DCD7CA] rounded-xl text-sm focus:outline-none focus:border-[#0F5132]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Kota / Kabupaten di Kalbar
                    </label>
                    <select
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value as KalbarLocation)}
                      className="w-full h-11 px-3.5 border border-[#DCD7CA] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0F5132]"
                    >
                      {KALBAR_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Nama Penerima
                    </label>
                    <input
                      type="text"
                      value={addrRecipient}
                      onChange={(e) => setAddrRecipient(e.target.value)}
                      className="w-full h-11 px-3.5 border border-[#DCD7CA] rounded-xl text-sm focus:outline-none focus:border-[#0F5132]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      className="w-full h-11 px-3.5 border border-[#DCD7CA] rounded-xl text-sm focus:outline-none focus:border-[#0F5132]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Alamat Lengkap
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={addrFull}
                    onChange={(e) => setAddrFull(e.target.value)}
                    placeholder="Nama jalan, nomor rumah, kecamatan..."
                    className="w-full p-3 border border-[#DCD7CA] rounded-xl text-sm focus:outline-none focus:border-[#0F5132]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="min-h-[42px] px-4 py-2 border border-[#DCD7CA] rounded-xl text-sm font-medium text-zinc-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="min-h-[42px] px-5 py-2 bg-[#0F5132] text-white rounded-xl text-sm font-semibold"
                  >
                    Simpan Alamat
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-5 bg-white rounded-2xl border ${
                    addr.isDefault ? 'border-[#0F5132]' : 'border-[#E6E2D8]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-zinc-900">
                      {addr.label} · {addr.city}
                    </span>
                    {addr.isDefault && (
                      <span className="text-xs font-semibold text-[#0F5132]">
                        Alamat Utama
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium text-zinc-800">
                    {addr.recipient} ({addr.phone})
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    {addr.fullAddress}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => onSetDefaultAddress(addr.id)}
                        className="text-xs font-medium text-[#0F5132] hover:underline py-1"
                      >
                        Jadikan Utama
                      </button>
                    )}
                    {addresses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteAddress(addr.id)}
                        className="text-xs font-medium text-rose-600 hover:underline inline-flex items-center gap-1 py-1 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Notifikasi */}
        {activeSubTab === 'notifications' && (
          <div className="bg-white border border-[#E6E2D8] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E6E2D8] flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-900">Notifikasi</h2>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="text-xs font-medium text-[#0F5132] hover:underline py-1"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>
            <div className="divide-y divide-[#F1EFE9]">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => onMarkOneRead(notif.id)}
                  className={`w-full px-5 py-4 text-left flex items-start justify-between gap-4 transition-colors ${
                    notif.read ? 'bg-white' : 'bg-[#0F5132]/[0.03]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="font-medium text-[#0F5132] capitalize">
                        {notif.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{notif.date}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                      {notif.title}
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-zinc-600">{notif.body}</p>
                  </div>
                  {!notif.read && (
                    <span className="text-[11px] font-semibold text-[#0F5132] shrink-0">
                      Baru
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. Koin Saya */}
        {activeSubTab === 'coins' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white border border-[#E6E2D8] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Coins className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-xs font-medium text-zinc-500">Total Saldo Koin Saya</p>
                  <p className="text-3xl font-bold text-zinc-900 tabular-nums">
                    {formatNumber(coins)} Koin
                  </p>
                </div>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">
                1 Koin KalbarRent bernilai Rp 1. Dapatkan cashback 2% koin dari setiap transaksi sewa
                dan tukarkan langsung pada Langkah 3 Pembayaran untuk potongan hingga 30% biaya sewa.
              </p>
            </div>

            <div className="lg:col-span-7 bg-white border border-[#E6E2D8] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E6E2D8]">
                <h2 className="text-base font-semibold text-zinc-900">Mutasi Koin</h2>
              </div>
              <div className="divide-y divide-[#F1EFE9]">
                {transactions
                  .filter((t) => t.coinDelta !== 0)
                  .map((trx) => (
                    <div
                      key={trx.id}
                      className="px-5 py-3.5 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{trx.title}</p>
                        <p className="text-xs text-zinc-500">{trx.date}</p>
                      </div>
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          trx.coinDelta > 0 ? 'text-[#0F5132]' : 'text-amber-700'
                        }`}
                      >
                        {trx.coinDelta > 0 ? '+' : ''}
                        {formatNumber(trx.coinDelta)} Koin
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. Bantuan */}
        {activeSubTab === 'help' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white border border-[#E6E2D8] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E6E2D8]">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Pertanyaan yang Sering Diajukan
                </h2>
              </div>
              <div className="divide-y divide-[#F1EFE9]">
                {FAQ_ITEMS.map((faq, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={faq.q}>
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#FAFAF8]"
                      >
                        <span className="text-sm font-semibold text-zinc-900">
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-sm text-zinc-600 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-[#E6E2D8] rounded-2xl p-5 h-fit space-y-4">
              <h2 className="text-base font-semibold text-zinc-900">
                Hubungi Layanan Bantuan KalbarRent
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600">
                Punya kendala ukuran, keterlambatan kurir, atau kemitraan UMKM sewa baju? Kirim pesan ke tim kami.
              </p>
              {supportSent ? (
                <div className="p-4 bg-[#0F5132]/5 border border-[#0F5132]/20 rounded-xl text-sm text-[#0F5132]">
                  Terima kasih! Pesan Anda telah dicatat. Tim layanan KalbarRent di Pontianak akan menghubungi Anda maksimal dalam 1x24 jam.
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!supportMsg.trim()) return;
                    setSupportSent(true);
                    setSupportMsg('');
                  }}
                  className="space-y-3"
                >
                  <textarea
                    rows={3}
                    required
                    value={supportMsg}
                    onChange={(e) => setSupportMsg(e.target.value)}
                    placeholder="Tuliskan pertanyaan atau nomor pesanan Anda..."
                    className="w-full p-3 bg-[#FAFAF8] border border-[#DCD7CA] rounded-xl text-sm focus:outline-none focus:border-[#0F5132]"
                  />
                  <button
                    type="submit"
                    className="w-full min-h-[44px] bg-[#0F5132] hover:bg-[#0B3D26] text-white rounded-xl text-sm font-semibold"
                  >
                    Kirim Pesan Bantuan
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
