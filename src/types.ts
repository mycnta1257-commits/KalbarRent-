export type Category =
  | 'Baju Adat Dayak'
  | 'Mandarin'
  | 'Melayu'
  | 'Batik'
  | 'Kebaya'
  | 'Wedding'
  | 'Jas (Suit)';

export type GarmentSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type KalbarLocation =
  | 'Pontianak Kota'
  | 'Pontianak Selatan'
  | 'Pontianak Timur'
  | 'Singkawang'
  | 'Kubu Raya'
  | 'Sambas'
  | 'Mempawah'
  | 'Sintang'
  | 'Ketapang'
  | 'Bengkayang';

export type SortOption = 'popular' | 'rating' | 'price_asc' | 'price_desc';

export type AppView = 'catalog' | 'map' | 'favorites' | 'chat' | 'profile';

export type ProfileSubTab =
  | 'orders'
  | 'transactions'
  | 'addresses'
  | 'notifications'
  | 'coins'
  | 'help';

export interface GarmentReview {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  comment: string;
  rentedSize: GarmentSize;
}

export interface GarmentItem {
  id: string;
  name: string;
  category: Category;
  vendorId: string;
  vendorName: string;
  vendorSince: string;
  location: KalbarLocation;
  address: string;
  pricePerDay: number;
  minDurationDays: 1 | 2 | 3;
  sizes: GarmentSize[];
  rating: number;
  reviewCount: number;
  rentedCount: number;
  image: string;
  galleryImages: {
    url: string;
    caption: string;
    objectPosition?: string;
  }[];
  description: string;
  accessories: string[];
  material: string;
  fitNotes: string;
  reviews: GarmentReview[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'vendor';
  text: string;
  timestamp: string;
  attachedItemId?: string;
}

export interface ChatThread {
  vendorId: string;
  vendorName: string;
  location: KalbarLocation;
  responseEstimate: string;
  messages: ChatMessage[];
}

export interface RentalOrder {
  id: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  category: Category;
  vendorId: string;
  vendorName: string;
  location: KalbarLocation;
  size: GarmentSize;
  durationDays: 1 | 2 | 3;
  startDate: string;
  endDate: string;
  customerName: string;
  phone: string;
  deliveryMethod: 'ambil' | 'antar';
  address: string;
  notes: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  coinsUsed: number;
  totalPaid: number;
  coinsEarned: number;
  status: 'Menunggu Pengambilan' | 'Sedang Disewa' | 'Selesai' | 'Dikonfirmasi';
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  amountRupiah?: number;
  coinDelta: number;
  type: 'payment' | 'reward' | 'redeem';
}

export interface UserAddress {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  city: KalbarLocation;
  fullAddress: string;
  isDefault: boolean;
}

export interface NotificationEntry {
  id: string;
  title: string;
  body: string;
  date: string;
  category: 'pesanan' | 'chat' | 'koin';
  read: boolean;
}
