import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, ShieldCheck, UserCheck, 
  Loader2, UserPlus, MapPin, Building2 
} from 'lucide-react';

const VerifikasiKaryawan = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState({});

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Pastikan Backend sudah melakukan ->with('cabang') di controllernya
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/pending-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data.data || [];
      setUsers(data);

      const initialRoles = {};
      data.forEach(u => {
        initialRoles[u.id] = 'karyawan';
      });
      setSelectedRoles(initialRoles);

    } catch (err) {
      console.error("Gagal mengambil data pending:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId, newRole) => {
    setSelectedRoles(prev => ({ ...prev, [userId]: newRole }));
  };

  const handleActivate = async (userId) => {
    const roleChoice = selectedRoles[userId] || 'karyawan';
    if (!window.confirm(`Aktifkan akun ini sebagai ${roleChoice.toUpperCase()}?`)) return;

    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      const payload = { is_admin: roleChoice === 'admin' };

      await axios.put(`${import.meta.env.VITE_API_URL}/admin/activate-user/${userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Akun berhasil diaktifkan!");
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      console.error(err);
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
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-all group">
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
          </button>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800">Verifikasi Karyawan</h1>
        </div>
        <div className="bg-emerald-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-emerald-100">
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black text-emerald-700 uppercase">{users.length} Antrean</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* HERO INFO */}
        <section className="bg-linear-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-2">
                <h2 className="text-3xl font-black italic tracking-tight uppercase">Aktivasi Akun 🛡️</h2>
                <p className="text-sm opacity-60 max-w-md">Validasi data diri dan tentukan penempatan cabang karyawan sebelum menyetujui akses masuk.</p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </section>

        {/* LIST KARYAWAN (Full Width Style) */}
        <section className="space-y-4">
            {loading ? (
                <div className="py-32 flex flex-col items-center gap-4 text-slate-300">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p className="font-black text-[10px] uppercase tracking-[0.3em]">Menyinkronkan Data...</p>
                </div>
            ) : users.length > 0 ? (
                <div className="space-y-4"> {/* Menggunakan flex column memanjang */}
                    {users.map((user) => (
                        <div key={user.id} className="bg-white p-6 md:p-8 rounded-4xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row items-center justify-between gap-6">
                            
                            {/* Kiri: Avatar & Utama Info */}
                            <div className="flex items-center gap-6 w-full lg:w-auto">
                                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center text-slate-300 shrink-0 font-black text-2xl shadow-inner">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="truncate">
                                    <p className="text-xl font-black text-slate-800 truncate leading-tight uppercase italic">{user.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold truncate mt-1">{user.email}</p>
                                    
                                    {/* TRIPLE BADGE AREA */}
                                    <div className="flex items-center flex-wrap gap-2 mt-3">
                                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                                            {user.jabatan || 'IT Staff'}
                                        </span>
                                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                                            {user.status_pegawai || 'THL'}
                                        </span>
                                        {/* BADGE BARU: CABANG */}
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                                            <MapPin className="w-2.5 h-2.5" />
                                            {user.cabang?.nama_cabang || 'Kantor Pusat'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Kanan: Dropdown Role & Tombol ACC */}
                            <div className="flex items-center gap-4 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0">
                                <div className="flex-1 lg:w-40">
                                    <p className="text-[8px] font-black text-slate-300 uppercase ml-1 mb-1">Set Peran User</p>
                                    <select 
                                        value={selectedRoles[user.id] || 'karyawan'}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-wider focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                                    >
                                        <option value="karyawan">Karyawan</option>
                                        <option value="admin">Admin Pusat</option>
                                    </select>
                                </div>

                                <button 
                                    onClick={() => handleActivate(user.id)}
                                    disabled={actionLoading === user.id}
                                    className={`p-5 rounded-2xl transition-all active:scale-90 shadow-xl mt-3 lg:mt-0 shrink-0 ${
                                        selectedRoles[user.id] === 'admin' 
                                        ? 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700' 
                                        : 'bg-emerald-500 text-white shadow-emerald-100 hover:bg-emerald-600'
                                    }`}
                                >
                                    {actionLoading === user.id ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <ShieldCheck className="w-6 h-6" />
                                    )}
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-24 rounded-4xl text-center border border-dashed border-slate-200">
                    <UserCheck className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Semua data sudah bersih</p>
                </div>
            )}
        </section>

      </main>
    </div>
  );
};

export default VerifikasiKaryawan;