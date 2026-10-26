import React from 'react';
import ReactDOM from 'react-dom/client';
import CircularCarousel from './components/CircularCarousel.jsx';
import MaskedHeading from './components/MaskedHeading.jsx';
import RippleDistortion from './components/RippleDistortion.jsx';

// ─── Document items for the carousel ─────────────────────────────────────────
const DOC_ITEMS = [
  { src: '/images/docs/doc-passport.svg',    alt: 'Identity document',    title: 'Identity',      subtitle: 'Passport' },
  { src: '/images/docs/doc-contract.svg',    alt: 'Work document',        title: 'Work',          subtitle: 'Offer Letter' },
  { src: '/images/docs/doc-diploma.svg',     alt: 'Education document',   title: 'Education',     subtitle: 'B.Tech Degree' },
  { src: '/images/docs/doc-tax.svg',         alt: 'Finance document',     title: 'Finance',       subtitle: 'Tax Assessment' },
  { src: '/images/docs/doc-medical.svg',     alt: 'Health document',      title: 'Health',        subtitle: 'Medical Record' },
  { src: '/images/docs/doc-key.svg',         alt: 'Security key',         title: 'Security',      subtitle: 'Vault Key' },
  { src: '/images/docs/doc-deed.svg',        alt: 'Legal document',       title: 'Legal',         subtitle: 'Property Deed' },
  { src: '/images/docs/doc-certificate.svg', alt: 'Certification',        title: 'Certificates',  subtitle: 'AWS SAA' },
];

// ─── Hero carousel mount ──────────────────────────────────────────────────────
const carouselRoot = document.getElementById('react-carousel');
if (carouselRoot) {
  ReactDOM.createRoot(carouselRoot).render(
    <React.StrictMode>
      <CircularCarousel
        items={DOC_ITEMS}
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

// ─── Masked heading mount ─────────────────────────────────────────────────────
const headingRoot = document.getElementById('react-heading');
if (headingRoot) {
  ReactDOM.createRoot(headingRoot).render(
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
        spotlight={false}
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

// ─── Ripple distortion background mount ──────────────────────────────────────
const rippleRoot = document.getElementById('react-ripple-bg');
if (rippleRoot) {
  ReactDOM.createRoot(rippleRoot).render(
    <React.StrictMode>
      <RippleDistortion
        src="/images/textures/vault-mesh.svg"
        brushSize={180}
        strength={0.18}
        swirl={1.2}
        rings={3}
        spread={4}
        fade={2.5}
        spacing={12}
        tint="#38bdf8"
        tintAmount={0.12}
        grayscale={false}
        trigger="hover"
        quality="low"
      />
    </React.StrictMode>
  );
}
