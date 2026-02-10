import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, ShieldCheck, UserCheck, 
  XCircle, Loader2, Search, UserPlus 
} from 'lucide-react';

const VerifikasiKaryawan = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/pending-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Pastikan menyesuaikan dengan struktur JSON dari BE (biasanya response.data.data)
      setUsers(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (userId) => {
    if (!window.confirm("Aktifkan akun karyawan ini?")) return;

    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/activate-user/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Akun berhasil diaktifkan!");
      // Hapus user yang sudah di-ACC dari list
      setUsers(users.filter(user => user.id !== userId));
    } catch {
      alert("Gagal mengaktifkan akun.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      
      {/* HEADER */}
      <header className="bg-white sticky top-0 z-50 p-6 md:px-12 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800">Verifikasi Karyawan</h1>
        </div>
        <div className="bg-emerald-50 px-4 py-2 rounded-xl flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">{users.length} Menunggu</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* INFO SECTION */}
        <section className="bg-linear-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-2">
                <h2 className="text-3xl font-black italic">Persetujuan Akun 🛡️</h2>
                <p className="text-sm opacity-60 max-w-md">Daftar calon karyawan yang baru saja mendaftar. Pastikan data diri mereka sesuai sebelum memberikan akses masuk.</p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </section>

        {/* LIST KARYAWAN */}
        <section className="space-y-4">
            {loading ? (
                <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p className="font-bold text-xs uppercase tracking-widest">Memuat Daftar...</p>
                </div>
            ) : users.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.map((user) => (
                        <div key={user.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4">
                            <div className="flex items-center gap-5 truncate">
                                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                                    <span className="text-lg font-black uppercase">{user.name.charAt(0)}</span>
                                </div>
                                <div className="truncate">
                                    <p className="text-lg font-black text-slate-800 truncate">{user.name}</p>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{user.jabatan || 'Staff'}</p>
                                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{user.email}</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleActivate(user.id)}
                                disabled={actionLoading === user.id}
                                className="p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all active:scale-90 shrink-0"
                            >
                                {actionLoading === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-20 rounded-[3rem] text-center border border-dashed border-slate-200">
                    <UserCheck className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Semua karyawan sudah terverifikasi.</p>
                </div>
            )}
        </section>

      </main>
    </div>
  );
};

export default VerifikasiKaryawan;