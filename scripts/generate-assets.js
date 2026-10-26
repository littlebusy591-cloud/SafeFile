// Generates sleek SVG artwork for document cards and background textures
const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'public', 'images', 'docs');
const texDir = path.join(__dirname, '..', 'public', 'images', 'textures');

[docsDir, texDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// 1. Textures
const vaultMeshSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="80%">
      <stop offset="0%" stop-color="#141c2e"/>
      <stop offset="45%" stop-color="#0b111e"/>
      <stop offset="100%" stop-color="#05070d"/>
    </radialGradient>
    <linearGradient id="glow1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#ec4899" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="glow2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.05"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.035)" stroke-width="1"/>
      <circle cx="0" cy="0" r="1.5" fill="rgba(56, 189, 248, 0.25)"/>
    </pattern>
  </defs>
  <rect width="1600" height="1000" fill="url(#bg)"/>
  <rect width="1600" height="1000" fill="url(#grid)"/>
  <circle cx="350" cy="250" r="420" fill="url(#glow1)"/>
  <circle cx="1250" cy="700" r="480" fill="url(#glow2)"/>
  <path d="M0,500 Q400,300 800,500 T1600,500" fill="none" stroke="rgba(99, 102, 241, 0.15)" stroke-width="2"/>
  <path d="M0,600 Q400,750 800,600 T1600,600" fill="none" stroke="rgba(56, 189, 248, 0.12)" stroke-width="2"/>
</svg>`;

const headingFillSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">
  <defs>
    <linearGradient id="mesh" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="30%" stop-color="#818cf8"/>
      <stop offset="60%" stop-color="#c084fc"/>
      <stop offset="85%" stop-color="#f472b6"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
    <filter id="blurFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="35"/>
    </filter>
  </defs>
  <rect width="1200" height="600" fill="url(#mesh)"/>
  <g filter="url(#blurFilter)">
    <circle cx="200" cy="200" r="280" fill="#ffffff" opacity="0.35"/>
    <circle cx="700" cy="400" r="320" fill="#06b6d4" opacity="0.6"/>
    <circle cx="1000" cy="150" r="250" fill="#fb7185" opacity="0.5"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(texDir, 'vault-mesh.svg'), vaultMeshSvg);
fs.writeFileSync(path.join(texDir, 'heading-fill.svg'), headingFillSvg);

// 2. Documents
function makeDocCard({ title, category, code, icon, accentColor, bgGradient, lines }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
  <defs>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradient[0]}"/>
      <stop offset="100%" stop-color="${bgGradient[1]}"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accentColor}"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.8"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="rgba(0,0,0,0.6)"/>
    </filter>
  </defs>
  <!-- Background -->
  <rect width="500" height="500" rx="24" fill="url(#cardBg)"/>
  <rect x="2" y="2" width="496" height="496" rx="22" fill="none" stroke="${accentColor}" stroke-opacity="0.35" stroke-width="2"/>

  <!-- Watermark seal -->
  <circle cx="250" cy="270" r="140" fill="none" stroke="${accentColor}" stroke-opacity="0.06" stroke-width="6" stroke-dasharray="8 6"/>
  <circle cx="250" cy="270" r="115" fill="none" stroke="${accentColor}" stroke-opacity="0.04" stroke-width="3"/>

  <!-- Top bar -->
  <rect x="36" y="36" width="428" height="60" rx="12" fill="rgba(255,255,255,0.05)"/>
  <text x="56" y="73" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="${accentColor}" letter-spacing="2">${category.toUpperCase()}</text>
  <text x="444" y="73" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="end">${code}</text>

  <!-- Document Icon & Seal -->
  <g transform="translate(48, 124)">
    <rect width="64" height="64" rx="16" fill="${accentColor}" fill-opacity="0.15" stroke="${accentColor}" stroke-opacity="0.4"/>
    <text x="32" y="42" font-size="32" text-anchor="middle">${icon}</text>
  </g>

  <!-- Document Title -->
  <text x="128" y="152" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#f8fafc">${title}</text>
  <text x="128" y="176" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#94a3b8">Encrypted with AES-256 GCM</text>

  <!-- Content Lines -->
  <g transform="translate(48, 224)">
    <rect width="404" height="150" rx="14" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.08)"/>
    ${lines.map((l, i) => `
      <text x="24" y="${36 + i * 28}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#64748b" font-weight="600">${l.label}:</text>
      <text x="140" y="${36 + i * 28}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#e2e8f0" font-weight="500">${l.value}</text>
    `).join('')}
  </g>

  <!-- Bottom Verification badge -->
  <g transform="translate(48, 404)">
    <rect width="404" height="52" rx="12" fill="rgba(255,255,255,0.04)" stroke="${accentColor}" stroke-opacity="0.25"/>
    <circle cx="30" cy="26" r="10" fill="${accentColor}" fill-opacity="0.2"/>
    <path d="M26 26 L29 29 L35 22" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round"/>
    <text x="50" y="31" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#f1f5f9">Verified Document</text>
    <text x="384" y="31" font-family="'Courier New', monospace" font-size="11" fill="${accentColor}" text-anchor="end">SHA-256 ✓</text>
  </g>
</svg>`;
}

const docs = [
  {
    file: 'doc-passport.svg',
    title: 'International Passport',
    category: 'Identity',
    code: 'ID-8849-PASS',
    icon: '🪪',
    accentColor: '#38bdf8',
    bgGradient: ['#0f1d33', '#080d19'],
    lines: [
      { label: 'Holder', value: 'Manisha R. / Student ID' },
      { label: 'Status', value: 'Active & Verified' },
      { label: 'Issuance', value: 'Government Authority' },
      { label: 'Vault Hash', value: 'e7a3...c914' }
    ]
  },
  {
    file: 'doc-contract.svg',
    title: 'Employment Offer Letter',
    category: 'Work',
    code: 'WRK-2026-ENG',
    icon: '💼',
    accentColor: '#a855f7',
    bgGradient: ['#1e1433', '#0f0a1c'],
    lines: [
      { label: 'Role', value: 'Cloud Engineer / SDE' },
      { label: 'Organization', value: 'Tech Innovation Labs' },
      { label: 'Signed By', value: 'VP Engineering' },
      { label: 'Vault Hash', value: '92bf...48a1' }
    ]
  },
  {
    file: 'doc-diploma.svg',
    title: 'Engineering Degree',
    category: 'Education',
    code: 'EDU-BTECH-26',
    icon: '🎓',
    accentColor: '#10b981',
    bgGradient: ['#0c241d', '#05120e'],
    lines: [
      { label: 'Degree', value: 'B.Tech Computer Engineering' },
      { label: 'Institute', value: 'Army Institute of Technology' },
      { label: 'Division', value: 'First Class with Distinction' },
      { label: 'Vault Hash', value: '47d0...8e11' }
    ]
  },
  {
    file: 'doc-tax.svg',
    title: 'Annual Tax Assessment',
    category: 'Finance',
    code: 'FIN-TAX-2026',
    icon: '📊',
    accentColor: '#f59e0b',
    bgGradient: ['#281e0e', '#130d05'],
    lines: [
      { label: 'Filing Year', value: 'Assessment Year 2026-27' },
      { label: 'Status', value: 'Filed & Cleared' },
      { label: 'Receipt No', value: 'ITR-7739104-V' },
      { label: 'Vault Hash', value: '11a8...3b92' }
    ]
  },
  {
    file: 'doc-medical.svg',
    title: 'Health & Medical Record',
    category: 'Health',
    code: 'MED-HLT-9921',
    icon: '🏥',
    accentColor: '#ec4899',
    bgGradient: ['#2b0f1e', '#14060e'],
    lines: [
      { label: 'Record Type', value: 'Annual Health Checkup' },
      { label: 'Provider', value: 'Apollo Health Care' },
      { label: 'Allergies', value: 'None Reported' },
      { label: 'Vault Hash', value: '7c32...f041' }
    ]
  },
  {
    file: 'doc-key.svg',
    title: 'RSA Master Vault Key',
    category: 'Security',
    code: 'SEC-RSA-4096',
    icon: '🔑',
    accentColor: '#06b6d4',
    bgGradient: ['#0b222a', '#040f13'],
    lines: [
      { label: 'Algorithm', value: 'RSA-4096 / PGP Signed' },
      { label: 'Key Fingerprint', value: '9D42 B188 E041 33FC' },
      { label: 'Zero-Knowledge', value: 'Client Side Encrypted' },
      { label: 'Vault Hash', value: 'fa82...01cc' }
    ]
  },
  {
    file: 'doc-deed.svg',
    title: 'Property Deed of Trust',
    category: 'Legal',
    code: 'LGL-PROP-301',
    icon: '📜',
    accentColor: '#8b5cf6',
    bgGradient: ['#17122b', '#0b0816'],
    lines: [
      { label: 'Title', value: 'Residential Property Deed' },
      { label: 'Registration', value: 'Registry Office Pune' },
      { label: 'Notarized', value: 'State Authorized Notary' },
      { label: 'Vault Hash', value: '38ea...b299' }
    ]
  },
  {
    file: 'doc-certificate.svg',
    title: 'AWS Solutions Architect',
    category: 'Certifications',
    code: 'CERT-AWS-SAA',
    icon: '☁️',
    accentColor: '#f97316',
    bgGradient: ['#281608', '#140902'],
    lines: [
      { label: 'Issued By', value: 'Amazon Web Services' },
      { label: 'Validation No', value: 'AWS-SAA-884920' },
      { label: 'Validity', value: 'Active (3 Years)' },
      { label: 'Vault Hash', value: 'b55e...e940' }
    ]
  }
];

docs.forEach(doc => {
  fs.writeFileSync(path.join(docsDir, doc.file), makeDocCard(doc));
});

console.log('Successfully generated textures and document SVGs!');
