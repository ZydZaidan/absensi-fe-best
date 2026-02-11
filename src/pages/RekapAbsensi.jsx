import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Search, Filter, 
  Loader2, Calendar, MapPin, 
  Camera, X, ImageOff, User
} from 'lucide-react';

const RekapAbsensi = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [daftarCabang, setDaftarCabang] = useState([]);
  
  // State untuk Modal Preview Foto
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const [filter, setFilter] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    status: '',
    tanggal: '',
    id_cabang: ''
  });

  // Ambil List Cabang
  useEffect(() => {
    const fetchCabang = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/cabang`);
        setDaftarCabang(response.data.data || []);
      } catch (err) { console.error(err); }
    };
    fetchCabang();
  }, []);

  // Ambil Data Rekap
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
        if (err.response?.status === 401) {
            localStorage.clear();
            navigate('/');
        }
      } finally { setLoading(false); }
    };
    fetchRekap();
  }, [filter, navigate]);

  // Fungsi memicu popup foto
  const openPreview = (url, type) => {
    setSelectedImage(url);
    setPreviewTitle(type === 'masuk' ? 'Bukti Absen Masuk' : 'Bukti Absen Pulang');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      
      {/* HEADER */}
      <header className="bg-white sticky top-0 z-40 p-6 md:px-12 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-all group">
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
          </button>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter">Monitoring Absensi Global</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* FILTER BAR */}
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
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Status</label>
            <select className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})}>
              <option value="">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="telat">Terlambat</option>
              <option value="izin">Izin / Sakit</option>
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
            <button className="w-full p-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95">
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
                  <th className="px-8 py-6 text-center">Bukti Foto</th>
                  <th className="px-8 py-6 text-center">Status</th>
                  <th className="px-8 py-6">Cabang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {loading ? (
                  <tr><td colSpan="6" className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-blue-600 mb-2" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memuat Data...</p></td></tr>
                ) : data.length > 0 ? data.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{row.nama_karyawan}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{row.user?.jabatan || 'Staff'}</p>
                    </td>
                    <td className="px-8 py-5 text-center text-xs font-bold text-slate-600 uppercase">
                      {row.tanggal_absen ? new Date(row.tanggal_absen).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric'}) : '-'}
                    </td>
                    <td className="px-8 py-5 text-center text-sm font-black text-slate-700 tracking-tighter">
                        {row.jam_masuk?.slice(0,5) || '--:--'} <span className="text-slate-200 mx-1">|</span> {row.jam_pulang?.slice(0,5) || '--:--'}
                    </td>
                    
                    {/* KOLOM 2 BUTTON FOTO BUKTI */}
                    <td className="px-8 py-5 text-center">
                        <div className="flex justify-center gap-2">
                            {/* Tombol Foto Masuk (Biru) */}
                            {row.foto_masuk_url ? (
                                <button 
                                  onClick={() => openPreview(row.foto_masuk_url, 'masuk')} 
                                  className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                  title="Lihat Foto Masuk"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            ) : <div className="p-2.5 bg-slate-50 text-slate-200 rounded-xl"><ImageOff className="w-4 h-4" /></div>}

                            {/* Tombol Foto Pulang (Oranye) */}
                            {row.foto_pulang_url ? (
                                <button 
                                  onClick={() => openPreview(row.foto_pulang_url, 'pulang')} 
                                  className="p-2.5 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                                  title="Lihat Foto Pulang"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            ) : row.jam_pulang ? <div className="p-2.5 bg-slate-50 text-slate-200 rounded-xl"><ImageOff className="w-4 h-4" /></div> : null}
                        </div>
                    </td>

                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        row.status === 'hadir' ? 'bg-emerald-100 text-emerald-700' : 
                        row.status === 'telat' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-400 uppercase italic">
                        <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-blue-400" />{row.user?.branch?.nama_cabang || 'Kantor Pusat'}</div>
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

      {/* POPUP PREVIEW FOTO */}
      {selectedImage && (
        <div className="fixed inset-0 z-2000 flex items-center justify-center p-4">
            {/* Backdrop dengan Blur */}
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setSelectedImage(null)}></div>
            
            {/* Image Container */}
            <div className="relative bg-white p-2 rounded-4xl shadow-2xl max-w-sm w-full animate-in zoom-in duration-300">
                <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-4 -right-4 bg-rose-600 text-white p-3 rounded-full shadow-xl hover:bg-rose-700 transition-all z-50 active:scale-90"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <div className="rounded-4xl overflow-hidden bg-slate-100 aspect-3/4">
                    <img 
                        src={selectedImage} 
                        alt="Bukti Absensi" 
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="p-6 text-center">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter text-lg">{previewTitle}</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Verifikasi Biometrik PT BEST</p>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default RekapAbsensi;