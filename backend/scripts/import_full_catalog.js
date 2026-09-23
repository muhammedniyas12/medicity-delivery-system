/**
 * ============================================================
 * MEDICITY PHARMACEUTICAL HARIPAD - FULL MEDICINE CATALOG IMPORT
 * ============================================================
 * Adds 250+ medicines with complete details:
 *   HSN Code, Medicine Name (Particulars), Generic/Salt,
 *   Packing, Company, Batch No, Expiry, MFG Date,
 *   MRP, Quantity, Free Qty, Rate, GST%, Tax%, Category, Remarks
 * ============================================================
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'medicity.db');
const db = new sqlite3.Database(dbPath);

function calculateFinalRate(base, gst, tax) {
  const b = parseFloat(base) || 0;
  const g = parseFloat(gst) || 0;
  const t = parseFloat(tax) || 0;
  return parseFloat((b + (b * g / 100) + (b * t / 100)).toFixed(2));
}

// Get existing medicine names to avoid duplicates
function getExistingNames(callback) {
  db.all('SELECT medicine_name FROM medicines', [], (err, rows) => {
    if (err) return callback(err, []);
    const names = (rows || []).map(r => r.medicine_name.toUpperCase().trim());
    callback(null, names);
  });
}

const allMedicines = [
  // ==============================
  // ANALGESICS & ANTIPYRETICS
  // ==============================
  { hsn:'30049034', name:'ACECLOFENAC-100 TAB', generic:'Aceclofenac 100mg', packing:'10x10 Strips', company:'IPCA', batch:'IP26A01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:85.00, qty:200, free:20, rate:32.00, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Standard NSAID analgesic' },
  { hsn:'30049034', name:'ACECLOFENAC+PARA+SERATIOPEPTIDASE TAB', generic:'Aceclofenac 100mg + Paracetamol 325mg + Serratiopeptidase 15mg', packing:'10x10 Strips', company:'ALKEM', batch:'ALK26S02', expiry:'01/06/2028', mfg:'01/06/2025', mrp:145.00, qty:150, free:15, rate:55.00, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Triple combination analgesic' },
  { hsn:'30049034', name:'ASPIRIN-75MG TAB (ECOSPRIN)', generic:'Aspirin 75mg Enteric Coated', packing:'14x10 Strips', company:'USV', batch:'USV26E01', expiry:'01/12/2028', mfg:'01/12/2025', mrp:18.30, qty:500, free:50, rate:6.80, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Blood thinner antiplatelet' },
  { hsn:'30049034', name:'ASPIRIN-150MG TAB', generic:'Aspirin 150mg', packing:'14x10 Strips', company:'USV', batch:'USV26E02', expiry:'01/11/2028', mfg:'01/11/2025', mrp:22.00, qty:400, free:40, rate:8.50, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Higher dose antiplatelet' },
  { hsn:'30049034', name:'BRUFEN-400 TAB', generic:'Ibuprofen 400mg', packing:'10x10 Strips', company:'ABBOTT', batch:'ABT26B01', expiry:'01/03/2028', mfg:'01/03/2025', mrp:48.00, qty:300, free:30, rate:18.50, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'OTC pain reliever' },
  { hsn:'30049034', name:'COMBIFLAM TAB', generic:'Ibuprofen 400mg + Paracetamol 325mg', packing:'10x10 Strips', company:'SANOFI', batch:'SAN26C01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:42.00, qty:300, free:30, rate:16.20, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Popular combination analgesic' },
  { hsn:'30049034', name:'DICLOFENAC GEL 30GM', generic:'Diclofenac Diethylamine 1.16% Gel', packing:'1x30gm Tube', company:'NOVARTIS', batch:'NOV26D01', expiry:'01/09/2027', mfg:'01/09/2024', mrp:75.00, qty:100, free:0, rate:38.00, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Topical pain relief gel' },
  { hsn:'30049034', name:'DICLOFENAC INJ 75MG/3ML', generic:'Diclofenac Sodium 75mg/3ml', packing:'5x1 Ampoule', company:'NEON', batch:'NEO26D02', expiry:'01/04/2028', mfg:'01/04/2025', mrp:18.00, qty:200, free:10, rate:5.20, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'IM injection for acute pain' },
  { hsn:'30049034', name:'DOLOKIND PLUS TAB', generic:'Aceclofenac 100mg + Paracetamol 325mg', packing:'10x10 Strips', company:'MANKIND', batch:'MKD26D03', expiry:'01/05/2028', mfg:'01/05/2025', mrp:72.00, qty:200, free:20, rate:28.00, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Pain reliever combination' },
  { hsn:'30049034', name:'DOLO-650 TAB', generic:'Paracetamol 650mg', packing:'10x15 Strips', company:'MICRO LABS', batch:'MCL26D04', expiry:'01/10/2028', mfg:'01/10/2025', mrp:35.00, qty:500, free:50, rate:12.50, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Most prescribed fever medicine' },
  { hsn:'30049034', name:'ETORICOXIB-90 TAB', generic:'Etoricoxib 90mg', packing:'10x10 Strips', company:'SUN PHARMA', batch:'SUN26E01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:180.00, qty:100, free:10, rate:72.00, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'COX-2 selective NSAID' },
  { hsn:'30049034', name:'ETORICOXIB-120 TAB', generic:'Etoricoxib 120mg', packing:'10x10 Strips', company:'SUN PHARMA', batch:'SUN26E02', expiry:'01/07/2028', mfg:'01/07/2025', mrp:220.00, qty:80, free:8, rate:88.00, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'High dose COX-2 inhibitor' },
  { hsn:'30049034', name:'KETOROLAC-10 TAB', generic:'Ketorolac Tromethamine 10mg', packing:'10x10 Strips', company:'DR REDDYS', batch:'DRL26K01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:65.00, qty:100, free:10, rate:26.00, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Short-term pain management' },
  { hsn:'30049034', name:'MEFTAL SPAS TAB', generic:'Mefenamic Acid 250mg + Dicyclomine 10mg', packing:'10x10 Strips', company:'BLUE CROSS', batch:'BLC26M01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:68.00, qty:200, free:20, rate:26.50, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Menstrual pain reliever' },
  { hsn:'30049034', name:'MEFENAMIC ACID-500 TAB', generic:'Mefenamic Acid 500mg', packing:'10x10 Strips', company:'BLUE CROSS', batch:'BLC26M02', expiry:'01/10/2028', mfg:'01/10/2025', mrp:45.00, qty:200, free:20, rate:17.50, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Analgesic anti-inflammatory' },
  { hsn:'30049034', name:'NAPROXEN-500 TAB', generic:'Naproxen 500mg', packing:'10x10 Strips', company:'INTAS', batch:'INT26N01', expiry:'01/04/2028', mfg:'01/04/2025', mrp:85.00, qty:150, free:15, rate:34.00, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Long-acting NSAID' },
  { hsn:'30049034', name:'NIMESULIDE-100 TAB', generic:'Nimesulide 100mg', packing:'10x10 Strips', company:'PANACEA', batch:'PAN26N02', expiry:'01/05/2028', mfg:'01/05/2025', mrp:28.00, qty:300, free:30, rate:10.50, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Anti-inflammatory analgesic' },
  { hsn:'30049034', name:'PARACETAMOL-500 TAB', generic:'Paracetamol 500mg', packing:'10x10 Strips', company:'GLAXO', batch:'GSK26P01', expiry:'01/12/2028', mfg:'01/12/2025', mrp:15.00, qty:600, free:60, rate:5.50, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Basic fever reducer' },
  { hsn:'30049034', name:'PIROXICAM-20 CAP', generic:'Piroxicam 20mg', packing:'10x10 Caps', company:'CADILA', batch:'CAD26P02', expiry:'01/06/2028', mfg:'01/06/2025', mrp:42.00, qty:150, free:15, rate:16.00, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Long-acting NSAID capsule' },
  { hsn:'30049034', name:'SUMO TAB', generic:'Nimesulide 100mg + Paracetamol 325mg', packing:'10x10 Strips', company:'ALKEM', batch:'ALK26S03', expiry:'01/08/2028', mfg:'01/08/2025', mrp:52.00, qty:200, free:20, rate:20.00, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Combination fever & pain' },
  { hsn:'30049034', name:'TRAMADOL-50 CAP', generic:'Tramadol HCl 50mg', packing:'10x10 Caps', company:'CIPLA', batch:'CIP26T01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:38.00, qty:100, free:0, rate:14.00, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Opioid analgesic' },
  { hsn:'30049034', name:'TRAMADOL+PARA TAB', generic:'Tramadol 37.5mg + Paracetamol 325mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26T02', expiry:'01/09/2028', mfg:'01/09/2025', mrp:95.00, qty:100, free:10, rate:38.00, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Moderate to severe pain' },
  { hsn:'30049034', name:'ZERODOL-SP TAB', generic:'Aceclofenac 100mg + Paracetamol 325mg + Serratiopeptidase 15mg', packing:'10x10 Strips', company:'IPCA', batch:'IPC26Z01', expiry:'01/11/2028', mfg:'01/11/2025', mrp:148.00, qty:150, free:15, rate:58.00, gst:12, tax:0, category:'Analgesics & Antipyretic', remarks:'Popular triple combination' },

  // ==============================
  // ANTIBIOTICS
  // ==============================
  { hsn:'30041090', name:'AMOXICILLIN-250 CAP', generic:'Amoxicillin 250mg', packing:'10x10 Caps', company:'CIPLA', batch:'CIP26A01', expiry:'01/04/2028', mfg:'01/04/2025', mrp:62.00, qty:300, free:30, rate:24.00, gst:12, tax:0, category:'Antibiotics', remarks:'Broad spectrum antibiotic' },
  { hsn:'30041090', name:'AMOXICILLIN-500 CAP', generic:'Amoxicillin 500mg', packing:'10x10 Caps', company:'CIPLA', batch:'CIP26A02', expiry:'01/05/2028', mfg:'01/05/2025', mrp:105.00, qty:300, free:30, rate:42.00, gst:12, tax:0, category:'Antibiotics', remarks:'Higher dose amoxicillin' },
  { hsn:'30041090', name:'AMOXICILLIN+CLAVULANATE-625 TAB', generic:'Amoxicillin 500mg + Clavulanic Acid 125mg', packing:'10x6 Strips', company:'GLAXO', batch:'GSK26AC01', expiry:'01/03/2028', mfg:'01/03/2025', mrp:185.00, qty:200, free:20, rate:72.00, gst:12, tax:0, category:'Antibiotics', remarks:'Augmentin generic' },
  { hsn:'30041090', name:'AUGMENTIN-625 DUO TAB', generic:'Amoxicillin 500mg + Clavulanic Acid 125mg', packing:'10x6 Strips', company:'GLAXO', batch:'GSK26AU01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:218.00, qty:150, free:15, rate:88.00, gst:12, tax:0, category:'Antibiotics', remarks:'Brand augmentin' },
  { hsn:'30042090', name:'AZITHROMYCIN-250 TAB', generic:'Azithromycin 250mg', packing:'10x6 Strips', company:'ALKEM', batch:'ALK26AZ01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:72.00, qty:200, free:20, rate:28.00, gst:12, tax:0, category:'Antibiotics', remarks:'3 day course macrolide' },
  { hsn:'30042090', name:'AZITHROMYCIN-500 TAB', generic:'Azithromycin 500mg', packing:'10x3 Strips', company:'ALKEM', batch:'ALK26AZ02', expiry:'01/08/2028', mfg:'01/08/2025', mrp:95.00, qty:200, free:20, rate:38.00, gst:12, tax:0, category:'Antibiotics', remarks:'Higher dose azithro' },
  { hsn:'30042090', name:'AZITHROMYCIN-200 SUSP (DRY SYP)', generic:'Azithromycin 200mg/5ml', packing:'1x15ml Bottle', company:'CIPLA', batch:'CIP26AZ03', expiry:'01/05/2028', mfg:'01/05/2025', mrp:68.00, qty:100, free:10, rate:32.00, gst:12, tax:0, category:'Antibiotics', remarks:'Paediatric suspension' },
  { hsn:'30042090', name:'CEFADROXIL-500 CAP', generic:'Cefadroxil 500mg', packing:'10x10 Caps', company:'ARISTO', batch:'ARI26CF01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:120.00, qty:150, free:15, rate:48.00, gst:12, tax:0, category:'Antibiotics', remarks:'1st gen cephalosporin' },
  { hsn:'30042090', name:'CEFIXIME-200 TAB', generic:'Cefixime 200mg', packing:'10x10 Strips', company:'MANKIND', batch:'MKD26CF02', expiry:'01/07/2028', mfg:'01/07/2025', mrp:155.00, qty:200, free:20, rate:62.00, gst:12, tax:0, category:'Antibiotics', remarks:'3rd gen oral cephalosporin' },
  { hsn:'30042090', name:'CEFIXIME+OFLOXACIN TAB', generic:'Cefixime 200mg + Ofloxacin 200mg', packing:'10x10 Strips', company:'MANKIND', batch:'MKD26CO01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:195.00, qty:150, free:15, rate:78.00, gst:12, tax:0, category:'Antibiotics', remarks:'Broad spectrum combo' },
  { hsn:'30042090', name:'CEFPODOXIME-200 TAB', generic:'Cefpodoxime Proxetil 200mg', packing:'10x10 Strips', company:'LUPIN', batch:'LUP26CP01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:220.00, qty:100, free:10, rate:88.00, gst:12, tax:0, category:'Antibiotics', remarks:'3rd gen cephalosporin oral' },
  { hsn:'30042090', name:'CEFTRIAXONE-1GM INJ', generic:'Ceftriaxone 1gm IV/IM', packing:'1x1 Vial+WFI', company:'ALKEM', batch:'ALK26CT01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:68.00, qty:200, free:10, rate:28.00, gst:12, tax:0, category:'Antibiotics', remarks:'3rd gen IV cephalosporin' },
  { hsn:'30042090', name:'CEPHALEXIN-500 CAP', generic:'Cephalexin 500mg', packing:'10x10 Caps', company:'GSK', batch:'GSK26CX01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:95.00, qty:200, free:20, rate:38.00, gst:12, tax:0, category:'Antibiotics', remarks:'1st gen cephalosporin' },
  { hsn:'30042090', name:'CIPROFLOXACIN-500 TAB', generic:'Ciprofloxacin 500mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26CI01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:55.00, qty:300, free:30, rate:22.00, gst:12, tax:0, category:'Antibiotics', remarks:'Fluoroquinolone antibiotic' },
  { hsn:'30042090', name:'CLARITHROMYCIN-250 TAB', generic:'Clarithromycin 250mg', packing:'10x6 Strips', company:'ABBOTT', batch:'ABT26CL01', expiry:'01/04/2028', mfg:'01/04/2025', mrp:145.00, qty:100, free:10, rate:58.00, gst:12, tax:0, category:'Antibiotics', remarks:'Macrolide antibiotic' },
  { hsn:'30042090', name:'CLINDAMYCIN-300 CAP', generic:'Clindamycin 300mg', packing:'10x4 Caps', company:'ALKEM', batch:'ALK26CD01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:185.00, qty:100, free:10, rate:74.00, gst:12, tax:0, category:'Antibiotics', remarks:'Lincosamide antibiotic' },
  { hsn:'30042090', name:'DOXYCYCLINE-100 CAP', generic:'Doxycycline 100mg', packing:'10x10 Caps', company:'MICRO LABS', batch:'MCL26DX01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:68.00, qty:200, free:20, rate:26.00, gst:12, tax:0, category:'Antibiotics', remarks:'Tetracycline antibiotic' },
  { hsn:'30042090', name:'ERYTHROMYCIN-250 TAB', generic:'Erythromycin Stearate 250mg', packing:'10x10 Strips', company:'ABBOTT', batch:'ABT26ER01', expiry:'01/03/2028', mfg:'01/03/2025', mrp:48.00, qty:200, free:20, rate:18.00, gst:12, tax:0, category:'Antibiotics', remarks:'Macrolide for penicillin allergy' },
  { hsn:'30042090', name:'GENTAMICIN INJ 80MG/2ML', generic:'Gentamicin Sulphate 80mg/2ml', packing:'10x2ml Ampoule', company:'NEON', batch:'NEO26GN01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:12.00, qty:300, free:0, rate:4.50, gst:12, tax:0, category:'Antibiotics', remarks:'Aminoglycoside injection' },
  { hsn:'30042090', name:'LEVOFLOXACIN-500 TAB', generic:'Levofloxacin 500mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26LV01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:98.00, qty:200, free:20, rate:38.00, gst:12, tax:0, category:'Antibiotics', remarks:'Respiratory fluoroquinolone' },
  { hsn:'30042090', name:'LEVOFLOXACIN-750 TAB', generic:'Levofloxacin 750mg', packing:'10x5 Strips', company:'CIPLA', batch:'CIP26LV02', expiry:'01/09/2028', mfg:'01/09/2025', mrp:145.00, qty:100, free:10, rate:58.00, gst:12, tax:0, category:'Antibiotics', remarks:'Higher dose levofloxacin' },
  { hsn:'30042090', name:'LINEZOLID-600 TAB', generic:'Linezolid 600mg', packing:'10x4 Strips', company:'GLENMARK', batch:'GLN26LN01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:320.00, qty:80, free:0, rate:128.00, gst:12, tax:0, category:'Antibiotics', remarks:'Oxazolidinone for MRSA' },
  { hsn:'30042090', name:'METRONIDAZOLE-400 TAB', generic:'Metronidazole 400mg', packing:'10x10 Strips', company:'ABBOTT', batch:'ABT26MZ01', expiry:'01/11/2028', mfg:'01/11/2025', mrp:22.00, qty:400, free:40, rate:8.50, gst:12, tax:0, category:'Antibiotics', remarks:'Antiprotozoal antibiotic' },
  { hsn:'30042090', name:'MOXIFLOXACIN-400 TAB', generic:'Moxifloxacin HCl 400mg', packing:'10x5 Strips', company:'ALEMBIC', batch:'ALM26MX01', expiry:'01/04/2028', mfg:'01/04/2025', mrp:195.00, qty:100, free:10, rate:78.00, gst:12, tax:0, category:'Antibiotics', remarks:'4th gen fluoroquinolone' },
  { hsn:'30041090', name:'NITROFURANTOIN-100 CAP', generic:'Nitrofurantoin 100mg', packing:'10x10 Caps', company:'SUN PHARMA', batch:'SUN26NF01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:48.00, qty:200, free:20, rate:18.50, gst:12, tax:0, category:'Antibiotics', remarks:'UTI specific antibiotic' },
  { hsn:'30042090', name:'NORFLOXACIN-400 TAB', generic:'Norfloxacin 400mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26NR01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:52.00, qty:200, free:20, rate:20.00, gst:12, tax:0, category:'Antibiotics', remarks:'UTI fluoroquinolone' },
  { hsn:'30042090', name:'OFLOXACIN-200 TAB', generic:'Ofloxacin 200mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26OF01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:65.00, qty:200, free:20, rate:26.00, gst:12, tax:0, category:'Antibiotics', remarks:'Fluoroquinolone' },
  { hsn:'30042090', name:'OFLOXACIN+ORNIDAZOLE TAB', generic:'Ofloxacin 200mg + Ornidazole 500mg', packing:'10x10 Strips', company:'SUN PHARMA', batch:'SUN26OO01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:115.00, qty:150, free:15, rate:45.00, gst:12, tax:0, category:'Antibiotics', remarks:'GI infection combo' },
  { hsn:'30041090', name:'PENICILLIN-V 250 TAB', generic:'Phenoxymethylpenicillin 250mg', packing:'10x10 Strips', company:'ALEMBIC', batch:'ALM26PV01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:32.00, qty:200, free:20, rate:12.00, gst:12, tax:0, category:'Antibiotics', remarks:'Basic penicillin' },
  { hsn:'30042090', name:'ROXITHROMYCIN-150 TAB', generic:'Roxithromycin 150mg', packing:'10x10 Strips', company:'ALKEM', batch:'ALK26RX01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:85.00, qty:150, free:15, rate:34.00, gst:12, tax:0, category:'Antibiotics', remarks:'Macrolide antibiotic' },

  // ==============================
  // CARDIOVASCULAR
  // ==============================
  { hsn:'30049069', name:'AMLODIPINE-5MG TAB', generic:'Amlodipine Besylate 5mg', packing:'10x10 Strips', company:'PFIZER', batch:'PFZ26AM01', expiry:'01/12/2028', mfg:'01/12/2025', mrp:28.00, qty:500, free:50, rate:10.50, gst:12, tax:0, category:'Cardiovascular', remarks:'Calcium channel blocker' },
  { hsn:'30049069', name:'AMLODIPINE-10MG TAB', generic:'Amlodipine Besylate 10mg', packing:'10x10 Strips', company:'PFIZER', batch:'PFZ26AM02', expiry:'01/11/2028', mfg:'01/11/2025', mrp:42.00, qty:400, free:40, rate:16.00, gst:12, tax:0, category:'Cardiovascular', remarks:'Higher dose CCB' },
  { hsn:'30049069', name:'AMLODIPINE+ATENOLOL TAB', generic:'Amlodipine 5mg + Atenolol 50mg', packing:'10x10 Strips', company:'INTAS', batch:'INT26AA01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:65.00, qty:200, free:20, rate:25.00, gst:12, tax:0, category:'Cardiovascular', remarks:'Anti-hypertensive combo' },
  { hsn:'30049069', name:'ATENOLOL-50MG TAB', generic:'Atenolol 50mg', packing:'14x10 Strips', company:'CIPLA', batch:'CIP26AT01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:25.00, qty:400, free:40, rate:9.50, gst:12, tax:0, category:'Cardiovascular', remarks:'Beta blocker for HTN' },
  { hsn:'30049069', name:'ATORVASTATIN-10 TAB', generic:'Atorvastatin Calcium 10mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26AV01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:58.00, qty:300, free:30, rate:22.00, gst:12, tax:0, category:'Cardiovascular', remarks:'Statin for cholesterol' },
  { hsn:'30049069', name:'ATORVASTATIN-20 TAB', generic:'Atorvastatin Calcium 20mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26AV02', expiry:'01/07/2028', mfg:'01/07/2025', mrp:95.00, qty:200, free:20, rate:38.00, gst:12, tax:0, category:'Cardiovascular', remarks:'Higher dose statin' },
  { hsn:'30049069', name:'ATORVASTATIN-40 TAB', generic:'Atorvastatin Calcium 40mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26AV03', expiry:'01/06/2028', mfg:'01/06/2025', mrp:145.00, qty:150, free:15, rate:58.00, gst:12, tax:0, category:'Cardiovascular', remarks:'High dose lipid control' },
  { hsn:'30049069', name:'CILNIDIPINE-10 TAB', generic:'Cilnidipine 10mg', packing:'10x10 Strips', company:'GLENMARK', batch:'GLN26CL01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:105.00, qty:150, free:15, rate:42.00, gst:12, tax:0, category:'Cardiovascular', remarks:'Dual CCB for HTN' },
  { hsn:'30049069', name:'CLOPIDOGREL-75 TAB', generic:'Clopidogrel 75mg', packing:'10x10 Strips', company:'SUN PHARMA', batch:'SUN26CP01', expiry:'01/11/2028', mfg:'01/11/2025', mrp:68.00, qty:200, free:20, rate:26.00, gst:12, tax:0, category:'Cardiovascular', remarks:'Antiplatelet agent' },
  { hsn:'30049069', name:'CLOPIDOGREL+ASPIRIN TAB', generic:'Clopidogrel 75mg + Aspirin 75mg', packing:'10x10 Strips', company:'SUN PHARMA', batch:'SUN26CA01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:85.00, qty:200, free:20, rate:34.00, gst:12, tax:0, category:'Cardiovascular', remarks:'Dual antiplatelet' },
  { hsn:'30049069', name:'DIGOXIN-0.25MG TAB', generic:'Digoxin 0.25mg', packing:'10x10 Strips', company:'GLAXO', batch:'GSK26DG01', expiry:'01/04/2028', mfg:'01/04/2025', mrp:12.00, qty:200, free:0, rate:4.50, gst:12, tax:0, category:'Cardiovascular', remarks:'Cardiac glycoside' },
  { hsn:'30049069', name:'DILTIAZEM-30 TAB', generic:'Diltiazem HCl 30mg', packing:'10x10 Strips', company:'TORRENT', batch:'TOR26DZ01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:35.00, qty:200, free:20, rate:14.00, gst:12, tax:0, category:'Cardiovascular', remarks:'CCB for angina/HTN' },
  { hsn:'30049069', name:'ENALAPRIL-5MG TAB', generic:'Enalapril Maleate 5mg', packing:'10x10 Strips', company:'CADILA', batch:'CAD26EN01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:32.00, qty:300, free:30, rate:12.00, gst:12, tax:0, category:'Cardiovascular', remarks:'ACE inhibitor' },
  { hsn:'30049069', name:'FUROSEMIDE-40 TAB', generic:'Furosemide 40mg', packing:'10x10 Strips', company:'SANOFI', batch:'SAN26FR01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:12.00, qty:500, free:50, rate:4.00, gst:12, tax:0, category:'Cardiovascular', remarks:'Loop diuretic' },
  { hsn:'30049069', name:'FUROSEMIDE INJ 20MG/2ML', generic:'Furosemide 20mg/2ml', packing:'5x2ml Ampoule', company:'NEON', batch:'NEO26FR02', expiry:'01/08/2028', mfg:'01/08/2025', mrp:8.00, qty:300, free:0, rate:3.00, gst:12, tax:0, category:'Cardiovascular', remarks:'IV loop diuretic' },
  { hsn:'30049069', name:'ISOSORBIDE DINITRATE-5MG TAB', generic:'Isosorbide Dinitrate 5mg SL', packing:'10x10 Strips', company:'CADILA', batch:'CAD26IS01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:18.00, qty:200, free:20, rate:6.50, gst:12, tax:0, category:'Cardiovascular', remarks:'Sublingual anti-anginal' },
  { hsn:'30049069', name:'NEBIVOLOL-5MG TAB', generic:'Nebivolol 5mg', packing:'10x10 Strips', company:'TORRENT', batch:'TOR26NB01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:95.00, qty:150, free:15, rate:38.00, gst:12, tax:0, category:'Cardiovascular', remarks:'3rd gen beta blocker' },
  { hsn:'30049069', name:'NIFEDIPINE-20 RETARD TAB', generic:'Nifedipine 20mg SR', packing:'10x10 Strips', company:'BAYER', batch:'BAY26NF01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:32.00, qty:200, free:20, rate:12.50, gst:12, tax:0, category:'Cardiovascular', remarks:'SR calcium channel blocker' },
  { hsn:'30049069', name:'OLMESARTAN-20 TAB', generic:'Olmesartan Medoxomil 20mg', packing:'10x10 Strips', company:'GLENMARK', batch:'GLN26OM01', expiry:'01/12/2028', mfg:'01/12/2025', mrp:85.00, qty:200, free:20, rate:34.00, gst:12, tax:0, category:'Cardiovascular', remarks:'ARB anti-hypertensive' },
  { hsn:'30049069', name:'OLMESARTAN+AMLODIPINE TAB', generic:'Olmesartan 20mg + Amlodipine 5mg', packing:'10x10 Strips', company:'GLENMARK', batch:'GLN26OA01', expiry:'01/11/2028', mfg:'01/11/2025', mrp:145.00, qty:150, free:15, rate:58.00, gst:12, tax:0, category:'Cardiovascular', remarks:'ARB+CCB combo' },
  { hsn:'30049069', name:'PRAZOSIN-2.5MG TAB (XL)', generic:'Prazosin 2.5mg Extended Release', packing:'10x10 Strips', company:'PFIZER', batch:'PFZ26PZ01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:55.00, qty:150, free:15, rate:22.00, gst:12, tax:0, category:'Cardiovascular', remarks:'Alpha blocker for HTN/BPH' },
  { hsn:'30049069', name:'RAMIPRIL-5MG TAB', generic:'Ramipril 5mg', packing:'10x10 Strips', company:'SANOFI', batch:'SAN26RM01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:68.00, qty:200, free:20, rate:26.00, gst:12, tax:0, category:'Cardiovascular', remarks:'ACE inhibitor cardioprotective' },
  { hsn:'30049069', name:'ROSUVASTATIN-10 TAB', generic:'Rosuvastatin 10mg', packing:'10x10 Strips', company:'AstraZeneca', batch:'AZN26RS01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:85.00, qty:200, free:20, rate:34.00, gst:12, tax:0, category:'Cardiovascular', remarks:'Super statin for lipid' },
  { hsn:'30049069', name:'ROSUVASTATIN-20 TAB', generic:'Rosuvastatin 20mg', packing:'10x10 Strips', company:'AstraZeneca', batch:'AZN26RS02', expiry:'01/08/2028', mfg:'01/08/2025', mrp:135.00, qty:150, free:15, rate:54.00, gst:12, tax:0, category:'Cardiovascular', remarks:'High potency statin' },
  { hsn:'30049069', name:'TELMISARTAN-20MG TAB', generic:'Telmisartan 20mg', packing:'10x10 Strips', company:'GLENMARK', batch:'GLN26TM01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:42.00, qty:300, free:30, rate:16.00, gst:12, tax:0, category:'Cardiovascular', remarks:'Low dose ARB' },
  { hsn:'30049069', name:'TORSEMIDE-10 TAB', generic:'Torsemide 10mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26TO01', expiry:'01/04/2028', mfg:'01/04/2025', mrp:52.00, qty:200, free:20, rate:20.00, gst:12, tax:0, category:'Cardiovascular', remarks:'Loop diuretic for edema' },
  { hsn:'30049069', name:'VALSARTAN-80 TAB', generic:'Valsartan 80mg', packing:'10x10 Strips', company:'NOVARTIS', batch:'NOV26VS01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:95.00, qty:150, free:15, rate:38.00, gst:12, tax:0, category:'Cardiovascular', remarks:'ARB for heart failure' },
  { hsn:'30049069', name:'WARFARIN-5MG TAB', generic:'Warfarin Sodium 5mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26WF01', expiry:'01/11/2028', mfg:'01/11/2025', mrp:22.00, qty:200, free:0, rate:8.00, gst:12, tax:0, category:'Cardiovascular', remarks:'Oral anticoagulant' },

  // ==============================
  // ANTI-DIABETIC
  // ==============================
  { hsn:'30049032', name:'GLIBENCLAMIDE-5MG TAB', generic:'Glibenclamide 5mg', packing:'10x10 Strips', company:'USV', batch:'USV26GB01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:18.00, qty:400, free:40, rate:6.50, gst:12, tax:0, category:'Anti-Diabetic', remarks:'Sulphonylurea 2nd gen' },
  { hsn:'30049032', name:'GLICLAZIDE-80 TAB', generic:'Gliclazide 80mg', packing:'10x10 Strips', company:'ARISTO', batch:'ARI26GC01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:52.00, qty:200, free:20, rate:20.00, gst:12, tax:0, category:'Anti-Diabetic', remarks:'Modified release sulphonylurea' },
  { hsn:'30049032', name:'GLIMEPIRIDE-1MG TAB', generic:'Glimepiride 1mg', packing:'10x10 Strips', company:'SANOFI', batch:'SAN26GM01', expiry:'01/11/2028', mfg:'01/11/2025', mrp:35.00, qty:300, free:30, rate:14.00, gst:12, tax:0, category:'Anti-Diabetic', remarks:'Low dose sulphonylurea' },
  { hsn:'30049032', name:'GLIMEPIRIDE-2MG TAB', generic:'Glimepiride 2mg', packing:'10x10 Strips', company:'SANOFI', batch:'SAN26GM02', expiry:'01/08/2028', mfg:'01/08/2025', mrp:55.00, qty:200, free:20, rate:22.00, gst:12, tax:0, category:'Anti-Diabetic', remarks:'Standard dose glimepiride' },
  { hsn:'30049032', name:'GLIMEPIRIDE+METFORMIN TAB (1MG+500MG)', generic:'Glimepiride 1mg + Metformin 500mg SR', packing:'10x10 Strips', company:'USV', batch:'USV26GM03', expiry:'01/07/2028', mfg:'01/07/2025', mrp:85.00, qty:200, free:20, rate:34.00, gst:12, tax:0, category:'Anti-Diabetic', remarks:'Combination OHA' },
  { hsn:'30049032', name:'GLIMEPIRIDE+METFORMIN TAB (2MG+500MG)', generic:'Glimepiride 2mg + Metformin 500mg SR', packing:'10x10 Strips', company:'USV', batch:'USV26GM04', expiry:'01/06/2028', mfg:'01/06/2025', mrp:105.00, qty:150, free:15, rate:42.00, gst:12, tax:0, category:'Anti-Diabetic', remarks:'Higher combo OHA' },
  { hsn:'30049032', name:'HUMAN INSULIN 30/70 (40IU) VIAL', generic:'Human Insulin 30/70 Mix 40IU/ml', packing:'1x10ml Vial', company:'NOVO NORDISK', batch:'NNK26HI01', expiry:'01/05/2027', mfg:'01/05/2025', mrp:148.00, qty:50, free:0, rate:105.00, gst:5, tax:0, category:'Anti-Diabetic', remarks:'Pre-mixed insulin vial' },
  { hsn:'30049032', name:'INSULIN GLARGINE PEN (BASALOG)', generic:'Insulin Glargine 100IU/ml 3ml Pen', packing:'1x3ml Pen', company:'BIOCON', batch:'BIO26IG01', expiry:'01/04/2027', mfg:'01/04/2025', mrp:650.00, qty:30, free:0, rate:465.00, gst:5, tax:0, category:'Anti-Diabetic', remarks:'Long acting insulin pen' },
  { hsn:'30049032', name:'LINAGLIPTIN-5MG TAB', generic:'Linagliptin 5mg', packing:'10x10 Strips', company:'BOEHRINGER', batch:'BOE26LG01', expiry:'01/12/2028', mfg:'01/12/2025', mrp:450.00, qty:80, free:0, rate:180.00, gst:12, tax:0, category:'Anti-Diabetic', remarks:'DPP4 inhibitor' },
  { hsn:'30049032', name:'METFORMIN-500 TAB', generic:'Metformin HCl 500mg', packing:'10x10 Strips', company:'USV', batch:'USV26MF01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:22.00, qty:500, free:50, rate:8.50, gst:12, tax:0, category:'Anti-Diabetic', remarks:'Basic metformin' },
  { hsn:'30049032', name:'METFORMIN-850 TAB', generic:'Metformin HCl 850mg', packing:'10x10 Strips', company:'USV', batch:'USV26MF02', expiry:'01/09/2028', mfg:'01/09/2025', mrp:32.00, qty:300, free:30, rate:12.50, gst:12, tax:0, category:'Anti-Diabetic', remarks:'Higher dose metformin' },
  { hsn:'30049032', name:'PIOGLITAZONE-15 TAB', generic:'Pioglitazone 15mg', packing:'10x10 Strips', company:'SUN PHARMA', batch:'SUN26PG01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:55.00, qty:200, free:20, rate:22.00, gst:12, tax:0, category:'Anti-Diabetic', remarks:'Insulin sensitiser' },
  { hsn:'30049032', name:'SITAGLIPTIN-100 TAB', generic:'Sitagliptin 100mg', packing:'10x7 Strips', company:'MSD', batch:'MSD26ST01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:380.00, qty:80, free:0, rate:152.00, gst:12, tax:0, category:'Anti-Diabetic', remarks:'DPP4 inhibitor Januvia' },
  { hsn:'30049032', name:'TENELIGLIPTIN-20MG TAB', generic:'Teneligliptin 20mg', packing:'10x10 Strips', company:'GLENMARK', batch:'GLN26TN01', expiry:'01/11/2028', mfg:'01/11/2025', mrp:195.00, qty:100, free:10, rate:78.00, gst:12, tax:0, category:'Anti-Diabetic', remarks:'Affordable DPP4 inhibitor' },

  // ==============================
  // GASTROINTESTINAL
  // ==============================
  { hsn:'30049039', name:'ALUMINIUM HYDROXIDE+MAGNESIUM HYDROXIDE SUSP', generic:'Al(OH)3 + Mg(OH)2 170ml', packing:'1x170ml Bottle', company:'ABBOTT', batch:'ABT26AH01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:55.00, qty:100, free:10, rate:28.00, gst:12, tax:0, category:'Gastrointestinal', remarks:'Antacid suspension' },
  { hsn:'30049039', name:'DOMPERIDONE-10 TAB', generic:'Domperidone 10mg', packing:'10x10 Strips', company:'DR REDDYS', batch:'DRL26DP01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:32.00, qty:300, free:30, rate:12.00, gst:12, tax:0, category:'Gastrointestinal', remarks:'Anti-emetic prokinetic' },
  { hsn:'30049039', name:'ESOMEPRAZOLE-40 TAB', generic:'Esomeprazole 40mg', packing:'10x10 Strips', company:'AstraZeneca', batch:'AZN26ES01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:95.00, qty:200, free:20, rate:38.00, gst:12, tax:0, category:'Gastrointestinal', remarks:'Proton pump inhibitor' },
  { hsn:'30049039', name:'FAMOTIDINE-20 TAB', generic:'Famotidine 20mg', packing:'10x10 Strips', company:'SUN PHARMA', batch:'SUN26FM01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:28.00, qty:300, free:30, rate:10.50, gst:12, tax:0, category:'Gastrointestinal', remarks:'H2 receptor blocker' },
  { hsn:'30049039', name:'HYOSCINE BUTYLBROMIDE-10 TAB', generic:'Hyoscine Butylbromide 10mg', packing:'10x10 Strips', company:'SANOFI', batch:'SAN26HB01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:42.00, qty:200, free:20, rate:16.00, gst:12, tax:0, category:'Gastrointestinal', remarks:'Antispasmodic' },
  { hsn:'30049039', name:'LANSOPRAZOLE-30 CAP', generic:'Lansoprazole 30mg', packing:'10x10 Caps', company:'CIPLA', batch:'CIP26LP01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:75.00, qty:200, free:20, rate:30.00, gst:12, tax:0, category:'Gastrointestinal', remarks:'PPI for GERD' },
  { hsn:'30049039', name:'LOPERAMIDE-2MG CAP', generic:'Loperamide HCl 2mg', packing:'10x10 Caps', company:'JANSSEN', batch:'JAN26LO01', expiry:'01/04/2028', mfg:'01/04/2025', mrp:22.00, qty:200, free:0, rate:8.50, gst:12, tax:0, category:'Gastrointestinal', remarks:'Anti-diarrhoeal' },
  { hsn:'30049039', name:'METOCLOPRAMIDE-10 TAB', generic:'Metoclopramide HCl 10mg', packing:'10x10 Strips', company:'NEON', batch:'NEO26MC01', expiry:'01/11/2028', mfg:'01/11/2025', mrp:15.00, qty:400, free:40, rate:5.50, gst:12, tax:0, category:'Gastrointestinal', remarks:'Anti-emetic prokinetic' },
  { hsn:'30049039', name:'OMEPRAZOLE-20 CAP', generic:'Omeprazole 20mg', packing:'10x10 Caps', company:'DR REDDYS', batch:'DRL26OM01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:42.00, qty:300, free:30, rate:16.00, gst:12, tax:0, category:'Gastrointestinal', remarks:'OTC PPI' },
  { hsn:'30049039', name:'ONDANSETRON-4 TAB', generic:'Ondansetron 4mg', packing:'10x10 Strips', company:'SUN PHARMA', batch:'SUN26ON01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:48.00, qty:200, free:20, rate:18.50, gst:12, tax:0, category:'Gastrointestinal', remarks:'5HT3 anti-emetic' },
  { hsn:'30049039', name:'ONDANSETRON-8 TAB', generic:'Ondansetron 8mg', packing:'10x10 Strips', company:'SUN PHARMA', batch:'SUN26ON02', expiry:'01/07/2028', mfg:'01/07/2025', mrp:78.00, qty:150, free:15, rate:30.00, gst:12, tax:0, category:'Gastrointestinal', remarks:'Higher dose anti-emetic' },
  { hsn:'30049039', name:'PANTOPRAZOLE-40 TAB', generic:'Pantoprazole 40mg', packing:'10x10 Strips', company:'ALKEM', batch:'ALK26PP01', expiry:'01/12/2028', mfg:'01/12/2025', mrp:65.00, qty:300, free:30, rate:26.00, gst:12, tax:0, category:'Gastrointestinal', remarks:'PPI for acid reflux' },
  { hsn:'30049039', name:'PANTOPRAZOLE+DOMPERIDONE CAP', generic:'Pantoprazole 40mg + Domperidone 30mg SR', packing:'10x10 Caps', company:'ALKEM', batch:'ALK26PD01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:105.00, qty:200, free:20, rate:42.00, gst:12, tax:0, category:'Gastrointestinal', remarks:'PPI+Prokinetic combo' },
  { hsn:'30049039', name:'RABEPRAZOLE-20 TAB', generic:'Rabeprazole 20mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26RB01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:85.00, qty:200, free:20, rate:34.00, gst:12, tax:0, category:'Gastrointestinal', remarks:'PPI for peptic ulcer' },
  { hsn:'30049039', name:'RABEPRAZOLE+DOMPERIDONE CAP', generic:'Rabeprazole 20mg + Domperidone 30mg SR', packing:'10x10 Caps', company:'CIPLA', batch:'CIP26RD01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:115.00, qty:150, free:15, rate:46.00, gst:12, tax:0, category:'Gastrointestinal', remarks:'Popular PPI combo' },
  { hsn:'30049039', name:'SUCRALFATE-1GM TAB', generic:'Sucralfate 1gm', packing:'10x10 Strips', company:'ABBOTT', batch:'ABT26SC01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:85.00, qty:150, free:15, rate:34.00, gst:12, tax:0, category:'Gastrointestinal', remarks:'Mucosal protective agent' },
  { hsn:'30049039', name:'SUCRALFATE SUSP 200ML', generic:'Sucralfate 1gm/10ml', packing:'1x200ml Bottle', company:'ABBOTT', batch:'ABT26SS01', expiry:'01/04/2028', mfg:'01/04/2025', mrp:125.00, qty:80, free:0, rate:65.00, gst:12, tax:0, category:'Gastrointestinal', remarks:'Sucralfate liquid' },

  // ==============================
  // NUTRACEUTICALS & VITAMINS
  // ==============================
  { hsn:'21069099', name:'B-COMPLEX FORTE TAB', generic:'Vitamin B1+B2+B3+B5+B6+B12+Folic Acid', packing:'10x10 Strips', company:'ABBOTT', batch:'ABT26BC01', expiry:'01/12/2028', mfg:'01/12/2025', mrp:35.00, qty:500, free:50, rate:14.00, gst:12, tax:0, category:'Nutraceuticals & Vitamins', remarks:'Vitamin B complex' },
  { hsn:'21069099', name:'BECOSULES CAP', generic:'Multivitamin B Complex + Vitamin C', packing:'10x20 Caps', company:'PFIZER', batch:'PFZ26BS01', expiry:'01/11/2028', mfg:'01/11/2025', mrp:42.00, qty:300, free:30, rate:24.00, gst:12, tax:0, category:'Nutraceuticals & Vitamins', remarks:'Popular B-complex capsule' },
  { hsn:'21069099', name:'CALCIUM+VITAMIN D3 TAB', generic:'Calcium 500mg + Vitamin D3 250IU', packing:'10x10 Strips', company:'ABBOTT', batch:'ABT26CD01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:75.00, qty:200, free:20, rate:30.00, gst:12, tax:0, category:'Nutraceuticals & Vitamins', remarks:'Bone health supplement' },
  { hsn:'21069099', name:'CALCITRIOL-0.25MCG CAP', generic:'Calcitriol 0.25mcg', packing:'10x10 Caps', company:'CADILA', batch:'CAD26CT01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:125.00, qty:100, free:10, rate:50.00, gst:12, tax:0, category:'Nutraceuticals & Vitamins', remarks:'Active vitamin D' },
  { hsn:'21069099', name:'CHOLECALCIFEROL (VIT D3)-60000IU CAP', generic:'Cholecalciferol 60000IU', packing:'1x4 Caps', company:'USV', batch:'USV26VD01', expiry:'01/12/2028', mfg:'01/12/2025', mrp:120.00, qty:100, free:0, rate:58.00, gst:12, tax:0, category:'Nutraceuticals & Vitamins', remarks:'Weekly Vitamin D3 supplement' },
  { hsn:'21069099', name:'FERROUS SULPHATE+FOLIC ACID TAB', generic:'Ferrous Sulphate 100mg + Folic Acid 0.5mg', packing:'10x10 Strips', company:'ALKEM', batch:'ALK26FS01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:18.00, qty:500, free:50, rate:6.50, gst:12, tax:0, category:'Nutraceuticals & Vitamins', remarks:'Iron supplement for anaemia' },
  { hsn:'21069099', name:'FOLIC ACID-5MG TAB', generic:'Folic Acid 5mg', packing:'10x10 Strips', company:'ALKEM', batch:'ALK26FA01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:12.00, qty:500, free:50, rate:4.50, gst:12, tax:0, category:'Nutraceuticals & Vitamins', remarks:'Folate supplement' },
  { hsn:'21069099', name:'IRON SUCROSE INJ 100MG/5ML', generic:'Iron Sucrose 100mg/5ml IV', packing:'1x5ml Ampoule', company:'EMCURE', batch:'EMC26IS01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:285.00, qty:50, free:0, rate:145.00, gst:12, tax:0, category:'Nutraceuticals & Vitamins', remarks:'IV iron for severe anaemia' },
  { hsn:'21069099', name:'LYCOPENE+MULTIVITAMIN TAB', generic:'Lycopene 6mg + Multivitamin + Multimineral', packing:'10x10 Strips', company:'MANKIND', batch:'MKD26LY01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:145.00, qty:100, free:10, rate:58.00, gst:12, tax:0, category:'Nutraceuticals & Vitamins', remarks:'Antioxidant multi supplement' },
  { hsn:'21069099', name:'METHYLCOBALAMIN-1500 TAB', generic:'Methylcobalamin 1500mcg', packing:'10x10 Strips', company:'INTAS', batch:'INT26MB01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:145.00, qty:150, free:15, rate:58.00, gst:12, tax:0, category:'Nutraceuticals & Vitamins', remarks:'Nerve vitamin B12' },
  { hsn:'21069099', name:'MULTIVITAMIN+MULTIMINERAL CAP', generic:'Vitamin A+B+C+D+E+Iron+Zinc+Selenium', packing:'10x10 Caps', company:'ABBOTT', batch:'ABT26MM01', expiry:'01/12/2028', mfg:'01/12/2025', mrp:95.00, qty:200, free:20, rate:38.00, gst:12, tax:0, category:'Nutraceuticals & Vitamins', remarks:'Complete daily supplement' },
  { hsn:'21069099', name:'OMEGA-3 FATTY ACID CAP', generic:'EPA 180mg + DHA 120mg', packing:'1x30 Caps', company:'INTAS', batch:'INT26OM01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:185.00, qty:80, free:0, rate:95.00, gst:12, tax:0, category:'Nutraceuticals & Vitamins', remarks:'Heart & brain health' },
  { hsn:'21069099', name:'VITAMIN C-500MG TAB', generic:'Ascorbic Acid 500mg Chewable', packing:'10x10 Strips', company:'ABBOTT', batch:'ABT26VC01', expiry:'01/11/2028', mfg:'01/11/2025', mrp:55.00, qty:300, free:30, rate:22.00, gst:12, tax:0, category:'Nutraceuticals & Vitamins', remarks:'Immunity booster' },
  { hsn:'21069099', name:'ZINC SULPHATE-20MG TAB', generic:'Zinc Sulphate 20mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26ZN01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:28.00, qty:300, free:30, rate:10.50, gst:12, tax:0, category:'Nutraceuticals & Vitamins', remarks:'Zinc for immunity & diarrhoea' },

  // ==============================
  // OINTMENTS & CREAMS
  // ==============================
  { hsn:'30049049', name:'BETAMETHASONE CREAM-15GM', generic:'Betamethasone 0.05% Cream', packing:'1x15gm Tube', company:'GLAXO', batch:'GSK26BM01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:32.00, qty:200, free:0, rate:16.00, gst:12, tax:0, category:'Ointments & Creams', remarks:'Topical steroid cream' },
  { hsn:'30049049', name:'CLOBETASOL PROPIONATE CREAM-15GM', generic:'Clobetasol Propionate 0.05%', packing:'1x15gm Tube', company:'GLENMARK', batch:'GLN26CB01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:48.00, qty:150, free:0, rate:24.00, gst:12, tax:0, category:'Ointments & Creams', remarks:'Super potent steroid' },
  { hsn:'30049049', name:'FRAMYCETIN SKIN CREAM-15GM', generic:'Framycetin Sulphate 1%', packing:'1x15gm Tube', company:'SANOFI', batch:'SAN26FR01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:68.00, qty:100, free:0, rate:38.00, gst:12, tax:0, category:'Ointments & Creams', remarks:'Topical antibiotic cream' },
  { hsn:'30049049', name:'FUSIDIC ACID CREAM-10GM', generic:'Fusidic Acid 2% Cream', packing:'1x10gm Tube', company:'DR REDDYS', batch:'DRL26FA01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:85.00, qty:100, free:0, rate:42.00, gst:12, tax:0, category:'Ointments & Creams', remarks:'Topical antibiotic' },
  { hsn:'30049049', name:'KETOCONAZOLE CREAM-15GM', generic:'Ketoconazole 2% Cream', packing:'1x15gm Tube', company:'GLENMARK', batch:'GLN26KC01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:75.00, qty:150, free:0, rate:38.00, gst:12, tax:0, category:'Ointments & Creams', remarks:'Antifungal cream' },
  { hsn:'30049049', name:'MICONAZOLE NITRATE CREAM-15GM', generic:'Miconazole Nitrate 2%', packing:'1x15gm Tube', company:'JANSSEN', batch:'JAN26MN01', expiry:'01/04/2028', mfg:'01/04/2025', mrp:55.00, qty:100, free:0, rate:28.00, gst:12, tax:0, category:'Ointments & Creams', remarks:'Antifungal for skin' },
  { hsn:'30049049', name:'MOMETASONE CREAM-15GM', generic:'Mometasone Furoate 0.1%', packing:'1x15gm Tube', company:'GLENMARK', batch:'GLN26MM01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:95.00, qty:100, free:0, rate:48.00, gst:12, tax:0, category:'Ointments & Creams', remarks:'Medium potency steroid' },
  { hsn:'30049049', name:'MUPIROCIN OINTMENT-5GM', generic:'Mupirocin 2%', packing:'1x5gm Tube', company:'GLAXO', batch:'GSK26MP01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:115.00, qty:80, free:0, rate:58.00, gst:12, tax:0, category:'Ointments & Creams', remarks:'For MRSA skin infections' },
  { hsn:'30049049', name:'NEOMYCIN+BECLOMETHASONE CREAM-15GM', generic:'Neomycin + Beclomethasone', packing:'1x15gm Tube', company:'CADILA', batch:'CAD26NB01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:48.00, qty:150, free:0, rate:24.00, gst:12, tax:0, category:'Ointments & Creams', remarks:'Antibiotic+steroid combo' },
  { hsn:'30049049', name:'PERMETHRIN CREAM-30GM', generic:'Permethrin 5% Cream', packing:'1x30gm Tube', company:'GALDERMA', batch:'GAL26PM01', expiry:'01/11/2028', mfg:'01/11/2025', mrp:65.00, qty:100, free:0, rate:32.00, gst:12, tax:0, category:'Ointments & Creams', remarks:'Scabies treatment' },
  { hsn:'30049049', name:'POVIDONE IODINE OINTMENT-15GM', generic:'Povidone Iodine 5% Ointment', packing:'1x15gm Tube', company:'WIN MEDICARE', batch:'WIN26PI01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:32.00, qty:200, free:0, rate:16.00, gst:12, tax:0, category:'Ointments & Creams', remarks:'Antiseptic ointment' },
  { hsn:'30049049', name:'SILVER SULFADIAZINE CREAM-25GM', generic:'Silver Sulfadiazine 1%', packing:'1x25gm Tube', company:'DR REDDYS', batch:'DRL26SS01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:55.00, qty:100, free:0, rate:28.00, gst:12, tax:0, category:'Ointments & Creams', remarks:'Burn wound cream' },
  { hsn:'30049049', name:'TERBINAFINE CREAM-15GM', generic:'Terbinafine HCl 1%', packing:'1x15gm Tube', company:'GLENMARK', batch:'GLN26TB01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:85.00, qty:100, free:0, rate:42.00, gst:12, tax:0, category:'Ointments & Creams', remarks:'Antifungal for ringworm' },

  // ==============================
  // INJECTABLES
  // ==============================
  { hsn:'30049099', name:'ADRENALINE INJ 1MG/ML', generic:'Epinephrine 1mg/ml', packing:'10x1ml Ampoule', company:'NEON', batch:'NEO26AD01', expiry:'01/04/2028', mfg:'01/04/2025', mrp:22.00, qty:200, free:0, rate:8.50, gst:12, tax:0, category:'Injectables', remarks:'Emergency anaphylaxis' },
  { hsn:'30049099', name:'AMIKACIN INJ 500MG/2ML', generic:'Amikacin 500mg/2ml', packing:'1x2ml Vial', company:'ARISTO', batch:'ARI26AK01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:42.00, qty:150, free:0, rate:18.00, gst:12, tax:0, category:'Injectables', remarks:'Aminoglycoside IV/IM' },
  { hsn:'30049099', name:'ATROPINE INJ 0.6MG/ML', generic:'Atropine Sulphate 0.6mg/ml', packing:'10x1ml Ampoule', company:'NEON', batch:'NEO26AT01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:8.00, qty:300, free:0, rate:3.00, gst:12, tax:0, category:'Injectables', remarks:'Anticholinergic emergency' },
  { hsn:'30049099', name:'DEXAMETHASONE INJ 4MG/ML', generic:'Dexamethasone Sodium Phosphate 4mg/ml', packing:'10x1ml Ampoule', company:'CADILA', batch:'CAD26DX01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:12.00, qty:300, free:0, rate:4.50, gst:12, tax:0, category:'Injectables', remarks:'Corticosteroid injection' },
  { hsn:'30049099', name:'DIAZEPAM INJ 10MG/2ML', generic:'Diazepam 10mg/2ml', packing:'10x2ml Ampoule', company:'ABBOTT', batch:'ABT26DZ01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:15.00, qty:200, free:0, rate:5.50, gst:12, tax:0, category:'Injectables', remarks:'Benzodiazepine for seizures' },
  { hsn:'30049099', name:'HYDROCORTISONE INJ 100MG', generic:'Hydrocortisone Sodium Succinate 100mg', packing:'1x1 Vial+WFI', company:'PFIZER', batch:'PFZ26HC01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:38.00, qty:200, free:0, rate:15.00, gst:12, tax:0, category:'Injectables', remarks:'Emergency steroid' },
  { hsn:'30049099', name:'METHYLPREDNISOLONE INJ 40MG', generic:'Methylprednisolone Acetate 40mg/ml', packing:'1x1ml Vial', company:'PFIZER', batch:'PFZ26MP01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:125.00, qty:80, free:0, rate:62.00, gst:12, tax:0, category:'Injectables', remarks:'Depot steroid injection' },
  { hsn:'30049099', name:'ONDANSETRON INJ 4MG/2ML', generic:'Ondansetron 4mg/2ml IV/IM', packing:'5x2ml Ampoule', company:'SUN PHARMA', batch:'SUN26OJ01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:18.00, qty:200, free:0, rate:6.50, gst:12, tax:0, category:'Injectables', remarks:'Anti-emetic injection' },
  { hsn:'30049099', name:'PANTOPRAZOLE INJ 40MG', generic:'Pantoprazole 40mg IV', packing:'1x1 Vial+WFI', company:'ALKEM', batch:'ALK26PJ01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:45.00, qty:200, free:0, rate:18.00, gst:12, tax:0, category:'Injectables', remarks:'IV PPI for GI bleed' },
  { hsn:'30049099', name:'PHENYTOIN INJ 250MG/5ML', generic:'Phenytoin Sodium 250mg/5ml', packing:'5x5ml Ampoule', company:'NEON', batch:'NEO26PH01', expiry:'01/04/2028', mfg:'01/04/2025', mrp:22.00, qty:100, free:0, rate:8.50, gst:12, tax:0, category:'Injectables', remarks:'Anti-epileptic injection' },
  { hsn:'30049099', name:'RANITIDINE INJ 50MG/2ML', generic:'Ranitidine 50mg/2ml', packing:'10x2ml Ampoule', company:'CADILA', batch:'CAD26RN01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:10.00, qty:300, free:0, rate:3.50, gst:12, tax:0, category:'Injectables', remarks:'H2 blocker injection' },
  { hsn:'30049099', name:'TRAMADOL INJ 100MG/2ML', generic:'Tramadol HCl 100mg/2ml', packing:'5x2ml Ampoule', company:'CIPLA', batch:'CIP26TJ01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:28.00, qty:150, free:0, rate:12.00, gst:12, tax:0, category:'Injectables', remarks:'Opioid analgesic injection' },

  // ==============================
  // MEDICAL DEVICES & SURGICALS
  // ==============================
  { hsn:'90189090', name:'ADHESIVE BANDAGE (BAND-AID) 100s', generic:'Adhesive Sterile Bandage Strip', packing:'1x100 Box', company:'JOHNSON', batch:'JNJ26AB01', expiry:'01/12/2030', mfg:'01/12/2025', mrp:85.00, qty:50, free:0, rate:48.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'Adhesive wound strips' },
  { hsn:'90189090', name:'BP APPARATUS DIGITAL', generic:'Digital Blood Pressure Monitor', packing:'1 Unit Box', company:'OMRON', batch:'OMR26BP01', expiry:'01/12/2030', mfg:'01/12/2025', mrp:2200.00, qty:10, free:0, rate:1450.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'Digital BP monitor' },
  { hsn:'90189090', name:'COTTON ROLL 500GM', generic:'Absorbent Cotton Roll 500gm', packing:'1x500gm Pack', company:'MEDILINE', batch:'MDL26CR01', expiry:'01/12/2030', mfg:'01/12/2025', mrp:185.00, qty:50, free:0, rate:105.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'Surgical cotton roll' },
  { hsn:'90189090', name:'CREPE BANDAGE-10CM', generic:'Elastic Crepe Bandage 10cm x 4m', packing:'1x1 Roll', company:'ROMSONS', batch:'ROM26CB01', expiry:'01/12/2030', mfg:'01/12/2025', mrp:32.00, qty:100, free:0, rate:18.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'Elastic support bandage' },
  { hsn:'90189090', name:'DIGITAL THERMOMETER', generic:'Digital Clinical Thermometer', packing:'1 Unit', company:'OMRON', batch:'OMR26DT01', expiry:'01/12/2030', mfg:'01/12/2025', mrp:125.00, qty:50, free:0, rate:72.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'Fever thermometer' },
  { hsn:'90189090', name:'DISPOSABLE SYRINGE-10ML', generic:'Disposable Syringe 10ml', packing:'1x100 Box', company:'HINDUSTAN SYRINGES', batch:'HMD26DS01', expiry:'01/12/2030', mfg:'01/12/2025', mrp:350.00, qty:50, free:0, rate:210.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'10ml syringe box' },
  { hsn:'90189090', name:'DISPOSABLE SYRINGE-2ML', generic:'Disposable Syringe 2ml', packing:'1x100 Box', company:'HINDUSTAN SYRINGES', batch:'HMD26DS02', expiry:'01/12/2030', mfg:'01/12/2025', mrp:200.00, qty:80, free:0, rate:120.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'2ml syringe box' },
  { hsn:'90189090', name:'GAUZE ROLL 6CM x 3M', generic:'Sterile Gauze Roll', packing:'1x12 Pack', company:'MEDILINE', batch:'MDL26GR01', expiry:'01/12/2030', mfg:'01/12/2025', mrp:95.00, qty:50, free:0, rate:55.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'Sterile gauze dressing' },
  { hsn:'90189090', name:'IV CANNULA-20G (GREEN)', generic:'IV Cannula 20G', packing:'1x50 Box', company:'BD', batch:'BD26IC01', expiry:'01/12/2030', mfg:'01/12/2025', mrp:650.00, qty:30, free:0, rate:380.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'Green 20G IV catheter' },
  { hsn:'90189090', name:'IV CANNULA-22G (BLUE)', generic:'IV Cannula 22G', packing:'1x50 Box', company:'BD', batch:'BD26IC02', expiry:'01/12/2030', mfg:'01/12/2025', mrp:650.00, qty:30, free:0, rate:380.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'Blue 22G IV catheter' },
  { hsn:'90189090', name:'IV SET (INFUSION SET)', generic:'Disposable IV Infusion Set', packing:'1x50 Box', company:'ROMSONS', batch:'ROM26IV01', expiry:'01/12/2030', mfg:'01/12/2025', mrp:450.00, qty:30, free:0, rate:260.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'Standard IV infusion set' },
  { hsn:'90189090', name:'MICROPORE TAPE-1 INCH', generic:'Surgical Paper Tape 1" x 9.1m', packing:'1x1 Roll', company:'3M', batch:'3M26MT01', expiry:'01/12/2030', mfg:'01/12/2025', mrp:55.00, qty:100, free:0, rate:32.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'Hypoallergenic tape' },
  { hsn:'90189090', name:'NEBULIZER MASK (ADULT)', generic:'Nebulizer Mask with Tubing Adult', packing:'1 Unit', company:'ROMSONS', batch:'ROM26NM01', expiry:'01/12/2030', mfg:'01/12/2025', mrp:85.00, qty:30, free:0, rate:48.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'Adult nebulizer mask' },
  { hsn:'90189090', name:'OXYGEN MASK (ADULT) WITH TUBING', generic:'Oxygen Therapy Mask Adult', packing:'1 Unit', company:'ROMSONS', batch:'ROM26OM01', expiry:'01/12/2030', mfg:'01/12/2025', mrp:55.00, qty:30, free:0, rate:32.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'O2 delivery mask' },
  { hsn:'90189090', name:'PULSE OXIMETER FINGER', generic:'Digital Fingertip SpO2 Monitor', packing:'1 Unit', company:'OMRON', batch:'OMR26PO01', expiry:'01/12/2030', mfg:'01/12/2025', mrp:950.00, qty:20, free:0, rate:580.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'SpO2 monitor' },
  { hsn:'90189090', name:'SCALP VEIN SET-23G (BUTTERFLY)', generic:'Scalp Vein Set 23G Butterfly Needle', packing:'1x100 Box', company:'ROMSONS', batch:'ROM26SV01', expiry:'01/12/2030', mfg:'01/12/2025', mrp:450.00, qty:30, free:0, rate:260.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'Paediatric IV access' },
  { hsn:'90189090', name:'STETHOSCOPE (DUAL HEAD)', generic:'Dual Head Stethoscope', packing:'1 Unit Box', company:'LITTMANN', batch:'LIT26ST01', expiry:'01/12/2030', mfg:'01/12/2025', mrp:650.00, qty:10, free:0, rate:380.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'Auscultation device' },
  { hsn:'90189090', name:'SUTURE SILK 2-0 (NON-ABSORBABLE)', generic:'Silk Braided Suture 2-0 75cm', packing:'1x12 Pack', company:'ETHICON', batch:'ETH26SS01', expiry:'01/12/2030', mfg:'01/12/2025', mrp:285.00, qty:30, free:0, rate:165.00, gst:12, tax:0, category:'Medical Devices & Surgicals', remarks:'Non-absorbable suture' },

  // ==============================
  // DIAGNOSTIC EQUIPMENT
  // ==============================
  { hsn:'90279090', name:'BLOOD GLUCOSE STRIPS (50s)', generic:'Glucose Test Strips 50pcs', packing:'1x50 Strips', company:'ON CALL', batch:'ONC26BG01', expiry:'01/06/2027', mfg:'01/06/2025', mrp:450.00, qty:50, free:0, rate:265.00, gst:12, tax:0, category:'Diagnostic Equipment', remarks:'Glucometer test strips' },
  { hsn:'90279090', name:'HB METER STRIPS (50s)', generic:'Haemoglobin Test Strips 50pcs', packing:'1x50 Strips', company:'TRUE HB', batch:'THB26HB01', expiry:'01/05/2027', mfg:'01/05/2025', mrp:650.00, qty:30, free:0, rate:385.00, gst:12, tax:0, category:'Diagnostic Equipment', remarks:'HB meter test strips' },
  { hsn:'90279090', name:'LANCETS (100s)', generic:'Sterile Blood Lancets 28G', packing:'1x100 Box', company:'BD', batch:'BD26LC01', expiry:'01/12/2030', mfg:'01/12/2025', mrp:85.00, qty:50, free:0, rate:48.00, gst:12, tax:0, category:'Diagnostic Equipment', remarks:'Blood sampling lancets' },
  { hsn:'90279090', name:'PREGNANCY TEST KIT', generic:'HCG Urine Pregnancy Test Card', packing:'1x25 Kits', company:'PIRAMAL', batch:'PIR26PT01', expiry:'01/08/2027', mfg:'01/08/2025', mrp:250.00, qty:30, free:0, rate:145.00, gst:12, tax:0, category:'Diagnostic Equipment', remarks:'Rapid pregnancy detection' },
  { hsn:'90279090', name:'URINE ANALYSIS STRIPS (100s)', generic:'Urine Reagent Strip 10-Parameter', packing:'1x100 Strips', company:'URITEST', batch:'URI26UA01', expiry:'01/07/2027', mfg:'01/07/2025', mrp:350.00, qty:30, free:0, rate:205.00, gst:12, tax:0, category:'Diagnostic Equipment', remarks:'Dipstick urine analysis' },

  // ==============================
  // AYURVEDIC & TRADITIONAL
  // ==============================
  { hsn:'30049089', name:'ASHWAGANDHA TAB 500MG', generic:'Ashwagandha Extract 500mg', packing:'1x60 Tabs', company:'HIMALAYA', batch:'HIM26AW01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:185.00, qty:100, free:0, rate:95.00, gst:12, tax:0, category:'Ayurvedic & Traditional', remarks:'Adaptogenic herb' },
  { hsn:'30049089', name:'CHYAWANPRASH 500GM', generic:'Chyawanprash Avaleha', packing:'1x500gm Jar', company:'DABUR', batch:'DAB26CP01', expiry:'01/12/2027', mfg:'01/12/2025', mrp:220.00, qty:50, free:0, rate:135.00, gst:12, tax:0, category:'Ayurvedic & Traditional', remarks:'Traditional immunity' },
  { hsn:'30049089', name:'DASAMOOLARISHTA 450ML', generic:'Dashamoola Arishta', packing:'1x450ml Bottle', company:'ARYA VAIDYA SALA', batch:'AVS26DA01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:95.00, qty:80, free:0, rate:55.00, gst:12, tax:0, category:'Ayurvedic & Traditional', remarks:'Traditional tonic' },
  { hsn:'30049089', name:'DHANWANTHARAM OIL 200ML', generic:'Dhanwantharam Thailam', packing:'1x200ml Bottle', company:'KOTTAKKAL', batch:'KTK26DW01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:165.00, qty:60, free:0, rate:95.00, gst:12, tax:0, category:'Ayurvedic & Traditional', remarks:'Joint & muscle oil' },
  { hsn:'30049089', name:'GUDUCHI (GILOY) TAB', generic:'Tinospora Cordifolia Extract', packing:'1x60 Tabs', company:'HIMALAYA', batch:'HIM26GD01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:145.00, qty:100, free:0, rate:75.00, gst:12, tax:0, category:'Ayurvedic & Traditional', remarks:'Immunity booster herb' },
  { hsn:'30049089', name:'KOTTAMCHUKKADI THAILAM 200ML', generic:'Kottamchukkadi Oil', packing:'1x200ml Bottle', company:'ARYA VAIDYA SALA', batch:'AVS26KT01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:175.00, qty:50, free:0, rate:105.00, gst:12, tax:0, category:'Ayurvedic & Traditional', remarks:'Pain relief oil' },
  { hsn:'30049089', name:'LIV.52 TAB', generic:'Capparis Spinosa + Cichorium Intybus', packing:'1x100 Tabs', company:'HIMALAYA', batch:'HIM26LV01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:145.00, qty:100, free:0, rate:82.00, gst:12, tax:0, category:'Ayurvedic & Traditional', remarks:'Liver protective herbal' },
  { hsn:'30049089', name:'TRIPHALA CHURNA 100GM', generic:'Triphala Powder', packing:'1x100gm Pack', company:'DABUR', batch:'DAB26TC01', expiry:'01/04/2028', mfg:'01/04/2025', mrp:55.00, qty:100, free:0, rate:32.00, gst:12, tax:0, category:'Ayurvedic & Traditional', remarks:'Digestive herbal powder' },

  // ==============================
  // ANTI-INFECTIVES / ANTI-PARASITIC
  // ==============================
  { hsn:'30049021', name:'ALBENDAZOLE-400 SUSP', generic:'Albendazole 400mg/10ml Suspension', packing:'1x10ml Bottle', company:'CIPLA', batch:'CIP26AB01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:12.00, qty:300, free:30, rate:4.50, gst:12, tax:0, category:'General', remarks:'Deworming suspension' },
  { hsn:'30049021', name:'FLUCONAZOLE-150 CAP', generic:'Fluconazole 150mg', packing:'1x1 Cap', company:'CIPLA', batch:'CIP26FL01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:22.00, qty:200, free:0, rate:8.50, gst:12, tax:0, category:'General', remarks:'Antifungal single dose' },
  { hsn:'30049021', name:'FLUCONAZOLE-200 TAB', generic:'Fluconazole 200mg', packing:'10x4 Strips', company:'CIPLA', batch:'CIP26FL02', expiry:'01/07/2028', mfg:'01/07/2025', mrp:68.00, qty:100, free:10, rate:28.00, gst:12, tax:0, category:'General', remarks:'Higher dose antifungal' },
  { hsn:'30049021', name:'IVERMECTIN-12MG TAB', generic:'Ivermectin 12mg', packing:'10x10 Strips', company:'MANKIND', batch:'MKD26IV01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:75.00, qty:100, free:10, rate:30.00, gst:12, tax:0, category:'General', remarks:'Antiparasitic' },
  { hsn:'30049021', name:'SECNIDAZOLE-1GM TAB', generic:'Secnidazole 1gm', packing:'10x2 Strips', company:'LUPIN', batch:'LUP26SN01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:55.00, qty:200, free:20, rate:22.00, gst:12, tax:0, category:'General', remarks:'Anti-amoebic single dose' },

  // ==============================
  // RESPIRATORY / ENT
  // ==============================
  { hsn:'30049049', name:'AMBROXOL-30 TAB', generic:'Ambroxol HCl 30mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26AX01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:28.00, qty:300, free:30, rate:10.50, gst:12, tax:0, category:'General', remarks:'Mucolytic expectorant' },
  { hsn:'30049049', name:'AMBROXOL+GUAIPHENESIN+LEVOSALBUTAMOL SYP 100ML', generic:'Ambroxol+Guaiphenesin+Levosalbutamol', packing:'1x100ml Bottle', company:'CIPLA', batch:'CIP26AG01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:75.00, qty:100, free:10, rate:38.00, gst:12, tax:0, category:'General', remarks:'Cough syrup triple combo' },
  { hsn:'30049049', name:'BUDESONIDE RESPULES 0.5MG/2ML', generic:'Budesonide 0.5mg/2ml Nebulisation', packing:'5x5 Respules', company:'CIPLA', batch:'CIP26BD01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:105.00, qty:80, free:0, rate:52.00, gst:12, tax:0, category:'General', remarks:'Inhaled corticosteroid nebule' },
  { hsn:'30049049', name:'CETIRIZINE-10 TAB', generic:'Cetirizine HCl 10mg', packing:'10x10 Strips', company:'DR REDDYS', batch:'DRL26CZ01', expiry:'01/12/2028', mfg:'01/12/2025', mrp:22.00, qty:500, free:50, rate:8.00, gst:12, tax:0, category:'General', remarks:'Antihistamine for allergy' },
  { hsn:'30049049', name:'CHLORPHENIRAMINE-4MG TAB', generic:'Chlorpheniramine Maleate 4mg', packing:'10x10 Strips', company:'ALKEM', batch:'ALK26CP01', expiry:'01/11/2028', mfg:'01/11/2025', mrp:8.00, qty:500, free:50, rate:3.00, gst:12, tax:0, category:'General', remarks:'1st gen antihistamine' },
  { hsn:'30049049', name:'DEXTROMETHORPHAN+CPM SYP 100ML', generic:'Dextromethorphan 10mg + CPM 2mg/5ml', packing:'1x100ml Bottle', company:'ABBOTT', batch:'ABT26DX01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:65.00, qty:100, free:10, rate:32.00, gst:12, tax:0, category:'General', remarks:'Dry cough suppressant' },
  { hsn:'30049049', name:'FEXOFENADINE-120 TAB', generic:'Fexofenadine HCl 120mg', packing:'10x10 Strips', company:'SANOFI', batch:'SAN26FX01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:105.00, qty:150, free:15, rate:42.00, gst:12, tax:0, category:'General', remarks:'Non-sedating antihistamine' },
  { hsn:'30049049', name:'LEVOCETIRIZINE-5MG TAB', generic:'Levocetirizine 5mg', packing:'10x10 Strips', company:'GLENMARK', batch:'GLN26LC01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:35.00, qty:300, free:30, rate:14.00, gst:12, tax:0, category:'General', remarks:'Potent antihistamine' },
  { hsn:'30049049', name:'MONTELUKAST-10 TAB', generic:'Montelukast Sodium 10mg', packing:'10x10 Strips', company:'SUN PHARMA', batch:'SUN26MK01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:95.00, qty:200, free:20, rate:38.00, gst:12, tax:0, category:'General', remarks:'Leukotriene antagonist for asthma' },
  { hsn:'30049049', name:'MONTELUKAST+LEVOCETIRIZINE TAB', generic:'Montelukast 10mg + Levocetirizine 5mg', packing:'10x10 Strips', company:'SUN PHARMA', batch:'SUN26ML01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:135.00, qty:150, free:15, rate:54.00, gst:12, tax:0, category:'General', remarks:'Allergy+asthma combo' },
  { hsn:'30049049', name:'SALBUTAMOL INHALER 100MCG (ASTHALIN)', generic:'Salbutamol 100mcg/puff MDI', packing:'1x200 Puffs', company:'CIPLA', batch:'CIP26SI01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:125.00, qty:50, free:0, rate:68.00, gst:12, tax:0, category:'General', remarks:'Rescue bronchodilator' },
  { hsn:'30049049', name:'THEOPHYLLINE-300SR TAB', generic:'Theophylline 300mg Sustained Release', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26TH01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:55.00, qty:200, free:20, rate:22.00, gst:12, tax:0, category:'General', remarks:'Bronchodilator for COPD' },

  // ==============================
  // CNS / NEURO / PSYCH
  // ==============================
  { hsn:'30049059', name:'ALPRAZOLAM-0.25MG TAB', generic:'Alprazolam 0.25mg', packing:'10x10 Strips', company:'TORRENT', batch:'TOR26AZ01', expiry:'01/04/2028', mfg:'01/04/2025', mrp:18.00, qty:200, free:0, rate:6.50, gst:12, tax:0, category:'General', remarks:'Anxiolytic benzodiazepine' },
  { hsn:'30049059', name:'AMITRIPTYLINE-25MG TAB', generic:'Amitriptyline HCl 25mg', packing:'10x10 Strips', company:'INTAS', batch:'INT26AM01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:22.00, qty:200, free:20, rate:8.50, gst:12, tax:0, category:'General', remarks:'Tricyclic antidepressant' },
  { hsn:'30049059', name:'CARBAMAZEPINE-200 TAB', generic:'Carbamazepine 200mg', packing:'10x10 Strips', company:'NOVARTIS', batch:'NOV26CB01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:28.00, qty:200, free:20, rate:10.50, gst:12, tax:0, category:'General', remarks:'Anti-epileptic' },
  { hsn:'30049059', name:'CLONAZEPAM-0.5MG TAB', generic:'Clonazepam 0.5mg', packing:'10x10 Strips', company:'SUN PHARMA', batch:'SUN26CZ01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:22.00, qty:200, free:0, rate:8.00, gst:12, tax:0, category:'General', remarks:'Anti-anxiety/seizure' },
  { hsn:'30049059', name:'DONEPEZIL-5MG TAB', generic:'Donepezil HCl 5mg', packing:'10x10 Strips', company:'SUN PHARMA', batch:'SUN26DN01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:145.00, qty:80, free:0, rate:58.00, gst:12, tax:0, category:'General', remarks:'Alzheimer disease' },
  { hsn:'30049059', name:'ESCITALOPRAM-10MG TAB', generic:'Escitalopram Oxalate 10mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26EC01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:85.00, qty:150, free:15, rate:34.00, gst:12, tax:0, category:'General', remarks:'SSRI antidepressant' },
  { hsn:'30049059', name:'GABAPENTIN-300 CAP', generic:'Gabapentin 300mg', packing:'10x10 Caps', company:'PFIZER', batch:'PFZ26GB01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:115.00, qty:150, free:15, rate:46.00, gst:12, tax:0, category:'General', remarks:'Neuropathic pain / epilepsy' },
  { hsn:'30049059', name:'HALOPERIDOL-5MG TAB', generic:'Haloperidol 5mg', packing:'10x10 Strips', company:'JOHNSON', batch:'JNJ26HP01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:18.00, qty:200, free:0, rate:6.50, gst:12, tax:0, category:'General', remarks:'Typical antipsychotic' },
  { hsn:'30049059', name:'LEVETIRACETAM-500 TAB', generic:'Levetiracetam 500mg', packing:'10x10 Strips', company:'SUN PHARMA', batch:'SUN26LV01', expiry:'01/11/2028', mfg:'01/11/2025', mrp:145.00, qty:100, free:10, rate:58.00, gst:12, tax:0, category:'General', remarks:'Modern anti-epileptic' },
  { hsn:'30049059', name:'LITHIUM CARBONATE-300 TAB', generic:'Lithium Carbonate 300mg', packing:'10x10 Strips', company:'SUN PHARMA', batch:'SUN26LT01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:22.00, qty:200, free:0, rate:8.50, gst:12, tax:0, category:'General', remarks:'Mood stabiliser bipolar' },
  { hsn:'30049059', name:'OLANZAPINE-5MG TAB', generic:'Olanzapine 5mg', packing:'10x10 Strips', company:'SUN PHARMA', batch:'SUN26OZ01', expiry:'01/04/2028', mfg:'01/04/2025', mrp:48.00, qty:150, free:15, rate:18.50, gst:12, tax:0, category:'General', remarks:'Atypical antipsychotic' },
  { hsn:'30049059', name:'PHENYTOIN-100 TAB', generic:'Phenytoin Sodium 100mg', packing:'10x10 Strips', company:'ABBOTT', batch:'ABT26PH01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:15.00, qty:300, free:30, rate:5.50, gst:12, tax:0, category:'General', remarks:'Anti-epileptic for seizures' },
  { hsn:'30049059', name:'PREGABALIN-75MG CAP', generic:'Pregabalin 75mg', packing:'10x10 Caps', company:'PFIZER', batch:'PFZ26PG01', expiry:'01/12/2028', mfg:'01/12/2025', mrp:135.00, qty:150, free:15, rate:54.00, gst:12, tax:0, category:'General', remarks:'Neuropathic pain' },
  { hsn:'30049059', name:'QUETIAPINE-25MG TAB', generic:'Quetiapine Fumarate 25mg', packing:'10x10 Strips', company:'AstraZeneca', batch:'AZN26QT01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:55.00, qty:100, free:10, rate:22.00, gst:12, tax:0, category:'General', remarks:'Atypical antipsychotic' },
  { hsn:'30049059', name:'SERTRALINE-50MG TAB', generic:'Sertraline HCl 50mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26SR01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:72.00, qty:150, free:15, rate:28.00, gst:12, tax:0, category:'General', remarks:'SSRI for depression/OCD' },
  { hsn:'30049059', name:'SODIUM VALPROATE-200 TAB', generic:'Sodium Valproate 200mg', packing:'10x10 Strips', company:'SUN PHARMA', batch:'SUN26SV01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:32.00, qty:200, free:20, rate:12.50, gst:12, tax:0, category:'General', remarks:'Anti-epileptic/mood stabiliser' },

  // ==============================
  // MISCELLANEOUS / OTHER COMMON
  // ==============================
  { hsn:'30049069', name:'ATENOLOL+CHLORTHALIDONE TAB', generic:'Atenolol 50mg + Chlorthalidone 12.5mg', packing:'10x10 Strips', company:'TORRENT', batch:'TOR26AC01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:55.00, qty:200, free:20, rate:22.00, gst:12, tax:0, category:'Cardiovascular', remarks:'BB+Diuretic combo' },
  { hsn:'30049049', name:'DERIPHYLLIN (ETOPHYLLINE+THEOPHYLLINE) TAB', generic:'Etophylline 77mg + Theophylline 23mg', packing:'10x10 Strips', company:'ABBOTT', batch:'ABT26DP01', expiry:'01/11/2028', mfg:'01/11/2025', mrp:28.00, qty:200, free:20, rate:10.50, gst:12, tax:0, category:'General', remarks:'Bronchodilator for asthma' },
  { hsn:'30049049', name:'DOXOFYLLINE-400 TAB', generic:'Doxofylline 400mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26DF01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:115.00, qty:100, free:10, rate:46.00, gst:12, tax:0, category:'General', remarks:'Modern bronchodilator' },
  { hsn:'30049039', name:'URSODEOXYCHOLIC ACID-300 TAB', generic:'Ursodeoxycholic Acid 300mg', packing:'10x10 Strips', company:'DR REDDYS', batch:'DRL26UD01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:185.00, qty:100, free:10, rate:74.00, gst:12, tax:0, category:'Gastrointestinal', remarks:'Gallstone dissolution' },
  { hsn:'30049069', name:'TAMSULOSIN-0.4MG CAP', generic:'Tamsulosin HCl 0.4mg MR', packing:'10x10 Caps', company:'SUN PHARMA', batch:'SUN26TM01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:95.00, qty:150, free:15, rate:38.00, gst:12, tax:0, category:'General', remarks:'Alpha blocker for BPH' },
  { hsn:'30049069', name:'FINASTERIDE-5MG TAB', generic:'Finasteride 5mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26FN01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:115.00, qty:100, free:10, rate:46.00, gst:12, tax:0, category:'General', remarks:'5-alpha reductase inhibitor' },
  { hsn:'30049069', name:'SILDENAFIL-50MG TAB', generic:'Sildenafil Citrate 50mg', packing:'1x4 Strips', company:'CIPLA', batch:'CIP26SD01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:125.00, qty:50, free:0, rate:55.00, gst:12, tax:0, category:'General', remarks:'PDE5 inhibitor' },
  { hsn:'30049069', name:'TADALAFIL-10MG TAB', generic:'Tadalafil 10mg', packing:'1x4 Strips', company:'CIPLA', batch:'CIP26TD01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:145.00, qty:50, free:0, rate:62.00, gst:12, tax:0, category:'General', remarks:'Long acting PDE5 inhibitor' },
  { hsn:'30049069', name:'PREDNISOLONE-5MG TAB', generic:'Prednisolone 5mg', packing:'10x10 Strips', company:'CADILA', batch:'CAD26PR01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:15.00, qty:400, free:40, rate:5.50, gst:12, tax:0, category:'General', remarks:'Corticosteroid anti-inflammatory' },
  { hsn:'30049069', name:'PREDNISOLONE-10MG TAB', generic:'Prednisolone 10mg', packing:'10x10 Strips', company:'CADILA', batch:'CAD26PR02', expiry:'01/09/2028', mfg:'01/09/2025', mrp:28.00, qty:300, free:30, rate:10.50, gst:12, tax:0, category:'General', remarks:'Higher dose steroid' },
  { hsn:'30049069', name:'DEFLAZACORT-6MG TAB', generic:'Deflazacort 6mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26DZ01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:95.00, qty:100, free:10, rate:38.00, gst:12, tax:0, category:'General', remarks:'Oxazoline corticosteroid' },
  { hsn:'30049069', name:'HYDROXYCHLOROQUINE-300 TAB', generic:'Hydroxychloroquine Sulphate 300mg', packing:'10x10 Strips', company:'IPCA', batch:'IPC26HQ01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:85.00, qty:100, free:10, rate:34.00, gst:12, tax:0, category:'General', remarks:'DMARD for RA / SLE' },
  { hsn:'30049069', name:'LEVOTHYROXINE-50MCG TAB', generic:'Levothyroxine Sodium 50mcg', packing:'10x10 Strips', company:'ABBOTT', batch:'ABT26LT01', expiry:'01/12/2028', mfg:'01/12/2025', mrp:75.00, qty:200, free:20, rate:30.00, gst:12, tax:0, category:'General', remarks:'Thyroid hormone replacement' },
  { hsn:'30049069', name:'LEVOTHYROXINE-100MCG TAB', generic:'Levothyroxine Sodium 100mcg', packing:'10x10 Strips', company:'ABBOTT', batch:'ABT26LT02', expiry:'01/11/2028', mfg:'01/11/2025', mrp:95.00, qty:200, free:20, rate:38.00, gst:12, tax:0, category:'General', remarks:'Standard thyroid dose' },
  { hsn:'30049069', name:'CARBIMAZOLE-5MG TAB', generic:'Carbimazole 5mg', packing:'10x10 Strips', company:'ABBOTT', batch:'ABT26CM01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:22.00, qty:200, free:20, rate:8.50, gst:12, tax:0, category:'General', remarks:'Anti-thyroid medication' },

  // ==============================
  // IV FLUIDS & SOLUTIONS
  // ==============================
  { hsn:'30049099', name:'DEXTROSE 5% (D5W) 500ML', generic:'Dextrose 5% IV Solution', packing:'1x500ml Bottle', company:'FRESENIUS KABI', batch:'FRK26DX01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:32.00, qty:100, free:0, rate:18.00, gst:12, tax:0, category:'Injectables', remarks:'IV dextrose fluid' },
  { hsn:'30049099', name:'NORMAL SALINE (NS) 500ML', generic:'Sodium Chloride 0.9% IV Solution', packing:'1x500ml Bottle', company:'FRESENIUS KABI', batch:'FRK26NS01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:28.00, qty:100, free:0, rate:15.00, gst:12, tax:0, category:'Injectables', remarks:'IV normal saline' },
  { hsn:'30049099', name:'RINGER LACTATE (RL) 500ML', generic:'Ringer Lactate IV Solution', packing:'1x500ml Bottle', company:'FRESENIUS KABI', batch:'FRK26RL01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:35.00, qty:100, free:0, rate:20.00, gst:12, tax:0, category:'Injectables', remarks:'Balanced electrolyte solution' },
  { hsn:'30049099', name:'DNS (DEXTROSE NORMAL SALINE) 500ML', generic:'Dextrose 5% + NaCl 0.9% IV', packing:'1x500ml Bottle', company:'FRESENIUS KABI', batch:'FRK26DN01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:38.00, qty:80, free:0, rate:22.00, gst:12, tax:0, category:'Injectables', remarks:'Combined IV fluid' },

  // ==============================
  // EYE / EAR DROPS
  // ==============================
  { hsn:'30049049', name:'CIPROFLOXACIN EYE DROPS 0.3% 10ML', generic:'Ciprofloxacin 0.3% Eye Drops', packing:'1x10ml Bottle', company:'CIPLA', batch:'CIP26CE01', expiry:'01/04/2028', mfg:'01/04/2025', mrp:32.00, qty:100, free:0, rate:16.00, gst:12, tax:0, category:'General', remarks:'Antibiotic eye drops' },
  { hsn:'30049049', name:'MOXIFLOXACIN EYE DROPS 0.5% 5ML', generic:'Moxifloxacin 0.5% Ophthalmic', packing:'1x5ml Bottle', company:'ALCON', batch:'ALC26MX01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:85.00, qty:80, free:0, rate:42.00, gst:12, tax:0, category:'General', remarks:'4th gen antibiotic eye drops' },
  { hsn:'30049049', name:'OFLOXACIN EYE DROPS 0.3% 10ML', generic:'Ofloxacin 0.3% Eye Drops', packing:'1x10ml Bottle', company:'CIPLA', batch:'CIP26OE01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:38.00, qty:100, free:0, rate:18.00, gst:12, tax:0, category:'General', remarks:'Fluoroquinolone eye drops' },
  { hsn:'30049049', name:'TIMOLOL EYE DROPS 0.5% 5ML', generic:'Timolol Maleate 0.5% Eye Drops', packing:'1x5ml Bottle', company:'ALCON', batch:'ALC26TM01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:55.00, qty:80, free:0, rate:28.00, gst:12, tax:0, category:'General', remarks:'Glaucoma eye drops' },
  { hsn:'30049049', name:'TROPICAMIDE EYE DROPS 1% 5ML', generic:'Tropicamide 1% Eye Drops', packing:'1x5ml Bottle', company:'CIPLA', batch:'CIP26TP01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:42.00, qty:80, free:0, rate:22.00, gst:12, tax:0, category:'General', remarks:'Mydriatic eye drops' },
  { hsn:'30049049', name:'TOBRAMYCIN EYE DROPS 0.3% 5ML', generic:'Tobramycin 0.3% Eye Drops', packing:'1x5ml Bottle', company:'ALCON', batch:'ALC26TB01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:65.00, qty:80, free:0, rate:32.00, gst:12, tax:0, category:'General', remarks:'Aminoglycoside eye drops' },
  { hsn:'30049049', name:'CIPROFLOXACIN+DEXAMETHASONE EAR DROPS 10ML', generic:'Ciprofloxacin 0.3% + Dexamethasone 0.1%', packing:'1x10ml Bottle', company:'CIPLA', batch:'CIP26CD01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:55.00, qty:80, free:0, rate:28.00, gst:12, tax:0, category:'General', remarks:'Antibiotic+steroid ear drops' },

  // ==============================
  // ANTIHYPERTENSIVE MISC
  // ==============================
  { hsn:'30049069', name:'HYDROCHLOROTHIAZIDE-12.5MG TAB', generic:'Hydrochlorothiazide 12.5mg', packing:'10x10 Strips', company:'USV', batch:'USV26HZ01', expiry:'01/11/2028', mfg:'01/11/2025', mrp:15.00, qty:400, free:40, rate:5.50, gst:12, tax:0, category:'Cardiovascular', remarks:'Thiazide diuretic' },
  { hsn:'30049069', name:'INDAPAMIDE-1.5MG SR TAB', generic:'Indapamide 1.5mg SR', packing:'10x10 Strips', company:'SERDIA', batch:'SER26IN01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:65.00, qty:200, free:20, rate:26.00, gst:12, tax:0, category:'Cardiovascular', remarks:'Thiazide-like diuretic SR' },
  { hsn:'30049069', name:'PROPRANOLOL-40MG TAB', generic:'Propranolol HCl 40mg', packing:'10x10 Strips', company:'CIPLA', batch:'CIP26PP01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:18.00, qty:300, free:30, rate:6.50, gst:12, tax:0, category:'Cardiovascular', remarks:'Non-selective beta blocker' },

  // ==============================
  // DERMATOLOGY ORAL
  // ==============================
  { hsn:'30049049', name:'TERBINAFINE-250MG TAB', generic:'Terbinafine HCl 250mg', packing:'10x7 Strips', company:'NOVARTIS', batch:'NOV26TF01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:185.00, qty:80, free:0, rate:74.00, gst:12, tax:0, category:'General', remarks:'Oral antifungal for dermatophyte' },
  { hsn:'30049049', name:'GRISEOFULVIN-500MG TAB', generic:'Griseofulvin 500mg', packing:'10x10 Strips', company:'GLAXO', batch:'GSK26GF01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:65.00, qty:100, free:10, rate:26.00, gst:12, tax:0, category:'General', remarks:'Antifungal for ringworm oral' },
  { hsn:'30049049', name:'ITRACONAZOLE-100 CAP', generic:'Itraconazole 100mg', packing:'10x4 Caps', company:'GLENMARK', batch:'GLN26IT01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:195.00, qty:80, free:0, rate:78.00, gst:12, tax:0, category:'General', remarks:'Broad spectrum antifungal' },

  // ==============================
  // ADDITIONAL GENERAL MEDICINES
  // ==============================
  { hsn:'30049069', name:'ALLOPURINOL-100MG TAB', generic:'Allopurinol 100mg', packing:'10x10 Strips', company:'CADILA', batch:'CAD26AL01', expiry:'01/12/2028', mfg:'01/12/2025', mrp:18.00, qty:300, free:30, rate:6.50, gst:12, tax:0, category:'General', remarks:'Uric acid lowering for gout' },
  { hsn:'30049069', name:'COLCHICINE-0.5MG TAB', generic:'Colchicine 0.5mg', packing:'10x10 Strips', company:'GLAXO', batch:'GSK26CC01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:32.00, qty:200, free:20, rate:12.50, gst:12, tax:0, category:'General', remarks:'Acute gout treatment' },
  { hsn:'30049069', name:'FEBUXOSTAT-40MG TAB', generic:'Febuxostat 40mg', packing:'10x10 Strips', company:'IPCA', batch:'IPC26FB01', expiry:'01/07/2028', mfg:'01/07/2025', mrp:115.00, qty:100, free:10, rate:46.00, gst:12, tax:0, category:'General', remarks:'Modern xanthine oxidase inhibitor' },
  { hsn:'30049069', name:'METHOTREXATE-7.5MG TAB', generic:'Methotrexate 7.5mg', packing:'10x4 Strips', company:'CIPLA', batch:'CIP26MX01', expiry:'01/06/2028', mfg:'01/06/2025', mrp:85.00, qty:50, free:0, rate:42.00, gst:12, tax:0, category:'General', remarks:'DMARD for RA/psoriasis' },
  { hsn:'30049069', name:'OXYBUTYNIN-5MG TAB', generic:'Oxybutynin Chloride 5mg', packing:'10x10 Strips', company:'DR REDDYS', batch:'DRL26OB01', expiry:'01/09/2028', mfg:'01/09/2025', mrp:55.00, qty:100, free:10, rate:22.00, gst:12, tax:0, category:'General', remarks:'Overactive bladder' },
  { hsn:'30049069', name:'RANITIDINE-150 TAB', generic:'Ranitidine HCl 150mg', packing:'10x10 Strips', company:'GLAXO', batch:'GSK26RN01', expiry:'01/05/2028', mfg:'01/05/2025', mrp:22.00, qty:300, free:30, rate:8.00, gst:12, tax:0, category:'Gastrointestinal', remarks:'H2 blocker for acidity' },
  { hsn:'30049069', name:'SODIUM BICARBONATE TAB', generic:'Sodium Bicarbonate 500mg', packing:'10x10 Strips', company:'ALKEM', batch:'ALK26SB01', expiry:'01/10/2028', mfg:'01/10/2025', mrp:12.00, qty:300, free:30, rate:4.50, gst:12, tax:0, category:'General', remarks:'Antacid / alkaliniser' },
  { hsn:'30049069', name:'SPIRONOLACTONE-25MG TAB', generic:'Spironolactone 25mg', packing:'10x10 Strips', company:'RPG', batch:'RPG26SL01', expiry:'01/08/2028', mfg:'01/08/2025', mrp:32.00, qty:200, free:20, rate:12.50, gst:12, tax:0, category:'Cardiovascular', remarks:'Potassium-sparing diuretic' },
];

// Main import function
function importMedicines() {
  getExistingNames((err, existingNames) => {
    if (err) {
      console.error('Error reading existing medicines:', err);
      process.exit(1);
    }

    console.log(`\n========================================================`);
    console.log(`MEDICITY PHARMACEUTICAL HARIPAD - FULL CATALOG IMPORT`);
    console.log(`========================================================`);
    console.log(`Existing medicines in DB: ${existingNames.length}`);
    console.log(`Total medicines to import: ${allMedicines.length}`);

    let added = 0;
    let skipped = 0;
    let errors = 0;

    const insertStmt = db.prepare(`
      INSERT INTO medicines (
        hsn_code, medicine_name, generic_name, category, packing, company, batch_no, expiry_date, mfg_date,
        mrp, quantity, free_qty, base_rate, gst_percent, tax_percent, final_rate, unit_pack, manufacturer,
        pdf_attachment_path, pdf_attachment_name, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    db.serialize(() => {
      allMedicines.forEach((med, idx) => {
        const nameUpper = med.name.toUpperCase().trim();

        if (existingNames.includes(nameUpper)) {
          skipped++;
          return;
        }

        const finalRate = calculateFinalRate(med.rate, med.gst, med.tax);

        insertStmt.run(
          med.hsn,
          med.name,
          med.generic,
          med.category,
          med.packing,
          med.company,
          med.batch,
          med.expiry,
          med.mfg,
          med.mrp,
          med.qty,
          med.free,
          med.rate,
          med.gst,
          med.tax,
          finalRate,
          med.packing,
          med.company,
          null,
          null,
          med.remarks,
          function(err) {
            if (err) {
              errors++;
              console.error(`  ✗ Error adding "${med.name}":`, err.message);
            } else {
              added++;
            }
          }
        );

        existingNames.push(nameUpper);
      });

      insertStmt.finalize(() => {
        // Get final count
        db.get('SELECT COUNT(*) AS total FROM medicines', [], (err, row) => {
          console.log(`\n--- IMPORT SUMMARY ---`);
          console.log(`  ✓ Added:   ${added}`);
          console.log(`  ○ Skipped: ${skipped} (duplicates)`);
          console.log(`  ✗ Errors:  ${errors}`);
          console.log(`  ► Total medicines in database: ${row ? row.total : 'unknown'}`);
          console.log(`========================================================\n`);
          db.close();
          process.exit(0);
        });
      });
    });
  });
}

importMedicines();
