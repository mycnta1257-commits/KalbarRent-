import { useCallback, useEffect, useState } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  Compass,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Star,
} from 'lucide-react';

interface RealPlacePin {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  userRatingCount?: number;
  googleMapsURI?: string;
}

interface GroundedPlaceLink {
  title: string;
  uri: string;
  placeId?: string;
  reviewSnippets?: string[];
}

interface UmkmMapSectionProps {
  initialCity?: string;
}

const CITY_CENTERS: Record<string, { lat: number; lng: number; label: string }> = {
  'Pontianak': { lat: -0.0263, lng: 109.3425, label: 'Pontianak' },
  'Singkawang': { lat: 0.9083, lng: 108.9847, label: 'Singkawang' },
  'Kubu Raya': { lat: -0.1145, lng: 109.4036, label: 'Kubu Raya' },
  'Sambas': { lat: 1.3625, lng: 109.3046, label: 'Sambas' },
  'Mempawah': { lat: 0.3667, lng: 108.95, label: 'Mempawah' },
  'Sintang': { lat: 0.068, lng: 111.498, label: 'Sintang' },
  'Ketapang': { lat: -1.85, lng: 109.983, label: 'Ketapang' },
};

function PlaceMarkerWithInfo({
  place,
  isSelected,
  onSelect,
  onClose,
}: {
  place: RealPlacePin;
  isSelected: boolean;
  onSelect: () => void;
  onClose: () => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: place.lat, lng: place.lng }}
        onClick={onSelect}
        title={place.name}
      >
        <Pin
          background={isSelected ? '#B45309' : '#0F5132'}
          borderColor="#FFFFFF"
          glyphColor="#FFFFFF"
        />
      </AdvancedMarker>
      {isSelected && marker && (
        <InfoWindow anchor={marker} maxWidth={260} onCloseClick={onClose}>
          <div className="p-1 space-y-1.5 text-zinc-900">
            <p className="text-sm font-semibold leading-snug">{place.name}</p>
            <p className="text-xs text-zinc-600 leading-relaxed">{place.address}</p>
            {typeof place.rating === 'number' && (
              <p className="text-xs font-medium text-amber-700 inline-flex items-center gap-1 tabular-nums">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {place.rating.toFixed(1)}
                {typeof place.userRatingCount === 'number'
                  ? ` (${place.userRatingCount} ulasan)`
                  : ''}
              </p>
            )}
            {place.googleMapsURI && (
              <a
                href={place.googleMapsURI}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs font-semibold text-[#0F5132] hover:underline pt-1"
              >
                Buka di Google Maps →
              </a>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function InteractiveMapContent({
  selectedCity,
  onCityChange,
  userCoords,
  onUseMyLocation,
  locatingUser,
}: {
  selectedCity: string;
  onCityChange: (city: string) => void;
  userCoords: { lat: number; lng: number } | null;
  onUseMyLocation: () => void;
  locatingUser: boolean;
}) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const apiStatus = useApiLoadingStatus();

  const [places, setPlaces] = useState<RealPlacePin[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('sewa baju adat kebaya jas');
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState('');

  // Maps Grounding (Gemini 4 Hydrogen + Google Maps tool)
  const [groundingPrompt, setGroundingPrompt] = useState(
    'Rekomendasi tempat sewa baju adat, kebaya, atau jas beserta informasi lokasi jalannya'
  );
  const [groundingLoading, setGroundingLoading] = useState(false);
  const [groundingText, setGroundingText] = useState('');
  const [groundingLinks, setGroundingLinks] = useState<GroundedPlaceLink[]>([]);
  const [groundingError, setGroundingError] = useState('');

  const runPlacesSearch = useCallback(
    async (queryText: string, cityName: string) => {
      if (!placesLib?.Place) return;
      setIsSearchingPlaces(true);
      setPlacesError('');

      try {
        const center = CITY_CENTERS[cityName] ?? CITY_CENTERS['Pontianak'];
        const { places: found } = await placesLib.Place.searchByText({
          textQuery: `${queryText} di ${cityName}, Kalimantan Barat`,
          fields: [
            'id',
            'displayName',
            'formattedAddress',
            'location',
            'rating',
            'userRatingCount',
            'googleMapsURI',
          ],
          locationBias: {
            center: userCoords ?? { lat: center.lat, lng: center.lng },
            radius: 25000,
          },
          maxResultCount: 10,
        });

        interface PlacesResultItem {
          id: string;
          displayName?: string | null;
          formattedAddress?: string | null;
          location?: { lat: () => number; lng: () => number } | null;
          rating?: number | null;
          userRatingCount?: number | null;
          googleMapsURI?: string | null;
        }

        const foundList = (found || []) as PlacesResultItem[];
        const mapped: RealPlacePin[] = foundList
          .filter((p) => Boolean(p.location))
          .map((p) => ({
            id: p.id,
            name: p.displayName || 'Penyedia Busana',
            address: p.formattedAddress || `${cityName}, Kalimantan Barat`,
            lat: p.location!.lat(),
            lng: p.location!.lng(),
            rating: p.rating ?? undefined,
            userRatingCount: p.userRatingCount ?? undefined,
            googleMapsURI: p.googleMapsURI ?? undefined,
          }));

        setPlaces(mapped);
        if (mapped[0]) {
          setSelectedPlaceId(mapped[0].id);
          if (map) {
            map.panTo({ lat: mapped[0].lat, lng: mapped[0].lng });
            map.setZoom(13);
          }
        } else if (map) {
          map.panTo({ lat: center.lat, lng: center.lng });
          map.setZoom(12);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('429')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        setPlacesError(
          'Tidak dapat memuat titik lokasi Google Places saat ini. Anda masih dapat melihat ringkasan lokasi di sebelah kanan.'
        );
      } finally {
        setIsSearchingPlaces(false);
      }
    },
    [placesLib, map, userCoords]
  );

  const runMapsGrounding = useCallback(
    async (queryText: string, cityName: string) => {
      setGroundingLoading(true);
      setGroundingError('');

      try {
        const center = CITY_CENTERS[cityName] ?? CITY_CENTERS['Pontianak'];
        const coords = userCoords ?? { lat: center.lat, lng: center.lng };
        const res = await fetch('/api/maps-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: queryText,
            city: `${cityName}, Kalimantan Barat`,
            lat: coords.lat,
            lng: coords.lng,
          }),
        });

        const data = await res.json();
        if (res.status === 429 || data?.error?.includes?.('RESOURCE_EXHAUSTED')) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        if (!res.ok) {
          throw new Error(data.error || 'Gagal mengambil data Maps Grounding.');
        }

        setGroundingText(data.text || '');
        setGroundingLinks(Array.isArray(data.places) ? data.places : []);
      } catch (err: unknown) {
        setGroundingError(
          err instanceof Error
            ? err.message
            : 'Gagal memuat rekomendasi berbasis Google Maps.'
        );
      } finally {
        setGroundingLoading(false);
      }
    },
    [userCoords]
  );

  // Trigger initial search when Places library loads or city changes
  useEffect(() => {
    if (placesLib?.Place) {
      runPlacesSearch(searchTerm, selectedCity);
    }
  }, [placesLib, selectedCity]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    runMapsGrounding(groundingPrompt, selectedCity);
  }, [selectedCity]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeCenter = userCoords ?? CITY_CENTERS[selectedCity] ?? CITY_CENTERS['Pontianak'];

  return (
    <div className="space-y-6">
      {/* City selector & Search controls */}
      <div className="bg-white border border-[#E6E2D8] rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {Object.keys(CITY_CENTERS).map((city) => {
              const active = selectedCity === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => onCityChange(city)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#0F5132] text-white border-[#0F5132]'
                      : 'bg-[#FAFAF8] text-zinc-700 border-[#E6E2D8] hover:border-zinc-400'
                  }`}
                >
                  {city}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onUseMyLocation}
            disabled={locatingUser}
            className="min-h-[40px] px-4 py-2 border border-[#0F5132] text-[#0F5132] hover:bg-[#0F5132]/5 rounded-xl text-xs font-medium inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{locatingUser ? 'Mendeteksi GPS...' : 'Gunakan Lokasi Saya'}</span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runPlacesSearch(searchTerm, selectedCity);
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari toko sewa kebaya, jas, butik adat, atau penjahit..."
              aria-label="Cari lokasi penyedia sewa pakaian di Google Maps"
              className="w-full h-11 pl-10 pr-4 bg-[#FAFAF8] border border-[#DCD7CA] rounded-xl text-sm text-zinc-900 focus:outline-none focus:border-[#0F5132]"
            />
          </div>
          <button
            type="submit"
            disabled={isSearchingPlaces}
            className="h-11 px-5 bg-[#0F5132] hover:bg-[#0B3D26] text-white rounded-xl text-sm font-medium whitespace-nowrap"
          >
            {isSearchingPlaces ? 'Mencari di Peta...' : 'Cari di Peta'}
          </button>
        </form>
      </div>

      {/* Main Split: Interactive Map + Maps Grounding Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Google Map + Place List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="h-[380px] sm:h-[440px] w-full rounded-2xl overflow-hidden border border-[#E6E2D8] bg-[#EFECE5] relative">
            {apiStatus === APILoadingStatus.FAILED ||
            apiStatus === APILoadingStatus.AUTH_FAILURE ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-600">
                <MapPin className="w-8 h-8 mb-2 text-zinc-400" />
                <p className="text-sm font-medium text-zinc-800">
                  Peta Google Maps tidak dapat dimuat saat ini.
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Silakan gunakan daftar lokasi terverifikasi di panel Asisten Lokasi.
                </p>
              </div>
            ) : (
              <GoogleMap
                mapId="DEMO_MAP_ID"
                defaultCenter={activeCenter}
                defaultZoom={12}
                gestureHandling="greedy"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                className="w-full h-full"
              >
                {places.map((place) => (
                  <PlaceMarkerWithInfo
                    key={place.id}
                    place={place}
                    isSelected={selectedPlaceId === place.id}
                    onSelect={() => {
                      setSelectedPlaceId(place.id);
                      map?.panTo({ lat: place.lat, lng: place.lng });
                    }}
                    onClose={() => setSelectedPlaceId(null)}
                  />
                ))}
              </GoogleMap>
            )}
          </div>

          {placesError && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
              {placesError}
            </p>
          )}

          {/* Places API (New) Results List */}
          {places.length > 0 && (
            <div className="bg-white border border-[#E6E2D8] rounded-2xl divide-y divide-[#F1EFE9]">
              <div className="px-4 py-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Hasil Google Places di {selectedCity} ({places.length})
                </h3>
              </div>
              {places.map((p) => {
                const selected = selectedPlaceId === p.id;
                return (
                  <div
                    key={p.id}
                    className={`p-4 flex items-start justify-between gap-3 transition-colors ${
                      selected ? 'bg-[#0F5132]/[0.04]' : 'hover:bg-[#FAFAF8]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlaceId(p.id);
                        map?.panTo({ lat: p.lat, lng: p.lng });
                        map?.setZoom(15);
                      }}
                      className="text-left flex-1 min-w-0"
                    >
                      <p className="text-sm font-semibold text-zinc-900 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-zinc-600 mt-0.5 line-clamp-2">
                        {p.address}
                      </p>
                      {typeof p.rating === 'number' && (
                        <p className="mt-1 text-xs font-medium text-amber-700 inline-flex items-center gap-1 tabular-nums">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {p.rating.toFixed(1)}
                          {typeof p.userRatingCount === 'number'
                            ? ` · ${p.userRatingCount} ulasan`
                            : ''}
                        </p>
                      )}
                    </button>
                    {p.googleMapsURI && (
                      <a
                        href={p.googleMapsURI}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[38px] px-3 py-1.5 border border-[#DCD7CA] hover:border-[#0F5132] rounded-lg text-xs font-medium text-[#0F5132] inline-flex items-center gap-1 shrink-0"
                      >
                        <span>Rute</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Gemini Maps Grounding Panel */}
        <div className="lg:col-span-5 bg-white border border-[#E6E2D8] rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F5132]/10 text-[#0F5132] flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Asisten Lokasi Google Maps
              </h2>
              <p className="text-xs text-zinc-500">
                Data tempat & tautan Google Maps terkini untuk wilayah {selectedCity}
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              runMapsGrounding(groundingPrompt, selectedCity);
            }}
            className="space-y-2.5"
          >
            <textarea
              rows={2}
              value={groundingPrompt}
              onChange={(e) => setGroundingPrompt(e.target.value)}
              placeholder="Contoh: Tempat sewa baju adat Dayak atau kebaya wisuda dekat pusat kota..."
              aria-label="Pertanyaan pencarian lokasi berbasis Google Maps"
              className="w-full p-3 bg-[#FAFAF8] border border-[#DCD7CA] rounded-xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-[#0F5132]"
            />
            <div className="flex flex-wrap gap-1.5">
              {[
                `Sewa baju adat & kebaya di ${selectedCity}`,
                `Toko sewa jas formal di ${selectedCity}`,
                `Pusat batik & oleh-oleh tenun di ${selectedCity}`,
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setGroundingPrompt(preset);
                    runMapsGrounding(preset, selectedCity);
                  }}
                  className="px-2.5 py-1 bg-[#FAFAF8] border border-[#E6E2D8] hover:border-[#0F5132] rounded-lg text-[11px] text-zinc-700 text-left"
                >
                  {preset}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={groundingLoading}
              className="w-full min-h-[42px] px-4 py-2 bg-[#0F5132] hover:bg-[#0B3D26] disabled:bg-zinc-300 text-white rounded-xl text-sm font-medium inline-flex items-center justify-center gap-2"
            >
              {groundingLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {groundingLoading ? 'Mengambil Data Google Maps...' : 'Tanya Data Maps'}
              </span>
            </button>
          </form>

          {groundingError && (
            <div
              role="alert"
              className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700"
            >
              {groundingError}
            </div>
          )}

          {groundingText && (
            <div className="pt-3 border-t border-[#E6E2D8] space-y-3">
              <div className="text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
                {groundingText}
              </div>

              {groundingLinks.length > 0 && (
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-semibold text-zinc-900">
                    Tautan Lokasi Terverifikasi Google Maps:
                  </p>
                  <ul className="space-y-1.5">
                    {groundingLinks.map((link, idx) => (
                      <li key={`${link.uri}-${idx}`}>
                        {link.uri ? (
                          <a
                            href={link.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-[#FAFAF8] border border-[#E6E2D8] hover:border-[#0F5132] rounded-xl flex items-center justify-between gap-2 text-xs text-[#0F5132] font-medium transition-colors"
                          >
                            <span className="truncate">{link.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-700">{link.title}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function UmkmMapSection({ initialCity = 'Pontianak' }: UmkmMapSectionProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [selectedCity, setSelectedCity] = useState(
    CITY_CENTERS[initialCity] ? initialCity : 'Pontianak'
  );
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locatingUser, setLocatingUser] = useState(false);
  const [geoNotice, setGeoNotice] = useState('');

  useEffect(() => {
    if (initialCity) {
      const normalized =
        initialCity.includes('Pontianak') ? 'Pontianak' : initialCity;
      if (CITY_CENTERS[normalized]) {
        setSelectedCity(normalized);
      }
    }
  }, [initialCity]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice('Peramban tidak mendukung deteksi lokasi GPS.');
      return;
    }
    setLocatingUser(true);
    setGeoNotice('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocatingUser(false);
      },
      () => {
        setGeoNotice(
          'Izin lokasi tidak diberikan. Menampilkan lokasi berdasarkan kota pilihan Anda.'
        );
        setLocatingUser(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-900">
          Peta Lokasi Sewa Busana & UMKM Kalimantan Barat
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Temukan persewaan baju adat, kebaya, batik, dan jas terdekat menggunakan peta interaktif Google Maps dan informasi lokasi terkini.
        </p>
        {geoNotice && <p className="mt-2 text-xs text-amber-700">{geoNotice}</p>}
      </div>

      {!apiKey ? (
        <div className="p-6 bg-white border border-[#E6E2D8] rounded-2xl text-sm text-zinc-600">
          Kunci Google Maps Platform (`VITE_GOOGLE_MAPS_API_KEY`) belum tersedia di lingkungan saat ini.
        </div>
      ) : (
        <APIProvider
          apiKey={apiKey}
          libraries={['marker', 'places']}
          language="id"
          region="ID"
        >
          <InteractiveMapContent
            selectedCity={selectedCity}
            onCityChange={(c) => {
              setUserCoords(null);
              setSelectedCity(c);
            }}
            userCoords={userCoords}
            onUseMyLocation={handleUseMyLocation}
            locatingUser={locatingUser}
          />
        </APIProvider>
      )}
    </section>
  );
}
