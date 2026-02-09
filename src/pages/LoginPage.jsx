import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoBest from '../assets/images/logobest.png';
import bgBest from '../assets/images/bgBest.jpg';

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('')
    try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`,{email: email,password: password});
    if (response.data.success) {
      // --- LOGIKA TOKEN (SANGAT PENTING) ---
      // Simpan Token ke dalam LocalStorage (Memori Browser)
      localStorage.setItem('token', response.data.data.token);
      // Simpan data user (nama, jabatan) agar bisa dipanggil di Dashboard
      localStorage.setItem('user', JSON.stringify(response.data.data.user));

      console.log("Login Sukses, Token disimpan!");
      navigate('/dashboard');
    }
    } catch (err) {
      // Menangkap error dari Laravel (Password salah atau Akun Belum Aktif)
      const message = err.response?.data?.message || "Terjadi kesalahan koneksi";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans">
      <img 
        src={bgBest} 
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover z-0" 
      />
      <div className="absolute inset-0 bg-black/30 z-10"></div>

      <div className="relative z-20 max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
        <header className="text-center mb-10">
          <img src={logoBest} alt="Logo PT BEST" className="w-80 mx-auto mb-2" />
          <p className="text-gray-500 font-medium text-sm">PT BAKTI ENERGI SEJAHTERA</p>
        </header>

          {/* Alert Error (Jika login gagal) */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1">Email Karyawan</label>
            <input 
              required
              type='email'
              value={email}
              onChange={(e)=> setEmail(e.target.value)}
              placeholder="nama@perusahaan.com"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:bg-white outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1">Password</label>
            <input 
              required
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:bg-white outline-none transition-all"
            />
            {/* Lupa Password di pojok kanan */}
            <div className="flex justify-end mt-2">
              <button 
                type="button" 
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Lupa Password?
              </button>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 shadow-blue-200"
          >
            {loading? 'Meverifikasi...' : 'Masuk'}
          </button>
        </form>

        <footer className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Belum punya akun?{' '}
            <button 
              type="button"
              onClick={() => navigate('/register')}
              className="text-blue-600 font-bold hover:underline"
            >
              Daftar Sekarang
            </button>
          </p>
        </footer>
      </div>
    </main>
  );
};

export default LoginPage;