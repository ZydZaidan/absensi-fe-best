import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, ShieldCheck, UserCheck, 
  Loader2, UserPlus, MapPin, 
  Key, Check, X
} from 'lucide-react';

const VerifikasiKaryawan = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState({});
//
  const [activeTab, setActiveTab] = useState('baru'); 
  const [resetRequests, setResetRequests] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]); // Fetch ulang tiap pindah tab

  const fetchData = async () => {
    if (activeTab === 'baru') {
      await fetchPendingUsers();
    } else {
      await fetchResetRequests();
    }
  };

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/pending-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.data || [];
      setUsers(data);
      
      const initialRoles = {};
      data.forEach(u => { initialRoles[u.id] = 'karyawan'; });
      setSelectedRoles(initialRoles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResetRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/pending-reset-password`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResetRequests(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
//
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
      alert("Gagal mengaktifkan akun.");
    } finally {
      setActionLoading(null);
    }
  };
  const handleApproveReset = async (id) => {
    if (!window.confirm("Setujui perubahan password karyawan ini?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/approve-reset/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Password berhasil diperbarui!");
      setResetRequests(resetRequests.filter(r => r.id !== id));
    } catch (err) {
      alert("Gagal menyetujui reset.");
    }
  };
//
  const handleRejectReset = async (id) => {
    if (!window.confirm("Tolak permintaan reset password ini?")) return;
    try {
      const token = localStorage.getItem('token');
      // Method DELETE sesuai spek BE
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/reject-reset/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Permintaan reset berhasil dihapus.");
      setResetRequests(resetRequests.filter(r => r.id !== id));
    } catch (err) {
      alert("Gagal menolak reset.");
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
          <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800">Manajemen Akun</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* TAB NAVIGATION */}
        <div className="flex bg-white p-2 rounded-3xl shadow-sm border border-slate-100 gap-2">
            <button 
              onClick={() => setActiveTab('baru')}
              className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'baru' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              User Baru ({users.length})
            </button>
            <button 
              onClick={() => setActiveTab('reset')}
              className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'reset' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              Reset Password ({resetRequests.length})
            </button>
        </div>

        {/* LOADING STATE */}
        {loading ? (
            <div className="py-32 flex flex-col items-center gap-4 text-slate-300">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="font-black text-[10px] uppercase tracking-[0.3em]">Menyinkronkan Data...</p>
            </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {/* TAB 1: USER BARU */}
            {activeTab === 'baru' && (
              <section className="space-y-4">
                {users.length > 0 ? users.map((user) => (
                  <div key={user.id} className="bg-white p-6 md:p-8 rounded-4xl border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6 w-full lg:w-auto">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-black text-xl italic shadow-inner">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-800 uppercase italic tracking-tight">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold truncate">{user.email}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-lg uppercase tracking-widest border border-blue-100">{user.jabatan}</span>
                          <span className="text-[8px] font-black bg-slate-50 text-slate-500 px-2 py-1 rounded-lg uppercase tracking-widest border border-slate-100">{user.cabang?.nama_cabang}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-none">
                      <select 
                        value={selectedRoles[user.id]} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="p-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="karyawan">Karyawan</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button 
                        onClick={() => handleActivate(user.id)}
                        disabled={actionLoading === user.id}
                        className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100 active:scale-95"
                      >
                        {actionLoading === user.id ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="bg-white p-20 rounded-4xl text-center border border-dashed border-slate-200">
                    <UserCheck className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Antrean User Baru Bersih</p>
                  </div>
                )}
              </section>
            )}

            {/* TAB 2: RESET PASSWORD */}
            {activeTab === 'reset' && (
              <section className="space-y-4">
                {resetRequests.length > 0 ? resetRequests.map((req) => (
                  <div key={req.id} className="bg-white p-6 rounded-4xl border border-slate-100 flex items-center justify-between shadow-sm group">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
                        <Key className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-800 uppercase italic tracking-tight">{req.user?.name}</p>
                        <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest">Meminta Reset Password</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button onClick={() => handleApproveReset(req.id)} className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100 active:scale-95 transition-all">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleRejectReset(req.id)} className="p-4 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-100 active:scale-95 transition-all">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="bg-white p-20 rounded-4xl text-center border border-dashed border-slate-200">
                    <Key className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Tidak ada permintaan reset</p>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default VerifikasiKaryawan;