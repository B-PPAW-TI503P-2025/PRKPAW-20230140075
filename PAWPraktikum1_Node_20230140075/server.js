const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;
const morgan = require("morgan");
const db = require("./models"); // <--- PENTING: Import models

// Impor router
const presensiRoutes = require("./routes/presensi");
const reportRoutes = require("./routes/reports");
const authRoutes = require('./routes/auth');
const ruteBuku = require("./routes/books");
const path = require('path'); 
// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Home Page for API");
});

// Gunakan Routes
app.use("/api/books", ruteBuku);
app.use("/api/presensi", presensiRoutes); 
app.use("/api/reports", reportRoutes);
app.use('/api/auth', authRoutes);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- BAGIAN INI YANG SEBELUMNYA HILANG ---
// Sinkronisasi Database otomatis saat server start
db.sequelize.sync({ alter: true }) // 'alter: true' akan menyesuaikan tabel jika ada kolom baru
  .then(() => {
    console.log("✅ Database berhasil disinkronisasi (Tabel otomatis dibuat/diupdate)!");
    
    // Jalankan server hanya jika koneksi DB berhasil
    app.listen(PORT, () => {
      console.log(`Express server running at http://localhost:${PORT}/`);
    });
  })
  .catch((err) => {
    console.error("❌ Gagal sinkronisasi database:", err);
  });