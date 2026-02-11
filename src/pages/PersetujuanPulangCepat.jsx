import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Clock, Check, X, 
  Loader2, AlertCircle, User, MessageSquare 
} from 'lucide-react';

const PersetujuanPulangCepat = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [actionId, setActionId] = useState(null); // Loading khusus tombol per baris

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/pending-pulang-cepat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Pastikan data yang diambil adalah array
      setRequests(response.data.data || []);
    } catch (err) {
      console.error("Gagal ambil data pengajuan:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    const actionText = status === 'disetujui' ? 'MENYETUJUI' : 'MENOLAK';
    if (!window.confirm(`Apakah Anda yakin ingin ${actionText} pengajuan ini?`)) return;

    setActionId(id);
    try {
      const token = localStorage.getItem('token');
      // Endpoint sesuai note BE
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/approve-pulang-cepat/${id}`, 
        { status: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(`Berhasil: Pengajuan telah ${status}`);
        // Hapus dari list setelah aksi sukses
        setRequests(requests.filter(req => req.id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memproses aksi. Cek koneksi server.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
      {/* HEADER */}
      <header className="bg-white sticky top-0 z-50 p-6 md:px-12 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-all group">
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
          </button>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter">Persetujuan Pulang Cepat</h1>
        </div>
        <div className="bg-orange-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-orange-100">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-black text-orange-700 uppercase">{requests.length} Pending</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* DATA TABLE */}
        <section className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Karyawan</th>
                  <th className="px-8 py-6 text-center">Jam Masuk</th>
                  <th className="px-8 py-6">Alasan Pulang Cepat</th>
                  <th className="px-8 py-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-32 text-center text-slate-300">
                      <Loader2 className="animate-spin mx-auto w-10 h-10 mb-4" />
                      <p className="font-black uppercase tracking-widest text-[10px]">Sinkronisasi Pengajuan...</p>
                    </td>
                  </tr>
                ) : requests.length > 0 ? requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black">
                            {req.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-black text-slate-800">{req.user?.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{req.user?.jabatan || 'Staff'}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-8 py-6 text-center">
                        <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-black text-xs">
                            {req.jam_masuk ? req.jam_masuk.slice(0,5) : '--:--'}
                        </span>
                    </td>

                    <td className="px-8 py-6 max-w-md">
                      {/* PERBAIKAN: Mengambil data dari key 'alasan' sesuai instruksi BE */}
                      <div className="flex gap-3 bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                         <MessageSquare className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                         <p className="text-xs text-orange-800 leading-relaxed italic font-bold">
                            "{req.alasan_pulang_cepat || 'Tidak ada alasan terlampir'}"
                         </p>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => handleAction(req.id, 'disetujui')}
                          disabled={actionId === req.id}
                          className="p-3.5 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-100 active:scale-90 transition-all disabled:opacity-50"
                          title="Setujui"
                        >
                          {actionId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        
                        <button 
                          onClick={() => handleAction(req.id, 'ditolak')}
                          disabled={actionId === req.id}
                          className="p-3.5 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 shadow-lg shadow-rose-100 active:scale-90 transition-all disabled:opacity-50"
                          title="Tolak"
                        >
                          {actionId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-24 text-center">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Tidak ada pengajuan pulang cepat hari ini</p>
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

export default PersetujuanPulangCepat;