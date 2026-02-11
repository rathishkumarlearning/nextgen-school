import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '40px 20px',
      borderTop: '1px solid var(--glass-border)',
      color: 'var(--text3)',
      fontSize: '.85rem',
      position: 'relative',
      zIndex: 1
    }}>
      <p style={{ marginBottom: '8px' }}>
        NextGen School — Mind Over Machines
      </p>
      <p style={{ marginBottom: '4px' }}>
        Founded by <strong style={{ color: 'var(--text2)' }}>Sathish 🇮🇳</strong> &amp; <strong style={{ color: 'var(--text2)' }}>Rathish 🇺🇸</strong>
      </p>
      <p style={{ fontSize: '.75rem', marginTop: '8px' }}>
        © {new Date().getFullYear()} NextGen School. All rights reserved.
      </p>
    </footer>
  );
}
