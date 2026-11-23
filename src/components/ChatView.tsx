import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MapPin, MessageCircle, Send, Store } from 'lucide-react';
import { ChatThread, GarmentItem } from '../types';
import { formatRupiah } from '../utils/format';
import { ResilientImage } from './ResilientImage';

interface ChatViewProps {
  threads: ChatThread[];
  activeVendorId: string;
  onSelectVendor: (vendorId: string) => void;
  onSendMessage: (vendorId: string, text: string) => void;
  catalog: GarmentItem[];
  onOpenProduct: (item: GarmentItem) => void;
}

export function ChatView({
  threads,
  activeVendorId,
  onSelectVendor,
  onSendMessage,
  catalog,
  onOpenProduct,
}: ChatViewProps) {
  const [draft, setDraft] = useState('');
  const [mobileShowThread, setMobileShowThread] = useState(Boolean(activeVendorId));
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentThread =
    threads.find((t) => t.vendorId === activeVendorId) ?? threads[0] ?? null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentThread?.messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentThread || !draft.trim()) return;
    onSendMessage(currentThread.vendorId, draft.trim());
    setDraft('');
  };

  const quickQuestions = [
    'Apakah ukuran M dan L masih tersedia untuk akhir pekan?',
    'Apakah semua aksesoris sudah termasuk dalam harga sewa?',
    'Apakah bisa fitting dulu di toko sebelum tanggal sewa?',
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-900">
          Chat Penyedia UMKM
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Tanyakan ketersediaan ukuran, jadwal fitting, atau kelengkapan aksesoris langsung kepada penyedia.
        </p>
      </div>

      <div className="bg-white border border-[#E6E2D8] rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[540px] max-h-[72vh]">
        {/* Thread List */}
        <aside
          className={`md:col-span-4 border-r border-[#E6E2D8] flex flex-col ${
            mobileShowThread ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="px-4 py-3.5 border-b border-[#E6E2D8] bg-[#FAFAF8]">
            <p className="text-xs font-semibold text-zinc-700">
              Daftar Percakapan ({threads.length})
            </p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#F1EFE9]">
            {threads.map((thread) => {
              const lastMsg = thread.messages[thread.messages.length - 1];
              const isSelected = currentThread?.vendorId === thread.vendorId;
              return (
                <button
                  key={thread.vendorId}
                  type="button"
                  onClick={() => {
                    onSelectVendor(thread.vendorId);
                    setMobileShowThread(true);
                  }}
                  className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                    isSelected ? 'bg-[#0F5132]/5' : 'hover:bg-[#FAFAF8]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#0F5132]/10 text-[#0F5132] flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-900 truncate">
                        {thread.vendorName}
                      </p>
                      <span className="text-[11px] text-zinc-400 shrink-0">
                        {lastMsg?.timestamp ?? ''}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{thread.location}</p>
                    <p className="text-xs text-zinc-600 truncate mt-1">
                      {lastMsg?.text ?? 'Mulai percakapan'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Active Conversation */}
        <div
          className={`md:col-span-8 flex flex-col bg-[#FAFAF8]/50 ${
            mobileShowThread ? 'flex' : 'hidden md:flex'
          }`}
        >
          {currentThread ? (
            <>
              <div className="px-4 py-3.5 bg-white border-b border-[#E6E2D8] flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileShowThread(false)}
                  aria-label="Kembali ke daftar chat"
                  className="md:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm sm:text-base font-semibold text-zinc-900 truncate">
                    {currentThread.vendorName}
                  </h2>
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0F5132]" aria-hidden="true" />
                    <span>{currentThread.location}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentThread.responseEstimate}</span>
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {currentThread.messages.map((msg) => {
                  const attached = msg.attachedItemId
                    ? catalog.find((c) => c.id === msg.attachedItemId)
                    : undefined;
                  const isUser = msg.sender === 'user';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      {attached && (
                        <button
                          type="button"
                          onClick={() => onOpenProduct(attached)}
                          className="mb-1.5 max-w-xs p-2.5 bg-white border border-[#E6E2D8] rounded-xl flex items-center gap-3 text-left hover:border-[#0F5132] transition-colors"
                        >
                          <div className="w-11 h-14 rounded-lg overflow-hidden shrink-0 bg-[#EFECE5]">
                            <ResilientImage
                              src={attached.image}
                              alt={attached.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] text-[#0F5132] font-medium">
                              Menanyakan produk
                            </p>
                            <p className="text-xs font-semibold text-zinc-900 line-clamp-1">
                              {attached.name}
                            </p>
                            <p className="text-xs text-zinc-600 tabular-nums">
                              {formatRupiah(attached.pricePerDay)} / hari
                            </p>
                          </div>
                        </button>
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isUser
                            ? 'bg-[#0F5132] text-white rounded-br-sm'
                            : 'bg-white border border-[#E6E2D8] text-zinc-800 rounded-bl-sm'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p
                          className={`text-[10px] mt-1 text-right ${
                            isUser ? 'text-emerald-100' : 'text-zinc-400'
                          }`}
                        >
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              <div className="px-4 py-2 bg-white border-t border-[#F1EFE9] flex items-center gap-2 overflow-x-auto">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onSendMessage(currentThread.vendorId, q)}
                    className="min-h-[34px] px-3 py-1 bg-[#FAFAF8] border border-[#E6E2D8] hover:border-[#0F5132] rounded-lg text-xs text-zinc-700 whitespace-nowrap shrink-0 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-3 bg-white border-t border-[#E6E2D8] flex items-center gap-2.5"
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Tulis pertanyaan untuk penyedia..."
                  aria-label="Tulis pesan untuk penyedia UMKM"
                  className="flex-1 h-11 px-4 bg-[#FAFAF8] border border-[#DCD7CA] rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#0F5132]"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  aria-label="Kirim pesan"
                  className="min-w-[44px] h-11 px-4 bg-[#0F5132] hover:bg-[#0B3D26] disabled:bg-zinc-300 text-white rounded-xl inline-flex items-center justify-center gap-1.5 text-sm font-medium transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Kirim</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
              <MessageCircle className="w-10 h-10 mb-2 text-zinc-400" />
              <p className="text-sm font-medium text-zinc-700">
                Pilih percakapan UMKM untuk mulai bertanya
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
