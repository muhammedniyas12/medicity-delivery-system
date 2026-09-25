const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Paths configuration for frontend assets & views
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const PUBLIC_DIR = path.join(FRONTEND_DIR, 'public');
const VIEWS_DIR = path.join(FRONTEND_DIR, 'views');
const uploadsDir = path.join(PUBLIC_DIR, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Setup for Slips and Medicine PDFs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '';
    const isPdf = file.mimetype === 'application/pdf' || ext.toLowerCase() === '.pdf';
    const prefix = isPdf ? 'med-doc-' : 'proof-';
    cb(null, prefix + uniqueSuffix + ext);
  }
});

// Multer File Filter allowing Images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/jpg'];
  const allowedDocTypes = ['application/pdf'];

  if (allowedImageTypes.includes(file.mimetype) || allowedDocTypes.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp|svg|pdf)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only Image files (JPG, PNG, WEBP) and PDF documents are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 35 * 1024 * 1024 } // 35MB limit
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(PUBLIC_DIR));

// Set View Engine
app.set('view engine', 'ejs');
app.set('views', VIEWS_DIR);

/**
 * Cookie parsing helper
 */
function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name ? name.trim() : '';
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

/**
 * Get currently authenticated session user
 */
function getSessionUser(req) {
  const cookies = parseCookies(req);
  const sessionToken = cookies['medicity_session_user'];

  if (sessionToken) {
    try {
      const decoded = JSON.parse(Buffer.from(sessionToken, 'base64').toString('utf-8'));
      if (decoded && decoded.role && decoded.username) {
        return decoded;
      }
    } catch (e) {
      // Fallback
    }
  }

  // Legacy fallback
  if (cookies['medicity_session'] === 'authenticated_medicity_staff') {
    return { username: 'medicity', role: 'admin', displayName: 'Medicity Staff (Admin)' };
  }

  return null;
}

/**
 * Authentication Middleware: Any logged in user (Admin or Worker)
 */
function requireAuth(req, res, next) {
  const user = getSessionUser(req);
  if (user) {
    req.user = user;
    res.locals.currentUser = user;
    return next();
  }
  return res.redirect('/login');
}

/**
 * Admin Authentication Middleware: Admin Only
 */
function requireAdmin(req, res, next) {
  const user = getSessionUser(req);
  if (user && user.role === 'admin') {
    req.user = user;
    res.locals.currentUser = user;
    return next();
  }
  if (user && user.role === 'worker') {
    return res.redirect('/?error=' + encodeURIComponent('Access Restricted: Medicine Rate Master is reserved for Administrator access.'));
  }
  return res.redirect('/login?tab=admin');
}

/**
 * GET /login : Dual-Role Login Page (Admin & Worker)
 */
app.get('/login', (req, res) => {
  const user = getSessionUser(req);
  if (user) {
    return res.redirect('/');
  }

  const activeTab = req.query.tab === 'admin' ? 'admin' : 'worker';

  res.render('login', {
    activeTab: activeTab,
    error: req.query.error || null,
    message: req.query.msg || null
  });
});

/**
 * POST /login : Process Authentication for Admin & Worker
 */
app.post('/login', (req, res) => {
  const { username, password, login_role } = req.body;
  const role = login_role || 'worker';

  let authenticatedUser = null;

  // Admin Verification
  if (role === 'admin') {
    const validAdminUsers = ['admin', 'medicity_admin', 'director'];
    const validAdminPass = ['admin@9447', 'admin@medicity', 'admin123', 'admin', 'medicity123'];

    if (validAdminUsers.includes((username || '').trim().toLowerCase()) && validAdminPass.includes((password || '').trim())) {
      authenticatedUser = {
        username: username.trim(),
        role: 'admin',
        displayName: 'Administrator (Master)',
        badge: 'Admin & Rate Manager'
      };
    }
  } else {
    // Worker / Delivery Staff Verification (Username: staff, Password: staff1212)
    const validWorkerUsers = ['staff', 'worker', 'medicity', 'delivery', 'agent'];
    const validWorkerPass = ['staff1212', 'staff 1212', 'staff@1212', 'worker 1212', 'worker1212', 'worker@medicity', 'worker123', '121212', 'medicity', 'worker'];

    if (validWorkerUsers.includes((username || '').trim().toLowerCase()) && validWorkerPass.includes((password || '').trim())) {
      authenticatedUser = {
        username: username.trim(),
        role: 'worker',
        displayName: 'Delivery Staff (Worker)',
        badge: 'Delivery Proof Entry'
      };
    }
  }

  if (authenticatedUser) {
    const token = Buffer.from(JSON.stringify(authenticatedUser)).toString('base64');
    res.setHeader('Set-Cookie', [
      `medicity_session_user=${token}; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax`,
      `medicity_session=authenticated_medicity_staff; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax`
    ]);

    if (authenticatedUser.role === 'admin') {
      return res.redirect('/?msg=' + encodeURIComponent('Welcome Administrator! You have full control of Medicine Details, Rates, and Slips.'));
    } else {
      return res.redirect('/?msg=' + encodeURIComponent('Welcome Staff! Ready to record and view delivery slips.'));
    }
  }

  return res.redirect(`/login?tab=${role}&error=` + encodeURIComponent(`Invalid ${role === 'admin' ? 'Admin' : 'Worker'} credentials. Please try again.`));
});

/**
 * GET /logout : Sign Out
 */
app.get('/logout', (req, res) => {
  res.setHeader('Set-Cookie', [
    'medicity_session_user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'medicity_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  ]);
  res.redirect('/login?msg=' + encodeURIComponent('You have been signed out successfully.'));
});

/**
 * Channel metadata configurations
 */
const CHANNEL_CONFIGS = {
  neethi: {
    name: 'NEETHI',
    title: 'Neethi Store - Signed Delivery Slip Entry',
    subtitle: 'Kerala State Co-operative Neethi & Karunya Fair Price Stores',
    serviceType: 'Neethi Store',
    accentColor: '#0f766e',
    bgLight: '#ccfbf1',
    icon: 'ri-store-2-fill',
    locationLabel: 'Delivered Neethi Store Branch or Delivered Hospital Name',
    locationPlaceholder: 'e.g. Neethi Medical Store, Haripad / Taluk Hospital',
    orderLabel: 'Medicity Invoice Number',
    orderPlaceholder: 'e.g. MED-INV-8821'
  },
  supplyco: {
    name: 'SUPPLYCO',
    title: 'Supplyco - Signed Delivery Slip Entry',
    subtitle: 'Kerala State Civil Supplies Corporation Medical Distribution',
    serviceType: 'Supplyco',
    accentColor: '#0284c7',
    bgLight: '#e0f2fe',
    icon: 'ri-shopping-cart-2-fill',
    locationLabel: 'Delivered Neethi Store Branch or Delivered Hospital Name',
    locationPlaceholder: 'e.g. Supplyco People\'s Pharmacy, Haripad / Govt Hospital',
    orderLabel: 'Medicity Invoice Number',
    orderPlaceholder: 'e.g. MED-INV-4091'
  },
  others: {
    name: 'OTHERS',
    title: 'Government Hospitals & Other Delivery Slip Entry',
    subtitle: 'Taluk HQ Hospitals, Medical College, PHC, CHC & Other Institutional Orders',
    serviceType: 'Direct Govt Order',
    accentColor: '#7c3aed',
    bgLight: '#f3e8ff',
    icon: 'ri-hospital-fill',
    locationLabel: 'Delivered Neethi Store Branch or Delivered Hospital Name',
    locationPlaceholder: 'e.g. Taluk Headquarter Hospital, Haripad',
    orderLabel: 'Medicity Invoice Number',
    orderPlaceholder: 'e.g. MED-INV-1049'
  }
};

/**
 * GET / : Second Page (Wholesale Shop Dashboard with Role Adaptation)
 */
app.get('/', requireAuth, (req, res) => {
  const filters = {
    delivery_date: req.query.delivery_date || '',
    service_type: req.query.service_type || 'All',
    hospital_name: req.query.hospital_name || ''
  };

  db.getMetrics((err, metrics) => {
    if (err) console.error('Error getting metrics:', err);

    db.getDeliveries(filters, (err, deliveries) => {
      if (err) {
        console.error('Error fetching deliveries:', err);
        return res.status(500).send('Database error fetching delivery records.');
      }

      db.getMedicineStats((mErr, medStats) => {
        const todayDate = new Date().toISOString().split('T')[0];

        res.render('index', {
          currentUser: req.user,
          deliveries: deliveries || [],
          metrics: metrics || { total: 0, today: 0, neethi: 0, supplyco: 0, other: 0 },
          medStats: medStats || { total_medicines: 0, avg_base_rate: 0, avg_final_rate: 0, avg_gst: 12, total_qty: 0, total_categories: 0, pdf_count: 0 },
          filters: filters,
          todayDate: todayDate,
          message: req.query.msg || null,
          error: req.query.error || null
        });
      });
    });
  });
});

/**
 * =========================================================
 * ADMIN MEDICINE & RATE MASTER ROUTES
 * =========================================================
 */

/**
 * GET /admin/medicines : Medicine Rate Master Catalog (Admin Only)
 */
app.get('/admin/medicines', requireAdmin, (req, res) => {
  const filters = {
    search: req.query.search || '',
    category: req.query.category || 'All'
  };

  db.getMedicines(filters, (err, medicines) => {
    if (err) {
      console.error('Error fetching medicines:', err);
      return res.status(500).send('Database error fetching medicines.');
    }

    db.getMedicineStats((sErr, stats) => {
      res.render('admin-medicines', {
        currentUser: req.user,
        medicines: medicines || [],
        stats: stats || { total_medicines: 0, avg_base_rate: 0, avg_final_rate: 0, avg_gst: 12, total_qty: 0, total_categories: 0, pdf_count: 0 },
        filters: filters,
        message: req.query.msg || null,
        error: req.query.error || null
      });
    });
  });
});

/**
 * POST /admin/medicines : Add New Medicine with Full Details (HSN, Particulars, Packing, Company, Batch, Expiry, MFG, MRP, Qty, Free, Rate, GST, Tax, Net Rate, PDF)
 */
app.post('/admin/medicines', requireAdmin, upload.single('pdf_attachment'), (req, res) => {
  const {
    hsn_code,
    medicine_name,
    generic_name,
    category,
    packing,
    company,
    batch_no,
    expiry_date,
    mfg_date,
    mrp,
    quantity,
    free_qty,
    base_rate,
    gst_percent,
    tax_percent,
    remarks
  } = req.body;

  if (!medicine_name || base_rate === undefined || base_rate === '') {
    return res.redirect('/admin/medicines?error=' + encodeURIComponent('Particulars (Medicine Name) and Rate are required fields.'));
  }

  const pdf_attachment_path = req.file ? '/uploads/' + req.file.filename : null;
  const pdf_attachment_name = req.file ? req.file.originalname : null;

  db.addMedicine({
    hsn_code: (hsn_code || '').trim(),
    medicine_name: medicine_name.trim(),
    generic_name: (generic_name || '').trim(),
    category: category || 'General',
    packing: (packing || '').trim(),
    company: (company || '').trim(),
    batch_no: (batch_no || '').trim(),
    expiry_date: (expiry_date || '').trim(),
    mfg_date: (mfg_date || '').trim(),
    mrp: parseFloat(mrp) || 0,
    quantity: parseFloat(quantity) || 1,
    free_qty: parseFloat(free_qty) || 0,
    base_rate: parseFloat(base_rate) || 0,
    gst_percent: parseFloat(gst_percent) || 0,
    tax_percent: parseFloat(tax_percent) || 0,
    pdf_attachment_path,
    pdf_attachment_name,
    remarks: (remarks || '').trim()
  }, (err, newId) => {
    if (err) {
      console.error('Error adding medicine:', err);
      return res.redirect('/admin/medicines?error=' + encodeURIComponent('Failed to save medicine to rate master.'));
    }

    res.redirect('/admin/medicines?msg=' + encodeURIComponent(`Medicine "${medicine_name}" added to Rate Master with Net Rate calculated!`));
  });
});

/**
 * GET /admin/medicines/:id/edit : Edit Full Medicine Details & Rates Page (Admin can edit whenever they want)
 */
app.get('/admin/medicines/:id/edit', requireAdmin, (req, res) => {
  const id = req.params.id;

  db.getMedicineById(id, (err, medicine) => {
    if (err || !medicine) {
      return res.redirect('/admin/medicines?error=' + encodeURIComponent('Medicine record not found.'));
    }

    res.render('admin-medicine-edit', {
      currentUser: req.user,
      medicine: medicine,
      message: req.query.msg || null,
      error: req.query.error || null
    });
  });
});

/**
 * POST /admin/medicines/:id/edit : Process Full Medicine Updates & PDF Replacement
 */
app.post('/admin/medicines/:id/edit', requireAdmin, upload.single('pdf_attachment'), (req, res) => {
  const id = req.params.id;
  const {
    hsn_code,
    medicine_name,
    generic_name,
    category,
    packing,
    company,
    batch_no,
    expiry_date,
    mfg_date,
    mrp,
    quantity,
    free_qty,
    base_rate,
    gst_percent,
    tax_percent,
    remarks,
    remove_pdf
  } = req.body;

  if (!medicine_name || base_rate === undefined || base_rate === '') {
    return res.redirect(`/admin/medicines/${id}/edit?error=` + encodeURIComponent('Particulars (Medicine Name) and Rate are required fields.'));
  }

  db.getMedicineById(id, (err, existing) => {
    if (err || !existing) {
      return res.redirect('/admin/medicines?error=' + encodeURIComponent('Medicine not found for update.'));
    }

    const updateData = {
      hsn_code: (hsn_code || '').trim(),
      medicine_name: medicine_name.trim(),
      generic_name: (generic_name || '').trim(),
      category: category || 'General',
      packing: (packing || '').trim(),
      company: (company || '').trim(),
      batch_no: (batch_no || '').trim(),
      expiry_date: (expiry_date || '').trim(),
      mfg_date: (mfg_date || '').trim(),
      mrp: parseFloat(mrp) || 0,
      quantity: parseFloat(quantity) || 1,
      free_qty: parseFloat(free_qty) || 0,
      base_rate: parseFloat(base_rate) || 0,
      gst_percent: parseFloat(gst_percent) || 0,
      tax_percent: parseFloat(tax_percent) || 0,
      remarks: (remarks || '').trim()
    };

    if (req.file) {
      updateData.pdf_attachment_path = '/uploads/' + req.file.filename;
      updateData.pdf_attachment_name = req.file.originalname;

      // Delete old PDF file if existed
      if (existing.pdf_attachment_path) {
        const oldPdfPath = path.join(__dirname, 'public', existing.pdf_attachment_path);
        if (fs.existsSync(oldPdfPath)) {
          fs.unlink(oldPdfPath, (unlinkErr) => {
            if (unlinkErr) console.error('Error removing old medicine PDF:', unlinkErr);
          });
        }
      }
    } else if (remove_pdf === '1') {
      updateData.pdf_attachment_path = null;
      updateData.pdf_attachment_name = null;

      if (existing.pdf_attachment_path) {
        const oldPdfPath = path.join(__dirname, 'public', existing.pdf_attachment_path);
        if (fs.existsSync(oldPdfPath)) {
          fs.unlink(oldPdfPath, (unlinkErr) => {
            if (unlinkErr) console.error('Error removing detached PDF:', unlinkErr);
          });
        }
      }
    }

    db.updateMedicine(id, updateData, (updateErr) => {
      if (updateErr) {
        console.error('Error updating medicine:', updateErr);
        return res.redirect(`/admin/medicines/${id}/edit?error=` + encodeURIComponent('Failed to update medicine details in database.'));
      }

      res.redirect('/admin/medicines?msg=' + encodeURIComponent(`Medicine "${medicine_name}" details, rates & batch info updated successfully!`));
    });
  });
});

/**
 * POST /admin/medicines/:id/delete : Delete Medicine Entry
 */
app.post('/admin/medicines/:id/delete', requireAdmin, (req, res) => {
  const id = req.params.id;

  db.deleteMedicine(id, (err, pdfPath) => {
    if (err) {
      console.error('Error deleting medicine:', err);
      return res.redirect('/admin/medicines?error=' + encodeURIComponent('Failed to delete medicine record.'));
    }

    if (pdfPath) {
      const fullPdfPath = path.join(PUBLIC_DIR, pdfPath);
      if (fs.existsSync(fullPdfPath)) {
        fs.unlink(fullPdfPath, (unlinkErr) => {
          if (unlinkErr) console.error('Error removing deleted medicine PDF:', unlinkErr);
        });
      }
    }

    res.redirect('/admin/medicines?msg=' + encodeURIComponent('Medicine record deleted from rate master.'));
  });
});

/**
 * =========================================================
 * DELIVERY SLIP ENTRY & ARCHIVE ROUTES (WORKERS & ADMIN)
 * =========================================================
 */

app.get('/upload/:channel', requireAuth, (req, res) => {
  const channelKey = (req.params.channel || '').toLowerCase();
  const channelInfo = CHANNEL_CONFIGS[channelKey];

  if (!channelInfo) {
    return res.redirect('/');
  }

  const todayDate = new Date().toISOString().split('T')[0];

  res.render('upload', {
    currentUser: req.user,
    channelKey: channelKey,
    channelInfo: channelInfo,
    todayDate: todayDate,
    message: req.query.msg || null,
    error: req.query.error || null
  });
});

app.get('/history', requireAuth, (req, res) => {
  const filters = {
    delivery_date: req.query.delivery_date || '',
    service_type: req.query.service_type || 'All',
    hospital_name: req.query.hospital_name || ''
  };

  db.getMetrics((err, metrics) => {
    if (err) console.error('Error getting metrics:', err);

    db.getDeliveries(filters, (err, deliveries) => {
      if (err) {
        console.error('Error fetching deliveries:', err);
        return res.status(500).send('Database error fetching delivery records.');
      }

      res.render('history', {
        currentUser: req.user,
        deliveries: deliveries || [],
        metrics: metrics || { total: 0, today: 0, neethi: 0, supplyco: 0, other: 0 },
        filters: filters,
        message: req.query.msg || null,
        error: req.query.error || null
      });
    });
  });
});

app.post('/deliveries', requireAuth, upload.single('signed_proof'), (req, res) => {
  const { delivery_date, service_type, hospital_name, order_number, delivery_boy, return_channel } = req.body;

  if (!delivery_date || !service_type || !hospital_name || !order_number) {
    const redirectUrl = return_channel ? `/upload/${return_channel}` : '/';
    return res.redirect(`${redirectUrl}?error=` + encodeURIComponent('All fields (Date, Hospital Name, and Order Number) are required.'));
  }

  if (!req.file) {
    const redirectUrl = return_channel ? `/upload/${return_channel}` : '/';
    return res.redirect(`${redirectUrl}?error=` + encodeURIComponent('Please upload or snap a photo of the signed delivery paper slip.'));
  }

  const signed_proof_path = '/uploads/' + req.file.filename;
  const deliveryBoyName = (delivery_boy || (req.user ? (req.user.displayName || req.user.username) : 'Medicity Staff')).trim();

  db.addDelivery({
    delivery_date,
    service_type,
    hospital_name,
    order_number,
    delivery_boy: deliveryBoyName,
    signed_proof_path,
    created_by: req.user ? req.user.username : 'worker'
  }, (err, newId) => {
    if (err) {
      console.error('Error adding delivery record:', err);
      return res.redirect('/?error=' + encodeURIComponent('Failed to save delivery proof record to database.'));
    }

    res.redirect('/history?msg=' + encodeURIComponent(`Signed delivery proof slip for ${service_type} (${order_number}) recorded successfully by ${deliveryBoyName}!`));
  });
});

app.get('/deliveries/:id', requireAuth, (req, res) => {
  const id = req.params.id;

  db.getDeliveryById(id, (err, delivery) => {
    if (err || !delivery) {
      return res.status(404).render('view', { currentUser: req.user, delivery: null, error: 'Delivery record not found.' });
    }

    res.render('view', { 
      currentUser: req.user,
      delivery: delivery, 
      message: req.query.msg || null,
      error: req.query.error || null 
    });
  });
});

app.get('/deliveries/:id/edit', requireAuth, (req, res) => {
  const id = req.params.id;

  db.getDeliveryById(id, (err, delivery) => {
    if (err || !delivery) {
      return res.status(404).render('view', { currentUser: req.user, delivery: null, error: 'Delivery record not found.' });
    }

    res.render('edit', { 
      currentUser: req.user,
      delivery: delivery, 
      error: req.query.error || null 
    });
  });
});

app.post('/deliveries/:id/edit', requireAuth, upload.single('signed_proof'), (req, res) => {
  const id = req.params.id;
  const { delivery_date, service_type, hospital_name, order_number, delivery_boy } = req.body;

  if (!delivery_date || !service_type || !hospital_name || !order_number) {
    return res.redirect(`/deliveries/${id}/edit?error=` + encodeURIComponent('All fields (Date, Service Channel, Hospital Name, and Order Number) are required.'));
  }

  db.getDeliveryById(id, (err, existing) => {
    if (err || !existing) {
      return res.redirect('/history?error=' + encodeURIComponent('Delivery record not found for update.'));
    }

    const updateData = {
      delivery_date,
      service_type,
      hospital_name,
      order_number,
      delivery_boy: (delivery_boy || existing.delivery_boy || 'Medicity Staff').trim()
    };

    if (req.file) {
      updateData.signed_proof_path = '/uploads/' + req.file.filename;

      if (existing.signed_proof_path && !existing.signed_proof_path.includes('sample_slip_')) {
        const oldPath = path.join(PUBLIC_DIR, existing.signed_proof_path);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (unlinkErr) => {
            if (unlinkErr) console.error('Error removing old slip photo:', unlinkErr);
          });
        }
      }
    }

    db.updateDelivery(id, updateData, (updateErr) => {
      if (updateErr) {
        console.error('Error updating delivery record:', updateErr);
        return res.redirect(`/deliveries/${id}/edit?error=` + encodeURIComponent('Failed to update delivery slip details in database.'));
      }

      res.redirect(`/deliveries/${id}?msg=` + encodeURIComponent(`Slip #${id} details and photo updated successfully!`));
    });
  });
});

app.post('/deliveries/:id/delete', requireAuth, (req, res) => {
  const id = req.params.id;

  db.deleteDelivery(id, (err, proofPath) => {
    if (err) {
      console.error('Error deleting record:', err);
      return res.redirect('/history?error=' + encodeURIComponent('Failed to delete delivery record.'));
    }

    if (proofPath && !proofPath.includes('sample_slip_')) {
      const fullPath = path.join(PUBLIC_DIR, proofPath);
      if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (unlinkErr) => {
          if (unlinkErr) console.error('Error removing slip file:', unlinkErr);
        });
      }
    }

    res.redirect('/history?msg=' + encodeURIComponent('Delivery proof slip deleted successfully.'));
  });
});

// Error handling middleware for Multer errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.redirect('/?error=' + encodeURIComponent('Upload Error: ' + err.message));
  } else if (err) {
    return res.redirect('/?error=' + encodeURIComponent(err.message));
  }
  next();
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`MEDICITY PHARMACEUTICAL HARIPAD - RATE MASTER ACTIVE`);
  console.log(`Server is running at: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
