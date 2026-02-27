import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Search, Loader2, MapPin, X, ImageOff } from 'lucide-react';

const RekapAbsensi = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [daftarCabang, setDaftarCabang] = useState([]);

  const [filter, setFilter] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    status: '',
    tanggal: '',
    id_cabang: ''
  });

  const fixUrl = (url) => {
    if (!url) return null;
    return url.replace('http://', 'https://');
  };

  useEffect(() => {
    const fetchCabang = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/cabang`);
        setDaftarCabang(response.data.data || []);
      } catch (err) { console.error(err); }
    };
    fetchCabang();
  }, []);

  useEffect(() => {
    const fetchRekap = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/rekap-absen`, {
          params: filter,
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Data Rekap dari Server:", response.data.data);
        setData(response.data.data || []);
      } catch (err) {
        if (err.response?.status === 401) { localStorage.clear(); navigate('/'); }
      } finally { setLoading(false); }
    };
    fetchRekap();
  }, [filter, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      <header className="bg-white sticky top-0 z-40 p-6 md:px-12 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-all group">
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
          </button>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800">Rekapitulasi Absensi</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* FILTER BOX - UPDATE: Menambah 4 status kategori */}
        <section className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Bulan</label>
            <select className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" value={filter.bulan} onChange={(e) => setFilter({...filter, bulan: e.target.value})}>
              {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, i) => (
                <option key={i} value={i+1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Status Kehadiran</label>
            <select className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})}>
              <option value="">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="telat">Terlambat</option>
              <option value="izin">Izin</option>
              <option value="sakit">Sakit</option>
              <option value="cuti">Cuti</option>
              <option value="dinas">Dinas Luar</option>
              <option value="alpha">Alpha</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Cabang</label>
            <select className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" value={filter.id_cabang} onChange={(e) => setFilter({...filter, id_cabang: e.target.value})}>
                <option value="">Semua Cabang</option>
                {daftarCabang.map(c => <option key={c.id} value={c.id}>{c.nama_cabang}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tanggal</label>
            <input type="date" className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" value={filter.tanggal} onChange={(e) => setFilter({...filter, tanggal: e.target.value})} />
          </div>
          <div className="flex items-end">
            <button className="w-full p-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
              <Search className="w-4 h-4" /> Cari
            </button>
          </div>
        </section>

        {/* DATA TABLE */}
        <section className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Karyawan</th>
                  <th className="px-8 py-6 text-center">Tanggal</th>
                  <th className="px-8 py-6 text-center">Masuk / Pulang</th>
                  <th className="px-8 py-6 text-center">Status</th>
                  <th className="px-8 py-6">Cabang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium italic">
                {loading ? (
                  <tr><td colSpan="6" className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-blue-600 mb-2" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinkronisasi...</p></td></tr>
                ) : data.length > 0 ? data.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group not-italic">
                    <td className="px-8 py-5">
                      <p className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{row.nama_karyawan}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{row.user?.jabatan || '-'}</p>
                    </td>
                    <td className="px-8 py-5 text-center text-xs font-bold text-slate-600 uppercase">
                      {row.tanggal_absen ? new Date(row.tanggal_absen).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric'}) : '-'}
                    </td>
                    <td className="px-8 py-5 text-center text-sm font-black text-slate-700">
                        {row.jam_masuk?.slice(0,5) || '--:--'} <span className="text-slate-200 mx-1">|</span> {row.jam_pulang?.slice(0,5) || '--:--'}
                    </td>
                    {/* KOLOM STATUS - UPDATE: Double Status & All Categories */}
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            row.status === 'hadir' ? 'bg-emerald-100 text-emerald-700' : 
                            row.status === 'telat' ? 'bg-rose-100 text-rose-700' : 
                            row.status === 'sakit' ? 'bg-red-100 text-red-700' : 
                            row.status === 'cuti' ? 'bg-blue-100 text-blue-700' : 
                            row.status === 'dinas' ? 'bg-purple-100 text-purple-700' : 
                            row.status === 'alpha' ? 'bg-slate-200 text-slate-500' : 
                            'bg-amber-100 text-amber-700' // Default Izin
                        }`}>
                            {row.status}
                        </span>
                        {row.status_pulang_cepat === 'disetujui' && (
                            <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">PC</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-400 uppercase italic">
                        <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-blue-400" />{row.user?.branch?.nama_cabang || 'Pusat'}</div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="py-24 text-center text-slate-300 font-black uppercase text-xs italic tracking-widest">Data tidak ditemukan</td></tr>
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