import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, ShieldCheck, Settings, LogOut, 
  Clock, BarChart3, Camera, CheckCircle, 
  Bell, Loader2, Calendar, ChevronRight
} from 'lucide-react';
import logoBest from '../assets/images/logobest.png';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminData] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [currentTime, setCurrentTime] = useState(new Date());

  // State untuk Data Pribadi & Stats Admin
  const [todayData, setTodayData] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ hadir: 0, telat: 0, izin: 0 });
  const [loading, setLoading] = useState(true);

  // Ambil Data dari Backend (Sama seperti Karyawan)
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [resStatus, resHistory] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/attendance/check-status`,config),
          axios.get(`${import.meta.env.VITE_API_URL}/riwayat-absensi`,config)
        ]);

        setTodayData(resStatus.data.data);
        setHistory(resHistory.data.data);
        setStats(resHistory.data.stats);
      } catch (err) {
        console.error("Gagal sinkronisasi data admin", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-slate-800 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Sinkronisasi Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
      {/* 1. TOP BAR */}
      <nav className="bg-white px-8 py-4 flex justify-between items-center shadow-sm border-b border-slate-100 sticky top-0 z-50">
        <img src={logoBest} alt="Logo" className="h-7 w-auto" />
        <div className="flex items-center gap-4 text-slate-400">

          <Settings className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors" />
          <LogOut onClick={handleLogout} className="w-5 h-5 cursor-pointer hover:text-rose-600 transition-colors" />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* 2. HERO CARD (Admin Style - Slate Black) */}
        <section className="bg-linear-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-row justify-between items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">Administrator Mode</span>
              </div>
              <h2 className="text-3xl font-black italic">
                Halo, {adminData?.name} <span className="not-italic">🛡️</span>
              </h2>
              <p className="text-xs opacity-60 mt-1 font-medium">{adminData?.jabatan} • Kendali Pusat</p>
            </div>

            <div className="text-right border-l border-white/10 pl-6">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-2">
                {currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          {/* Admin Attendance Info */}
          <div className="mt-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-4xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full animate-pulse ${todayData ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                <span className="text-lg font-black italic"> {todayData ? 'Sudah Masuk' : 'Belum Absen'}</span>
              </div>
              <p className="text-xl font-black">{todayData?.jam_masuk?.slice(0,5) || '-- : --'}</p>
            </div>
            
            <div className="h-px bg-white/5 w-full mb-6"></div>

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
        {/* 3. ACTION BUTTONS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* TOMBOL ABSEN ADMIN (Dinamis) */}
          {!todayData ? (
            <button onClick={() => navigate('/absensi')} className="flex flex-col items-center justify-center bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50 hover:border-blue-500 transition-all group active:scale-95">
              <div className="bg-blue-50 p-5 rounded-2xl mb-5 group-hover:bg-blue-600 transition-colors">
                <Camera className="w-7 h-7 text-blue-600 group-hover:text-white" />
              </div>
              <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Absen Masuk</span>
            </button>
          ) : !todayData.jam_pulang ? (
            <button onClick={() => navigate('/absensi-pulang')} className="flex flex-col items-center justify-center bg-white p-10 rounded-[2.5rem] shadow-sm border border-orange-100 hover:border-orange-500 transition-all group active:scale-95">
              <div className="bg-orange-50 p-5 rounded-2xl mb-5 group-hover:bg-orange-600 transition-colors">
                <Camera className="w-7 h-7 text-orange-600 group-hover:text-white" />
              </div>
              <span className="text-xs font-black text-orange-900 uppercase tracking-widest">Absen Pulang</span>
            </button>
          ) : (
            <button disabled className="flex flex-col items-center justify-center bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200 opacity-60">
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

          {/* VERIFIKASI KARYAWAN */}
          <button onClick={() => navigate('/admin/verifikasi')} className="flex flex-col items-center justify-center bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50 hover:border-emerald-500 transition-all group active:scale-95">
            <div className="bg-emerald-50 p-5 rounded-2xl mb-5 group-hover:bg-emerald-600 transition-colors">
              <ShieldCheck className="w-7 h-7 text-emerald-600 group-hover:text-white" />
            </div>
            <span className="text-xs font-black text-emerald-900 uppercase tracking-widest text-center">Verifikasi Karyawan</span>
          </button>

          {/* REKAPAN DATA KARYAWAN (Fungsi Melihat Semua Absen) */}
          <button onClick={() => navigate('/admin/rekap-absen')} className="flex flex-col items-center justify-center bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50 hover:border-purple-500 transition-all group active:scale-95">
            <div className="bg-purple-50 p-5 rounded-2xl mb-5 group-hover:bg-purple-600 transition-colors">
              <Users className="w-7 h-7 text-purple-600 group-hover:text-white" />
            </div>
            <span className="text-xs font-black text-purple-900 uppercase tracking-widest text-center">Rekap Absensi</span>
          </button>

          
        </section>

        {/* 4. PERSONAL HISTORY FEED (Riwayat Absen Admin Sendiri) */}
        <section className="space-y-6 pt-4">
          <div className="flex justify-between items-end px-2">
            <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Riwayat Absensi Saya</h3>
            <button 
              onClick={() => navigate('/riwayat')}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
            >
              Lihat History Lengkap
            </button>
          </div>
          
          <div className="space-y-4">
            {history.length > 0 ? history.slice(0, 3).map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-4xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center ${item.status === 'hadir' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                    <span className="text-lg font-black leading-none">{new Date(item.tanggal_absen).getDate()}</span>
                    <span className="text-[8px] font-bold uppercase">{new Date(item.tanggal_absen).toLocaleString('id-ID', { month: 'short' })}</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">Absen {item.jam_pulang ? 'Selesai' : 'Masuk'}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        {item.status === 'hadir' ? 'TEPAT WAKTU' : 'TERLAMBAT'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-800">{item.jam_masuk.slice(0,5)} WIB</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-slate-400 py-10">Belum ada riwayat tercatat.</p>
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;