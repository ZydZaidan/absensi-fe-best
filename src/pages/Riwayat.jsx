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
  const [stats, setStats] = useState({ hadir: 0, telat: 0, izin: 0 });
  
  // State untuk Filter
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // 1. Gunakan useCallback agar fungsi tidak dibuat ulang setiap render (Menghilangkan Warning Dependency)
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/riwayat-absensi?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Pastikan struktur data sesuai dengan respon Laravel
      setHistory(response.data.data || []);
      setStats(response.data.stats || { hadir: 0, telat: 0, izin: 0 });
    } catch (err) {
      console.error("Gagal mengambil riwayat:", err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [month, year, navigate]); // Fungsi akan update jika month/year berubah

  // 2. useEffect memanggil fetchHistory
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      
      {/* HEADER */}
      <header className="bg-white sticky top-0 z-50 p-6 md:px-12 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
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
                {/* Dropdown Bulan */}
                <select 
                    value={month} 
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="flex-1 md:w-40 p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                    ))}
                </select>

                {/* Dropdown Tahun (UPDATE: Agar setYear terpakai) */}
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

        {/* SUMMARY CARDS */}
        <section className="grid grid-cols-3 gap-4">
            <div className="bg-blue-600 p-6 rounded-4xl text-white shadow-xl shadow-blue-100">
                <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Hadir</p>
                <p className="text-3xl font-black">{stats?.hadir || 0 + stats?.telat || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Telat</p>
                <p className="text-3xl font-black text-rose-500">{stats.telat}</p>
            </div>
            <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Izin</p>
                <p className="text-3xl font-black text-amber-500">{stats.izin}</p>
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
                                <div className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center shrink-0 ${item.status === 'hadir' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                                    <span className="text-xl font-black leading-none">{new Date(item.tanggal_absen).getDate()}</span>
                                    <span className="text-[10px] font-bold uppercase">{new Date(item.tanggal_absen).toLocaleString('id-ID', { month: 'short' })}</span>
                                </div>
                                
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-lg font-black text-slate-800 tracking-tight italic">
                                            {item.jam_pulang ? 'Absensi Lengkap' : 'Hanya Absen Masuk'}
                                        </p>
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${item.status === 'hadir' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-xs font-bold">
                                              {item.jam_masuk?.slice(0,5)} - {item.jam_pulang ? item.jam_pulang.slice(0,5) : '--:--'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <MapPin className="w-3 h-3" />
                                            <span className="text-xs font-bold uppercase">Koordinat Tercatat</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-20 rounded-[3rem] text-center border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada aktivitas pada bulan ini.</p>
                </div>
            )}
        </section>

      </main>
    </div>
  );
};

export default Riwayat;