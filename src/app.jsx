import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import CircularCarousel from './components/CircularCarousel.jsx';
import MaskedHeading from './components/MaskedHeading.jsx';
import RippleDistortion from './components/RippleDistortion.jsx';

// ─── Preset document items for the vault ring ─────────────────────────────────
const VAULT_ITEMS = [
  { src: '/images/docs/doc-passport.svg',    alt: 'Identity Document',   title: 'Identity',      subtitle: 'Biometric Passport' },
  { src: '/images/docs/doc-contract.svg',    alt: 'Employment Contract', title: 'Work',          subtitle: 'Offer Letter & NDA' },
  { src: '/images/docs/doc-diploma.svg',     alt: 'Academic Degree',     title: 'Education',     subtitle: 'B.Tech Engineering' },
  { src: '/images/docs/doc-tax.svg',         alt: 'Tax Assessment',      title: 'Finance',       subtitle: 'Annual ITR Filing' },
  { src: '/images/docs/doc-medical.svg',     alt: 'Medical Record',      title: 'Health',        subtitle: 'Health & Insurance' },
  { src: '/images/docs/doc-key.svg',         alt: 'RSA Vault Key',       title: 'Security',      subtitle: 'RSA-4096 Master Key' },
  { src: '/images/docs/doc-deed.svg',        alt: 'Property Deed',       title: 'Legal',         subtitle: 'Title & Trust Deed' },
  { src: '/images/docs/doc-certificate.svg', alt: 'AWS Certification',   title: 'Certificates',  subtitle: 'Cloud Architect SAA' },
];

// Map categories to SVG cards
const CATEGORY_MAP = {
  Identity: '/images/docs/doc-passport.svg',
  Work: '/images/docs/doc-contract.svg',
  Education: '/images/docs/doc-diploma.svg',
  Finance: '/images/docs/doc-tax.svg',
  Health: '/images/docs/doc-medical.svg',
  Legal: '/images/docs/doc-deed.svg',
  Other: '/images/docs/doc-key.svg',
};

// ─── 1. Global / App Ripple Background Mount ──────────────────────────────────
const rippleContainers = document.querySelectorAll('.vault-ripple-bg, #app-ripple-bg, #react-ripple-bg');
rippleContainers.forEach(container => {
  if (container && !container.hasAttribute('data-mounted')) {
    container.setAttribute('data-mounted', 'true');
    const tint = container.getAttribute('data-tint') || '#38bdf8';
    const strength = parseFloat(container.getAttribute('data-strength') || '0.18');
    ReactDOM.createRoot(container).render(
      <React.StrictMode>
        <RippleDistortion
          src="/images/textures/vault-mesh.svg"
          brushSize={180}
          strength={strength}
          swirl={1.2}
          rings={3}
          spread={4}
          fade={2.4}
          spacing={12}
          tint={tint}
          tintAmount={0.12}
          grayscale={false}
          trigger="hover"
          quality="low"
        />
      </React.StrictMode>
    );
  }
});

// ─── 2. Masked Headings Across Entire Website ──────────────────────────────────
const headingElements = document.querySelectorAll('[data-masked-heading]');
headingElements.forEach(el => {
  if (!el.hasAttribute('data-mounted')) {
    el.setAttribute('data-mounted', 'true');
    const text = el.getAttribute('data-masked-heading') || el.textContent || 'SafeFile Vault';
    const tag = el.getAttribute('data-tag') || 'h1';
    const align = el.getAttribute('data-align') || 'left';
    const textScale = parseFloat(el.getAttribute('data-scale') || '0.075');
    const reveal = el.getAttribute('data-reveal') || 'rise';

    ReactDOM.createRoot(el).render(
      <React.StrictMode>
        <MaskedHeading
          text={text}
          tag={tag}
          mediaType="image"
          src="/images/textures/heading-fill.svg"
          fillScale={1.3}
          parallax={26}
          reveal={reveal}
          trigger="view"
          outline={false}
          weight={800}
          tracking={-0.035}
          lineHeight={1.08}
          textScale={textScale}
          align={align}
        />
      </React.StrictMode>
    );
  }
});

// Legacy ID support for landing page heading
const legacyHeading = document.getElementById('react-heading');
if (legacyHeading && !legacyHeading.hasAttribute('data-mounted')) {
  legacyHeading.setAttribute('data-mounted', 'true');
  ReactDOM.createRoot(legacyHeading).render(
    <React.StrictMode>
      <MaskedHeading
        text="Your private document vault"
        tag="h1"
        mediaType="image"
        src="/images/textures/heading-fill.svg"
        fillScale={1.3}
        parallax={28}
        reveal="rise"
        trigger="view"
        outline={false}
        weight={800}
        tracking={-0.04}
        lineHeight={1.08}
        textScale={0.08}
        align="left"
      />
    </React.StrictMode>
  );
}

// ─── 3. Landing Page Carousel Mount ───────────────────────────────────────────
const landingCarousel = document.getElementById('react-carousel');
if (landingCarousel && !landingCarousel.hasAttribute('data-mounted')) {
  landingCarousel.setAttribute('data-mounted', 'true');
  ReactDOM.createRoot(landingCarousel).render(
    <React.StrictMode>
      <CircularCarousel
        items={VAULT_ITEMS}
        preset="cylinder"
        intro="rise"
        cardWidth={210}
        aspectRatio={1}
        speed={12}
        captions
        depthFade={0.5}
        fadeColor="#060911"
        cornerRadius={18}
        gap={20}
      />
    </React.StrictMode>
  );
}

// ─── 4. Dashboard 3D Vault Carousel Component ─────────────────────────────────
const DashboardVault = () => {
  const [items, setItems] = useState(VAULT_ITEMS);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    // Fetch user documents to populate the carousel if available
    fetch('/api/documents', { credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(r => r.ok ? r.json() : null)
      .then(res => {
        if (res && res.data && res.data.documents && res.data.documents.length > 0) {
          const userDocs = res.data.documents.map(doc => ({
            src: CATEGORY_MAP[doc.category] || '/images/docs/doc-key.svg',
            alt: doc.title,
            title: doc.title,
            subtitle: `${doc.category} • ${(doc.size / (1024 * 1024)).toFixed(1)} MB`,
            docId: doc.id,
            originalName: doc.originalName
          }));
          // Ensure at least 4 items for good cylindrical layout
          while (userDocs.length < 4) {
            userDocs.push(VAULT_ITEMS[userDocs.length % VAULT_ITEMS.length]);
          }
          setItems(userDocs);
        }
      })
      .catch(() => {});
  }, []);

  const handleItemClick = (item) => {
    if (item.docId) {
      window.location.href = `/documents?search=${encodeURIComponent(item.title)}`;
    }
  };

  return (
    <div className="vault-carousel-container">
      <div className="vault-carousel-header">
        <div className="vault-carousel-badge">
          <span className="pulse-dot"></span>
          <span>3D Vault Interactive Ring</span>
        </div>
        <p className="vault-carousel-hint">Drag to spin • Click to inspect</p>
      </div>
      <div style={{ width: '100%', height: '360px', position: 'relative' }}>
        <CircularCarousel
          items={items}
          preset="cylinder"
          intro="rise"
          cardWidth={180}
          aspectRatio={1}
          speed={10}
          captions
          depthFade={0.55}
          fadeColor="#090e1a"
          cornerRadius={16}
          gap={18}
          onItemClick={handleItemClick}
        />
      </div>
    </div>
  );
};

const dashboardCarouselRoot = document.getElementById('react-dashboard-carousel');
if (dashboardCarouselRoot && !dashboardCarouselRoot.hasAttribute('data-mounted')) {
  dashboardCarouselRoot.setAttribute('data-mounted', 'true');
  ReactDOM.createRoot(dashboardCarouselRoot).render(
    <React.StrictMode>
      <DashboardVault />
    </React.StrictMode>
  );
}

// ─── 5. Documents Page 3D Vault View Mount ────────────────────────────────────
const DocumentsVaultView = () => {
  const [items, setItems] = useState(VAULT_ITEMS);
  const [mode, setMode] = useState('list'); // '3d' or 'list'

  useEffect(() => {
    const syncDocs = () => {
      fetch('/api/documents', { credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(r => r.ok ? r.json() : null)
        .then(res => {
          if (res && res.data && res.data.documents && res.data.documents.length > 0) {
            const list = res.data.documents.map(d => ({
              src: CATEGORY_MAP[d.category] || '/images/docs/doc-key.svg',
              alt: d.title,
              title: d.title,
              subtitle: `${d.category} • ${(d.size / 1024).toFixed(0)} KB`,
              docId: d.id,
              originalName: d.originalName
            }));
            while (list.length < 4) {
              list.push(VAULT_ITEMS[list.length % VAULT_ITEMS.length]);
            }
            setItems(list);
          }
        })
        .catch(() => {});
    };
    syncDocs();
  }, []);

  const toggleMode = (newMode) => {
    setMode(newMode);
    const standardList = document.getElementById('docList');
    if (standardList) {
      standardList.style.display = newMode === '3d' ? 'none' : 'block';
    }
  };

  return (
    <div className="documents-3d-toggle-bar">
      <div className="view-switch-btns">
        <button
          type="button"
          className={`btn-view-toggle ${mode === 'list' ? 'active' : ''}`}
          onClick={() => toggleMode('list')}
        >
          <span>☰</span> Standard List
        </button>
        <button
          type="button"
          className={`btn-view-toggle ${mode === '3d' ? 'active' : ''}`}
          onClick={() => toggleMode('3d')}
        >
          <span>🔄</span> 3D Vault Ring
        </button>
      </div>

      {mode === '3d' && (
        <div className="vault-3d-documents-panel">
          <div style={{ width: '100%', height: '420px', position: 'relative' }}>
            <CircularCarousel
              items={items}
              preset="orbit"
              intro="assemble"
              cardWidth={200}
              aspectRatio={1}
              speed={11}
              captions
              depthFade={0.45}
              fadeColor="#090e1a"
              cornerRadius={16}
              gap={24}
              onItemClick={(item) => {
                if (item.docId) {
                  window.location.href = `/api/documents/${item.docId}/download`;
                }
              }}
            />
          </div>
          <p className="vault-click-instruction">Click any card to download document</p>
        </div>
      )}
    </div>
  );
};

const doc3dRoot = document.getElementById('react-documents-3d');
if (doc3dRoot && !doc3dRoot.hasAttribute('data-mounted')) {
  doc3dRoot.setAttribute('data-mounted', 'true');
  ReactDOM.createRoot(doc3dRoot).render(
    <React.StrictMode>
      <DocumentsVaultView />
    </React.StrictMode>
  );
}
