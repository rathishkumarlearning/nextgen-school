// ===== CERTIFICATE GENERATION =====
import { getLevel } from './gamification.js';

export function generateCertificate(courseName, stateName, statePoints) {
  const name = stateName || 'Explorer';
  const level = getLevel(statePoints || 0);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const certId = 'NGS-' + Date.now().toString(36).toUpperCase() + '-' + (name || 'X').charCodeAt(0).toString(36).toUpperCase();

  // Try jsPDF first
  if (typeof window !== 'undefined' && window.jspdf && window.jspdf.jsPDF) {
    const doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Background
    doc.setFillColor(10, 10, 46);
    doc.rect(0, 0, 297, 210, 'F');

    // Border gradient effect
    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(2);
    doc.roundedRect(8, 8, 281, 194, 5, 5);
    doc.setDrawColor(139, 92, 246);
    doc.setLineWidth(1);
    doc.roundedRect(12, 12, 273, 186, 4, 4);

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(6, 182, 212);
    doc.text('🎓 NEXTGEN SCHOOL', 148.5, 30, { align: 'center' });

    // Certificate title
    doc.setFontSize(28);
    doc.setTextColor(251, 191, 36);
    doc.text('Certificate of Completion', 148.5, 50, { align: 'center' });

    // Decorative line
    doc.setDrawColor(251, 191, 36);
    doc.setLineWidth(0.5);
    doc.line(80, 55, 217, 55);

    // "This certifies that"
    doc.setFontSize(12);
    doc.setTextColor(148, 163, 184);
    doc.text('This certifies that', 148.5, 68, { align: 'center' });

    // Child name
    doc.setFontSize(32);
    doc.setTextColor(251, 191, 36);
    doc.text(name, 148.5, 84, { align: 'center' });

    // Course name
    doc.setFontSize(14);
    doc.setTextColor(226, 232, 240);
    doc.text(`Has successfully completed ${courseName}`, 148.5, 98, { align: 'center' });

    // Description
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('Demonstrating critical thinking, creativity, and responsible AI awareness', 148.5, 110, { align: 'center' });

    // Level & Badges
    doc.setFontSize(12);
    doc.setTextColor(139, 92, 246);
    doc.text(`Level: ${level.icon} ${level.name} | XP: ${statePoints || 0}`, 148.5, 125, { align: 'center' });

    // Date
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`Date: ${date}`, 148.5, 140, { align: 'center' });

    // Certificate ID
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Certificate ID: ${certId}`, 148.5, 150, { align: 'center' });

    // Founders
    doc.setFontSize(11);
    doc.setTextColor(226, 232, 240);
    doc.text('Founders: Rathish & Sathish', 148.5, 168, { align: 'center' });

    // Website
    doc.setFontSize(9);
    doc.setTextColor(6, 182, 212);
    doc.text('nextgenschool.aiupskills.com', 148.5, 178, { align: 'center' });

    doc.save(`NextGen_Certificate_${courseName.replace(/[^a-zA-Z]/g, '_')}.pdf`);
  } else {
    // HTML fallback
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Certificate</title><style>
      body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0a0a2e;font-family:Georgia,serif}
      .cert{background:#050510;border:3px solid #06b6d4;padding:60px;text-align:center;max-width:800px;position:relative}
      .cert::after{content:'';position:absolute;inset:8px;border:1px solid #8b5cf6;pointer-events:none}
      h1{color:#fbbf24;font-size:2.5rem;margin-bottom:20px}
      h2{color:#06b6d4;font-size:2rem;margin:10px 0}
      p{color:#e2e8f0;font-size:1.1rem;margin:8px 0}
      .course{color:#8b5cf6;font-size:1.5rem;margin:10px 0}
      .date{color:#94a3b8;margin-top:30px}
      button{margin-top:20px;padding:12px 30px;background:#06b6d4;color:#000;border:none;border-radius:8px;font-size:1rem;cursor:pointer}
    </style></head><body><div class="cert">
      <h1>🏆 Certificate of Completion</h1>
      <p>This certifies that</p><h2>${name}</h2>
      <p>has successfully completed</p><div class="course">${courseName}</div>
      <p>at NextGen School — Mind Over Machines</p>
      <div class="date">${date}</div>
      <button onclick="window.print()">🖨️ Print Certificate</button>
    </div></body></html>`);
  }

  return certId;
}
