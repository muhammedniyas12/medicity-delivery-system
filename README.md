# MEDICITY PHARMACEUTICAL HARIPAD
## Delivery Proof & Medicine Rate Master Management System

---

### 📁 Project Folder Structure

This application is cleanly separated into two distinct folders in the root directory:

```
├── backend/                  # Backend Application Server & Database Layer
│   ├── server.js             # Express application & API routing
│   ├── database.js           # SQLite3 database helper & schema management
│   ├── medicity.db           # SQLite database with 300+ full medicine catalog & deliveries
│   ├── package.json          # Backend package configuration & dependencies
│   └── scripts/              # Utility & data import scripts
│       ├── import_all_medicines.js
│       ├── import_full_catalog.js
│       ├── seed_catalog.js
│       ├── generate_samples.js
│       └── test_app.js
│
├── frontend/                 # Frontend User Interface & Static Assets
│   ├── views/                # EJS Web Page Templates
│   │   ├── admin-medicines.ejs    # Medicine rate master list & catalog
│   │   ├── admin-medicine-edit.ejs # Medicine create / edit form with live calculator
│   │   ├── index.ejs              # Worker dispatch / channel portal
│   │   ├── upload.ejs             # Delivery proof slip upload portal
│   │   ├── history.ejs            # Delivery history & filters
│   │   ├── view.ejs               # Individual delivery slip viewer & badge
│   │   ├── edit.ejs               # Delivery slip editor
│   │   └── login.ejs              # Dual-role authentication screen
│   └── public/               # Public Static Assets
│       ├── css/
│       │   └── style.css     # Premium UI theme & responsive styling
│       └── uploads/          # Uploaded signed delivery slips and medicine PDFs
│
├── package.json              # Root project launcher script
└── README.md                 # Documentation
```

---

### 🚀 Quick Start

From the root directory:

```bash
npm start
```
or run with auto-reload:
```bash
npm run dev
```

Or from the `backend/` directory:
```bash
cd backend
node server.js
```

Open your browser at: **[http://localhost:3000](http://localhost:3000)**

---

### 🔐 Login Credentials

| Role | Username | Password | Access |
|---|---|---|---|
| **Admin** | `admin` | `admin@medicity` | Full access: Medicine Rates Master, Price Calculations, Analytics, All Deliveries |
| **Staff / Worker** | `worker` | `worker@medicity` | Upload Delivery Proof Slips, Browse Channel Archives |
