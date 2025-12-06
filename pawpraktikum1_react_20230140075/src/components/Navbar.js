import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, UserCheck, FileText } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // --- UPDATE LOGIC LOGOUT DI SINI ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // TAMBAHAN PENTING:
    // Hapus status presensi harian saat logout agar bisa tes ulang
    localStorage.removeItem("attendanceStatus"); 
    
    navigate("/login");
  };

  return (
    // Ubah border bawah jadi ungu tipis (border-indigo-50)
    <nav className="bg-white/90 backdrop-blur-md border-b border-indigo-50 sticky top-0 z-50 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO BRAND */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            {/* Icon Box: Gradient Ungu */}
            <div className="bg-gradient-to-br from-indigo-600 to-fuchsia-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 group-hover:scale-105 transition-all duration-300">
               <UserCheck size={24} strokeWidth={3} />
            </div>
            {/* Text: Gradient Ungu Tua ke Pink */}
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-fuchsia-700 tracking-tight group-hover:to-indigo-600 transition-all">
              PRESENSI<span className="text-slate-800">APP</span>
            </span>
          </Link>

          {token && (
            <div className="flex items-center gap-8">
              {/* MENU LINKS (Desktop) */}
              <div className="hidden md:flex items-center gap-6">
                <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <Link to="/attendance" className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors">
                  <UserCheck size={18} /> Presensi
                </Link>
                
                {user && user.role === "admin" && (
                  <Link to="/report" className="flex items-center gap-2 text-slate-500 font-bold hover:text-fuchsia-600 transition-colors">
                    <FileText size={18} /> Laporan
                  </Link>
                )}
              </div>
              
              <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

              {/* LOGOUT BUTTON */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-full font-bold hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-red-200"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;