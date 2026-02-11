import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, ShieldCheck, Settings, LogOut, 
  Clock, BarChart3, Camera, CheckCircle, 
  Bell, Loader2, Calendar, ChevronRight, AlertCircle
} from 'lucide-react';
import logoBest from '../assets/images/logobest.png';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // 1. STATE MANAGEMENT
  const [adminData] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayData, setTodayData] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ hadir: 0, telat: 0, izin: 0 });
  const [pendingPulangCount, setPendingPulangCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 2. FETCH DATA DARI BACKEND
  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Ambil 3 data penting secara paralel (Lebih Cepat)
        const [resStatus, resHistory, resPending] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/attendance/check-status`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/riwayat-absensi`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/admin/pending-pulang-cepat`, config)
        ]);

        setTodayData(resStatus.data.data);
        setHistory(resHistory.data.data || []);
        setStats(resHistory.data.stats || { hadir: 0, telat: 0, izin: 0 });
        setPendingPulangCount(resPending.data.data?.length || 0);

      } catch (err) {
        console.error("Gagal sinkronisasi data dashboard", err);
        // Jika token tidak valid (Expired), otomatis logout
        if (err.response?.status === 401) {
            localStorage.clear();
            navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();

    // Timer Jam Real-time
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // 3. LOADING STATE VIEW
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-slate-800 animate-spin mb-4" />
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">Memproses Dashboard Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
      {/* NAVIGATION BAR */}
      <nav className="bg-white px-8 py-4 flex justify-between items-center shadow-sm border-b border-slate-100 sticky top-0 z-50">
        <img src={logoBest} alt="Logo" className="h-7 w-auto" />
        <div className="flex items-center gap-4 text-slate-400">
          <Settings className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors" />
          <LogOut onClick={handleLogout} className="w-5 h-5 cursor-pointer hover:text-rose-600 transition-colors" />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* HERO CARD (Admin Info & Live Clock) */}
        <section className="bg-linear-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-row justify-between items-center gap-6">
            <div>
              <div className="bg-blue-600 w-fit px-3 py-1 rounded-full mb-3 shadow-lg shadow-blue-900/20 border border-blue-400/20">
                <p className="text-[8px] font-black uppercase tracking-[0.2em]">Administrator Mode</p>
              </div>
              <h2 className="text-3xl font-black italic tracking-tight leading-tight">
                Halo, {adminData?.name || 'Admin'} <span className="not-italic">🛡️</span>
              </h2>
              <p className="text-xs opacity-60 mt-1 font-medium italic uppercase tracking-wider">
                {adminData?.jabatan || 'Head'} • Kendali Pusat
              </p>
            </div>

            <div className="text-right border-l border-white/10 pl-6 hidden sm:block">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-2">
                {currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Admin's Personal Absence Status */}
          <div className="mt-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-4xl p-8 shadow-inner">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${todayData ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                <span className="text-lg font-black italic tracking-wide">
                    {todayData ? (todayData.jam_pulang ? 'Absensi Selesai' : 'Status: Sudah Masuk') : 'Status: Belum Absen'}
                </span>
              </div>
              <div className="bg-white/10 px-3 py-1.5 rounded-xl font-black text-xs">
                {todayData?.jam_masuk?.slice(0,5) || '--:--'}
              </div>
            </div>
            
            <div className="h-px bg-white/5 w-full mb-6"></div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center md:text-left">
                <p className="text-[10px] uppercase font-bold opacity-40 mb-1">Hadir</p>
                <p className="text-2xl font-black text-white">{(stats?.hadir || 0) + (stats?.telat || 0)}</p>
              </div>
              <div className="text-center md:text-left border-l border-white/5 pl-6">
                <p className="text-[10px] uppercase font-bold opacity-40 mb-1">Izin</p>
                <p className="text-2xl font-black text-amber-400">{stats?.izin || 0}</p>
              </div>
              <div className="text-center md:text-left border-l border-white/5 pl-6">
                <p className="text-[10px] uppercase font-bold opacity-40 mb-1">Telat</p>
                <p className="text-2xl font-black text-rose-400">{stats?.telat || 0}</p>
              </div>
              <div className="text-center md:text-left border-l border-white/5 pl-6">
                <p className="text-[10px] uppercase font-bold opacity-40 mb-1">Alpha</p>
                <p className="text-2xl font-black text-slate-500">0</p>
              </div>
            </div>
          </div>
        </section>

        {/* ACTION BUTTONS (Dinamis & Responsive) */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          
          {/* LOGIKA TOMBOL ABSEN ADMIN SENDIRI */}
          {!todayData ? (
            <button onClick={() => navigate('/absensi')} className="flex flex-col items-center justify-center bg-white p-6 rounded-4xl shadow-sm border border-slate-50 hover:border-blue-500 transition-all group active:scale-95">
                <div className="bg-blue-50 p-4 rounded-2xl mb-4 group-hover:bg-blue-600 transition-colors"><Camera className="text-blue-600 group-hover:text-white" /></div>
                <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest text-center">Absen Masuk</span>
            </button>
          ) : !todayData.jam_pulang ? (
            <button onClick={() => navigate('/absensi-pulang')} className="flex flex-col items-center justify-center bg-white p-6 rounded-4xl shadow-sm border border-orange-100 hover:border-orange-500 transition-all group active:scale-95">
                <div className="bg-orange-50 p-4 rounded-2xl mb-4 group-hover:bg-orange-600 transition-colors"><Camera className="text-orange-600 group-hover:text-white" /></div>
                <span className="text-[10px] font-black text-orange-900 uppercase tracking-widest text-center">Absen Pulang</span>
            </button>
          ) : (
            <button disabled className="flex flex-col items-center justify-center bg-slate-50 p-6 rounded-4xl border border-slate-200 opacity-60">
                <div className="bg-slate-200 p-4 rounded-2xl mb-4"><CheckCircle className="text-slate-400" /></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Selesai</span>
            </button>
          )}

          {/* IZIN / SAKIT PRIBADI */}
          <button onClick={() => navigate('/izin')} className="flex flex-col items-center justify-center bg-white p-6 rounded-4xl shadow-sm border border-slate-50 hover:border-emerald-500 transition-all group active:scale-95">
            <div className="bg-emerald-50 p-4 rounded-2xl mb-4 group-hover:bg-emerald-600 transition-colors"><Calendar className="text-emerald-600 group-hover:text-white" /></div>
            <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest text-center">Izin / Sakit</span>
          </button>

          {/* VERIFIKASI AKUN KARYAWAN */}
          <button onClick={() => navigate('/admin/verifikasi')} className="flex flex-col items-center justify-center bg-white p-6 rounded-4xl shadow-sm border border-slate-50 hover:border-indigo-500 transition-all group active:scale-95">
            <div className="bg-indigo-50 p-4 rounded-2xl mb-4 group-hover:bg-indigo-600 transition-colors"><ShieldCheck className="text-indigo-600 group-hover:text-white" /></div>
            <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest text-center">Verifikasi Akun</span>
          </button>

          {/* PERSETUJUAN PULANG CEPAT (With Red Badge) */}
          <button onClick={() => navigate('/admin/persetujuan-pulang-cepat')} className="relative flex flex-col items-center justify-center bg-white p-6 rounded-4xl shadow-sm border border-orange-50 hover:border-orange-500 transition-all group active:scale-95">
            {pendingPulangCount > 0 && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-black animate-bounce shadow-lg border-4 border-white">
                    {pendingPulangCount}
                </div>
            )}
            <div className="bg-orange-50 p-4 rounded-2xl mb-4 group-hover:bg-orange-600 transition-colors"><Clock className="text-orange-600 group-hover:text-white" /></div>
            <span className="text-[10px] font-black text-orange-900 uppercase tracking-widest text-center">ACC Pulang</span>
          </button>

          {/* REKAPITULASI GLOBAL */}
          <button onClick={() => navigate('/admin/rekap-absen')} className="flex flex-col items-center justify-center bg-white p-6 rounded-4xl shadow-sm border border-slate-50 hover:border-purple-500 transition-all group active:scale-95">
            <div className="bg-purple-50 p-4 rounded-2xl mb-4 group-hover:bg-purple-600 transition-colors"><Users className="text-purple-600 group-hover:text-white" /></div>
            <span className="text-[10px] font-black text-purple-900 uppercase tracking-widest text-center">Rekap Absensi</span>
          </button>

        </section>

        {/* PERSONAL HISTORY LIST (Admin's Personal Data) */}
        <section className="space-y-6 pt-4">
          <div className="flex justify-between items-end px-2">
            <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Riwayat Absensi Saya</h3>
            <button onClick={() => navigate('/riwayat')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Lihat Semua</button>
          </div>
          
          <div className="space-y-4">
            {history.length > 0 ? history.slice(0, 3).map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-4xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center ${item.status === 'hadir' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                    <span className="text-lg font-black leading-none">{new Date(item.tanggal_absen).getDate()}</span>
                    <span className="text-[8px] font-bold uppercase">{new Date(item.tanggal_absen).toLocaleString('id-ID', { month: 'short' })}</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase italic tracking-tighter">Absen {item.jam_pulang ? 'Selesai' : 'Masuk'}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.status === 'hadir' ? 'TEPAT WAKTU' : 'TERLAMBAT'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-800">{item.jam_masuk?.slice(0,5) || '--:--'} WIB</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-slate-300 font-bold uppercase text-[10px] py-10">Belum ada riwayat absen bulan ini.</p>
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;