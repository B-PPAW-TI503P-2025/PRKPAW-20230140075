import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter
} from "lucide-react";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      // Asumsi endpoint backend untuk riwayat user sendiri
      const response = await axios.get("http://localhost:3001/api/attendance/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(response.data.data || []); // Sesuaikan struktur response backend kamu
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat riwayat presensi.");
      setLoading(false);
    }
  };

  // Format Tanggal Indonesia
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Format Jam
  const formatTime = (timeString) => {
    return timeString ? timeString.substring(0, 5) : "-";
  };

  // Filter Data
  const filteredData = history.filter((item) => 
    item.date?.toLowerCase().includes(filter.toLowerCase()) ||
    item.status?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 font-sans text-slate-700 min-h-screen bg-slate-50">
      
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-indigo-900 tracking-tight mb-2">
              Riwayat Presensi
            </h1>
            <p className="text-slate-500">
              Daftar kehadiran yang telah tercatat di sistem.
            </p>
          </div>

          {/* Search / Filter */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cari tanggal atau status..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64 shadow-sm"
            />
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
            <p className="text-slate-400 font-medium">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3 text-red-700">
            <AlertCircle size={24} />
            <p>{error}</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">Belum ada data presensi.</p>
          </div>
        ) : (
          /* Table Card */
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <th className="p-5">Tanggal</th>
                    <th className="p-5">Jam Masuk</th>
                    <th className="p-5">Jam Keluar</th>
                    <th className="p-5 text-center">Status</th>
                    <th className="p-5 text-center">Lokasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-5 font-medium text-indigo-900">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                            <Calendar size={18} />
                          </div>
                          {formatDate(item.date || item.createdAt)}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="flex items-center gap-2 text-slate-600 font-mono text-sm bg-slate-100 px-3 py-1 rounded-full w-fit">
                          <Clock size={14} /> {formatTime(item.clockIn)}
                        </span>
                      </td>
                      <td className="p-5">
                        {item.clockOut ? (
                          <span className="flex items-center gap-2 text-slate-600 font-mono text-sm bg-slate-100 px-3 py-1 rounded-full w-fit">
                            <Clock size={14} /> {formatTime(item.clockOut)}
                          </span>
                        ) : (
                           <span className="text-slate-400 italic text-sm">-- : --</span>
                        )}
                      </td>
                      <td className="p-5 text-center">
                        {item.status === 'Hadir' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                            <CheckCircle size={14} /> Hadir
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
                            <AlertCircle size={14} /> {item.status || "Check In"}
                          </span>
                        )}
                      </td>
                       <td className="p-5 text-center">
                        <a 
                          href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-700 hover:underline"
                        >
                          <MapPin size={14} /> Lihat Peta
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;