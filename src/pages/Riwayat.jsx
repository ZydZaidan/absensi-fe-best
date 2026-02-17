import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Filter, 
  ChevronRight, MapPin, Clock, Search, Loader2 
} from 'lucide-react';
import axios from 'axios';

const Riwayat = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ hadir: 0, telat: 0, izin: 0, pulang_cepat: 0 });
  
  // State untuk Filter
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // 1. Ambil Data History
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/riwayat-absensi?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setHistory(response.data.data || []);
      setStats(response.data.stats || { hadir: 0, telat: 0, izin: 0, pulang_cepat: 0 });
    } catch (err) {
      console.error("Gagal mengambil riwayat:", err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [month, year, navigate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      
      {/* HEADER */}
      <header className="bg-white sticky top-0 z-50 p-6 md:px-12 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-all group">
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
          </button>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800">Riwayat Kehadiran</h1>
        </div>
        <div className="hidden md:flex items-center gap-2 text-slate-400">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Periode {year}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* FILTER SECTION */}
        <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="bg-blue-50 p-3 rounded-2xl"><Filter className="w-4 h-4 text-blue-600" /></div>
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Filter Laporan</h3>
            </div>
            
            <div className="flex flex-wrap md:flex-nowrap gap-3 w-full md:w-auto">
                <select 
                    value={month} 
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="flex-1 md:w-40 p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                    ))}
                </select>

                <select 
                    value={year} 
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="flex-1 md:w-32 p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    {[2024, 2025, 2026].map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>

                <button onClick={fetchHistory} className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">
                    <Search className="w-5 h-5" />
                </button>
            </div>
        </section>

        {/* SUMMARY CARDS (Responsive: Mobile 3-2) */}
        <section className="bg-white p-6 md:p-8 rounded-4xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-6 lg:flex lg:items-center gap-y-8 lg:gap-0">
            <div className="col-span-2 text-center lg:flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hadir</p>
                <p className="text-xl md:text-3xl font-black text-blue-600">{(stats?.hadir || 0)}</p>
            </div>
            <div className="hidden lg:block w-px h-10 bg-slate-100 shrink-0"></div>
            <div className="col-span-2 text-center lg:flex-1 border-l lg:border-none border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Izin</p>
                <p className="text-xl md:text-3xl font-black text-amber-500">{stats?.izin || 0}</p>
            </div>
            <div className="hidden lg:block w-px h-10 bg-slate-100 shrink-0"></div>
            <div className="col-span-2 text-center lg:flex-1 border-l lg:border-none border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">P. Cepat</p>
                <p className="text-xl md:text-3xl font-black text-orange-500">{stats?.pulang_cepat || 0}</p>
            </div>
            <div className="hidden lg:block w-px h-10 bg-slate-100 shrink-0"></div>
            <div className="col-span-3 text-center lg:flex-1 border-t lg:border-t-0 pt-6 lg:pt-0 border-slate-100">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Telat</p>
                <p className="text-xl md:text-3xl font-black text-rose-500">{stats?.telat || 0}</p>
            </div>
            <div className="hidden lg:block w-px h-10 bg-slate-100 shrink-0"></div>
            <div className="col-span-3 text-center lg:flex-1 border-t lg:border-t-0 pt-6 lg:pt-0 border-l border-slate-100 lg:border-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alpha</p>
                <p className="text-xl md:text-3xl font-black text-slate-300">0</p>
            </div>
        </div>
        </section>

        {/* TIMELINE LIST */}
        <section className="space-y-4">
            <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.3em] ml-4">Detail Aktivitas</h3>
            
            {loading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sinkronisasi Data...</p>
                </div>
            ) : history.length > 0 ? (
                <div className="space-y-4">
                    {history.map((item, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all group">
                            <div className="flex items-center gap-6">
                                {/* Warna Lingkaran Dinamis Berdasarkan Status */}
                                <div className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center shrink-0 ${
                                    item.status === 'hadir' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                                    item.status === 'telat' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                                    item.status === 'cuti' ? 'bg-blue-50 border-blue-100 text-blue-600' : 
                                    item.status === 'dinas' ? 'bg-purple-50 border-purple-100 text-purple-600' : 
                                    'bg-amber-50 border-amber-100 text-amber-600'
                                }`}>
                                    <span className="text-xl font-black leading-none">{new Date(item.tanggal_absen).getDate()}</span>
                                    <span className="text-[10px] font-bold uppercase">{new Date(item.tanggal_absen).toLocaleString('id-ID', { month: 'short' })}</span>
                                </div>
                                
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        {/* Status Utama */}
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${
                                            item.status === 'hadir' ? 'bg-emerald-100 text-emerald-700' : 
                                            item.status === 'telat' ? 'bg-rose-100 text-rose-700' : 
                                            item.status === 'sakit' ? 'bg-red-100 text-red-700' : 
                                            item.status === 'cuti' ? 'bg-blue-100 text-blue-700' : 
                                            item.status === 'dinas' ? 'bg-purple-100 text-purple-700' : 
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                            {item.status}
                                        </span>

                                        {/* Status Double: Pulang Cepat */}
                                        {item.status_pulang_cepat === 'disetujui' && (
                                            <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase bg-orange-100 text-orange-700 border border-orange-200">
                                                Pulang Cepat
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-lg font-black text-slate-800 tracking-tight leading-tight">
                                            {['izin', 'sakit', 'cuti', 'dinas'].includes(item.status) 
                                                ? `Pengajuan ${item.status.toUpperCase()}` 
                                                : (item.jam_pulang ? 'Absensi Lengkap' : 'Hanya Absen Masuk')}
                                        </p>
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            {/* Jam hanya muncul jika bukan status Izin/Cuti/Dinas */}
                                            {!['izin', 'sakit', 'cuti', 'dinas'].includes(item.status) && (
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-xs font-bold font-mono">
                                                        {item.jam_masuk?.slice(0,5)} - {item.jam_pulang ? item.jam_pulang.slice(0,5) : '--:--'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <MapPin className="w-3 h-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Koordinat Tercatat</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-20 rounded-[3rem] text-center border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Belum ada aktivitas tercatat pada periode ini.</p>
                </div>
            )}
        </section>

      </main>
    </div>
  );
};

export default Riwayat;