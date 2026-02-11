import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import bgBest from '../assets/images/bgBest.jpg';
import { Eye, EyeOff } from 'lucide-react'; // 1. Tambahkan import icon

const Register = () => {
  const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false); // 2. State untuk show/hide
  
  // 1. Inisialisasi State (Gunakan satu objek untuk semua input)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    jabatan: '',
    nomor_hp: '',
    id_cabang: '',
    password: ''
  });

  const [daftarCabang, setDaftarCabang] = useState([]);
  const [loading, setLoading] = useState(false);

  // 2. Fungsi untuk menangkap perubahan di semua input secara dinamis
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Ambil data cabang dari Backend saat halaman dibuka
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

  // 4. Fungsi Kirim Data ke Laravel
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/register`,formData);
      if (response.data.success) {
        alert("Pendaftaran Berhasil! Silakan tunggu verifikasi admin.");
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
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans">
      <img src={bgBest} alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 bg-black/30 z-10"></div>

      <div className="relative z-20 max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
        <header className="mb-8 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-800">Daftar Akun Karyawan</h1>
          <p className="text-gray-500 text-sm mt-1">Lengkapi data diri untuk akses sistem absensi.</p>
        </header>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1">Email</label>
            <input 
              required 
              name="email" 
              type="email" 
              placeholder="contoh@gmail.com" 
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 border outline-none focus:border-blue-500 transition-all" 
            />
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1">Nama Lengkap</label>
            <input 
              required 
              name="name" 
              type="text" 
              placeholder="Sesuai KTP" 
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 border outline-none focus:border-blue-500 transition-all" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Jabatan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 ml-1">Jabatan</label>
              <input 
                required 
                name="jabatan" 
                type="text" 
                placeholder="Staff IT" 
                value={formData.jabatan}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 border outline-none focus:border-blue-500 transition-all" 
              />
            </div>
            {/* No HP */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 ml-1">No. HP (WA)</label>
              <input 
                required 
                name="nomor_hp" 
                type="tel" 
                placeholder="0812..." 
                value={formData.nomor_hp}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 border outline-none focus:border-blue-500 transition-all" 
              />
            </div>
          </div>

          {/* Dropdown Cabang */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1">Kantor Cabang</label>
            <select 
              required 
              name="id_cabang" 
              value={formData.id_cabang}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 border focus:border-blue-500 appearance-none transition-all"
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
  <label className="block text-sm font-semibold text-gray-700 ml-1">Buat Password</label>
  
  {/* Container relative agar tombol mata bisa melayang di dalam input */}
  <div className="relative mt-1">
    <input 
      required 
      name="password" 
      // Tipe berubah dinamis berdasarkan state
      type={showPassword ? 'text' : 'password'} 
      placeholder="••••••••" 
      value={formData.password}
      onChange={handleChange}
      // Tambahkan pr-12 agar teks tidak menabrak icon mata
      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-blue-500 transition-all pr-12 font-medium" 
    />
    
    {/* Tombol Icon Mata */}
    <button
      type="button" // WAJIB: Agar tidak men-submit form pendaftaran
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>

  {/* Sub-teks panduan password */}
  <p className="text-[10px] text-gray-400 mt-2 ml-1 font-medium italic">Min. 8 characters</p>
</div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 font-bold rounded-xl transition-all shadow-lg active:scale-95 text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
            >
              {loading ? 'MEMPROSES...' : 'DAFTAR SEKARANG'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/')} 
              className="w-full mt-4 py-2 text-sm text-gray-500 font-semibold hover:text-gray-800"
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