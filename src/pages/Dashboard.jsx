import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 1. Pastikan axios di-import
import { 
  Camera, Clock, CheckCircle, 
  Calendar, Settings, LogOut, User, Loader2
} from 'lucide-react';
import logoBest from '../assets/images/logobest.png';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // State Data User & Waktu
  const [userData] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [currentTime, setCurrentTime] = useState(new Date());

  // UPDATE: State untuk Data API
  const [stats, setStats] = useState({ hadir: 0, izin: 0, alpha: 0 });
  const [history, setHistory] = useState([]);
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);

  // UPDATE: Ambil Data dari Backend saat halaman dibuka
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Ambil Status Hari Ini & Riwayat (termasuk stats) secara paralel
        const [resStatus, resHistory] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/attendance/check-status`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/riwayat-absensi`, config)
        ]);

        setTodayData(resStatus.data.data); // Simpan info absen hari ini
        setHistory(resHistory.data.data);   // Simpan list riwayat
        setStats(resHistory.data.stats);     // Simpan angka stats (hadir, izin, dll)
      } catch (err) {
        console.error("Gagal mengambil data dashboard", err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Memuat Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
      {/* TOP BAR */}
      <nav className="bg-white px-8 py-4 flex justify-between items-center shadow-sm border-b border-slate-100">
        <img src={logoBest} alt="Logo" className="h-7 w-auto" />
        <div className="flex items-center gap-4 text-slate-400">
          <Settings className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors" />
          <LogOut 
            onClick={handleLogout}
            className="w-5 h-5 cursor-pointer hover:text-rose-600 transition-colors" 
          />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* HERO CARD */}
        <section className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-row justify-between items-center gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Selamat Datang</p>
              <h2 className="md:text-4xl text-2xl font-black flex items-center gap-2 italic">
                {userData?.name || 'Karyawan'} 
              </h2>
              <p className="text-xs opacity-70 mt-1 font-medium">{userData?.jabatan || 'Staff'} • PT BEST</p>
            </div>

            <div className="text-right border-l border-white/20 pl-4">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-2">
                {currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric'})}
              </p>
            </div>
          </div>

          {/* INNER BOX: STATUS KEHADIRAN (DINAMIS) */}
          <div className="mt-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-4xl p-8">
            <div className="flex items-center gap-3 mb-6">
              {/* Bulatan Hijau jika sudah absen, Merah jika belum */}
              <div className={`w-3 h-3 rounded-full animate-pulse ${todayData ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
              <span className="text-xl font-black italic tracking-wide">
                {todayData ? 'Sudah Masuk' : 'Belum Absen'}
              </span>
            </div>

            <div className="h-px bg-white/10 w-full mb-6"></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold opacity-60">Jam Masuk</p>
                {/* Tampilkan jam_masuk dari DB atau --:-- */}
                <p className="text-2xl font-black tracking-tight">
                  {todayData?.jam_masuk ? todayData.jam_masuk.slice(0, 5) : '-- : --'}
                </p>      
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold opacity-60">Jam Pulang</p>
                <p className="text-2xl font-black tracking-tight opacity-30">
                  {todayData?.jam_pulang ? todayData.jam_pulang.slice(0,5) : '-- : --'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STATISTIK (DINAMIS) */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-around items-center">
            <div className="text-center flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hadir</p>
              <p className="text-2xl font-black text-blue-600">{(stats?.hadir || 0) + (stats?.telat || 0)}</p>
            </div>
            <div className="w-px h-10 bg-slate-100"></div>
            <div className="text-center flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Izin</p>
              <p className="text-2xl font-black text-amber-500">{stats.izin}</p>
            </div>
            <div className="w-px h-10 bg-slate-100"></div>
            <div className="text-center flex-1">
              <p className="text-[10px] uppercase font-bold opacity-40">Terlambat</p>
              <p className="text-2xl font-black text-rose-400">{stats?.telat || 0}</p>
            </div>
            <div className="w-px h-10 bg-slate-100"></div>
            <div className="text-center flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Alpha</p>
              <p className="text-2xl font-black text-rose-500">0</p>
            </div>
          </div>
        </section>

        {/* MAIN BUTTONS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6" >
          {!todayData ? (
            // 1. SKENARIO: BELUM ABSEN (Tombol Biru)
            <button 
              onClick={() => navigate('/absensi')}
              className="flex flex-col items-center justify-center bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50 hover:border-blue-500 transition-all group active:scale-95"
            >
              <div className="bg-blue-50 p-5 rounded-2xl mb-5 group-hover:bg-blue-600 transition-colors">
                <Camera className="w-7 h-7 text-blue-600 group-hover:text-white" />
              </div>
              <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Absen Sekarang</span>
            </button>
          ) : !todayData.jam_pulang ? (
            // 2. SKENARIO: SUDAH MASUK, TAPI BELUM PULANG (Tombol Oranye)
            <button 
              onClick={() => navigate('/absensi-pulang')} 
              className="flex flex-col items-center justify-center bg-white p-10 rounded-[2.5rem] shadow-sm border border-orange-100 hover:border-orange-500 transition-all group active:scale-95"
            >
              <div className="bg-orange-50 p-5 rounded-2xl mb-5 group-hover:bg-orange-600 transition-colors">
                <Camera className="w-7 h-7 text-orange-600 group-hover:text-white" />
              </div>
              <span className="text-xs font-black text-orange-900 uppercase tracking-widest">Absen Pulang</span>
            </button>
          ) : (
            // 3. SKENARIO: SUDAH PULANG (Tombol Abu-abu / Mati)
            <button 
              disabled
              className="flex flex-col items-center justify-center bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200 opacity-60 cursor-not-allowed"
            >
              <div className="bg-slate-200 p-5 rounded-2xl mb-5">
                <CheckCircle className="w-7 h-7 text-slate-400" />
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Absensi Selesai</span>
            </button>
          )}

          <button onClick={() => navigate('/izin')} className="flex flex-col items-center justify-center bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50 hover:border-emerald-500 transition-all group active:scale-95">
            <div className="bg-emerald-50 p-5 rounded-2xl mb-5 group-hover:bg-emerald-600 transition-colors">
              <Calendar className="w-7 h-7 text-emerald-600 group-hover:text-white" />
            </div>
            <span className="text-xs font-black text-emerald-900 uppercase tracking-widest">Izin / Sakit</span>
          </button>

          <button onClick={() => navigate('/riwayat')} className="flex flex-col items-center justify-center bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50 hover:border-purple-500 transition-all group active:scale-95">
            <div className="bg-purple-50 p-5 rounded-2xl mb-5 group-hover:bg-purple-600 transition-colors">
              <Clock className="w-7 h-7 text-purple-600 group-hover:text-white" />
            </div>
            <span className="text-xs font-black text-purple-900 uppercase tracking-widest">Riwayat</span>
          </button>
        </section>

        {/* AKTIVITAS TERAKHIR (LOOPING DARI DATABASE) */}
        <section className="space-y-6 pt-4">
          <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest px-2">History Absensi</h3>
          <div className="space-y-4">
            {history.length > 0 ? history.map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-4xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center ${item.status === 'hadir' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                    {/* Mengambil tanggal dari format YYYY-MM-DD */}
                    <span className="text-lg font-black leading-none">{new Date(item.tanggal_absen).getDate()}</span>
                    <span className="text-[8px] font-bold uppercase">{new Date(item.tanggal_absen).toLocaleString('id-ID', {month: 'short'})}</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">Absen {item.jam_pulang ? 'Selesai' : 'Masuk'}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      {item.status === 'hadir' ? 'TEPAT WAKTU' : 'TERLAMBAT'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-800">
                    {item.jam_masuk ? item.jam_masuk.slice(0, 5) : '--:--'}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-center text-slate-400 py-10">Belum ada riwayat absen.</p>
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;