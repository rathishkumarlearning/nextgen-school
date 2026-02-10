import jsPDF from 'jspdf';

export function generateCertificate(courseName, playerName, points) {
  // Create PDF document with landscape orientation
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background color (dark navy)
  doc.setFillColor(5, 5, 16);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Outer border (cyan)
  doc.setDrawColor(6, 182, 212);
  doc.setLineWidth(3);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Inner border (purple)
  doc.setDrawColor(139, 92, 246);
  doc.setLineWidth(1);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(48);
  doc.setTextColor(251, 191, 36); // Gold
  doc.text('Certificate of Achievement', pageWidth / 2, 40, { align: 'center' });

  // "Presented to" text
  doc.setFontSize(14);
  doc.setTextColor(226, 232, 240); // Light text
  doc.text('Presented to', pageWidth / 2, 60, { align: 'center' });

  // Player name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(6, 182, 212); // Cyan
  doc.text(playerName, pageWidth / 2, 75, { align: 'center' });

  // Divider line
  doc.setDrawColor(139, 92, 246);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 40, 82, pageWidth / 2 + 40, 82);

  // Course text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(226, 232, 240);
  doc.text('For successfully completing', pageWidth / 2, 100, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(139, 92, 246); // Purple
  doc.text(courseName, pageWidth / 2, 115, { align: 'center' });

  // Points earned
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(226, 232, 240);
  doc.text(`Points Earned: ${points} XP`, pageWidth / 2, 130, { align: 'center' });

  // Date
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184); // Gray text
  doc.text(`Date: ${dateStr}`, pageWidth / 2, 150, { align: 'center' });

  // Decorative elements (emojis as text)
  doc.setFontSize(24);
  doc.text('🎉', pageWidth / 2 - 25, 155);
  doc.text('⭐', pageWidth / 2, 155, { align: 'center' });
  doc.text('🎉', pageWidth / 2 + 25, 155);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Darker gray
  doc.text('NextGen School — Mind Over Machines: AI Literacy for Kids', pageWidth / 2, pageHeight - 12, {
    align: 'center',
  });

  // Download the PDF
  const filename = `${playerName}_${courseName.replace(/\s+/g, '_')}_Certificate.pdf`;
  doc.save(filename);

  return filename;
}

// Alternative: generate certificate and return as data URL
export function generateCertificateDataURL(courseName, playerName, points) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(5, 5, 16);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Borders
  doc.setDrawColor(6, 182, 212);
  doc.setLineWidth(3);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  doc.setDrawColor(139, 92, 246);
  doc.setLineWidth(1);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(48);
  doc.setTextColor(251, 191, 36);
  doc.text('Certificate of Achievement', pageWidth / 2, 40, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(226, 232, 240);
  doc.text('Presented to', pageWidth / 2, 60, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(6, 182, 212);
  doc.text(playerName, pageWidth / 2, 75, { align: 'center' });

  doc.setDrawColor(139, 92, 246);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 40, 82, pageWidth / 2 + 40, 82);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(226, 232, 240);
  doc.text('For successfully completing', pageWidth / 2, 100, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(139, 92, 246);
  doc.text(courseName, pageWidth / 2, 115, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(226, 232, 240);
  doc.text(`Points Earned: ${points} XP`, pageWidth / 2, 130, { align: 'center' });

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184);
  doc.text(`Date: ${dateStr}`, pageWidth / 2, 150, { align: 'center' });

  doc.setFontSize(24);
  doc.text('🎉', pageWidth / 2 - 25, 155);
  doc.text('⭐', pageWidth / 2, 155, { align: 'center' });
  doc.text('🎉', pageWidth / 2 + 25, 155);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('NextGen School — Mind Over Machines: AI Literacy for Kids', pageWidth / 2, pageHeight - 12, {
    align: 'center',
  });

  // Return as data URL
  return doc.output('datauristring');
}
