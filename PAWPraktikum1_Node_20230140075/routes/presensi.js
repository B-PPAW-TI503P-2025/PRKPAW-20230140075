const express = require("express");
const router = express.Router();
const presensiController = require("../controllers/presensiController");

const { authenticateToken, isAdmin } = require("../middleware/permissionMiddleware");

// Middleware Auth untuk semua
router.use(authenticateToken);

// --- RUTE PRESENSI ---

// 1. Rute History (User Biasa) -> INI YANG TADINYA HILANG
// Endpoint: /api/attendance/history
router.get("/history", presensiController.getHistory);

// 2. Rute Admin Report (Admin Only)
// Endpoint: /api/attendance/
router.get("/", isAdmin, presensiController.getAllPresensi); 

router.post(
  "/check-in",
  [presensiController.upload.single("image")],
  presensiController.CheckIn
);

router.post("/check-out", presensiController.CheckOut);

router.put("/:id", presensiController.updatePresensi);
router.delete("/:id", presensiController.hapusPresensi);

module.exports = router;