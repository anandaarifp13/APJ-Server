const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // Pakai v2.x biar CommonJS kompatibel
const app = express();
const PORT = process.env.PORT || 3000;

// URL endpoint GAS yang sudah kamu deploy
const GAS_URL = "https://script.google.com/macros/s/AKfycbwEJUHNySa48orORtjO1CjTaYVi_meyWz56eTRYP9jWsdoIAx0L9B_c5S51FIeQcKhrjg/exec";

// Middleware setup
app.use(cors());
app.use(express.json());

// ================================
// POST /api/user – Login user
// ================================
app.post("/api/user", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      status: "error",
      message: "Username dan password wajib diisi.",
    });
  }

  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "user",
        username,
        password,
      }),
    });
    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error("🔥 Error login:", err.message);
    res.status(500).json({
      status: "error",
      message: "Gagal menghubungi server GAS.",
      error: err.message,
    });
  }
});

// ================================
// GET /api/user – Ambil daftar user dari GAS
// ================================
app.get("/api/user", async (req, res) => {
  try {
    const response = await fetch(`${GAS_URL}?action=user`);
    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error("🔥 Error ambil user:", err.message);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data user dari GAS.",
      error: err.message,
    });
  }
});

// ================================
// GET /api/outlet – Ambil daftar outlet dari GAS
// ================================
app.get("/api/outlet", async (req, res) => {
  try {
    const response = await fetch(`${GAS_URL}?action=outlet`);
    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error("🔥 Error ambil outlet:", err.message);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data outlet dari GAS.",
      error: err.message,
    });
  }
});

// ================================
// POST /api/input_outlet – Kirim data input outlet ke GAS
// ================================
app.post("/api/input_outlet", async (req, res) => {
  const { tanggal, pemasukanCash, pemasukanDebit, pengeluaran, totalAkhir, outlet } = req.body;

  // Validasi sederhana
  if (!tanggal || !outlet) {
    return res.status(400).json({
      status: "error",
      message: "Tanggal dan outlet wajib diisi.",
    });
  }

  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "input_outlet",
        tanggal,
        pemasukanCash,
        pemasukanDebit,
        pengeluaran,
        totalAkhir,
        outlet,
      }),
    });

    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error("🔥 Error input outlet:", err.message);
    res.status(500).json({
      status: "error",
      message: "Gagal mengirim data ke server GAS.",
      error: err.message,
    });
  }
});

// ================================
// GET /api/barang – Ambil daftar barang & satuan dari GAS
// ================================
app.get("/api/barang", async (req, res) => {
  try {
    const response = await fetch(`${GAS_URL}?action=barang`);
    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error("🔥 Error ambil barang:", err.message);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data barang dari GAS.",
      error: err.message,
    });
  }
});

// ================================
// GET /api/supplier – Ambil daftar supplier dari GAS
// ================================
app.get("/api/supplier", async (req, res) => {
  try {
    const response = await fetch(`${GAS_URL}?action=supplier`);
    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error("🔥 Error ambil supplier:", err.message);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data supplier dari GAS.",
      error: err.message,
    });
  }
});

// ================================
// POST /api/output_umum – Kirim data ke sheet OUTPUT UMUM
// ================================
app.post("/api/output_umum", async (req, res) => {
  const {
    tanggal,
    namaBarang,
    qty,
    satuan,
    harga,
    totalHarga,
    supplier,
    keterangan
  } = req.body;

  if (!tanggal || !namaBarang || !qty || !satuan || !harga || !supplier) {
    return res.status(400).json({
      status: "error",
      message: "Field penting wajib diisi.",
    });
  }

  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "output_umum",
        tanggal,
        namaBarang,
        qty,
        satuan,
        harga,
        totalHarga,
        supplier,
        keterangan: keterangan || ""
      }),
    });

    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error("🔥 Error input output_umum:", err.message);
    res.status(500).json({
      status: "error",
      message: "Gagal mengirim data ke OUTPUT UMUM di GAS.",
      error: err.message,
    });
  }
});

// ================================
// GET /api/rekap – Ambil data rekap pemasukan/pengeluaran dari GAS
// Query: tipe=pemasukan|pengeluaran, tanggalAwal, tanggalAkhir, outlet/supplier (opsional)
// ================================
app.get("/api/rekap", async (req, res) => {
  const { tipe, tanggalAwal, tanggalAkhir, outlet, supplier } = req.query;

  if (!tipe || !tanggalAwal || !tanggalAkhir) {
    return res.status(400).json({
      status: "error",
      message: "Parameter wajib: tipe, tanggalAwal, dan tanggalAkhir.",
    });
  }

  let url = `${GAS_URL}?action=rekap&tipe=${encodeURIComponent(tipe)}&tanggalAwal=${encodeURIComponent(tanggalAwal)}&tanggalAkhir=${encodeURIComponent(tanggalAkhir)}`;

  if (tipe === "pemasukan" && outlet) {
    url += `&outlet=${encodeURIComponent(outlet)}`;
  }

  if (tipe === "pengeluaran" && supplier) {
    url += `&supplier=${encodeURIComponent(supplier)}`;
  }

  try {
    const response = await fetch(url);
    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error("🔥 Error ambil data rekap:", err.message);
    res.status(500).json({
      status: "error",
      message: "Gagal ambil data rekap dari GAS.",
      error: err.message,
    });
  }
});

// POST: Tambah Data USER (ke LIST USER)
app.post("/api/user_dashboard", async (req, res) => {
  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "user_dashboard", ...req.body })
    });
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Gagal tambah user dashboard.",
      error: err.message,
    });
  }
});

// POST: Tambah Data SUPPLIER (ke LIST SUPPLIER)
app.post("/api/supplier_dashboard", async (req, res) => {
  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "supplier_dashboard", ...req.body })
    });
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Gagal tambah supplier dashboard.",
      error: err.message,
    });
  }
});

// POST: Tambah Data BARANG (ke LIST BARANG)
app.post("/api/barang_dashboard", async (req, res) => {
  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "barang_dashboard", ...req.body })
    });
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Gagal tambah barang dashboard.",
      error: err.message,
    });
  }
});

// POST: Tambah Data OUTLET (ke LIST OUTLET)
app.post("/api/outlet_dashboard", async (req, res) => {
  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "outlet_dashboard", ...req.body })
    });
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Gagal tambah outlet dashboard.",
      error: err.message,
    });
  }
});
// GET: Ambil Data USER
app.get("/api/user_dashboard", async (req, res) => {
  try {
    const response = await fetch(`${GAS_URL}?action=user_dashboard`);
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Gagal ambil user dashboard.",
      error: err.message,
    });
  }
});

// GET: Ambil Data SUPPLIER
app.get("/api/supplier_dashboard", async (req, res) => {
  try {
    const response = await fetch(`${GAS_URL}?action=supplier_dashboard`);
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Gagal ambil supplier dashboard.",
      error: err.message,
    });
  }
});

// GET: Ambil Data BARANG
app.get("/api/barang_dashboard", async (req, res) => {
  try {
    const response = await fetch(`${GAS_URL}?action=barang_dashboard`);
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Gagal ambil barang dashboard.",
      error: err.message,
    });
  }
});

// GET: Ambil Data OUTLET
app.get("/api/outlet_dashboard", async (req, res) => {
  try {
    const response = await fetch(`${GAS_URL}?action=outlet_dashboard`);
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Gagal ambil outlet dashboard.",
      error: err.message,
    });
  }
});


// === Taruh /ping DI SINI ===
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// ================================
// Jalankan server
// ================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
