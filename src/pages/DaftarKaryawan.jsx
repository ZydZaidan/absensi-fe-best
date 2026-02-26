import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import bgBest from '../assets/images/bgBest.jpg';
import { Eye, EyeOff } from 'lucide-react'; 

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); 
  
  // 1. UPDATE STATE: nik_ktp & status_pegawai
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    nik_ktp: '', // Sinkron dengan BE
    status_pegawai: '', // Field baru
    jabatan: '',
    nomor_hp: '',
    id_cabang: '',
    password: ''
  });

  const [daftarCabang, setDaftarCabang] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    const fetchCabang = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/cabang`);
        setDaftarCabang(response.data.data);
      } catch (error) {
        console.error("Gagal mengambil data cabang:", error);
      }
    };
    fetchCabang();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mengirim formData dengan struktur baru ke server
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/register`, formData);
      if (response.data.success) {
        alert("Pendaftaran Berhasil! Akun anda akan disinkronkan via NIK KTP.");
        navigate('/');
      }
    } catch (error) {
      const pesanError = error.response?.data?.message || "Terjadi kesalahan";
      alert("Gagal Daftar: " + pesanError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans text-slate-900">
      <img src={bgBest} alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 bg-black/30 z-10"></div>

      <div className="relative z-20 max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
        <header className="mb-8 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight italic">Daftar Akun Karyawan</h1>
          <p className="text-gray-500 text-xs font-medium mt-1">Lengkapi data untuk sinkronisasi Profil Perusahaan.</p>
        </header>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 ml-1">Email</label>
            <input 
              required 
              name="email" 
              type="email" 
              placeholder="contoh@gmail.com" 
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium" 
            />
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 ml-1">Nama Lengkap</label>
            <input 
              required 
              name="name" 
              type="text" 
              placeholder="Sesuai KTP" 
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium" 
            />
          </div>

          {/* NIK KTP */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-blue-600 ml-1">NIK KTP (16 Digit)</label>
            <input 
              required 
              name="nik_ktp" 
              type="text" 
              placeholder="Masukkan NIK KTP Anda" 
              value={formData.nik_ktp}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/50 border border-blue-200 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Jabatan */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 ml-1">Jabatan</label>
              <input 
                required 
                name="jabatan" 
                type="text" 
                placeholder="Contoh: Staff IT" 
                value={formData.jabatan}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium" 
              />
            </div>
            {/* No HP */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 ml-1">No. HP (WA)</label>
              <input 
                required 
                name="nomor_hp" 
                type="tel" 
                placeholder="0812..." 
                value={formData.nomor_hp}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium" 
              />
            </div>
          </div>

          {/* NEW: Status Pegawai Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 ml-1">Status Pegawai</label>
            <select 
              required 
              name="status_pegawai" 
              value={formData.status_pegawai}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 appearance-none transition-all font-bold text-sm text-gray-700 cursor-pointer"
            >
              <option value="">-- Pilih Status --</option>
              <option value="PKWTT">PKWTT</option>
              <option value="PKWT">PKWT</option>
              <option value="THL">THL</option>
              <option value="Konsultan">Konsultan</option>
              <option value="Magang">Magang</option>
            </select>
          </div>

          {/* Dropdown Cabang */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 ml-1">Kantor Cabang</label>
            <select 
              required 
              name="id_cabang" 
              value={formData.id_cabang}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 appearance-none transition-all font-bold text-sm text-gray-700 cursor-pointer"
            >
              <option value="">-- Pilih Kantor Cabang --</option>
              {daftarCabang?.map((cabang) => (
                <option key={cabang.id} value={cabang.id}>
                  {cabang.nama_cabang} 
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 ml-1">Buat Password</label>
            <div className="relative mt-1">
                <input 
                  required 
                  name="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:bg-white outline-none transition-all pr-12 font-medium" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 ml-1 font-medium italic">Min. 8 characters</p>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
            >
              {loading ? 'MEMPROSES...' : 'DAFTAR SEKARANG'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/')} 
              className="w-full mt-4 py-2 text-xs text-gray-500 font-black uppercase tracking-widest hover:text-blue-600 transition-all"
            >
              Kembali ke Login
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Register;