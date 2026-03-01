import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { 
  CheckCircle, XCircle, 
  ArrowLeft, Navigation, AlertTriangle, Loader2
} from 'lucide-react';
import axios from 'axios'; 

// Konfigurasi Icon Leaflet
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

const AbsensiPulang = () => {
  const navigate = useNavigate();
  const [userData] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [step, setStep] = useState(1); // 1: Map, 3: Konfirmasi
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alasanPulangCepat, setAlasanPulangCepat] = useState('');

  //koordinat dinamis
  const OFFICE_COORDS = useMemo(() => {
    // Kita panggil data cabang dari user yang login
    if (userData?.cabang) {
        return { 
            lat: parseFloat(userData.cabang.latitude), 
            lng: parseFloat(userData.cabang.longitude),
            radius: userData.cabang.radius_meter || 50 
        };
    }
    // Fallback darurat ke Kantor Pusat Jakarta k
    return { lat: -6.2452732, lng: 106.8722992, radius: 50 }; 
  }, [userData]); 
  
  const isEarly = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    // Pulang Cepat jika sebelum 16:30
    return hours < 16 || (hours === 16 && minutes < 30);
  }, []);

  const handleSubmit = async () => {
    if (isEarly && !alasanPulangCepat.trim()) {
        return alert("Anda pulang lebih awal. Wajib mengisi alasan!");
    }

    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const payload = {
            latitude: location.lat,
            longitude: location.lng,
            alasan: isEarly ? alasanPulangCepat : null,
            foto: null // Dikirim null karena fitur kamera dihapus
        };

        const endpoint = isEarly ? '/absen-pulang-cepat' : '/absen-pulang';

        const response = await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
            alert(isEarly ? "Pengajuan pulang cepat berhasil dikirim!" : "Berhasil Absen Pulang!");
            navigate('/dashboard'); 
        }
    } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "Gagal mengirim data.";
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex justify-center">
      <div className="bg-white w-full max-w-7xl min-h-screen flex flex-col relative overflow-hidden shadow-2xl">
        
        {/* HEADER */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-1000 p-4 md:px-10 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-orange-50 rounded-full transition-colors group">
                  <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-orange-600" />
              </button>
              <h1 className="text-sm md:text-lg font-black uppercase tracking-tight text-orange-600">Presensi Pulang</h1>
            </div>
            <div className="hidden md:flex bg-orange-50 px-4 py-2 rounded-xl items-center gap-3">
                <Navigation className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-bold text-orange-800 uppercase tracking-widest">GPS: {accuracy}m</span>
            </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 md:p-10 w-full">
          
          {/* STEP 1: MAP VALIDATION */}
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
              <div className="lg:col-span-2 h-100 md:h-125 rounded-4xl overflow-hidden shadow-inner border border-slate-200 z-0 relative grayscale-[0.3]">
                {location && (
                  <MapContainer center={[location.lat, location.lng]} zoom={17} zoomControl={false} className="h-full w-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Circle center={[OFFICE_COORDS.lat, OFFICE_COORDS.lng]} radius={50} pathOptions={{ color: '#ea580c', fillColor: '#ea580c', fillOpacity: 0.2 }} />
                    <Marker position={[location.lat, location.lng]} />
                    <RecenterMap coords={location} />
                  </MapContainer>
                )}
              </div>

              <div className="bg-white p-8 md:p-10 rounded-4xl shadow-xl border border-orange-100 flex flex-col justify-center text-center space-y-8">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${isWithinRange ? 'bg-orange-50 text-orange-500' : 'bg-rose-50 text-rose-500'}`}>
                      {isWithinRange ? <CheckCircle className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                  </div>
                  <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                          {isWithinRange ? 'Lokasi Terjangkau' : 'Luar Jangkauan'}
                      </h2>
                      <p className="text-sm font-medium text-slate-400 mt-2 px-4">
                        {isWithinRange ? 'Lokasi kantor terdeteksi. Silakan lanjut untuk konfirmasi pulang.' : `Jarak: ${distance}m dari titik kantor.`}
                      </p>
                  </div>
                  <button 
                    disabled={!isWithinRange}
                    onClick={() => setStep(3)} // LANGSUNG KE STEP 3 (SKIP CAMERA)
                    className={`w-full py-5 rounded-3xl font-black text-sm uppercase tracking-widest transition-all ${isWithinRange ? 'bg-orange-600 text-white shadow-xl shadow-orange-200 active:scale-95' : 'bg-slate-100 text-slate-300'}`}
                  >
                    Lanjut Konfirmasi
                  </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION (RESTRUCTURED) */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-10 animate-in slide-in-from-bottom-10 max-w-2xl mx-auto">
              <header className="text-center mb-10">
                  <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">Selesai <span className="text-orange-600">Bekerja?</span></h2>
                  <p className="text-slate-400 font-medium mt-2 italic">Data lokasi Anda sudah tervalidasi oleh sistem.</p>
              </header>

              <div className="w-full space-y-8">
                  {isEarly ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-4xl p-8 space-y-4">
                        <div className="flex items-center gap-3 text-amber-700">
                            <AlertTriangle className="w-6 h-6" />
                            <p className="font-black uppercase text-sm tracking-widest">Peringatan: Pulang Cepat</p>
                        </div>
                        <p className="text-[10px] font-bold text-amber-600/70 italic">Wajib isi alasan agar pengajuan Anda dapat disetujui Admin.</p>
                        <textarea 
                            value={alasanPulangCepat}
                            onChange={(e) => setAlasanPulangCepat(e.target.value)}
                            placeholder="Tuliskan alasan pulang cepat (Contoh: Sakit, Urusan Keluarga)..."
                            className="w-full p-5 bg-white rounded-2xl text-sm font-medium border-none shadow-inner focus:ring-2 focus:ring-amber-500 outline-none min-h-30"
                        />
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-100 p-8 rounded-4xl flex items-center gap-5 text-orange-700">
                        <div className="bg-white p-3 rounded-2xl shadow-sm text-orange-600"><CheckCircle className="w-8 h-8" /></div>
                        <div>
                            <p className="text-orange-800 font-black uppercase text-sm tracking-widest">Waktunya Pulang!</p>
                            <p className="text-xs font-bold opacity-70 italic">Hati-hati di jalan dan selamat beristirahat.</p>
                        </div>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-4">
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`flex-1 py-5 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 ${isEarly ? 'bg-amber-600 shadow-amber-100' : 'bg-orange-600 shadow-orange-100'}`}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : isEarly ? 'Ajukan Pulang Cepat' : 'Konfirmasi Pulang'}
                    </button>
                    <button onClick={() => setStep(1)} className="py-5 px-10 bg-slate-100 text-slate-400 rounded-3xl font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500">
                        Batal
                    </button>
                  </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AbsensiPulang;