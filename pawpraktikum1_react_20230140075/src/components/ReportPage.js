import React, { useState, useEffect } from "react";
import axios from "axios";
import { Download, AlertCircle, MapPin, X, ImageOff, FileText } from "lucide-react";

const ReportPage = () => {
  const [dataPresensi, setDataPresensi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(""); // Simpan role user
  
  // STATE POPUP GAMBAR
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    // Ambil info user
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    
    if (user) {
      setUserRole(user.role);
    }

    fetchReport(user);
    // eslint-disable-next-line
  }, []);

  const fetchReport = async (currentUser) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan.");

      // --- LOGIKA PINTAR ENDPOINT ---
      // Jika Admin: lihat semua (/attendance)
      // Jika Pegawai: lihat history sendiri (/attendance/history)
      const endpoint = currentUser?.role === "admin" 
        ? "http://localhost:3001/api/attendance" 
        : "http://localhost:3001/api/attendance/history";

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Normalisasi data (jika endpoint history mengembalikan object wrapper)
      const rawData = response.data.data || response.data;
      const listData = Array.isArray(rawData) ? rawData : [];

      // Sort terbaru di atas
      const sortedData = listData.sort((a, b) => new Date(b.checkIn || b.createdAt) - new Date(a.checkIn || a.createdAt));
      
      setDataPresensi(sortedData);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Gagal memuat data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    });
  };

  const getImageUrl = (path) => {
    if (!path || path.includes("no-image")) return null;
    const cleanPath = path.replace(/\\/g, "/");
    return `http://localhost:3001/${cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-50 overflow-hidden relative">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-fuchsia-900 p-8 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-1">
                <div className="bg-white/10 p-2 rounded-lg">
                    <FileText className="text-indigo-200" size={24} />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  {userRole === "admin" ? "LAPORAN PEGAWAI" : "RIWAYAT SAYA"}
                </h2>
            </div>
            <p className="text-indigo-200 text-sm font-medium ml-1">
               {userRole === "admin" ? "Pantau semua kehadiran tim" : "Daftar kehadiran Anda"}
            </p>
          </div>
          
          <button 
            onClick={() => {
                const user = JSON.parse(localStorage.getItem("user"));
                fetchReport(user);
            }}
            className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white hover:text-indigo-900 transition-all flex items-center gap-2 shadow-lg active:scale-95"
          >
            <Download size={20} /> REFRESH
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-500 font-bold">Sedang memuat data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="font-extrabold text-lg">Gagal Memuat</p>
                <p>{error}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-left">
                    <th className="py-5 px-6 font-extrabold text-slate-500 uppercase text-xs tracking-wider">No</th>
                    {/* Kolom Pegawai hanya relevan untuk Admin */}
                    {userRole === "admin" && (
                        <th className="py-5 px-6 font-extrabold text-slate-500 uppercase text-xs tracking-wider">Pegawai</th>
                    )}
                    <th className="py-5 px-6 font-extrabold text-slate-500 uppercase text-xs tracking-wider text-center">Check-In</th>
                    <th className="py-5 px-6 font-extrabold text-slate-500 uppercase text-xs tracking-wider text-center">Check-Out</th>
                    <th className="py-5 px-6 font-extrabold text-slate-500 uppercase text-xs tracking-wider text-center">Foto</th>
                    <th className="py-5 px-6 font-extrabold text-slate-500 uppercase text-xs tracking-wider text-center">Lokasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dataPresensi.length > 0 ? (
                    dataPresensi.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-400">{index + 1}</td>
                        
                        {/* Nama Pegawai (Admin Only) */}
                        {userRole === "admin" && (
                            <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                {item.user?.nama?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div>
                                <p className="font-bold text-slate-800">{item.user?.nama || "Unknown"}</p>
                                <p className="text-xs text-slate-400 font-medium">{item.user?.email}</p>
                                </div>
                            </div>
                            </td>
                        )}

                        <td className="py-4 px-6 text-center">
                          <span className="bg-emerald-50 text-emerald-700 py-1.5 px-4 rounded-lg text-xs font-bold border border-emerald-100 inline-block">
                            {formatDate(item.checkIn)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {item.checkOut ? (
                            <span className="bg-indigo-50 text-indigo-700 py-1.5 px-4 rounded-lg text-xs font-bold border border-indigo-100 inline-block">
                              {formatDate(item.checkOut)}
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-600 py-1.5 px-4 rounded-lg text-xs font-bold border border-amber-100 animate-pulse inline-block">
                              Belum Pulang
                            </span>
                          )}
                        </td>
                        
                        {/* FOTO */}
                        <td className="py-4 px-6 text-center">
                          {getImageUrl(item.buktiFoto) ? (
                            <div className="relative group/img flex justify-center">
                              <img 
                                src={getImageUrl(item.buktiFoto)}
                                alt="Thumbnail"
                                className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:scale-150 transition-transform hover:z-50 hover:border-indigo-400"
                                onClick={() => setSelectedImage(getImageUrl(item.buktiFoto))}
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-300">
                               <ImageOff size={18} />
                               <span className="text-[10px] italic mt-1">No Image</span>
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-6 text-center">
                           {item.latitude ? (
                             <a 
                               href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold text-xs transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg"
                             >
                               <MapPin size={14} /> Maps
                             </a>
                           ) : <span className="text-slate-300">-</span>}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={userRole === "admin" ? 6 : 5} className="text-center py-16 text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                           <FileText size={40} className="text-slate-200" />
                           <p className="font-medium">Belum ada data presensi.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL POPUP */}
        {selectedImage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
               onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" 
                 onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 md:-right-4 bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-all border border-white/20"
              >
                <X size={24} />
              </button>

              <img 
                src={selectedImage} 
                alt="Bukti Check-In Full" 
                className="w-full h-full object-contain rounded-xl shadow-2xl border border-white/10 bg-black"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportPage;