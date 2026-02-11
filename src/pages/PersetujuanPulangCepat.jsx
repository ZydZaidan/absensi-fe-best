import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, Check, X, Loader2, AlertCircle } from 'lucide-react';

const PersetujuanPulangCepat = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);

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
      setRequests(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    if (!window.confirm(`${status === 'disetujui' ? 'Setujui' : 'Tolak'} pengajuan ini?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/approve-pulang-cepat/${id}`, 
        { status: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(`Pengajuan ${status}!`);
        setRequests(requests.filter(req => req.id !== id));
      }
    } catch {
      alert("Gagal memproses pengajuan.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      <header className="bg-white sticky top-0 z-50 p-6 md:px-12 flex items-center gap-4 border-b border-slate-100 shadow-sm">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-all">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter">Persetujuan Pulang Cepat</h1>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-6">Karyawan</th>
                  <th className="px-8 py-6">Jam Masuk</th>
                  <th className="px-8 py-6">Alasan Pulang Cepat</th>
                  <th className="px-8 py-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600 mb-2" /> Memuat Data...</td>
                  </tr>
                ) : requests.length > 0 ? requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800">{req.user?.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{req.user?.jabatan}</p>
                    </td>
                    <td className="px-8 py-6 font-bold text-blue-600">{req.jam_masuk.slice(0,5)}</td>
                    <td className="px-8 py-6">
                      <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-orange-800 text-xs italic">
                        "{req.late_reason || req.alasan}"
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleAction(req.id, 'disetujui')}
                          className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-100 active:scale-90 transition-all"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, 'ditolak')}
                          className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-100 active:scale-90 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-20 text-center text-slate-300 font-bold uppercase text-xs tracking-widest italic">Tidak ada pengajuan pending hari ini</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PersetujuanPulangCepat;