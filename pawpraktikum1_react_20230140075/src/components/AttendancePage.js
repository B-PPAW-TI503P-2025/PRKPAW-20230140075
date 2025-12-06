import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin,
  Camera,
  CameraOff, // Icon baru untuk kamera mati
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  LogOut,
  RotateCw
} from 'lucide-react';

const AttendancePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // --- STATE ABSENSI ---
  const [lokasi, setLokasi] = useState({ lat: null, lng: null, error: null });
  const [fotoBlob, setFotoBlob] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false); // State status kamera
  
  // State Status
  const [statusAbsen, setStatusAbsen] = useState('idle'); 
  const [pesanStatus, setPesanStatus] = useState('');
  
  // State Refresh Map
  const [mapKey, setMapKey] = useState(0); 

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    // 1. Cek User
    const userString = localStorage.getItem("user");
    if (userString) {
      setUser(JSON.parse(userString));
    }

    // 2. Ambil Lokasi
    getLokasi();

    // 3. Nyalakan Kamera Otomatis saat masuk
    startCamera();

    // Cleanup saat keluar halaman
    return () => stopCamera();
    // eslint-disable-next-line
  }, []);

  // --- LOGIKA LOKASI ---
  const getLokasi = () => {
    setLokasi(prev => ({ ...prev, error: null })); 
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLokasi({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            error: null
          });
          setMapKey(prev => prev + 1);
        },
        (err) => {
          console.error(err);
          setLokasi(prev => ({ ...prev, error: "Gagal mendapatkan lokasi. Pastikan GPS aktif." }));
        }
      );
    } else {
      setLokasi(prev => ({ ...prev, error: "Browser tidak mendukung Geolocation." }));
    }
  };

  const handleRefreshMap = () => {
    getLokasi();
    setMapKey(prev => prev + 1);
  };

  // --- LOGIKA KAMERA (UPDATE: Toggle ON/OFF) ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true); // Set status aktif
      setPesanStatus(""); // Clear error message jika ada
    } catch (err) {
      console.error("Gagal akses kamera:", err);
      setCameraActive(false);
      setPesanStatus("Izin kamera ditolak atau perangkat tidak ditemukan.");
      setStatusAbsen('error');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false); // Set status mati
  };

  // Fungsi Toggle (Saklar)
  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && cameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        setFotoBlob(blob);
      }, 'image/jpeg', 0.8);

      const dataUrl = canvas.toDataURL('image/jpeg');
      setFotoPreview(dataUrl);
      
      // Opsional: Matikan kamera setelah foto diambil untuk hemat baterai
      // stopCamera(); 
    }
  };

  const retakePhoto = () => {
    setFotoBlob(null);
    setFotoPreview(null);
    startCamera();
  };

  // --- LOGIKA API ABSEN ---
  const handleAbsen = async (type) => {
    if (!lokasi.lat || !lokasi.lng) {
      setStatusAbsen('error');
      setPesanStatus("Lokasi belum ditemukan! Tunggu GPS terkunci.");
      return;
    }

    if (type === 'in' && !fotoBlob) {
      setStatusAbsen('error');
      setPesanStatus("Wajib ambil foto selfie untuk Check-In!");
      return;
    }

    setStatusAbsen('loading');
    setPesanStatus('Sedang mengirim data ke server...');

    try {
      const token = localStorage.getItem('token');
      // eslint-disable-next-line no-unused-vars
      let response;

      if (type === 'in') {
        const formData = new FormData();
        formData.append('latitude', lokasi.lat);
        formData.append('longitude', lokasi.lng);
        formData.append('image', fotoBlob, `selfie-${Date.now()}.jpg`);

        response = await axios.post('http://localhost:3001/api/attendance/check-in', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await axios.post('http://localhost:3001/api/attendance/check-out', {
            latitude: lokasi.lat,
            longitude: lokasi.lng
        }, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
      }

      setStatusAbsen('success');
      setPesanStatus(type === 'in' ? 'Berhasil Check-IN! Selamat Bekerja.' : 'Berhasil Check-OUT! Hati-hati di jalan.');
      
      const today = new Date().toISOString().split('T')[0];
      const currentStatus = JSON.parse(localStorage.getItem("attendanceStatus") || "{}");
      localStorage.setItem("attendanceStatus", JSON.stringify({
          ...currentStatus,
          date: today,
          hasCheckedIn: type === 'in' ? true : currentStatus.hasCheckedIn,
          hasCheckedOut: type === 'out' ? true : currentStatus.hasCheckedOut
      }));

      if(type === 'in') {
        setFotoBlob(null);
        setFotoPreview(null);
        startCamera(); 
      }

    } catch (error) {
      console.error(error);
      setStatusAbsen('error');
      setPesanStatus(error.response?.data?.message || 'Gagal melakukan presensi.');
    }
  };

  return (
    <div className="p-6 md:p-10 font-sans text-slate-700">
      
      <div className="max-w-5xl mx-auto space-y-6">
          
        {/* Header Card Gradient */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black tracking-tight">Halo, {user?.nama || "User"}</h2>
            <p className="opacity-90 mt-2 font-medium text-indigo-100 max-w-lg">
              Silakan lakukan presensi. Pastikan wajah terlihat jelas dan lokasi akurat.
            </p>
            
            <div className="mt-6 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md border border-white/20 shadow-sm">
              <MapPin size={16} className="text-fuchsia-300" /> 
              {lokasi.error ? (
                  <span className="text-red-200">{lokasi.error}</span>
              ) : (lokasi.lat ? (
                  <span>Lokasi: {lokasi.lat.toFixed(5)}, {lokasi.lng.toFixed(5)}</span>
              ) : (
                  <span className="animate-pulse">Mencari titik GPS...</span>
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="absolute bottom-0 left-20 w-40 h-40 bg-indigo-900/20 rounded-full blur-2xl"></div>
        </div>

        {/* Alert Status Message */}
        {statusAbsen !== 'idle' && (
          <div className={`p-5 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2 duration-300 border-l-4 shadow-sm ${
              statusAbsen === 'success' ? 'bg-green-50 text-green-800 border-green-500' : 
              statusAbsen === 'error' ? 'bg-red-50 text-red-800 border-red-500' : 
              'bg-blue-50 text-blue-800 border-blue-500'
          }`}>
            <div className={`p-2 rounded-full ${statusAbsen === 'success' ? 'bg-green-200' : statusAbsen === 'error' ? 'bg-red-200' : 'bg-blue-200'}`}>
              {statusAbsen === 'success' ? <CheckCircle size={20} /> : statusAbsen === 'error' ? <AlertTriangle size={20} /> : <RefreshCw size={20} className="animate-spin" />}
            </div>
            <span className="font-bold">{pesanStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* KOLOM KIRI: KAMERA */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl shadow-[0_5px_30px_-5px_rgba(0,0,0,0.05)] border border-slate-100">
              
              {/* Header Kamera + Tombol Toggle */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <Camera size={20} className="text-indigo-500" /> Foto Selfie
                </h3>
                
                {/* TOMBOL ON/OFF KAMERA */}
                {!fotoPreview && (
                  <button 
                    onClick={toggleCamera}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      cameraActive 
                        ? "bg-red-50 text-red-600 hover:bg-red-100" 
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    {cameraActive ? (
                      <><CameraOff size={14} /> Matikan Kamera</>
                    ) : (
                      <><Camera size={14} /> Hidupkan Kamera</>
                    )}
                  </button>
                )}
              </div>
              
              {/* AREA VIDEO / PREVIEW */}
              <div className="aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden relative shadow-inner ring-1 ring-black/5 group">
                {!fotoPreview ? (
                  cameraActive ? (
                    // Video Nyala
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                  ) : (
                    // Kamera Mati (Placeholder)
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-100">
                      <CameraOff size={48} className="mb-2 opacity-50" />
                      <p className="font-medium text-sm">Kamera Nonaktif</p>
                      <button onClick={toggleCamera} className="mt-4 text-indigo-600 font-bold text-xs hover:underline">
                        Ketuk untuk mengaktifkan
                      </button>
                    </div>
                  )
                ) : (
                  // Hasil Foto
                  <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover transform scale-x-[-1]" />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* TOMBOL ACTION (Jepret/Ulang) */}
              <div className="mt-5 flex gap-3">
                {!fotoPreview ? (
                  <button 
                    onClick={takePhoto} 
                    disabled={!cameraActive} // Disable jika kamera mati
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <Camera size={20} /> AMBIL FOTO
                  </button>
                ) : (
                  <button onClick={retakePhoto} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                      <RefreshCw size={18} /> FOTO ULANG
                  </button>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS (Check In/Out) */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                  onClick={() => handleAbsen('in')} 
                  disabled={statusAbsen === 'loading' || !fotoBlob} 
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black shadow-lg shadow-green-200 flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all group"
              >
                  <div className="bg-white/20 p-2 rounded-full mb-1 group-hover:scale-110 transition-transform"><Clock size={24} /></div>
                  <span>CHECK IN</span>
              </button>
              
              <button 
                  onClick={() => handleAbsen('out')} 
                  disabled={statusAbsen === 'loading'} 
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black shadow-lg shadow-red-200 flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all group"
              >
                  <div className="bg-white/20 p-2 rounded-full mb-1 group-hover:scale-110 transition-transform"><LogOut size={24} /></div>
                  <span>CHECK OUT</span>
              </button>
            </div>
          </div>

          {/* KOLOM KANAN: PETA (Dengan Tombol Refresh) */}
          <div className="bg-white p-5 rounded-3xl shadow-[0_5px_30px_-5px_rgba(0,0,0,0.05)] border border-slate-100 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <MapPin size={20} className="text-fuchsia-500" /> Posisi Anda
              </h3>
              
              <button 
                onClick={handleRefreshMap}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                title="Muat ulang peta"
              >
                <RotateCw size={14} /> Refresh Map
              </button>
            </div>
            
            <div className="aspect-square w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative">
              {lokasi.lat ? (
                <iframe 
                  key={mapKey} 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${lokasi.lng-0.002},${lokasi.lat-0.002},${lokasi.lng+0.002},${lokasi.lat+0.002}&layer=mapnik&marker=${lokasi.lat},${lokasi.lng}`} 
                  className="absolute inset-0 grayscale-[20%]"
                  title="User Location"
                ></iframe>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 flex-col animate-pulse">
                  <MapPin size={40} className="text-slate-300 mb-2" />
                  <span className="text-sm font-semibold">Sedang mencari sinyal GPS...</span>
                  <button onClick={getLokasi} className="mt-4 text-indigo-500 underline text-xs">Coba Lagi</button>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center leading-relaxed">
              *Koordinat akurat (Lat: {lokasi.lat?.toFixed(5)}, Lng: {lokasi.lng?.toFixed(5)}) dikirim ke sistem.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AttendancePage;