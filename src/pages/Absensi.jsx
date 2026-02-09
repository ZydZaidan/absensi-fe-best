import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Camera, CheckCircle, XCircle, 
  ArrowLeft, Navigation, AlertTriangle, ScanFace,
  Loader2
} from 'lucide-react';
import axios from 'axios'; 


const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView([coords.lat, coords.lng], 17);
  }, [coords, map]);
  return null;
};

const Absensi = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [lateReason, setLateReason] = useState('');
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(false);

  const OFFICE_COORDS = useMemo(() => ({ lat: -6.245358520910364, lng: 106.87237966608049 }), []); //-6.245358520910364, 106.87237966608049
  const isLate = useMemo(() => {
    const now = new Date();
    return now.getHours() > 7 || (now.getHours() === 7 && now.getMinutes() > 30);
  }, []);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

    // 3. FUNGSI KIRIM DATA KE LARAVEL
  const submitAbsen = async () => {
    // Validasi alasan jika telat
    if (isLate && !lateReason.trim()) {
        return alert("Anda terdeteksi terlambat. Mohon isi alasan keterlambatan!");
    }

    setLoading(true);
      try {
          const token = localStorage.getItem('token');
          //++
          console.log("Token yang dikirim:", token); 
          console.log("URL Tujuan:", `${import.meta.env.VITE_API_URL}/absen-masuk`);
          
          const payload = {
              foto: photo,          // Data Base64 dari kamera
              latitude: location.lat,
              longitude: location.lng,
              catatan_telat: lateReason,
              status: isLate ? 'telat' : 'hadir'
          };

          const response = await axios.post(`${import.meta.env.VITE_API_URL}/absen-masuk`,payload,{headers:{Authorization:`Bearer ${token}`}});

          if (response.data.success) {
              alert("Berhasil! Absensi Anda telah tercatat.");
              navigate('/dashboard'); // Balik ke dashboard
          }
      } catch (err) {
          console.error(err);
          const msg = err.response?.data?.message || "Gagal mengirim absensi. Coba lagi.";
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
        setIsWithinRange(d <= 100);
      }, (err) => console.error(err), { enableHighAccuracy: true });
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [step, OFFICE_COORDS]);

  const startCamera = async () => {
    setStep(2);
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch { alert("Kamera Error"); setStep(1); }
    }, 200);
  };

  const capturePhoto = () => {
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    setPhoto(canvasRef.current.toDataURL('image/jpeg'));
    videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* GLOBAL HEADER */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-1000 p-4 md:px-10 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-sm md:text-lg font-black uppercase tracking-tight">Presensi Kehadiran</h1>
          </div>
          <div className="hidden md:flex bg-blue-50 px-4 py-2 rounded-xl items-center gap-3">
              <Navigation className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-800">Akurasi GPS: {accuracy}m</span>
          </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-10">
        
        {/* STEP 1: VALIDASI LOKASI (Responsive Split) */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Map Column (Kiri - Lebar) */}
            <div className="lg:col-span-2 h-100 md:h-150 rounded-[2.5rem] overflow-hidden shadow-inner border border-slate-200 z-0">
              {location && (
                <MapContainer center={[location.lat, location.lng]} zoom={17} zoomControl={false} className="h-full w-full">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Circle center={[OFFICE_COORDS.lat, OFFICE_COORDS.lng]} radius={50} pathOptions={{ color: '#3b82f6' }} />
                  <Marker position={[location.lat, location.lng]} />
                  <RecenterMap coords={location} />
                </MapContainer>
              )}
            </div>

            {/* Info Column (Kanan - Sidebar) */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col justify-center text-center space-y-8">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${isWithinRange ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    {isWithinRange ? <CheckCircle className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        {isWithinRange ? 'Lokasi Terjangkau' : 'Diluar Jangkauan'}
                    </h2>
                    <p className="text-sm font-medium text-slate-400 mt-2">
                        {isWithinRange ? 'Anda berada dalam radius aman untuk melakukan absensi.' : `Anda berada ${distance}m dari titik kantor.`}
                    </p>
                </div>
                <div className="space-y-3">
                    <button 
                      disabled={!isWithinRange}
                      onClick={startCamera}
                      className={`w-full py-5 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isWithinRange ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                    >
                      <Camera className="w-5 h-5" /> Ambil Foto Selfie
                    </button>
                    <p className="text-[10px] font-bold text-slate-300 uppercase">Verifikasi Biometrik Wajah</p>
                </div>
            </div>
          </div>
        )}

        {/* STEP 2: KAMERA (Layar Penuh Tetap) */}
        {step === 2 && (
          <div className="fixed inset-0 bg-slate-900 z-2000 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-2xl aspect-3/4 md:aspect-video bg-black rounded-[3rem] overflow-hidden shadow-2xl border-4 border-slate-800">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                <div className="absolute inset-0 border-16 border-black/20 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-80 border-2 border-dashed border-white/50 rounded-full"></div>
                </div>
            </div>
            <div className="mt-10 flex gap-6">
                <button onClick={() => setStep(1)} className="p-5 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"><XCircle /></button>
                <button onClick={capturePhoto} className="p-10 bg-blue-600 rounded-full text-white shadow-2xl hover:scale-110 active:scale-90 transition-all border-8 border-white/20">
                    <ScanFace className="w-8 h-8" />
                </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* STEP 3: KONFIRMASI (Responsive Split) */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-bottom-10 duration-500">
            {/* Photo Column */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-white p-4 rounded-[3rem] shadow-2xl">
                    <img src={photo} className="w-full h-100 md:h-125 object-cover rounded-[2.5rem]" alt="Selfie" />
                </div>
            </div>

             {/* Form Column */}
            <div className="flex flex-col justify-center space-y-8">
                <header>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Konfirmasi <span className="text-blue-600">Kehadiran</span></h2>
                    <p className="text-slate-400 font-medium mt-2 italic">Pastikan data dan foto wajah terlihat jelas.</p>
                </header>

                {isLate ? (
                    <div className="bg-rose-50 border border-rose-100 rounded-4xl p-8 space-y-4">
                        <div className="flex items-center gap-3 text-rose-600">
                            <AlertTriangle className="w-6 h-6" />
                            <p className="text-sm font-black uppercase tracking-widest">Peringatan: Anda Terlambat!</p>
                        </div>
                        <textarea 
                            value={lateReason}
                            onChange={(e) => setLateReason(e.target.value)}
                            placeholder="Tuliskan alasan keterlambatan (Wajib isi)..."
                            className="w-full p-5 bg-white rounded-2xl text-sm font-medium border-none shadow-inner focus:ring-2 focus:ring-rose-500 outline-none min-h-30"
                        />
                    </div>
                ) : (
                    <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-4xl flex items-center gap-5">
                        <div className="bg-white p-3 rounded-2xl shadow-sm text-emerald-500"><CheckCircle className="w-8 h-8" /></div>
                        <div>
                            <p className="text-emerald-800 font-black uppercase tracking-widest text-sm">Hadir Tepat Waktu</p>
                            <p className="text-xs text-emerald-600/70 font-bold">Terima kasih atas kedisiplinan Anda.</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-4">
                    {/* GANTI TOMBOL INI */}
                    <button 
                        onClick={submitAbsen}
                        disabled={loading}
                        className="flex-1 py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Kirim Absensi'}
                    </button>
                    <button 
                        disabled={loading}
                        onClick={() => setStep(1)} 
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