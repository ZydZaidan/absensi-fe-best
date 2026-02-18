import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Check, X, Loader2, 
  FileText, Calendar, User, Eye, CheckCircle 
} from 'lucide-react';

const PersetujuanIzin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null); // Untuk modal preview surat

  useEffect(() => {
    fetchPendingIzin();
  }, []);

  const fetchPendingIzin = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/pending-izin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

// Ganti fungsi handleAction di PersetujuanIzin.jsx menjadi ini:

const handleAction = async (id, status) => {
    // Sesuaikan status dengan kemauan BE (disetujui/ditolak)
    const finalStatus = status === 'approved' ? 'disetujui' : 'ditolak';
    
    if (!window.confirm(`Yakin ingin ${finalStatus} pengajuan ini?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/approve-izin/${id}`, 
        { status: finalStatus }, // Kirim "disetujui" atau "ditolak"
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
          alert(`Pengajuan telah ${finalStatus}`);
          setRequests(requests.filter(r => r.id !== id));
      }
    } catch (err) {
      // INI YANG BAKAL BONGKAR KEBOHONGAN BE LU
    console.error("FULL ERROR DARI BE:", err.response);
    
    const pesanError = err.response?.data?.message || err.message;
    alert(`Gagal Bro! Kata BE: ${pesanError}`)
    }
};

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
      {/* HEADER */}
      <header className="bg-white sticky top-0 z-40 p-6 md:px-12 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter">Persetujuan Izin & Cuti</h1>
        </div>
        <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black text-emerald-700">{requests.length} Menunggu</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* TABLE SECTION */}
        <section className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-6">Karyawan</th>
                  <th className="px-8 py-6">Jenis</th>
                  <th className="px-8 py-6">Rentang Tanggal</th>
                  <th className="px-8 py-6">Alasan</th>
                  <th className="px-8 py-6 text-center">Bukti</th>
                  <th className="px-8 py-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-sm">
                {loading ? (
                  <tr><td colSpan="6" className="py-32 text-center text-slate-300"><Loader2 className="animate-spin mx-auto w-10 h-10 mb-4" />Menyinkronkan Pengajuan...</td></tr>
                ) : requests.length > 0 ? requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800">{req.user?.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{req.user?.jabatan || 'Staff'}</p>
                    </td>
                    <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                            req.jenis_izin === 'sakit' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {req.jenis_izin}
                        </span>
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-emerald-500" />
                            {req.tanggal_mulai} s/d {req.tanggal_selesai}
                        </div>
                    </td>
                    <td className="px-8 py-6 max-w-xs truncate italic text-slate-500">"{req.keterangan}"</td>
                    <td className="px-8 py-6 text-center">
                        {req.foto_url ? (
                            <button onClick={() => setSelectedDoc(req.foto_url)} className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
                                <Eye className="w-4 h-4" />
                            </button>
                        ) : <span className="text-slate-200">-</span>}
                    </td>
                    <td className="px-8 py-6">
                        <div className="flex justify-center gap-2">
                            <button onClick={() => handleAction(req.id, 'approved')} className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all active:scale-90">
                                <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleAction(req.id, 'rejected')} className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-100 active:scale-90">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="py-24 text-center text-slate-300 font-bold uppercase text-xs italic tracking-widest">Tidak ada pengajuan izin pending</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* MODAL PREVIEW SURAT DOKTER / BUKTI */}
      {selectedDoc && (
        <div className="fixed inset-0 z-2000 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
            <div className="relative bg-white p-2 rounded-4xl shadow-2xl max-w-lg w-full animate-in zoom-in duration-300">
                <button onClick={() => setSelectedDoc(null)} className="absolute -top-4 -right-4 bg-rose-600 text-white p-3 rounded-full shadow-xl"><X /></button>
                <img src={selectedDoc} className="w-full h-auto rounded-4xl" alt="Dokumen Bukti" />
                <div className="p-6 text-center">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Lampiran Dokumen Pengajuan</p>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default PersetujuanIzin;