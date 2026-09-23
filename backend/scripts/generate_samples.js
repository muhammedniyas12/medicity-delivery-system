const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Minimal valid PDF generator
function createSimplePdf(filename, title) {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 210 >>
stream
BT
/F1 18 Tf
50 720 Td
(MEDICITY PHARMACEUTICAL HARIPAD) Tj
/F1 12 Tf
0 -30 Td
(${title}) Tj
0 -25 Td
(Authorized Wholesale Price & Rate Schedule - Alappuzha, Kerala) Tj
0 -25 Td
(GST Applicable: Standard Institutional & Neethi Rates) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000508 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
577
%%EOF`;

  fs.writeFileSync(path.join(uploadsDir, filename), content.trim());
}

createSimplePdf('sample_rate_sheet_neethi.pdf', 'NEETHI STORES ESSENTIAL MEDICINE RATE SHEET 2026-27');
createSimplePdf('sample_quotation_govthospital.pdf', 'TALUK & GOVT HOSPITALS INSTITUTIONAL QUOTATION');
createSimplePdf('sample_antibiotics_rate_list.pdf', 'SPECIALIZED ANTIBIOTICS & INJECTABLES CATALOG');

// Create sample delivery slips SVG
const sampleSlipNeethi = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 950" width="700" height="950">
  <rect width="100%" height="100%" fill="#fafafa"/>
  <rect x="25" y="25" width="650" height="900" fill="#ffffff" stroke="#0f766e" stroke-width="3" rx="10"/>
  <rect x="25" y="25" width="650" height="110" fill="#0f766e" rx="10 10 0 0"/>
  <text x="350" y="70" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle">MEDICITY PHARMACEUTICAL HARIPAD</text>
  <text x="350" y="100" font-family="Arial, sans-serif" font-size="14" fill="#ccfbf1" text-anchor="middle">DELIVERY CHALLAN &amp; ACKNOWLEDGEMENT SLIP &bull; NEETHI STORE</text>
  <rect x="50" y="160" width="600" height="130" fill="#f0fdfa" stroke="#99f6e4" stroke-width="1.5" rx="8"/>
  <text x="70" y="195" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#0f172a">Outlet: Neethi Medical Store, Haripad Town Branch</text>
  <text x="70" y="225" font-family="Arial, sans-serif" font-size="13" fill="#475569">Invoice Ref: NEETHI-HPD-8821 | Delivery Date: 2026-09-23</text>
  <text x="70" y="255" font-family="Arial, sans-serif" font-size="13" fill="#475569">Distributor: Medicity Pharmaceutical Wholesale Supply Unit</text>
  <rect x="50" y="310" width="600" height="320" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="50" y="310" width="600" height="40" fill="#f1f5f9"/>
  <text x="70" y="335" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#334155">#</text>
  <text x="110" y="335" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#334155">ITEM DESCRIPTION</text>
  <text x="390" y="335" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#334155">PACK</text>
  <text x="490" y="335" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#334155">QTY</text>
  <text x="560" y="335" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#334155">STATUS</text>
  <text x="70" y="380" font-family="Arial, sans-serif" font-size="13" fill="#0f172a">1. Paracetamol 650mg Tabs</text>
  <text x="390" y="380" font-family="Arial, sans-serif" font-size="13" fill="#475569">10x10</text>
  <text x="490" y="380" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">50 Bx</text>
  <text x="560" y="380" font-family="Arial, sans-serif" font-size="12" fill="#16a34a" font-weight="bold">RECEIVED</text>
  <text x="70" y="420" font-family="Arial, sans-serif" font-size="13" fill="#0f172a">2. Amoxicillin+Clav 625mg</text>
  <text x="390" y="420" font-family="Arial, sans-serif" font-size="13" fill="#475569">1x10</text>
  <text x="490" y="420" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">30 Bx</text>
  <text x="560" y="420" font-family="Arial, sans-serif" font-size="12" fill="#16a34a" font-weight="bold">RECEIVED</text>
  <text x="70" y="460" font-family="Arial, sans-serif" font-size="13" fill="#0f172a">3. Pantoprazole 40mg Tabs</text>
  <text x="390" y="460" font-family="Arial, sans-serif" font-size="13" fill="#475569">10x10</text>
  <text x="490" y="460" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">25 Bx</text>
  <text x="560" y="460" font-family="Arial, sans-serif" font-size="12" fill="#16a34a" font-weight="bold">RECEIVED</text>
  <rect x="80" y="670" width="220" height="150" fill="#f8fafc" stroke="#cbd5e1" stroke-dasharray="4" rx="6"/>
  <text x="190" y="700" font-family="Arial, sans-serif" font-size="12" fill="#64748b" text-anchor="middle">Dispatched By</text>
  <text x="190" y="745" font-family="'Brush Script MT', cursive, sans-serif" font-size="28" fill="#0f766e" text-anchor="middle">Medicity Staff</text>
  <text x="190" y="790" font-family="Arial, sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">Delivery Agent Sign</text>
  <rect x="400" y="670" width="220" height="150" fill="#f0fdf4" stroke="#16a34a" rx="6"/>
  <circle cx="510" cy="740" r="45" fill="none" stroke="#16a34a" stroke-width="2" stroke-dasharray="4 2"/>
  <text x="510" y="735" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#166534" text-anchor="middle">NEETHI STORE</text>
  <text x="510" y="750" font-family="Arial, sans-serif" font-size="10" fill="#15803d" text-anchor="middle">HARIPAD BRANCH</text>
  <text x="510" y="765" font-family="Arial, sans-serif" font-size="9" fill="#16a34a" text-anchor="middle">RECEIVED &amp; VERIFIED</text>
  <text x="510" y="805" font-family="'Brush Script MT', cursive, sans-serif" font-size="22" fill="#15803d" text-anchor="middle">K. Radhakrishnan</text>
  <text x="350" y="880" font-family="Arial, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">&bull; Digitally Recorded by MEDICITY PHARMACEUTICAL HARIPAD Delivery Proof System &bull;</text>
</svg>`;

fs.writeFileSync(path.join(uploadsDir, 'sample_slip_neethi.svg'), sampleSlipNeethi);
fs.writeFileSync(path.join(uploadsDir, 'sample_slip_supplyco.svg'), sampleSlipNeethi.replace(/NEETHI STORE/g, 'SUPPLYCO PHARMACY').replace(/#0f766e/g, '#0284c7'));
fs.writeFileSync(path.join(uploadsDir, 'sample_slip_others.svg'), sampleSlipNeethi.replace(/NEETHI STORE/g, 'TALUK HQ HOSPITAL HARIPAD').replace(/#0f766e/g, '#7c3aed'));

console.log('Sample PDF rate sheets and delivery slip photos generated successfully.');
