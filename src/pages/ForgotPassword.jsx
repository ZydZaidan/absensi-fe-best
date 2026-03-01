import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import bgBest from '../assets/images/bgBest.jpg';
import { Eye, EyeOff, ArrowLeft, Send, ShieldAlert } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi Sederhana
    if (formData.password !== formData.confirmPassword) {
      return alert("Password baru dan konfirmasi tidak cocok!");
    }

    if (formData.password.length < 8) {
      return alert("Password minimal 8 karakter!");
    }

    setLoading(true);
    try {
      // Endpoint ini harus disiapkan oleh BE
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/forgot-password`, {
        email: formData.email,
        new_password: formData.password
      });

      if (response.data.success) {
        alert("Permintaan berhasil dikirim! Silakan hubungi Admin untuk aktivasi password baru Anda.");
        navigate('/');
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal mengirim permintaan.";
      alert("Error: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans text-slate-900">
      <img src={bgBest} alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      <div className="relative z-20 max-w-md w-full bg-white/95 backdrop-blur-md rounded-4xl shadow-2xl p-8 md:p-10 border border-white/20">
        <header className="mb-8">
          <button 
            onClick={() => navigate('/')}
            className="mb-6 p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic">Lupa <span className="text-blue-600">Password?</span></h1>
          <p className="text-slate-500 text-xs font-medium mt-2 leading-relaxed">
            Masukkan email Anda dan password baru. Permintaan Anda akan dikirim ke <span className="font-bold text-slate-800">Admin Pusat</span> untuk diverifikasi.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Terdaftar</label>
            <input 
              required 
              name="email"
              type="email" 
              placeholder="nama@perusahaan.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
            />
          </div>

          {/* Password Baru */}
          <div className="space-y-2 text-right">
            <label className="block text-left text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password Baru</label>
            <div className="relative">
                <input 
                  required 
                  name="password"
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ulangi Password</label>
            <input 
              required 
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
            />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start">
             <ShieldAlert className="text-blue-600 shrink-0" size={20} />
             <p className="text-[10px] text-blue-800 font-bold leading-relaxed">
               DEMI KEAMANAN: Password Anda tidak akan langsung berubah. Admin akan memverifikasi permintaan ini terlebih dahulu.
             </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl active:scale-95 disabled:bg-slate-300 transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Kirim Permintaan</>}
          </button>
        </form>
      </div>
    </main>
  );
};

export default ForgotPassword;