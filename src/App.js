import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './LoginPage'; // Pastikan path ini benar sesuai struktur folder Anda
import RegisterPage from './RegisterPage'; // Pastikan path ini benar
import DashboardPage from './components/DashboardPage';
import AttendancePage from './components/AttendancePage';
import ReportPage from './components/ReportPage';

function App() {
  return (
    <Router>
      <div className="bg-gray-50 min-h-screen font-sans">
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/presensi" element={<AttendancePage />} />
          <Route path="/laporan" element={<ReportPage />} />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;