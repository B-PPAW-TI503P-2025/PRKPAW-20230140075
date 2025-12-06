import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, UserCheck, FileText } from "lucide-react"; // Hapus Icon History

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("attendanceStatus"); 
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const getLinkClass = (path) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
      isActive(path) 
        ? "bg-indigo-50 text-indigo-600 shadow-sm border-r-4 border-indigo-600" 
        : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
    }`;

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-indigo-50 shadow-xl z-50 flex flex-col justify-between py-6 px-4">
      
      <div>
        {/* LOGO */}
        <div className="flex items-center gap-3 mb-10 px-2 mt-2">
          <div className="bg-gradient-to-br from-indigo-600 to-fuchsia-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
             <UserCheck size={28} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-fuchsia-700 tracking-tight leading-none">
              PRESENSI
            </h1>
            <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em]">SYSTEM</span>
          </div>
        </div>

        {/* MENU LINKS */}
        {token && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Menu Utama</p>
            
            <Link to="/dashboard" className={getLinkClass("/dashboard")}>
              <LayoutDashboard size={20} /> Dashboard
            </Link>

            <Link to="/attendance" className={getLinkClass("/attendance")}>
              <UserCheck size={20} /> Presensi
            </Link>

            {/* --- MENU LAPORAN (PENGGANTI RIWAYAT) --- */}
            {/* Diakses oleh semua user, logic pembeda ada di dalam halaman ReportPage */}
            <Link to="/report" className={getLinkClass("/report")}>
              <FileText size={20} /> Laporan
            </Link>
          </div>
        )}
      </div>

      {/* USER PROFILE & LOGOUT */}
      {token && (
        <div className="border-t border-slate-100 pt-6">
           <div className="flex items-center gap-3 mb-6 px-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                {user?.nama ? user.nama.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-700 truncate w-32">{user?.nama || "User"}</p>
                <p className="text-xs text-slate-400 truncate w-32">{user?.role || "Member"}</p>
              </div>
           </div>

           <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-red-200"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;