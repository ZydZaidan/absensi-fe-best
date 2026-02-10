import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import semua halaman
import LoginPage from './pages/LoginPage';
import Register from './pages/Register'; // 1. Pastikan R besar jika nama filenya Register.jsx
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Absensi from './pages/Absensi';
import AbsensiPulang from './pages/AbsensiPulang';
import Izin from './pages/Izin';
import Riwayat from './pages/Riwayat';
import VerifikasiKaryawan from './pages/VerifikasiKaryawan';

const DashboardSelector = () => {
  const savedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (!token || !savedUser) {
    return <Navigate to="/" />;
  }

  const user = JSON.parse(savedUser);
  return user.peran === 'admin' ? <AdminDashboard /> : <Dashboard />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Standar */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardSelector />} />
        <Route path="/absensi" element={<Absensi />} />
        <Route path="/absensi-pulang" element={<AbsensiPulang />} />
        <Route path="/izin" element={<Izin />} />
        <Route path="/riwayat" element={<Riwayat />} />
        
        {/* Rute Khusus Admin */}
        <Route path="/admin/verifikasi" element={<VerifikasiKaryawan />} />
        <Route path="/admin/monitoring" element={<div>Halaman Peta Monitoring</div>} />

        {/* 2. PINDAHKAN INI KE PALING BAWAH (Wildcard Catch-all) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;