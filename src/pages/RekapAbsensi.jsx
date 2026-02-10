import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Search, Filter, 
  FileSpreadsheet, Loader2 
} from 'lucide-react';

const RekapAbsensi = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  // 1. State Filter (Default ke bulan & tahun sekarang)
  const [filter, setFilter] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    status: '',
    tanggal: ''
  });

  // 2. Fetch Data Logic (Diletakkan di dalam useEffect agar tidak error dependency)
  useEffect(() => {
    const fetchRekap = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/rekap-absen`, {
          params: filter,
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Pastikan mengambil array data dari respon Laravel
        setData(response.data.data || []);
      } catch (err) {
        console.error("Gagal mengambil data rekap:", err);
        if (err.response?.status === 401) {
            localStorage.clear();
            navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRekap();
  }, [filter, navigate]); // Otomatis refresh jika objek filter berubah

  // 3. Logic Export Excel (Token dikirim via URL karena window.open tidak bisa kirim header)
  const handleExportExcel = () => {
    const token = localStorage.getItem('token');
    const url = `${import.meta.env.VITE_API_URL}/admin/export-excel?bulan=${filter.bulan}&tahun=${filter.tahun}&token=${token}`;
    
    // Membuka tab baru untuk memicu download file dari Laravel
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      
      {/* HEADER */}
      <header className="bg-white sticky top-0 z-1000 p-6 md:px-12 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-all group">
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
          </button>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter">Rekapitulasi Global</h1>
        </div>
        
        <button 
          onClick={handleExportExcel}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span className="hidden md:block uppercase tracking-widest">Export Excel</span>
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* FILTER BOX */}
        <section className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Bulan</label>
            <select 
              className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
              value={filter.bulan}
              onChange={(e) => setFilter({...filter, bulan: e.target.value})}
            >
              {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, i) => (
                <option key={i} value={i+1}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Status Kehadiran</label>
            <select 
              className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
              value={filter.status}
              onChange={(e) => setFilter({...filter, status: e.target.value})}
            >
              <option value="">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="telat">Terlambat</option>
              <option value="izin">Izin/Sakit</option>
              <option value="alpha">Alpha</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tanggal Spesifik</label>
            <input 
              type="date" 
              className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
              value={filter.tanggal}
              onChange={(e) => setFilter({...filter, tanggal: e.target.value})}
            />
          </div>

          <div className="flex items-end">
            <button className="w-full p-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
              <Search className="w-4 h-4" /> Cari Data
            </button>
          </div>
        </section>

        {/* DATA TABLE AREA */}
        <section className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto text-nowrap">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Karyawan</th>
                  <th className="px-8 py-6 text-center">Tanggal</th>
                  <th className="px-8 py-6 text-center">Masuk</th>
                  <th className="px-8 py-6 text-center">Pulang</th>
                  <th className="px-8 py-6 text-center">Status</th>
                  <th className="px-8 py-6">Cabang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menyinkronkan Data...</p>
                    </td>
                  </tr>
                ) : data.length > 0 ? data.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{row.user?.name || 'User'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{row.user?.jabatan || 'Staff'}</p>
                    </td>
                    <td className="px-8 py-5 text-center text-xs font-bold text-slate-600 uppercase">
                      {row.tanggal_absen ? new Date(row.tanggal_absen).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric'}) : '-'}
                    </td>
                    <td className="px-8 py-5 text-center text-sm font-black text-slate-700">{row.jam_masuk?.slice(0,5) || '--:--'}</td>
                    <td className="px-8 py-5 text-center text-sm font-black text-slate-700">{row.jam_pulang?.slice(0,5) || '--:--'}</td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        row.status === 'hadir' ? 'bg-emerald-100 text-emerald-700' : 
                        row.status === 'telat' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-400 uppercase italic">
                      {row.user?.branch?.nama_cabang || 'Kantor Pusat'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-slate-300 font-bold text-xs uppercase italic tracking-widest">Data tidak ditemukan dalam periode ini</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
};

export default RekapAbsensi;