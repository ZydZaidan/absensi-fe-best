import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Calendar, 
  Upload, CheckCircle, AlertCircle, Loader2,
  CalendarRange
} from 'lucide-react';
import axios from 'axios';

const Izin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    jenis_izin: '', // 'sakit', 'izin', 'dinas', 'cuti'
    tanggal_mulai: '',
    tanggal_selesai: '',
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
    if (!formData.kategori) return alert("Pilih kategori pengajuan!");
    
    // Validasi Logika Tanggal
    if (new Date(formData.tanggal_selesai) < new Date(formData.tanggal_mulai)) {
        return alert("Tanggal selesai tidak boleh mendahului tanggal mulai!");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('kategori', formData.kategori);
      data.append('tanggal_mulai', formData.tanggal_mulai);
      data.append('tanggal_selesai', formData.tanggal_selesai);
      data.append('keterangan', formData.keterangan);
      if (formData.dokumen) {
        data.append('dokumen', formData.dokumen);
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/pengajuan-izin`, data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.data.success) {
          alert("Pengajuan Berhasil Terkirim!");
          navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      alert("Gagal: " + (err.response?.data?.message || "Cek kembali data Anda"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 p-6 md:px-12 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-3 hover:bg-emerald-50 rounded-full transition-all group">
            <ArrowLeft className="w-6 h-6 text-slate-600 group-hover:text-emerald-600" />
          </button>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter text-emerald-600">Formulir Ketidakhadiran</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        
        {/* KOLOM KIRI: FORM */}
        <div className="flex-1 p-8 md:p-16 lg:p-24 flex flex-col justify-center bg-white">
          <div className="max-w-xl mx-auto w-full space-y-10">
            <header className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter">
                Rencana <span className="text-emerald-600 italic">Izin & Cuti.</span>
              </h2>
              <p className="text-slate-400 font-medium text-base">Silakan pilih kategori dan tentukan durasi waktu Anda.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Kategori (Update: 4 Pilihan) */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pilih Kategori</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Sakit', 'Izin', 'Dinas', 'Cuti'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, jenis_izin: type.toLowerCase() })}
                      className={`py-4 rounded-2xl text-xs font-black transition-all border-2 ${
                        formData.jenis_izin === type.toLowerCase() 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100 scale-105' 
                        : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-emerald-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* RENTANG TANGGAL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dari Tanggal</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                    <input type="date" name="tanggal_mulai" required value={formData.tanggal_mulai} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sampai Tanggal</label>
                  <div className="relative">
                    <CalendarRange className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                    <input type="date" name="tanggal_selesai" required value={formData.tanggal_selesai} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* Lampiran & Alasan */}
              <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Lampiran Dokumen (Opsional untuk Izin/Cuti)</label>
                    <label className="flex items-center justify-center h-16 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-emerald-50 transition-all group">
                        <Upload className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 mr-2" />
                        <span className="text-[10px] font-black text-slate-400 group-hover:text-emerald-700 truncate px-4 uppercase">
                            {formData.dokumen ? formData.dokumen.name : 'Pilih File Bukti'}
                        </span>
                        <input type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Keterangan Tambahan</label>
                    <textarea 
                        name="keterangan" required placeholder="Tuliskan alasan atau detail keperluan Anda di sini..."
                        className="w-full p-6 bg-slate-50 border-none rounded-3xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none min-h-30"
                        onChange={handleInputChange}
                    />
                </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full py-6 bg-emerald-600 text-white rounded-4xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-slate-300"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Kirim Pengajuan Sekarang'}
              </button>
            </form>
          </div>
        </div>

        {/* KOLOM KANAN: INFO */}
        <div className="hidden lg:flex flex-1 bg-emerald-50 flex-col justify-center items-center p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/50 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="relative z-10 max-w-md text-center space-y-10">
                <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-emerald-200/50 inline-block">
                    <FileText className="w-24 h-24 text-emerald-500" />
                </div>
                <div className="space-y-4">
                    <h3 className="text-3xl font-black text-emerald-900 tracking-tight">Kebijakan Cuti & Izin</h3>
                    <p className="text-emerald-700/60 font-medium leading-relaxed">Pastikan pengajuan Anda dilakukan sesuai ketentuan untuk mempermudah proses administrasi kantor pusat.</p>
                </div>
                <div className="space-y-4">
                    {[
                        "Cuti: Minimal diajukan H-3 kerja.",
                        "Sakit: Wajib melampirkan Surat Dokter.",
                        "Dinas: Lampirkan bukti koordinasi cabang."
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