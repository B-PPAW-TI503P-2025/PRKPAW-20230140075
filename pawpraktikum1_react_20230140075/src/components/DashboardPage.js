import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  UserCheck, 
  Calendar, 
  Clock, 
  LayoutDashboard, 
  LogOut, 
  Menu 
} from "lucide-react";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    // Ambil data user dari localStorage
    const userString = localStorage.getItem("user");
    if (userString) {
      setUser(JSON.parse(userString));
    }

    // Timer Real-time
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* --- NAVBAR (BARU) --- */}
      <nav className="bg-white px-6 py-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          
          {/* Logo Brand - Warna Ungu */}
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md shadow-indigo-200">
              <UserCheck size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-indigo-900">
              PRESENSI<span className="text-indigo-600">APP</span>
            </h1>
          </div>

          {/* Menu Kanan (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors">
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link to="/attendance" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors">
              <UserCheck size={18} />
              Presensi
            </Link>
            
            <div className="h-6 w-px bg-slate-200"></div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-pink-50 text-pink-600 px-5 py-2.5 rounded-full font-bold hover:bg-pink-100 hover:text-pink-700 transition-all text-sm"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button (Optional) */}
          <button className="md:hidden text-slate-600">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION (HEADER) --- */}
      {/* Kartu menu di bawah dihapus, hanya menyisakan header gradient yang elegan */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-fuchsia-900 text-white relative overflow-hidden pb-32 pt-16 px-6 rounded-b-[3rem] shadow-xl">
        
        {/* Dekorasi Background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-fuchsia-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-10 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            
            {/* Kiri: Sapaan User */}
            <div>
              <div className="flex items-center gap-2 text-indigo-200 bg-white/10 backdrop-blur-md w-fit px-4 py-1.5 rounded-full text-xs font-bold border border-white/10 mb-4 uppercase tracking-wider shadow-sm">
                <LayoutDashboard size={14} /> Dashboard Panel
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-xl">
                Halo, {user?.nama || "Admin"}! <span className="text-4xl inline-block animate-bounce">👋</span>
              </h1>
              <p className="text-indigo-100 text-lg font-medium opacity-90 max-w-lg leading-relaxed">
                Selamat datang kembali. Siap untuk mencatat produktivitas hari ini?
              </p>
            </div>

            {/* Kanan: Widget Waktu (Real-time) */}
            <div className="flex flex-wrap gap-4">
              {/* Tanggal */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-lg hover:bg-white/15 transition-colors">
                <div className="p-3 bg-indigo-500/40 rounded-xl">
                  <Calendar size={24} className="text-indigo-50" />
                </div>
                <div>
                  <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider mb-1">Tanggal</p>
                  <p className="font-bold text-white text-base">{formatDate(currentTime)}</p>
                </div>
              </div>

              {/* Waktu */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-lg hover:bg-white/15 transition-colors">
                <div className="p-3 bg-fuchsia-500/40 rounded-xl">
                  <Clock size={24} className="text-fuchsia-50" />
                </div>
                <div>
                  <p className="text-[10px] text-fuchsia-200 font-bold uppercase tracking-wider mb-1">Waktu</p>
                  <p className="font-mono font-bold text-white text-xl tracking-widest">{formatTime(currentTime)}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;