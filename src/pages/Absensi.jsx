import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { 
  CheckCircle, XCircle, 
  ArrowLeft, Navigation, AlertTriangle,
  Loader2
} from 'lucide-react';
import axios from 'axios'; 

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView([coords.lat, coords.lng], 17);
  }, [coords, map]);
  return null;
};

const Absensi = () => {
  const navigate = useNavigate();
  const [userData] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [step, setStep] = useState(1); // 1: Map, 3: Konfirmasi
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [lateReason, setLateReason] = useState('');
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAbsenDanIzin, setIsAbsenDanIzin] = useState(false);

  //koordinat dinamis
  const OFFICE_COORDS = useMemo(() => {
    // Kita panggil data cabang dari user yang login
    if (userData?.cabang) {
        return { 
            lat: parseFloat(userData.cabang.latitude), 
            lng: parseFloat(userData.cabang.longitude),
            radius: parseInt(userData.cabang.radius_meter) || 50 
        };
    }
    // Fallback darurat ke Kantor Pusat Jakarta k
    return { lat: -6.2452732, lng: 106.8722992, radius: 50 }; 
  }, [userData]); 
  
  const isLate = useMemo(() => {
    const now = new Date();
    return now.getHours() > 7 || (now.getHours() === 7 && now.getMinutes() > 30);
  }, []);

  const submitAbsen = async () => {
// 2. MODIFIKASI VALIDASI ALASAN
    if ((isLate || isAbsenDanIzin) && !lateReason.trim()) {
        return alert(isAbsenDanIzin ? "Mohon isi alasan izin Anda!" : "Anda terdeteksi terlambat. Mohon isi alasan keterlambatan!");
    }

    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const payload = {
            latitude: location.lat,
            longitude: location.lng,
            late_reason: lateReason, 
            status: isLate ? 'telat' : 'hadir',
            // 3. TAMBAHKAN FLAG KE PAYLOAD UNTUK BACKEND
            is_permission: isAbsenDanIzin, 
            foto: null 
        };

        const response = await axios.post(`${import.meta.env.VITE_API_URL}/absen-masuk`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
            alert("Berhasil! Absensi Anda telah tercatat.");
            navigate('/dashboard'); 
        }
    } catch (err) {
        const msg = err.response?.data?.message || "Gagal mengirim absensi.";
        alert("Error: " + msg);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 1) {
      const watchId = navigator.geolocation.watchPosition((pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setAccuracy(Math.round(acc));
        const R = 6371e3;
        const φ1 = latitude * Math.PI / 180;
        const φ2 = OFFICE_COORDS.lat * Math.PI / 180;
        const Δφ = (OFFICE_COORDS.lat - latitude) * Math.PI / 180;
        const Δλ = (OFFICE_COORDS.lng - longitude) * Math.PI / 180;
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const d = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
        setDistance(Math.round(d));
        setIsWithinRange(d <= OFFICE_COORDS.radius);
      }, (err) => console.error(err), { enableHighAccuracy: true });
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [step, OFFICE_COORDS]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-1000 p-4 md:px-10 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-all group">
                <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
            </button>
            <h1 className="text-sm md:text-lg font-black uppercase tracking-tight">Presensi Kehadiran</h1>
          </div>
          <div className="hidden md:flex bg-blue-50 px-4 py-2 rounded-xl items-center gap-3">
              <Navigation className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-800 tracking-widest uppercase">GPS: {accuracy}m</span>
          </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-10">
        
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-2 h-100 md:h-150 rounded-4xl overflow-hidden shadow-inner border border-slate-200 z-0 relative">
              {location && (
                <MapContainer 
                  center={[OFFICE_COORDS.lat, OFFICE_COORDS.lng]} // Fokus ke Kantor dulu
                  zoom={17} 
                  zoomControl={false} 
                  className="h-full w-full"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  {/* Lingkaran Radius Kantor */}
                  <Circle 
                    center={[OFFICE_COORDS.lat, OFFICE_COORDS.lng]} 
                    radius={OFFICE_COORDS.radius} 
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2 }} 
                  />
                  
                  {/* Marker Lokasi User (Hanya muncul jika GPS aktif) */}
                  {location && (
                    <>
                      <Marker position={[location.lat, location.lng]} />
                      <RecenterMap coords={location} />
                    </>
                  )}
                </MapContainer>
              )}
            </div>

            <div className="bg-white p-8 md:p-10 rounded-4xl shadow-xl border border-slate-100 flex flex-col justify-center text-center space-y-8">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${isWithinRange ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    {isWithinRange ? <CheckCircle className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        {isWithinRange ? 'Lokasi Terjangkau' : 'Diluar Jangkauan'}
                    </h2>
                    <p className="text-sm font-medium text-slate-400 mt-2 px-4">
                        {isWithinRange ? 'Jarak aman. Silakan lanjut untuk konfirmasi.' : `Jarak Anda: ${distance}m dari titik kantor.`}
                    </p>
                </div>
                {/* PILIHAN */}
                <div className="space-y-3 pt-4">
                  {/* Tombol Hadir Biasa: Tetap membutuhkan isWithinRange */}
                  <button 
                    disabled={!isWithinRange}
                    onClick={() => { setStep(3); setIsAbsenDanIzin(false); }} 
                    className={`w-full py-5 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                      isWithinRange 
                        ? 'bg-blue-600 text-white shadow-xl active:scale-95' 
                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    Lanjut Konfirmasi
                  </button>

                  {/* Tombol Absen & Izin: SEKARANG BEBAS (Tanpa disabled isWithinRange) */}
                  <button 
                    onClick={() => { setStep(3); setIsAbsenDanIzin(true); }} 
                    className="w-full py-5 rounded-3xl font-black text-sm uppercase tracking-widest border-2 border-amber-500 text-amber-600 hover:bg-amber-50 active:scale-95 transition-all"
                  >
                    Absen & Izin
                  </button>
                  
                  {/* Note UX Tambahan (Opsional) agar user tidak bingung */}
                  {!isWithinRange && (
                    <p className="text-[9px] font-bold text-rose-400 italic mt-2 uppercase tracking-tighter text-center">
                      *Hadir biasa wajib di lokasi, lapor izin bisa dimana saja.
                    </p>
                  )}
                </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-10 animate-in slide-in-from-bottom-10 max-w-2xl mx-auto">
            <header className="text-center mb-10">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">
                  Konfirmasi <span className={isAbsenDanIzin ? "text-amber-500" : "text-blue-600"}>
                    {isAbsenDanIzin ? 'Izin Kerja' : 'Kehadiran'}
                  </span>
                </h2>
                <p className="text-slate-400 font-medium mt-2 italic">
                  {isAbsenDanIzin 
                    ? 'Laporan izin Anda akan diteruskan ke Admin untuk divalidasi.' 
                    : 'Data lokasi Anda akan dicatat sebagai bukti kehadiran.'}
                </p>
            </header>

            <div className="w-full space-y-8">
                {/* CASE 1: ABSEN & IZIN (Tampilan Amber/Orange) */}
                {isAbsenDanIzin ? (
                    <div className="bg-amber-50 border border-amber-100 rounded-4xl p-8 space-y-4 shadow-sm">
                        <div className="flex items-center gap-3 text-amber-600 font-black uppercase text-sm tracking-widest">
                            <Navigation className="w-6 h-6" />
                            Form Izin
                        </div>
                        <p className="text-[10px] font-bold text-amber-600/70 italic px-1">
                          *Anda tetap tercatat hadir, namun memerlukan alasan izin untuk keperluan administrasi.
                        </p>
                        <textarea 
                            value={lateReason}
                            onChange={(e) => setLateReason(e.target.value)}
                            placeholder="Tuliskan alasan izin Anda (Contoh: Ada keperluan keluarga mendadak)..."
                            className="w-full p-6 bg-white rounded-3xl text-sm font-medium border-none shadow-inner focus:ring-2 focus:ring-amber-500 outline-none min-h-40 transition-all"
                        />
                    </div>
                ) : isLate ? (
                    /* CASE 2: TERLAMBAT (Tampilan Rose/Merah sesuai Gambar) */
                    <div className="bg-rose-50 border border-rose-100 rounded-4xl p-8 space-y-4 shadow-sm">
                        <div className="flex items-center gap-3 text-rose-600 font-black uppercase text-sm tracking-widest">
                            <AlertTriangle className="w-6 h-6" />
                            Peringatan: Anda Terlambat!
                        </div>
                        <textarea 
                            value={lateReason}
                            onChange={(e) => setLateReason(e.target.value)}
                            placeholder="Tuliskan alasan keterlambatan Anda..."
                            className="w-full p-6 bg-white rounded-3xl text-sm font-medium border-none shadow-inner focus:ring-2 focus:ring-rose-500 outline-none min-h-40 transition-all"
                        />
                    </div>
                ) : (
                    /* CASE 3: HADIR NORMAL (Tampilan Emerald/Hijau) */
                    <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-4xl flex items-center gap-5 shadow-sm">
                        <div className="bg-white p-3 rounded-2xl shadow-sm text-emerald-500">
                          <CheckCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-emerald-800 font-black uppercase tracking-widest text-sm">Hadir Tepat Waktu</p>
                            <p className="text-xs text-emerald-600/70 font-bold italic">Terima kasih atas kedisiplinan Anda hari ini.</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-4 pt-4">
                    <button 
                        onClick={submitAbsen}
                        disabled={loading}
                        className={`flex-1 py-5 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 transition-all ${
                          isAbsenDanIzin ? 'bg-amber-500 shadow-amber-100' : 'bg-blue-600 shadow-blue-100'
                        }`}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : isAbsenDanIzin ? 'Kirim Laporan Izin' : 'Kirim Absensi'}
                    </button>
                    <button 
                        disabled={loading}
                        onClick={() => { setStep(1); setIsAbsenDanIzin(false); }} 
                        className="py-5 px-10 bg-slate-100 text-slate-400 rounded-3xl font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all"
                    >
                        Batal
                    </button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Absensi;