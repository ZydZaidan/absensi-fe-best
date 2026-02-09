import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import semua halaman
import LoginPage from './pages/LoginPage';
import Register from './pages/register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Absensi from './pages/Absensi';
import AbsensiPulang from './pages/AbsensiPulang';
import Izin from './pages/Izin';
import Riwayat from './pages/Riwayat';

const DashboardSelector = () => {
  const savedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  // Proteksi: Jika tidak ada token, balik ke login
  if (!token || !savedUser) {
    return <Navigate to="/" />;
  }

  const user = JSON.parse(savedUser);
  // Pastikan casing 'admin' sesuai dengan database kamu
  return user.peran === 'admin' ? <AdminDashboard /> : <Dashboard />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        
        {/* GUNAKAN HURUF KECIL SEMUA UNTUK PATH */}
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardSelector />} />
        <Route path="/absensi" element={<Absensi />} />
        <Route path="/absensi-pulang" element={<AbsensiPulang />} />
        <Route path="/izin" element={<Izin />} />
        <Route path="/riwayat" element={<Riwayat />} />

        {/* Jika user mengetik URL ngawur, arahkan ke login */}
        <Route path="*" element={<Navigate to="/" />} />

        <Route path="/admin/monitoring" element={<div>Halaman Peta Monitoring</div>} />

      </Routes>
    </Router>
  );
}

export default App;