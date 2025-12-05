import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { jwtDecode } from 'jwt-decode'; // Pastikan import ini benar sesuai versi Anda

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardPage = () => {
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpha: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.nama || 'User');
      } catch (error) {
        console.error("Error decoding token", error);
      }
    }
    
    // Fetch data riwayat untuk statistik
    // Note: Backend 075 mungkin belum punya endpoint khusus stats, 
    // jadi kita hitung manual dari endpoint riwayat jika ada.
    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/presensi', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Simulasi perhitungan statistik dari data riwayat
            // Backend 075 sepertinya hanya return array data
            const data = response.data;
            // Hitung jumlah kehadiran (Dummy logic karena struktur data mungkin beda)
            setStats({
                hadir: data.length, 
                izin: 0, // Backend 075 mungkin belum support status ini
                sakit: 0,
                alpha: 0
            });
        } catch (error) {
            console.error("Gagal ambil data stats", error);
        }
    };
    fetchStats();
  }, []);

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Kehadiran Bulanan',
        data: [12, 19, 3, 5, 2, 3], // Data dummy statis untuk visualisasi
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  const doughnutData = {
    labels: ['Hadir', 'Izin', 'Sakit', 'Alpha'],
    datasets: [
      {
        data: [stats.hadir, stats.izin, stats.sakit, stats.alpha],
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(234, 179, 8, 0.5)',
          'rgba(239, 68, 68, 0.5)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Selamat datang kembali, <span className="font-semibold text-blue-600">{userName}</span>!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Hadir</p>
                <p className="text-2xl font-bold text-gray-800">{stats.hadir}</p>
              </div>
            </div>
          </div>
          {/* Card Izin/Sakit dll bisa ditambahkan di sini */}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Statistik Kehadiran</h3>
            <Bar data={barData} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Persentase Status</h3>
            <div className="w-2/3 mx-auto">
              <Doughnut data={doughnutData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;