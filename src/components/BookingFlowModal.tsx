import { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Coins,
  CreditCard,
  MapPin,
  MessageCircle,
  Truck,
  X,
} from 'lucide-react';
import { GarmentItem, GarmentSize, RentalOrder, UserAddress } from '../types';
import {
  addDaysToDateString,
  formatIndoDate,
  formatNumber,
  formatRupiah,
  getTomorrowDateString,
} from '../utils/format';
import { ResilientImage } from './ResilientImage';

interface BookingFlowModalProps {
  item: GarmentItem | null;
  initialSize: GarmentSize;
  addresses: UserAddress[];
  availableCoins: number;
  onClose: () => void;
  onConfirmOrder: (order: RentalOrder) => void;
  onViewOrders: () => void;
  onChatVendor: (item: GarmentItem) => void;
}

export function BookingFlowModal({
  item,
  initialSize,
  addresses,
  availableCoins,
  onClose,
  onConfirmOrder,
  onViewOrders,
  onChatVendor,
}: BookingFlowModalProps) {
  const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [size, setSize] = useState<GarmentSize>(initialSize);
  const [durationDays, setDurationDays] = useState<1 | 2 | 3>(
    item?.minDurationDays ?? 1
  );
  const [startDate, setStartDate] = useState<string>(getTomorrowDateString());

  const [deliveryMethod, setDeliveryMethod] = useState<'ambil' | 'antar'>('ambil');
  const [customerName, setCustomerName] = useState<string>(
    defaultAddr?.recipient ?? 'Rani Wijaya'
  );
  const [phone, setPhone] = useState<string>(defaultAddr?.phone ?? '0812-5678-9012');
  const [addressText, setAddressText] = useState<string>(
    defaultAddr
      ? `${defaultAddr.fullAddress} (${defaultAddr.city})`
      : 'Jl. Parit Haji Husin II No. 18, Pontianak Selatan'
  );
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  const [paymentMethod, setPaymentMethod] = useState<string>('QRIS Instan');
  const [useCoins, setUseCoins] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<RentalOrder | null>(null);

  if (!item) return null;

  const endDate = addDaysToDateString(startDate, durationDays);
  const subtotal = item.pricePerDay * durationDays;
  const deliveryFee = deliveryMethod === 'antar' ? 20000 : 0;
  const maxRedeemableCoins = Math.min(availableCoins, Math.floor((subtotal + deliveryFee) * 0.3));
  const coinsUsed = useCoins ? maxRedeemableCoins : 0;
  const totalPaid = Math.max(0, subtotal + deliveryFee - coinsUsed);
  const coinsEarned = Math.round(totalPaid * 0.02);

  const handleStep2Next = () => {
    if (!customerName.trim() || !phone.trim()) {
      setFormError('Mohon lengkapi nama penyewa dan nomor WhatsApp aktif.');
      return;
    }
    if (deliveryMethod === 'antar' && !addressText.trim()) {
      setFormError('Mohon isi alamat lengkap pengiriman di Kalimantan Barat.');
      return;
    }
    setFormError('');
    setStep(3);
  };

  const handleConfirmPayment = () => {
    const orderId = `KR-2611-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: RentalOrder = {
      id: orderId,
      itemId: item.id,
      itemName: item.name,
      itemImage: item.image,
      category: item.category,
      vendorId: item.vendorId,
      vendorName: item.vendorName,
      location: item.location,
      size,
      durationDays,
      startDate,
      endDate,
      customerName: customerName.trim(),
      phone: phone.trim(),
      deliveryMethod,
      address:
        deliveryMethod === 'ambil'
          ? `Ambil di Toko — ${item.address}`
          : addressText.trim(),
      notes: notes.trim(),
      paymentMethod,
      subtotal,
      deliveryFee,
      coinsUsed,
      totalPaid,
      coinsEarned,
      status: 'Menunggu Pengambilan',
      createdAt: 'Hari ini',
    };
    onConfirmOrder(newOrder);
    setCreatedOrder(newOrder);
    setStep(4);
  };

  const stepLabels = [
    { num: 1, title: 'Pilih Tanggal' },
    { num: 2, title: 'Isi Detail' },
    { num: 3, title: 'Pembayaran' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/55 backdrop-blur-xs md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-2xl bg-white rounded-t-3xl md:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-[#E6E2D8] flex items-center justify-between">
          <div>
            <h2 id="booking-modal-title" className="text-lg font-semibold text-zinc-900">
              {step === 4 ? 'Pemesanan Berhasil' : 'Pemesanan Sewa Pakaian'}
            </h2>
            {step !== 4 && (
              <p className="text-xs text-zinc-500">
                Langkah {step} dari 3 · {item.vendorName}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form pemesanan"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step !== 4 && (
          <div className="px-5 py-3 bg-[#FAFAF8] border-b border-[#E6E2D8] grid grid-cols-3 gap-2">
            {stepLabels.map((s) => {
              const isCurrent = step === s.num;
              const isDone = step > s.num;
              return (
                <div key={s.num} className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 tabular-nums ${
                      isCurrent
                        ? 'bg-[#0F5132] text-white'
                        : isDone
                        ? 'bg-[#0F5132]/15 text-[#0F5132]'
                        : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {s.num}
                  </span>
                  <span
                    className={`text-xs font-medium truncate ${
                      isCurrent ? 'text-zinc-900' : 'text-zinc-500'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Compact Item Summary */}
          {step !== 4 && (
            <div className="flex items-center gap-3.5 p-3 bg-[#FAFAF8] border border-[#E6E2D8] rounded-xl">
              <div className="w-14 h-18 rounded-lg overflow-hidden shrink-0 bg-[#EFECE5]">
                <ResilientImage
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#0F5132] font-medium">
                  {item.category} · {item.location}
                </p>
                <p className="text-sm font-semibold text-zinc-900 truncate">{item.name}</p>
                <p className="text-xs text-zinc-600 tabular-nums mt-0.5">
                  {formatRupiah(item.pricePerDay)} / hari · Ukuran {size}
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Pilih Tanggal & Durasi */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">
                  Ukuran Pakaian
                </label>
                <div className="flex flex-wrap gap-2">
                  {item.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSize(sz)}
                      className={`min-h-[42px] min-w-[52px] px-3 rounded-lg text-xs font-semibold border transition-colors ${
                        size === sz
                          ? 'bg-[#0F5132] text-white border-[#0F5132]'
                          : 'bg-white text-zinc-800 border-[#DCD7CA] hover:border-[#0F5132]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="text-sm font-semibold text-zinc-900">
                    Durasi Sewa (1, 2, atau 3 Hari)
                  </label>
                  <span className="text-xs text-zinc-500 tabular-nums">
                    Minimal {item.minDurationDays} hari
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {([1, 2, 3] as const).map((days) => {
                    const disabled = days < item.minDurationDays;
                    const active = durationDays === days;
                    return (
                      <button
                        key={days}
                        type="button"
                        disabled={disabled}
                        onClick={() => setDurationDays(days)}
                        className={`p-3 rounded-xl border text-left transition-colors ${
                          disabled
                            ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed'
                            : active
                            ? 'bg-[#0F5132] text-white border-[#0F5132]'
                            : 'bg-white text-zinc-900 border-[#DCD7CA] hover:border-[#0F5132]'
                        }`}
                      >
                        <p className="text-sm font-semibold tabular-nums">{days} Hari</p>
                        <p
                          className={`text-xs mt-0.5 tabular-nums ${
                            disabled
                              ? 'text-zinc-400'
                              : active
                              ? 'text-emerald-100'
                              : 'text-zinc-500'
                          }`}
                        >
                          {formatRupiah(item.pricePerDay * days)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="booking-start-date"
                  className="block text-sm font-semibold text-zinc-900 mb-2"
                >
                  Tanggal Mulai Sewa
                </label>
                <div className="relative">
                  <Calendar
                    className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="booking-start-date"
                    type="date"
                    min={getTomorrowDateString()}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 bg-white border border-[#DCD7CA] rounded-xl text-sm text-zinc-900 focus:outline-none focus:border-[#0F5132]"
                  />
                </div>
                <div className="mt-3 p-3.5 bg-[#F4F1EA] rounded-xl flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-zinc-600">Jadwal Pengembalian:</span>
                  <span className="font-semibold text-zinc-900 tabular-nums">
                    {formatIndoDate(endDate)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Isi Detail */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">
                  Metode Pengambilan / Pengiriman
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('ambil')}
                    className={`p-3.5 rounded-xl border text-left transition-colors ${
                      deliveryMethod === 'ambil'
                        ? 'border-[#0F5132] bg-[#0F5132]/5'
                        : 'border-[#DCD7CA] bg-white hover:border-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
                        <MapPin className="w-4 h-4 text-[#0F5132]" aria-hidden="true" />
                        Ambil di Toko UMKM
                      </span>
                      <span className="text-xs font-semibold text-[#0F5132]">Gratis</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-600">{item.address}</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('antar')}
                    className={`p-3.5 rounded-xl border text-left transition-colors ${
                      deliveryMethod === 'antar'
                        ? 'border-[#0F5132] bg-[#0F5132]/5'
                        : 'border-[#DCD7CA] bg-white hover:border-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
                        <Truck className="w-4 h-4 text-[#0F5132]" aria-hidden="true" />
                        Antar Kurir KalbarRent
                      </span>
                      <span className="text-xs font-semibold text-zinc-800 tabular-nums">
                        Rp 20.000
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-600">
                      Dikirim langsung ke alamat tujuan Anda
                    </p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="cust-name" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Nama Lengkap Penyewa
                  </label>
                  <input
                    id="cust-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full h-11 px-3.5 bg-white border border-[#DCD7CA] rounded-xl text-sm text-zinc-900 focus:outline-none focus:border-[#0F5132]"
                  />
                </div>
                <div>
                  <label htmlFor="cust-phone" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    id="cust-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 px-3.5 bg-white border border-[#DCD7CA] rounded-xl text-sm text-zinc-900 focus:outline-none focus:border-[#0F5132]"
                  />
                </div>
              </div>

              {deliveryMethod === 'antar' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="cust-addr" className="text-xs font-semibold text-zinc-700">
                      Alamat Pengiriman
                    </label>
                    {addresses.length > 0 && (
                      <div className="flex items-center gap-2">
                        {addresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setCustomerName(addr.recipient);
                              setPhone(addr.phone);
                              setAddressText(`${addr.fullAddress} (${addr.city})`);
                            }}
                            className="text-xs text-[#0F5132] font-medium hover:underline"
                          >
                            Pakai {addr.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <textarea
                    id="cust-addr"
                    rows={2}
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                    className="w-full p-3 bg-white border border-[#DCD7CA] rounded-xl text-sm text-zinc-900 focus:outline-none focus:border-[#0F5132]"
                  />
                </div>
              )}

              <div>
                <label htmlFor="cust-notes" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Catatan Tambahan untuk UMKM (Opsional)
                </label>
                <input
                  id="cust-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Minta siapkan peniti cadangan atau jam ambil pukul 10.00"
                  className="w-full h-11 px-3.5 bg-white border border-[#DCD7CA] rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#0F5132]"
                />
              </div>

              {formError && (
                <p role="alert" className="text-xs font-medium text-rose-600">
                  {formError}
                </p>
              )}
            </div>
          )}

          {/* Step 3: Pembayaran */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2.5">
                  Pilih Metode Pembayaran
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    'QRIS Instan',
                    'Transfer Bank Kalbar / BCA',
                    'E-Wallet (GoPay / OVO / DANA)',
                    'Bayar di Tempat (COD / Toko)',
                  ].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`min-h-[48px] px-3.5 py-2.5 rounded-xl border text-left text-xs sm:text-sm font-medium inline-flex items-center gap-2.5 transition-colors ${
                        paymentMethod === method
                          ? 'border-[#0F5132] bg-[#0F5132]/5 text-[#0F5132]'
                          : 'border-[#DCD7CA] bg-white text-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {availableCoins > 0 && (
                <div className="p-3.5 bg-[#FAFAF8] border border-[#E6E2D8] rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Coins className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        Tukar Koin Saya ({formatNumber(availableCoins)} Koin)
                      </p>
                      <p className="text-xs text-zinc-500 tabular-nums">
                        Potong hingga {formatRupiah(maxRedeemableCoins)} pada transaksi ini
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={useCoins}
                    onChange={(e) => setUseCoins(e.target.checked)}
                    aria-label="Gunakan Koin Saya untuk potongan harga"
                    className="w-5 h-5 accent-[#0F5132] cursor-pointer"
                  />
                </div>
              )}

              <div className="p-4 bg-[#FAFAF8] border border-[#E6E2D8] rounded-xl space-y-2 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>
                    Sewa {durationDays} hari ({formatIndoDate(startDate)} – {formatIndoDate(endDate)})
                  </span>
                  <span className="tabular-nums font-medium text-zinc-900">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>{deliveryMethod === 'antar' ? 'Kurir KalbarRent' : 'Ambil di Toko UMKM'}</span>
                  <span className="tabular-nums font-medium text-zinc-900">
                    {deliveryFee === 0 ? 'Gratis' : formatRupiah(deliveryFee)}
                  </span>
                </div>
                {coinsUsed > 0 && (
                  <div className="flex justify-between text-[#0F5132]">
                    <span>Potongan Koin Saya</span>
                    <span className="tabular-nums font-medium">-{formatRupiah(coinsUsed)}</span>
                  </div>
                )}
                <div className="pt-2.5 border-t border-[#E6E2D8] flex justify-between items-baseline">
                  <span className="font-semibold text-zinc-900">Total Pembayaran</span>
                  <span className="text-lg font-bold text-zinc-900 tabular-nums">
                    {formatRupiah(totalPaid)}
                  </span>
                </div>
                <p className="text-xs text-amber-700 pt-1 tabular-nums">
                  Anda akan mendapatkan +{formatNumber(coinsEarned)} Koin KalbarRent setelah pembayaran.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Sukses */}
          {step === 4 && createdOrder && (
            <div className="py-4 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#0F5132]/10 text-[#0F5132] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-mono text-zinc-500">
                  KODE PEMESANAN: {createdOrder.id}
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-zinc-900">
                  Pesanan Sewa Dikonfirmasi
                </h3>
                <p className="mt-1.5 text-sm text-zinc-600 max-w-md mx-auto">
                  {createdOrder.vendorName} telah menerima detail pesanan Anda untuk tanggal{' '}
                  <strong className="text-zinc-900">{formatIndoDate(createdOrder.startDate)}</strong>.
                </p>
              </div>

              <div className="p-4 bg-[#FAFAF8] border border-[#E6E2D8] rounded-xl text-left text-xs sm:text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Pakaian</span>
                  <span className="font-medium text-zinc-900 text-right">{createdOrder.itemName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Ukuran & Durasi</span>
                  <span className="font-medium text-zinc-900 tabular-nums">
                    {createdOrder.size} · {createdOrder.durationDays} hari
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Dibayar</span>
                  <span className="font-semibold text-zinc-900 tabular-nums">
                    {formatRupiah(createdOrder.totalPaid)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Bonus Koin</span>
                  <span className="font-semibold text-[#0F5132] tabular-nums">
                    +{formatNumber(createdOrder.coinsEarned)} Koin
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onChatVendor(item)}
                  className="flex-1 min-h-[46px] px-4 py-2.5 border border-[#0F5132] text-[#0F5132] rounded-xl text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-[#0F5132]/5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat Penyedia</span>
                </button>
                <button
                  type="button"
                  onClick={onViewOrders}
                  className="flex-1 min-h-[46px] px-4 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white rounded-xl text-sm font-semibold"
                >
                  Lihat Riwayat Pesanan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons for steps 1-3 */}
        {step !== 4 && (
          <div className="px-5 py-4 border-t border-[#E6E2D8] bg-white flex items-center justify-between gap-3 pb-safe">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
                className="min-h-[46px] px-5 py-2.5 border border-[#DCD7CA] text-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50"
              >
                Kembali
              </button>
            ) : (
              <div className="text-xs sm:text-sm text-zinc-600 tabular-nums">
                Subtotal: <strong className="text-zinc-900">{formatRupiah(subtotal)}</strong>
              </div>
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="min-h-[46px] px-6 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white rounded-xl text-sm font-semibold"
              >
                Lanjut ke Isi Detail
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleStep2Next}
                className="min-h-[46px] px-6 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white rounded-xl text-sm font-semibold"
              >
                Lanjut ke Pembayaran
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="min-h-[46px] px-6 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white rounded-xl text-sm font-semibold"
              >
                Konfirmasi & Bayar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
