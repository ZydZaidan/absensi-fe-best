import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, ShieldCheck, Settings, LogOut, 
  Clock, BarChart3, Camera, CheckCircle, 
  Bell, Loader2, Calendar, ChevronRight, AlertCircle, CalendarCheck
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
        
        {/* HERO CARD */}
        <section className="bg-linear-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-row justify-between items-center gap-6">
            <div>
              <div className='bg-blue-600 w-fit px-3 py-1 rounded-full mb-3 shadow-lg shadow-blue-900/20 border border-blue-400/20'>
                <p className='text-[8px] font-black uppercase tracking-[0.2em]'>Administrator Mode</p>
              </div>
              <h2 className="md:text-4xl text-2xl font-black flex items-center gap-2 italic">
                {adminData?.name || 'Admin'} 
              </h2>
              <p className="text-xs opacity-70 mt-1 font-medium">{adminData?.jabatan || 'Staff'} • PT BEST</p>
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

          <div className="mt-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-4xl p-8">
            <div className="flex items-center gap-3 mb-6">
              {/* Logika Status Visual */}
              <div className={`w-3 h-3 rounded-full animate-pulse ${todayData ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
              <span className="text-xl font-black italic tracking-wide">
                {todayData ? (todayData.jam_pulang ? 'Absensi Selesai' : 'Sudah Masuk') : 'Belum Absen'}
              </span>
            </div>

            <div className="h-px bg-white/10 w-full mb-6"></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold opacity-60">Jam Masuk</p>
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

        {/* STATISTIK (Responsive Grid: Mobile 3-2, Desktop 1 Baris) */}
        <section className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="grid grid-cols-6 lg:flex lg:items-center gap-y-6 lg:gap-0">
            
            {/* 1. HADIR - Mobile: 2 dari 6 kolom (1/3 baris) */}
            <div className="col-span-2 text-center lg:flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hadir</p>
              <p className="text-xl md:text-2xl font-black text-blue-600">{(stats?.hadir || 0) + (stats?.telat || 0)}</p>
            </div>

            {/* Divider Desktop Only */}
            <div className="hidden lg:block w-px h-10 bg-slate-100 shrink-0"></div>

            {/* 2. IZIN - Mobile: 2 dari 6 kolom (1/3 baris) */}
            <div className="col-span-2 text-center lg:flex-1 border-l border-slate-50 lg:border-none">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Izin</p>
              <p className="text-xl md:text-2xl font-black text-amber-500">{stats?.izin || 0}</p>
            </div>

            <div className="hidden lg:block w-px h-10 bg-slate-100 shrink-0"></div>

            {/* 3. PULANG CEPAT (Dipindah ke urutan 3 agar sebaris di HP) */}
            <div className="col-span-2 text-center lg:flex-1 border-l border-slate-50 lg:border-none">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pulang Cepat</p>
              <p className="text-xl md:text-2xl font-black text-slate-300">0</p>
            </div>

            {/* Divider Desktop Only */}
            <div className="hidden lg:block w-px h-10 bg-slate-100 shrink-0"></div>

            {/* 4. TERLAMBAT - Mobile: 3 dari 6 kolom (1/2 baris) */}
            <div className="col-span-3 text-center lg:flex-1 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Terlambat</p>
              <p className="text-xl md:text-2xl font-black text-rose-500">{stats?.telat || 0}</p>
            </div>

            {/* Divider Desktop Only */}
            <div className="hidden lg:block w-px h-10 bg-slate-100 shrink-0"></div>

            {/* 5. ALPHA - Mobile: 3 dari 6 kolom (1/2 baris) */}
            <div className="col-span-3 text-center lg:flex-1 border-t lg:border-t-0 pt-4 lg:pt-0 border-l border-slate-50 lg:border-none">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alpha</p>
              <p className="text-xl md:text-2xl font-black text-slate-300">0</p>
            </div>

          </div>
        </section>

       {/* ACTION BUTTONS (6 Tombol: Mobile 3-3 | Desktop 1 Baris Melebar) */}
        <section className="bg-white p-8 rounded-4xl shadow-sm border border-slate-100">
          
          <div className="flex flex-wrap lg:flex-nowrap justify-center lg:justify-between items-start gap-y-10 gap-x-2 md:gap-x-6">
            
            {/* 1. ABSEN (Dinamis Pribadi Admin) */}
            <div className="flex flex-col items-center w-[30%] lg:w-auto lg:flex-1">
              {!todayData ? (
                <button onClick={() => navigate('/absensi')} className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all border-2 border-blue-100 hover:bg-blue-600 hover:text-white group">
                  <Camera className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>
              ) : todayData.jam_pulang ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center border-2 border-slate-100">
                  <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
              ) : (
                <button onClick={() => navigate('/absensi-pulang')} className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all border-2 border-orange-100 hover:bg-orange-600 hover:text-white">
                  <Camera className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>
              )}
              <span className="mt-3 text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-tighter text-center">
                {todayData ? (todayData.jam_pulang ? 'Selesai' : 'Pulang') : 'Absen'}
              </span>
            </div>

            {/* 2. IZIN / SAKIT (Pribadi) */}
            <div className="flex flex-col items-center w-[30%] lg:w-auto lg:flex-1">
              <button onClick={() => navigate('/izin')} className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all border-2 border-emerald-100 hover:bg-emerald-600 hover:text-white">
                <Calendar className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>
              <span className="mt-3 text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-tighter text-center leading-tight">Izin</span>
            </div>

            {/* 3. VERIFIKASI AKUN (Admin) */}
            <div className="flex flex-col items-center w-[30%] lg:w-auto lg:flex-1">
              <button onClick={() => navigate('/admin/verifikasi')} className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all border-2 border-indigo-100 hover:bg-indigo-600 hover:text-white">
                <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>
              <span className="mt-3 text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-tighter text-center leading-tight">Verifikasi</span>
            </div>

            {/* 4. ACC PULANG CEPAT (Admin) */}
            <div className="flex flex-col items-center w-[30%] lg:w-auto lg:flex-1">
              <div className="relative">
                <button onClick={() => navigate('/admin/persetujuan-pulang-cepat')} className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all border-2 border-orange-100 hover:bg-orange-600 hover:text-white">
                  <Clock className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>
                {pendingPulangCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-white animate-bounce shadow-lg">
                    {pendingPulangCount}
                  </span>
                )}
              </div>
              <span className="mt-3 text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-tighter text-center leading-tight">ACC Pulang</span>
            </div>

            {/* 5. PERSETUJUAN IZIN & CUTI (Admin - Fitur Baru) */}
            <div className="flex flex-col items-center w-[30%] lg:w-auto lg:flex-1">
              <div className="relative">
                <button 
                  onClick={() => navigate('/admin/persetujuan-izin')} 
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all border-2 border-emerald-100 hover:bg-emerald-600 hover:text-white"
                >
                  <CalendarCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>
                {/* Nanti bisa ditambah badge jumlah izin pending di sini */}
              </div>
              <span className="mt-3 text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-tighter text-center leading-tight">ACC Izin</span>
            </div>

            {/* 6. REKAPITULASI (Admin) */}
            <div className="flex flex-col items-center w-[30%] lg:w-auto lg:flex-1">
              <button onClick={() => navigate('/admin/rekap-absen')} className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all border-2 border-purple-100 hover:bg-purple-600 hover:text-white">
                <Users className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>
              <span className="mt-3 text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-tighter text-center leading-tight">Rekap Absen</span>
            </div>
            
          </div>
        </section>

        {/* PERSONAL HISTORY LIST - UPDATE LOGIC */}
        <section className="space-y-6 pt-4">
          <div className="flex justify-between items-end px-2">
            <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Riwayat Absensi Saya</h3>
            <button onClick={() => navigate('/riwayat')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Lihat Semua</button>
          </div>
          
          <div className="space-y-4">
            {history.length > 0 ? history.slice(0, 3).map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-4xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-5">
                  {/* Lingkaran Tanggal Dinamis */}
                  <div className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center ${
                    item.status === 'hadir' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                    (item.status === 'telat' || item.status === 'sakit') ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                    'bg-blue-50 border-blue-100 text-blue-600'
                  }`}>
                    <span className="text-lg font-black leading-none">{new Date(item.tanggal_absen).getDate()}</span>
                    <span className="text-[8px] font-bold uppercase">{new Date(item.tanggal_absen).toLocaleString('id-ID', { month: 'short' })}</span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                        item.status === 'hadir' ? 'bg-emerald-100 text-emerald-700' : 
                        item.status === 'telat' ? 'bg-rose-100 text-rose-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                      {item.status_pulang_cepat === 'disetujui' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">
                          PC
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-black text-slate-800 uppercase italic tracking-tighter">
                        {['izin', 'sakit', 'cuti', 'dinas'].includes(item.status) 
                            ? `PENGADAAN ${item.status}` 
                            : (item.jam_pulang ? 'Absen Selesai' : 'Absen Masuk')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {!['izin', 'sakit', 'cuti', 'dinas'].includes(item.status) && (
                    <p className="text-sm font-black text-slate-800">{item.jam_masuk?.slice(0,5) || '--:--'} WIB</p>
                  )}
                </div>
              </div>
            )) : (
              <p className="text-center text-slate-300 font-bold uppercase text-[10px] py-10 italic">Belum ada riwayat absen bulan ini.</p>
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;