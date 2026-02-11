import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, ShieldCheck, UserCheck, 
  Loader2, UserPlus, Shield, User
} from 'lucide-react';

const VerifikasiKaryawan = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // 1. STATE UNTUK MENAMPUNG PILIHAN ROLE PER USER
  // Formatnya: { userId: 'karyawan' | 'admin' }
  const [selectedRoles, setSelectedRoles] = useState({});

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
      
      const data = response.data.data || [];
      setUsers(data);

      // 2. INISIALISASI ROLE DEFAULT 'karyawan' UNTUK SEMUA USER YANG BARU DIAMBIL
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
    setSelectedRoles(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  const handleActivate = async (userId) => {
    const roleChoice = selectedRoles[userId] || 'karyawan';
    if (!window.confirm(`Aktifkan akun ini sebagai ${roleChoice.toUpperCase()}?`)) return;

    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      
      // 3. PAYLOAD DISESUAIKAN DENGAN BACKEND (Minta is_admin boolean)
      const payload = {
        is_admin: roleChoice === 'admin'
      };

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
            <span className="text-xs font-black text-emerald-700 uppercase">{users.length} Pending</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* HERO INFO */}
        <section className="bg-linear-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-2">
                <h2 className="text-3xl font-black italic tracking-tight">Persetujuan Akun 🛡️</h2>
                <p className="text-sm opacity-60 max-w-md">Tentukan peran (Role) dan aktifkan akun pendaftar baru untuk memberikan akses sistem.</p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </section>

        {/* LIST KARYAWAN */}
        <section className="space-y-4">
            {loading ? (
                <div className="py-32 flex flex-col items-center gap-4 text-slate-300">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p className="font-black text-[10px] uppercase tracking-[0.3em]">Menyinkronkan Data...</p>
                </div>
            ) : users.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {users.map((user) => (
                        <div key={user.id} className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-6">
                            
                            {/* Kiri: User Info */}
                            <div className="flex items-center gap-5 w-full">
                                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 font-black text-xl">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="truncate">
                                    <p className="text-lg font-black text-slate-800 truncate leading-tight">{user.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">{user.jabatan || 'Calon Staff'}</p>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium truncate mt-1">{user.email}</p>
                                </div>
                            </div>

                            {/* Kanan: Dropdown Role & Tombol ACC */}
                            <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                                
                                {/* 4. DROPDOWN PEMILIHAN ROLE */}
                                <div className="flex-1 sm:w-32 relative">
                                    <select 
                                        value={selectedRoles[user.id] || 'karyawan'}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-wider focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="karyawan">Karyawan</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <button 
                                    onClick={() => handleActivate(user.id)}
                                    disabled={actionLoading === user.id}
                                    className={`p-4 rounded-2xl transition-all active:scale-90 shadow-lg shrink-0 ${
                                        selectedRoles[user.id] === 'admin' 
                                        ? 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700' 
                                        : 'bg-emerald-500 text-white shadow-emerald-100 hover:bg-emerald-600'
                                    }`}
                                >
                                    {actionLoading === user.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <ShieldCheck className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-24 rounded-4xl text-center border border-dashed border-slate-200">
                    <UserCheck className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Antrean verifikasi kosong</p>
                </div>
            )}
        </section>

      </main>
    </div>
  );
};

export default VerifikasiKaryawan;