const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'medicity.db');
const db = new sqlite3.Database(dbPath);

const fullCatalog = [
  {
    name: 'ELSARTAN-H TAB (Telmisartan + Hydrochlorothiazide)',
    generic: 'Telmisartan 40mg + Hydrochlorothiazide 12.5mg',
    category: 'Cardiovascular',
    base: 28.50,
    gst: 12.0,
    tax: 0.0,
    unit: '10x10 Strips',
    hsn: '30049069',
    mfg: 'ANCHOR PHARMA / MEDISUM',
    pdf_path: '/uploads/sample_rate_sheet_neethi.pdf',
    pdf_name: 'NEETHI-RATE-ELSARTAN-H.pdf',
    remarks: 'Neethi Quotation Rate & Hospital supply'
  },
  {
    name: 'DIBONATE-500 TAB (Metformin Hydrochloride)',
    generic: 'Metformin HCl 500mg Sustained Release',
    category: 'Anti-Diabetic',
    base: 14.20,
    gst: 12.0,
    tax: 0.0,
    unit: '10x10 Blister',
    hsn: '30049032',
    mfg: 'MEDIBEST PHARMA',
    pdf_path: '/uploads/sample_rate_sheet_neethi.pdf',
    pdf_name: 'DIBONATE-SPEC-SHEET.pdf',
    remarks: 'Kerala State Supplyco Fair Price Item'
  },
  {
    name: 'MULTIMIN TAB (Multivitamin + Minerals)',
    generic: 'Essential Vitamins, Zinc, Calcium & Trace Minerals',
    category: 'Nutraceuticals & Vitamins',
    base: 34.00,
    gst: 18.0,
    tax: 0.0,
    unit: '10x10 Strips',
    hsn: '30045039',
    mfg: 'MEDISMITH FORMULATIONS',
    pdf_path: '/uploads/sample_quotation_govthospital.pdf',
    pdf_name: 'MULTIMIN-QUOTATION.pdf',
    remarks: 'Approved Govt Institutional Rate'
  },
  {
    name: 'HYDROXYQUINE-200 TAB',
    generic: 'Hydroxychloroquine Sulfate IP 200mg',
    category: 'Analgesics & Antipyretic',
    base: 48.00,
    gst: 12.0,
    tax: 0.0,
    unit: '10x10 Strip',
    hsn: '30049056',
    mfg: 'KSDP (Kerala State Drugs & Pharmaceuticals)',
    pdf_path: '/uploads/sample_quotation_govthospital.pdf',
    pdf_name: 'KSDP-HYDROXYQUINE-RATE.pdf',
    remarks: 'Essential Drug List (EDL) Item'
  },
  {
    name: 'SALBUTAMOL-4MG TAB',
    generic: 'Salbutamol Sulphate IP 4mg',
    category: 'Respiratory & Anti-Asthma',
    base: 8.50,
    gst: 12.0,
    tax: 0.0,
    unit: '10x10 Strips',
    hsn: '30049086',
    mfg: 'CIPLA PHARMACEUTICALS',
    pdf_path: null,
    pdf_name: null,
    remarks: 'Standard PHC & Taluk Hospital supply'
  },
  {
    name: 'VINBION FORTE (VIT B1+B6+B12 TAB)',
    generic: 'Thiamine + Pyridoxine + Cyanocobalamin',
    category: 'Nutraceuticals & Vitamins',
    base: 22.00,
    gst: 18.0,
    tax: 0.0,
    unit: '10x10 Strips',
    hsn: '30049086',
    mfg: 'PCI PHARMA',
    pdf_path: '/uploads/sample_rate_sheet_neethi.pdf',
    pdf_name: 'VINBION-NEETHI-RATE.pdf',
    remarks: 'High potency neurotropic B-Complex'
  },
  {
    name: 'BECOTAB TAB (B-Complex Vitamin)',
    generic: 'Vitamin B Complex with L-Lysine',
    category: 'Nutraceuticals & Vitamins',
    base: 12.00,
    gst: 18.0,
    tax: 0.0,
    unit: '10x10 Strips',
    hsn: '30049086',
    mfg: 'MEDISMITH HARIPAD',
    pdf_path: null,
    pdf_name: null,
    remarks: 'Standard Fair Price item'
  },
  {
    name: 'SPIROLACT 50 TAB',
    generic: 'Spironolactone IP 50mg',
    category: 'Cardiovascular',
    base: 45.00,
    gst: 12.0,
    tax: 0.0,
    unit: '10x10 Strips',
    hsn: '30049062',
    mfg: 'INDOCO REMEDIES',
    pdf_path: null,
    pdf_name: null,
    remarks: 'Aldosterone antagonist diuretic'
  },
  {
    name: 'FLUMOL-500 TAB (Paracetamol 500mg)',
    generic: 'Paracetamol IP 500mg',
    category: 'Analgesics & Antipyretic',
    base: 15.00,
    gst: 12.0,
    tax: 0.0,
    unit: '10x10 Blister',
    hsn: '30049060',
    mfg: 'MEDISMITH FORMULATIONS',
    pdf_path: '/uploads/sample_rate_sheet_neethi.pdf',
    pdf_name: 'FLUMOL-500-RATE.pdf',
    remarks: 'Primary analgesic delivery item'
  },
  {
    name: 'FLUMOL-650 TAB (Paracetamol 650mg)',
    generic: 'Paracetamol IP 650mg Fast-Action',
    category: 'Analgesics & Antipyretic',
    base: 19.50,
    gst: 12.0,
    tax: 0.0,
    unit: '10x10 Blister',
    hsn: '30049060',
    mfg: 'MEDISMITH FORMULATIONS',
    pdf_path: '/uploads/sample_rate_sheet_neethi.pdf',
    pdf_name: 'FLUMOL-650-NEETHI.pdf',
    remarks: 'Bulk Quotation Rate for Neethi & Supplyco'
  },
  {
    name: 'ANPIRIDE-2MG TAB (Glimepiride)',
    generic: 'Glimepiride IP 2mg',
    category: 'Anti-Diabetic',
    base: 24.00,
    gst: 12.0,
    tax: 0.0,
    unit: '10x10 Strips',
    hsn: '30049099',
    mfg: 'ANCHOR-ANMISART PHARMA',
    pdf_path: null,
    pdf_name: null,
    remarks: 'Oral hypoglycemic formulation'
  },
  {
    name: 'DAPAGLIFLOZIN-10MG TAB',
    generic: 'Dapagliflozin Propanediol Monohydrate 10mg',
    category: 'Anti-Diabetic',
    base: 65.00,
    gst: 12.0,
    tax: 0.0,
    unit: '1x10 Alu-Alu Strip',
    hsn: '30049099',
    mfg: 'HEALING PHARMA',
    pdf_path: '/uploads/sample_quotation_govthospital.pdf',
    pdf_name: 'DAPAGLIFLOZIN-SPECIAL-RATE.pdf',
    remarks: 'SGLT2 Inhibitor for Diabetic Care'
  },
  {
    name: 'HISTAC-150 TAB (Ranitidine)',
    generic: 'Ranitidine Hydrochloride IP 150mg',
    category: 'Gastrointestinal',
    base: 9.80,
    gst: 12.0,
    tax: 0.0,
    unit: '10x10 Strip',
    hsn: '30049039',
    mfg: 'HISTAC-RANBAXY',
    pdf_path: null,
    pdf_name: null,
    remarks: 'Standard H2 blocker'
  },
  {
    name: 'CLOTRIMAZOLE CREAM-15GM',
    generic: 'Clotrimazole Topical IP 1% w/w',
    category: 'Ointments & Creams',
    base: 22.00,
    gst: 12.0,
    tax: 0.0,
    unit: '15gm Lami Tube',
    hsn: '30043913',
    mfg: 'PILCO PHARMA',
    pdf_path: '/uploads/sample_rate_sheet_neethi.pdf',
    pdf_name: 'DERMA-PRODUCTS-RATE.pdf',
    remarks: 'Antifungal dermatological cream'
  },
  {
    name: 'CETWICK TAB (Cetirizine 10mg)',
    generic: 'Cetirizine Dihydrochloride IP 10mg',
    category: 'Antihistamines',
    base: 14.00,
    gst: 12.0,
    tax: 0.0,
    unit: '10x10 Strips',
    hsn: '30049031',
    mfg: 'PPL PHARMACEUTICALS',
    pdf_path: null,
    pdf_name: null,
    remarks: 'Antiallergic retail & wholesale'
  },
  {
    name: 'MINISPRIN-75 TAB (Aspirin 75mg)',
    generic: 'Aspirin Gastro-Resistant 75mg',
    category: 'Cardiovascular',
    base: 7.20,
    gst: 12.0,
    tax: 0.0,
    unit: '14 Tablets Strip',
    hsn: '30049069',
    mfg: 'AMERICAN REMEDIES',
    pdf_path: null,
    pdf_name: null,
    remarks: 'Antiplatelet cardiovascular therapy'
  },
  {
    name: 'TELMISARTAN-40MG TAB',
    generic: 'Telmisartan IP 40mg',
    category: 'Cardiovascular',
    base: 28.00,
    gst: 12.0,
    tax: 0.0,
    unit: '10x10 Alu-Alu',
    hsn: '30049079',
    mfg: 'MOREPEN PHARMA',
    pdf_path: '/uploads/sample_quotation_govthospital.pdf',
    pdf_name: 'CARDIO-RATE-MASTER-2026.pdf',
    remarks: 'Antihypertensive daily tablet'
  },
  {
    name: 'ANFORMIN METFORMIN-1000SR TAB',
    generic: 'Metformin HCl 1000mg Sustained Release',
    category: 'Anti-Diabetic',
    base: 32.00,
    gst: 12.0,
    tax: 0.0,
    unit: '10x10 Strip',
    hsn: '30049039',
    mfg: 'ANCHOR PHARMA',
    pdf_path: null,
    pdf_name: null,
    remarks: 'High dosage diabetes formulation'
  },
  {
    name: 'ANPRAZOLE-40 TAB (Pantoprazole 40mg)',
    generic: 'Pantoprazole Sodium Gastro-Resistant 40mg',
    category: 'Gastrointestinal',
    base: 38.00,
    gst: 12.0,
    tax: 0.0,
    unit: '10x10 Strip',
    hsn: '30049099',
    mfg: 'ANCHOR HEALTHCARE',
    pdf_path: '/uploads/sample_rate_sheet_neethi.pdf',
    pdf_name: 'ANPRAZOLE-QUOTATION.pdf',
    remarks: 'Standard PPI for hospital prescription'
  },
  {
    name: 'ACENEXT-P TAB (Aceclofenac + Paracetamol)',
    generic: 'Aceclofenac 100mg + Paracetamol 325mg',
    category: 'Analgesics & Antipyretic',
    base: 26.00,
    gst: 12.0,
    tax: 0.0,
    unit: '10x10 Blister',
    hsn: '30049034',
    mfg: 'ALKEM LABORATORIES',
    pdf_path: null,
    pdf_name: null,
    remarks: 'Potent anti-inflammatory pain relief'
  },
  {
    name: 'DICLOWIN PLUS TAB (Diclofenac + Para)',
    generic: 'Diclofenac Sodium 50mg + Paracetamol 325mg',
    category: 'Analgesics & Antipyretic',
    base: 21.00,
    gst: 12.0,
    tax: 0.0,
    unit: '10x10 Strips',
    hsn: '30049061',
    mfg: 'WINGS BIOTECH',
    pdf_path: null,
    pdf_name: null,
    remarks: 'Fast action analgesic combination'
  },
  {
    name: 'AMBU BAG-P (Paediatric Resuscitator)',
    generic: 'Silicone Manual Resuscitator Kit (Paediatric)',
    category: 'Medical Devices & Surgicals',
    base: 420.00,
    gst: 12.0,
    tax: 0.0,
    unit: '1 Set in Carry Box',
    hsn: '90192010',
    mfg: 'ROMSONS SCIENTIFIC',
    pdf_path: '/uploads/sample_quotation_govthospital.pdf',
    pdf_name: 'ROMSONS-SURGICALS-RATE.pdf',
    remarks: 'Emergency Ward & Paediatric ICU equipment'
  },
  {
    name: 'FOLEY CATHETER-16 (2-Way Silicone Coated)',
    generic: 'Latex Foley Balloon Catheter 16FR / 30ml',
    category: 'Medical Devices & Surgicals',
    base: 68.00,
    gst: 12.0,
    tax: 0.0,
    unit: '1 Sterile Pack',
    hsn: '90183910',
    mfg: 'ROMSONS MEDICAL',
    pdf_path: null,
    pdf_name: null,
    remarks: 'Sterile urinary catheterisation supply'
  },
  {
    name: 'DISPOVAN SYRINGE-20ML WITH NEEDLE',
    generic: 'Single Use Hypodermic Syringe 20ml',
    category: 'Medical Devices & Surgicals',
    base: 12.50,
    gst: 12.0,
    tax: 0.0,
    unit: '1 Sterile Pouch (Box of 50)',
    hsn: '90183100',
    mfg: 'HMD (Hindustan Syringes & Medical Devices)',
    pdf_path: '/uploads/sample_quotation_govthospital.pdf',
    pdf_name: 'HMD-DISPOVAN-SCHEDULE.pdf',
    remarks: 'High demand hospital consumable'
  },
  {
    name: 'DISPOVAN SYRINGE-5ML WITH NEEDLE',
    generic: 'Single Use Hypodermic Syringe 5ml',
    category: 'Medical Devices & Surgicals',
    base: 4.80,
    gst: 12.0,
    tax: 0.0,
    unit: '1 Sterile Pouch (Box of 100)',
    hsn: '90183100',
    mfg: 'HMD',
    pdf_path: null,
    pdf_name: null,
    remarks: 'Standard injection syringe'
  },
  {
    name: 'GLOVES STERILE-7 (Latex Surgical)',
    generic: 'Pre-powdered Hypoallergenic Surgical Gloves Size 7',
    category: 'Medical Devices & Surgicals',
    base: 18.00,
    gst: 12.0,
    tax: 0.0,
    unit: '1 Pair Sterile Pouch (Box of 50)',
    hsn: '40151100',
    mfg: 'SUTURES INDIA / ROY',
    pdf_path: null,
    pdf_name: null,
    remarks: 'Operation Theatre & Labour Room grade'
  },
  {
    name: 'MURIVENNA 100ML (Classical Herbal Oil)',
    generic: 'Traditional Ayurvedic Wound Healing Medicated Oil',
    category: 'Ayurvedic & Traditional',
    base: 72.00,
    gst: 12.0,
    tax: 0.0,
    unit: '100ml PET Bottle',
    hsn: '30049011',
    mfg: 'ASHTAVAIDYAN AYURVEDA',
    pdf_path: '/uploads/sample_rate_sheet_neethi.pdf',
    pdf_name: 'AYURVEDA-OILS-PRICELIST.pdf',
    remarks: 'Fast moving trauma and wound oil'
  },
  {
    name: 'ON CALL PLUS GLUCOMETER KIT',
    generic: 'Blood Glucose Monitoring System with Lancing Device',
    category: 'Diagnostic Equipment',
    base: 680.00,
    gst: 18.0,
    tax: 0.0,
    unit: '1 Kit Box',
    hsn: '90278090',
    mfg: 'ACON LABORATORIES',
    pdf_path: '/uploads/sample_quotation_govthospital.pdf',
    pdf_name: 'ACON-DIAGNOSTICS-PRICING.pdf',
    remarks: 'Point-of-care digital diagnostic meter'
  }
];

db.serialize(() => {
  // Clear old default seeds and insert full rich catalog
  db.run('DELETE FROM medicines', [], (delErr) => {
    if (delErr) console.error('Error clearing old medicines:', delErr);

    const stmt = db.prepare(`
      INSERT INTO medicines (
        medicine_name, generic_name, category, base_rate, gst_percent, tax_percent, final_rate, unit_pack, hsn_code, manufacturer, pdf_attachment_path, pdf_attachment_name, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    fullCatalog.forEach(m => {
      const gstVal = (m.base * m.gst) / 100;
      const taxVal = (m.base * m.tax) / 100;
      const finalRate = parseFloat((m.base + gstVal + taxVal).toFixed(2));
      stmt.run(
        m.name,
        m.generic,
        m.category,
        m.base,
        m.gst,
        m.tax,
        finalRate,
        m.unit,
        m.hsn,
        m.mfg,
        m.pdf_path,
        m.pdf_name,
        m.remarks
      );
    });

    stmt.finalize(() => {
      console.log(`Successfully populated ${fullCatalog.length} medicines into Medicity Rate Master database!`);
      db.close();
    });
  });
});
