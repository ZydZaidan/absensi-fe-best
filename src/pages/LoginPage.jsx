import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react'; // 1. Tambahkan import icon
import logoBest from '../assets/images/logobest.png';
import bgBest from '../assets/images/bgBest.jpg';

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 2. State untuk show/hide
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
        email: email,
        password: password
      });
      
      if (response.data.success) {
        // --- LOGIKA TOKEN (SANGAT PENTING) ---
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        console.log("Login Sukses, Token disimpan!");
        navigate('/dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.message || "Terjadi kesalahan koneksi";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans text-slate-900">
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

        {/* Alert Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* INPUT EMAIL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1 uppercase tracking-wider">Email Karyawan</label>
            <input 
              required
              type='email'
              value={email}
              onChange={(e)=> setEmail(e.target.value)}
              placeholder="nama@perusahaan.com"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
            />
          </div>
          
          {/* INPUT PASSWORD DENGAN FITUR EYE HIDE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1 uppercase tracking-wider">Password</label>
            <div className="relative mt-1">
              <input 
                required
                // 3. Tipe input berubah dinamis
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                // 4. Tambahkan pr-12 agar teks tidak tertutup icon
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium pr-12"
              />
              
              {/* 5. Tombol Mata */}
              <button
                type="button" // WAJIB agar tidak dianggap tombol submit
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* 6. Footer Input: Penempatan Sub-teks & Lupa Password */}
            <div className="flex justify-between items-center mt-2 px-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Min 8 characters</p>
              <button 
                type="button" 
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Lupa Password?
              </button>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 shadow-blue-200 disabled:bg-slate-300"
          >
            {loading ? 'Memverifikasi...' : 'Masuk'}
          </button>
        </form>

        <footer className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Belum punya akun?{' '}
            <button 
              type="button"
              onClick={() => navigate('/register')}
              className="text-blue-600 font-black hover:underline"
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