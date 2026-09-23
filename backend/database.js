const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'medicity.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to medicity.db:', err.message);
  } else {
    console.log('Connected to SQLite database: medicity.db');
  }
});

// Initialize database schema
db.serialize(() => {
  // Deliveries Table
  db.run(`
    CREATE TABLE IF NOT EXISTS deliveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      delivery_date TEXT NOT NULL,
      service_type TEXT NOT NULL,
      hospital_name TEXT NOT NULL,
      order_number TEXT NOT NULL,
      signed_proof_path TEXT NOT NULL,
      created_by TEXT DEFAULT 'worker',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating deliveries table:', err.message);
    } else {
      console.log('Deliveries table initialized successfully.');
    }
  });

  // Medicines & Full Rate Master Table
  db.run(`
    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hsn_code TEXT,
      medicine_name TEXT NOT NULL,
      generic_name TEXT,
      category TEXT NOT NULL DEFAULT 'General',
      packing TEXT DEFAULT '10x10 Strips',
      company TEXT,
      batch_no TEXT,
      expiry_date TEXT,
      mfg_date TEXT,
      mrp REAL DEFAULT 0.0,
      quantity REAL DEFAULT 1.0,
      free_qty REAL DEFAULT 0.0,
      base_rate REAL NOT NULL DEFAULT 0.0,
      gst_percent REAL NOT NULL DEFAULT 12.0,
      tax_percent REAL NOT NULL DEFAULT 0.0,
      final_rate REAL NOT NULL DEFAULT 0.0,
      unit_pack TEXT,
      manufacturer TEXT,
      pdf_attachment_path TEXT,
      pdf_attachment_name TEXT,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating medicines table:', err.message);
    } else {
      console.log('Medicines table initialized successfully.');
    }
  });
});

/**
 * Deliveries Helper Functions
 */
function getDeliveries(filters = {}, callback) {
  let sql = 'SELECT * FROM deliveries WHERE 1=1';
  const params = [];

  if (filters.delivery_date) {
    sql += ' AND delivery_date = ?';
    params.push(filters.delivery_date);
  }

  if (filters.service_type && filters.service_type !== 'All') {
    sql += ' AND service_type = ?';
    params.push(filters.service_type);
  }

  if (filters.hospital_name && filters.hospital_name.trim() !== '') {
    sql += ' AND hospital_name LIKE ?';
    params.push(`%${filters.hospital_name.trim()}%`);
  }

  sql += ' ORDER BY delivery_date DESC, id DESC';

  db.all(sql, params, (err, rows) => {
    callback(err, rows);
  });
}

function getDeliveryById(id, callback) {
  db.get('SELECT * FROM deliveries WHERE id = ?', [id], (err, row) => {
    callback(err, row);
  });
}

function addDelivery(data, callback) {
  const sql = `
    INSERT INTO deliveries (delivery_date, service_type, hospital_name, order_number, signed_proof_path, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [
    data.delivery_date,
    data.service_type,
    data.hospital_name,
    data.order_number,
    data.signed_proof_path,
    data.created_by || 'worker'
  ];

  db.run(sql, params, function(err) {
    callback(err, this ? this.lastID : null);
  });
}

function deleteDelivery(id, callback) {
  db.get('SELECT signed_proof_path FROM deliveries WHERE id = ?', [id], (err, row) => {
    if (err) return callback(err);
    const proofPath = row ? row.signed_proof_path : null;

    db.run('DELETE FROM deliveries WHERE id = ?', [id], (err) => {
      callback(err, proofPath);
    });
  });
}

function getMetrics(callback) {
  const sql = `
    SELECT 
      COUNT(*) AS total,
      SUM(CASE WHEN delivery_date = DATE('now') OR delivery_date = CURRENT_DATE THEN 1 ELSE 0 END) AS today,
      SUM(CASE WHEN service_type LIKE '%Neethi%' THEN 1 ELSE 0 END) AS neethi,
      SUM(CASE WHEN service_type LIKE '%Supplyco%' THEN 1 ELSE 0 END) AS supplyco,
      SUM(CASE WHEN (service_type NOT LIKE '%Neethi%' AND service_type NOT LIKE '%Supplyco%') THEN 1 ELSE 0 END) AS other
    FROM deliveries
  `;
  db.get(sql, [], (err, row) => {
    callback(err, row || { total: 0, today: 0, neethi: 0, supplyco: 0, other: 0 });
  });
}

function updateDelivery(id, data, callback) {
  let sql;
  let params;

  if (data.signed_proof_path) {
    sql = `
      UPDATE deliveries 
      SET delivery_date = ?, service_type = ?, hospital_name = ?, order_number = ?, signed_proof_path = ?
      WHERE id = ?
    `;
    params = [
      data.delivery_date,
      data.service_type,
      data.hospital_name,
      data.order_number,
      data.signed_proof_path,
      id
    ];
  } else {
    sql = `
      UPDATE deliveries 
      SET delivery_date = ?, service_type = ?, hospital_name = ?, order_number = ?
      WHERE id = ?
    `;
    params = [
      data.delivery_date,
      data.service_type,
      data.hospital_name,
      data.order_number,
      id
    ];
  }

  db.run(sql, params, function(err) {
    callback(err, this ? this.changes : 0);
  });
}

/**
 * =========================================================
 * FULL MEDICINES & RATE MASTER (ADMIN CONTROL)
 * =========================================================
 */

function calculateFinalRate(baseRate, gstPercent, taxPercent) {
  const base = parseFloat(baseRate) || 0;
  const gst = parseFloat(gstPercent) || 0;
  const tax = parseFloat(taxPercent) || 0;
  const gstAmount = (base * gst) / 100;
  const taxAmount = (base * tax) / 100;
  return parseFloat((base + gstAmount + taxAmount).toFixed(2));
}

function getMedicines(filters = {}, callback) {
  let sql = 'SELECT * FROM medicines WHERE 1=1';
  const params = [];

  if (filters.search && filters.search.trim() !== '') {
    sql += ' AND (medicine_name LIKE ? OR generic_name LIKE ? OR company LIKE ? OR manufacturer LIKE ? OR hsn_code LIKE ? OR batch_no LIKE ?)';
    const term = `%${filters.search.trim()}%`;
    params.push(term, term, term, term, term, term);
  }

  if (filters.category && filters.category !== 'All') {
    sql += ' AND category = ?';
    params.push(filters.category);
  }

  sql += ' ORDER BY medicine_name ASC';

  db.all(sql, params, (err, rows) => {
    callback(err, rows);
  });
}

function getMedicineById(id, callback) {
  db.get('SELECT * FROM medicines WHERE id = ?', [id], (err, row) => {
    callback(err, row);
  });
}

function addMedicine(data, callback) {
  const baseRate = parseFloat(data.base_rate) || 0;
  const gstPercent = parseFloat(data.gst_percent) || 0;
  const taxPercent = parseFloat(data.tax_percent) || 0;
  const finalRate = calculateFinalRate(baseRate, gstPercent, taxPercent);

  const sql = `
    INSERT INTO medicines (
      hsn_code, medicine_name, generic_name, category, packing, company, batch_no, expiry_date, mfg_date,
      mrp, quantity, free_qty, base_rate, gst_percent, tax_percent, final_rate, unit_pack, manufacturer,
      pdf_attachment_path, pdf_attachment_name, remarks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    data.hsn_code || '',
    data.medicine_name.trim(),
    (data.generic_name || '').trim(),
    data.category || 'General',
    data.packing || '10x10 Strips',
    (data.company || data.manufacturer || '').trim(),
    (data.batch_no || '').trim(),
    data.expiry_date || '',
    data.mfg_date || '',
    parseFloat(data.mrp) || 0,
    parseFloat(data.quantity) || 1,
    parseFloat(data.free_qty) || 0,
    baseRate,
    gstPercent,
    taxPercent,
    finalRate,
    data.packing || '10x10 Strips',
    (data.company || data.manufacturer || '').trim(),
    data.pdf_attachment_path || null,
    data.pdf_attachment_name || null,
    (data.remarks || '').trim()
  ];

  db.run(sql, params, function(err) {
    callback(err, this ? this.lastID : null);
  });
}

function updateMedicine(id, data, callback) {
  const baseRate = parseFloat(data.base_rate) || 0;
  const gstPercent = parseFloat(data.gst_percent) || 0;
  const taxPercent = parseFloat(data.tax_percent) || 0;
  const finalRate = calculateFinalRate(baseRate, gstPercent, taxPercent);

  let sql;
  let params;

  if (data.pdf_attachment_path !== undefined) {
    sql = `
      UPDATE medicines
      SET hsn_code = ?, medicine_name = ?, generic_name = ?, category = ?, packing = ?, company = ?,
          batch_no = ?, expiry_date = ?, mfg_date = ?, mrp = ?, quantity = ?, free_qty = ?,
          base_rate = ?, gst_percent = ?, tax_percent = ?, final_rate = ?, unit_pack = ?, manufacturer = ?,
          pdf_attachment_path = ?, pdf_attachment_name = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    params = [
      data.hsn_code || '',
      data.medicine_name.trim(),
      (data.generic_name || '').trim(),
      data.category || 'General',
      data.packing || '10x10 Strips',
      (data.company || data.manufacturer || '').trim(),
      (data.batch_no || '').trim(),
      data.expiry_date || '',
      data.mfg_date || '',
      parseFloat(data.mrp) || 0,
      parseFloat(data.quantity) || 1,
      parseFloat(data.free_qty) || 0,
      baseRate,
      gstPercent,
      taxPercent,
      finalRate,
      data.packing || '10x10 Strips',
      (data.company || data.manufacturer || '').trim(),
      data.pdf_attachment_path,
      data.pdf_attachment_name,
      (data.remarks || '').trim(),
      id
    ];
  } else {
    sql = `
      UPDATE medicines
      SET hsn_code = ?, medicine_name = ?, generic_name = ?, category = ?, packing = ?, company = ?,
          batch_no = ?, expiry_date = ?, mfg_date = ?, mrp = ?, quantity = ?, free_qty = ?,
          base_rate = ?, gst_percent = ?, tax_percent = ?, final_rate = ?, unit_pack = ?, manufacturer = ?,
          remarks = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    params = [
      data.hsn_code || '',
      data.medicine_name.trim(),
      (data.generic_name || '').trim(),
      data.category || 'General',
      data.packing || '10x10 Strips',
      (data.company || data.manufacturer || '').trim(),
      (data.batch_no || '').trim(),
      data.expiry_date || '',
      data.mfg_date || '',
      parseFloat(data.mrp) || 0,
      parseFloat(data.quantity) || 1,
      parseFloat(data.free_qty) || 0,
      baseRate,
      gstPercent,
      taxPercent,
      finalRate,
      data.packing || '10x10 Strips',
      (data.company || data.manufacturer || '').trim(),
      (data.remarks || '').trim(),
      id
    ];
  }

  db.run(sql, params, function(err) {
    callback(err, this ? this.changes : 0);
  });
}

function deleteMedicine(id, callback) {
  db.get('SELECT pdf_attachment_path FROM medicines WHERE id = ?', [id], (err, row) => {
    if (err) return callback(err);
    const pdfPath = row ? row.pdf_attachment_path : null;

    db.run('DELETE FROM medicines WHERE id = ?', [id], (err) => {
      callback(err, pdfPath);
    });
  });
}

function getMedicineStats(callback) {
  const sql = `
    SELECT 
      COUNT(*) AS total_medicines,
      AVG(base_rate) AS avg_base_rate,
      AVG(final_rate) AS avg_final_rate,
      AVG(gst_percent) AS avg_gst,
      SUM(quantity) AS total_qty,
      COUNT(DISTINCT category) AS total_categories,
      SUM(CASE WHEN pdf_attachment_path IS NOT NULL AND pdf_attachment_path != '' THEN 1 ELSE 0 END) AS pdf_count
    FROM medicines
  `;
  db.get(sql, [], (err, row) => {
    callback(err, row || { total_medicines: 0, avg_base_rate: 0, avg_final_rate: 0, avg_gst: 12, total_qty: 0, total_categories: 0, pdf_count: 0 });
  });
}

module.exports = {
  db,
  getDeliveries,
  getDeliveryById,
  addDelivery,
  updateDelivery,
  deleteDelivery,
  getMetrics,
  getMedicines,
  getMedicineById,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getMedicineStats,
  calculateFinalRate
};
