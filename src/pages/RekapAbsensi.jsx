import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Search, Loader2, MapPin, FileSpreadsheet } from 'lucide-react';
// IMPORT LIBRARY EXCEL
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const RekapAbsensi = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [daftarCabang, setDaftarCabang] = useState([]);

  const [filter, setFilter] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    status: '',
    tanggal: '',
    id_cabang: ''
  });

  // ==========================================
  // LOGIKA VIRTUAL ALPHA (REAL-TIME CHECK)
  // ==========================================
  const getDisplayStatus = (row) => {
    // Jika data dari BE sudah memiliki status (hadir, telat, izin, dsb)
    if (row.status && row.status !== 'alpha') return row.status;
    if (row.status === 'alpha') return 'alpha';

    // Jika data kosong, cek apakah sudah melewati jam pulang (17:30)
    const sekarang = new Date();
    const jamPulang = 17;
    const menitPulang = 30;

    const isSudahLewatWaktu = sekarang.getHours() > jamPulang || 
                             (sekarang.getHours() === jamPulang && sekarang.getMinutes() >= menitPulang);

    if (!row.jam_masuk && isSudahLewatWaktu) {
      return 'alpha';
    }
    
    return 'belum absen';
  };

  useEffect(() => {
    const fetchCabang = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/cabang`);
        setDaftarCabang(response.data.data || []);
      } catch (err) { console.error(err); }
    };
    fetchCabang();
  }, []);

  useEffect(() => {
    const fetchRekap = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/rekap-absen`, {
          params: filter,
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setData(response.data.data || []);
      } catch (err) {
        if (err.response?.status === 401) { localStorage.clear(); navigate('/'); }
      } finally { setLoading(false); }
    };
    fetchRekap();
  }, [filter, navigate]);

  const handleExportExcel = async () => {
    if (data.length === 0) return alert("Tidak ada data untuk dieksport!");

    const workbook = new ExcelJS.Workbook();
    
    const groupedData = data.reduce((acc, row) => {
      const cabangName = row.user?.branch?.nama_cabang || 'Kantor Pusat';
      if (!acc[cabangName]) acc[cabangName] = [];
      acc[cabangName].push(row);
      return acc;
    }, {});

    Object.keys(groupedData).forEach((cabang) => {
      const worksheet = workbook.addWorksheet(cabang.substring(0, 31));

      worksheet.columns = [
        { header: 'NAMA KARYAWAN', key: 'nama', width: 30 },
        { header: 'JABATAN', key: 'jabatan', width: 20 },
        { header: 'TANGGAL', key: 'tanggal', width: 20 },
        { header: 'JAM MASUK', key: 'masuk', width: 15 },
        { header: 'JAM PULANG', key: 'pulang', width: 15 },
        { header: 'STATUS UTAMA', key: 'status', width: 15 },
        { header: 'IZIN/PULANG CEPAT', key: 'pc', width: 20 },
        { header: 'ALASAN', key: 'alasan', width: 35 },
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E293B' }
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      groupedData[cabang].forEach(item => {
        const statusIzin = item.is_permission ? 'IZIN MENINGGALKAN KANTOR' : (item.status_pulang_cepat === 'disetujui' ? 'PULANG CEPAT' : '-');
        
        const row = worksheet.addRow({
          nama: item.nama_karyawan,
          jabatan: item.user?.jabatan || '-',
          tanggal: item.tanggal_absen ? new Date(item.tanggal_absen).toLocaleDateString('id-ID') : '-',
          masuk: item.jam_masuk?.slice(0,5) || '--:--',
          pulang: item.jam_pulang?.slice(0,5) || '--:--',
          status: getDisplayStatus(item).toUpperCase(),
          pc: statusIzin,
          alasan: item.late_reason || item.alasan_izin || '-'
        });

        row.getCell('tanggal').alignment = { horizontal: 'center' };
        row.getCell('masuk').alignment = { horizontal: 'center' };
        row.getCell('pulang').alignment = { horizontal: 'center' };
        row.getCell('status').alignment = { horizontal: 'center' };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = `REKAP_ABSEN_LENGKAP_${new Date().getTime()}.xlsx`;
    saveAs(blob, fileName);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      <header className="bg-white sticky top-0 z-40 p-6 md:px-12 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-all group">
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
          </button>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-800">Rekapitulasi Absensi</h1>
        </div>
        <button 
          onClick={handleExportExcel}
          className="hidden md:flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export Excel
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <section className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Bulan</label>
            <select className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" value={filter.bulan} onChange={(e) => setFilter({...filter, bulan: e.target.value})}>
              {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, i) => (
                <option key={i} value={i+1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Status</label>
            <select className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})}>
              <option value="">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="telat">Terlambat</option>
              <option value="izin">Izin</option>
              <option value="sakit">Sakit</option>
              <option value="alpha">Alpha</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Cabang</label>
            <select className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" value={filter.id_cabang} onChange={(e) => setFilter({...filter, id_cabang: e.target.value})}>
                <option value="">Semua Cabang</option>
                {daftarCabang.map(c => <option key={c.id} value={c.id}>{c.nama_cabang}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tanggal</label>
            <input type="date" className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" value={filter.tanggal} onChange={(e) => setFilter({...filter, tanggal: e.target.value})} />
          </div>
          <div className="flex items-end gap-2">
            <button className="flex-1 p-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600">
              <Search className="w-4 h-4" /> Cari
            </button>
            <button onClick={handleExportExcel} className="md:hidden p-4 bg-emerald-600 text-white rounded-2xl"><FileSpreadsheet className="w-4 h-4" /></button>
          </div>
        </section>

        <section className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Karyawan</th>
                  <th className="px-8 py-6 text-center">Tanggal</th>
                  <th className="px-8 py-6 text-center">Masuk / Pulang</th>
                  <th className="px-8 py-6 text-center">Status</th>
                  <th className="px-8 py-6 text-center">Alasan</th>
                  <th className="px-8 py-6">Cabang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium italic">
                {loading ? (
                  <tr><td colSpan="6" className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
                ) : data.length > 0 ? data.map((row, i) => {
                  const currentStatus = getDisplayStatus(row);
                  return (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group not-italic">
                      <td className="px-8 py-5">
                        <p className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{row.nama_karyawan}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{row.user?.jabatan || '-'}</p>
                      </td>
                      <td className="px-8 py-5 text-center text-xs font-bold text-slate-600 uppercase">
                        {row.tanggal_absen ? new Date(row.tanggal_absen).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric'}) : '-'}
                      </td>
                      <td className="px-8 py-5 text-center text-sm font-black text-slate-700">
                          {row.jam_masuk?.slice(0,5) || '--:--'} <span className="text-slate-200 mx-1">|</span> {row.jam_pulang?.slice(0,5) || '--:--'}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex flex-wrap justify-center gap-1.5">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            currentStatus === 'hadir' ? 'bg-emerald-100 text-emerald-700' : 
                            currentStatus === 'telat' ? 'bg-rose-100 text-rose-700' : 
                            currentStatus === 'alpha' ? 'bg-slate-200 text-slate-500' : 
                            'bg-amber-100 text-amber-700'
                          }`}>
                              {currentStatus}
                          </span>
                          
                          {/* FIX 1: Gunakan ternary operator buat cegah render angka 0 */}
                          {(row.is_permission === true || row.is_permission === 1) ? (
                              <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">IZIN</span>
                          ) : null}

                          {/* FIX 2: Tampilkan lagi badge Pulang Cepat */}
                          {row.status_pulang_cepat === 'disetujui' ? (
                              <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">PC</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center text-[10px] text-slate-500 font-medium max-w-37.5 truncate">
                        {row.late_reason || row.alasan_izin || '-'}
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-400 uppercase italic">
                          <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-blue-400" />{row.user?.branch?.nama_cabang || 'Kantor Pusat'}</div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="6" className="py-24 text-center text-slate-300">Data tidak ditemukan</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RekapAbsensi;