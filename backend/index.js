const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, "data", "items.json");

function ensureDataFile() {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, JSON.stringify([]));
}

function readItems() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function writeItems(items) {
  ensureDataFile();
  fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2));
}

function validateItem(body) {
  const name = String(body.name ?? "").trim();
  const unit = String(body.unit ?? "").trim();
  const stock = Number(body.stock);

  if (!name) return "name is required";
  if (!unit) return "unit is required";
  if (!Number.isFinite(stock) || stock < 0) return "stock must be a number >= 0";
  return null;
}

// GET local-items
app.get("/local-items", (req, res) => {
  const items = readItems();
  res.json({ status: 1, data: items });
});

// POST local-items
app.post("/local-items", (req, res) => {
  const err = validateItem(req.body);
  if (err) return res.status(400).json({ status: 0, message: err });

  const items = readItems();
  const newItem = {
    id: crypto.randomUUID(),
    name: req.body.name.trim(),
    stock: Number(req.body.stock),
    unit: req.body.unit.trim(),
    source: "local",
    createdAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  writeItems(items);
  res.status(201).json({ status: 1, data: newItem });
});

// PUT local-items/:id
app.put("/local-items/:id", (req, res) => {
  const err = validateItem(req.body);
  if (err) return res.status(400).json({ status: 0, message: err });

  const items = readItems();
  const idx = items.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ status: 0, message: "not found" });

  items[idx] = {
    ...items[idx],
    name: req.body.name.trim(),
    stock: Number(req.body.stock),
    unit: req.body.unit.trim(),
    updatedAt: new Date().toISOString(),
  };
  writeItems(items);
  res.json({ status: 1, data: items[idx] });
});

// DELETE local-items/:id
app.delete("/local-items/:id", (req, res) => {
  const items = readItems();
  const next = items.filter((x) => x.id !== req.params.id);
  if (next.length === items.length) return res.status(404).json({ status: 0, message: "not found" });

  writeItems(next);
  res.json({ status: 1 });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
