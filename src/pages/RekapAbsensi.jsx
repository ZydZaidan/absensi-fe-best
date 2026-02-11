import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Search, Filter, 
  Loader2, Calendar, MapPin, Clock 
} from 'lucide-react';

const RekapAbsensi = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [daftarCabang, setDaftarCabang] = useState([]); // State untuk list cabang

  // 1. State Filter (Ditambah id_cabang)
  const [filter, setFilter] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    status: '',
    tanggal: '',
    id_cabang: '' // Filter baru
  });

  // 2. Ambil Daftar Cabang untuk Dropdown (Hanya jalan sekali saat mount)
  useEffect(() => {
    const fetchCabang = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/cabang`);
        setDaftarCabang(response.data.data || []);
      } catch (err) {
        console.error("Gagal ambil list cabang", err);
      }
    };
    fetchCabang();
  }, []);

  // 3. Fetch Data Rekap (Otomatis panggil jika filter berubah)
  useEffect(() => {
    const fetchRekap = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/rekap-absen`, {
          params: filter,
          headers: { Authorization: `Bearer ${token}` }
        });
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
  }, [filter, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      
      <header className="bg-white sticky top-0 z-1000 p-6 md:px-12 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-all group">
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
          </button>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter">Rekapitulasi Absensi</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* FILTER BOX (Update: Menjadi 5 Kolom di Desktop) */}
        <section className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Filter Bulan */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Bulan</label>
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

          {/* Filter Status */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Status</label>
            <select 
              className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
              value={filter.status}
              onChange={(e) => setFilter({...filter, status: e.target.value})}
            >
              <option value="">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="telat">Terlambat</option>
              <option value="izin">Izin / Sakit</option>
              <option value="alpha">Alpha</option>
            </select>
          </div>

          {/* NEW: Filter Cabang */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Cabang Kantor</label>
            <select 
              className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
              value={filter.id_cabang}
              onChange={(e) => setFilter({...filter, id_cabang: e.target.value})}
            >
              <option value="">Semua Cabang</option>
              {daftarCabang.map((cabang) => (
                <option key={cabang.id} value={cabang.id}>{cabang.nama_cabang}</option>
              ))}
            </select>
          </div>

          {/* Filter Tanggal */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Tanggal</label>
            <input 
              type="date" 
              className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
              value={filter.tanggal}
              onChange={(e) => setFilter({...filter, tanggal: e.target.value})}
            />
          </div>

          {/* Tombol Search */}
          <div className="flex items-end">
            <button className="w-full p-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95">
              <Search className="w-4 h-4" /> Cari Data
            </button>
          </div>
        </section>

        {/* DATA TABLE */}
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
                    <td colSpan="6" className="py-24 text-center">
                      <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Data Kantor...</p>
                    </td>
                  </tr>
                ) : data.length > 0 ? data.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{row.user?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{row.user?.jabatan || '-'}</p>
                    </td>
                    <td className="px-8 py-5 text-center text-xs font-bold text-slate-600">
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
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-blue-400" />
                            {row.user?.branch?.nama_cabang || 'Kantor Pusat'}
                        </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="py-24 text-center text-slate-300 font-black uppercase text-xs italic tracking-widest">
                        Belum ada catatan absensi untuk periode ini
                    </td>
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