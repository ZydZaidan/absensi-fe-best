import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Calendar, 
  Upload, CheckCircle, AlertCircle, Loader2 
} from 'lucide-react';
import axios from 'axios';


const Izin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    jenis_izin: '',
    tanggal: '',
    keterangan: '',
    dokumen: null
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 2000000) {
      setFormData({ ...formData, dokumen: file });
    } else {
      alert("File terlalu besar (Maks 2MB)");
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.jenis_izin) return alert("Pilih jenis izin!");
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // 1. Gunakan FormData untuk mengirim File
      const data = new FormData();
      data.append('jenis_izin', formData.jenis_izin);
      data.append('tanggal', formData.tanggal);
      data.append('keterangan', formData.keterangan);
      
      // Pastikan append file jika ada
      if (formData.dokumen) {
        data.append('dokumen', formData.dokumen);
      }

      // 2. Kirim ke API Laravel
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/pengajuan-zin`, data, {
        headers: { 
          'Content-Type': 'multipart/form-data', // Wajib untuk upload file
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.data.success) {
          alert("Pengajuan berhasil dikirim dan otomatis tercatat di absensi!");
          navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim pengajuan: " + (err.response?.data?.message || "Terjadi kesalahan"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      
      {/* HEADER - Sticky & Wide */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 p-6 md:px-12 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-3 hover:bg-emerald-50 rounded-full transition-all group">
            <ArrowLeft className="w-6 h-6 text-slate-600 group-hover:text-emerald-600" />
          </button>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter text-emerald-600">Formulir Ketidakhadiran</h1>
        </div>
      </header>

      {/* MAIN CONTENT - Full Height Split */}
      <main className="flex-1 flex flex-col lg:flex-row">
        
        {/* KOLOM KIRI: FORM (Lebar 50% di Desktop) */}
        <div className="flex-1 p-8 md:p-16 lg:p-24 flex flex-col justify-center bg-white">
          <div className="max-w-xl mx-auto w-full space-y-10">
            <header className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter">
                Rencana <span className="text-emerald-600 text-outline">Izin Anda.</span>
              </h2>
              <p className="text-slate-400 font-medium text-base">Silakan lengkapi detail informasi di bawah ini.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Kategori */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Pilih Kategori</label>
                <div className="grid grid-cols-3 gap-4">
                  {['Sakit', 'Izin', 'Dinas'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, jenis_izin: type.toLowerCase() })}
                      className={`py-5 rounded-3xl text-sm font-black transition-all border-2 ${
                        formData.jenis_izin === type.toLowerCase() 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-100 scale-105' 
                        : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-emerald-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tanggal & Keterangan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tanggal</label>
                  <input type="date" name="tanggal" required className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" onChange={handleInputChange} />
                </div>
                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Lampiran</label>
                    <label className="flex items-center justify-center h-15 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-emerald-50 transition-all group">
                        <Upload className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 mr-2" />
                        <span className="text-[10px] font-black text-slate-400 group-hover:text-emerald-700 truncate px-2">
                            {formData.dokumen ? formData.dokumen.name : 'UPLOAD BUKTI'}
                        </span>
                        <input type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Alasan Detail</label>
                <textarea 
                  name="keterangan" required placeholder="Tuliskan keterangan lengkap di sini..."
                  className="w-full p-6 bg-slate-50 border-none rounded-3xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none min-h-37.5"
                  onChange={handleInputChange}
                />
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full py-6 bg-emerald-600 text-white rounded-4xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Kirim Pengajuan Sekarang'}
              </button>
            </form>
          </div>
        </div>

        {/* KOLOM KANAN: INFO (Hidden di HP, Muncul 50% di Desktop) */}
        <div className="hidden lg:flex flex-1 bg-emerald-50 flex-col justify-center items-center p-20 relative overflow-hidden">
            {/* Dekorasi Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/50 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-200/30 rounded-full -ml-20 -mb-20 blur-2xl"></div>

            <div className="relative z-10 max-w-md text-center space-y-10">
                <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-emerald-200/50 inline-block">
                    <FileText className="w-24 h-24 text-emerald-500" />
                </div>
                
                <div className="space-y-4">
                    <h3 className="text-3xl font-black text-emerald-900 tracking-tight">Kebijakan <br/>Ketidakhadiran</h3>
                    <p className="text-emerald-700/60 font-medium leading-relaxed">Sistem Smart Presence mengharuskan setiap karyawan untuk melampirkan bukti yang sah guna menjaga integritas data perusahaan.</p>
                </div>

                <div className="space-y-4">
                    {[
                        "Sakit: Lampirkan Surat Dokter resmi.",
                        "Izin/Dinas: Lampirkan Surat Tugas/Keterangan.",
                        "Maksimal pengajuan: H-1 atau Hari H."
                    ].map((text, i) => (
                        <div key={i} className="flex items-center gap-4 p-5 bg-white/60 backdrop-blur-sm rounded-3xl border border-white text-left">
                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                            <p className="text-xs font-bold text-emerald-800">{text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </main>
    </div>
  );
};

export default Izin;