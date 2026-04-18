import jsPDF from 'jspdf';

export function generateReceipt(booking) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(0, 113, 227);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ZAPSPOT', 20, 25);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('EV Charging Receipt', pageWidth - 20, 25, { align: 'right' });

  // Receipt info
  doc.setTextColor(29, 29, 31);
  doc.setFontSize(12);
  let y = 55;

  doc.setFont('helvetica', 'bold');
  doc.text('Booking ID:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(booking._id || 'N/A', 80, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.date || 'N/A', 80, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Time Slot:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.timeSlot || 'N/A', 80, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Vehicle:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.vehicle || 'N/A', 80, y);
  y += 15;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  // Station info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Station Details', 20, y);
  y += 10;
  doc.setFontSize(12);

  doc.setFont('helvetica', 'bold');
  doc.text('Station:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.stationName || 'N/A', 80, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Charger:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${booking.chargerType || 'N/A'} (${booking.chargerId || 'N/A'})`, 80, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Energy:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${booking.kwhDelivered || booking.totalKwh || 0} kWh`, 80, y);
  y += 15;

  // Divider
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  // Cost breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Payment Summary', 20, y);
  y += 10;
  doc.setFontSize(12);

  doc.setFont('helvetica', 'normal');
  doc.text('Charging Cost:', 20, y);
  doc.text(`Rs.${booking.cost || 0}`, pageWidth - 20, y, { align: 'right' });
  y += 8;

  const discount = booking.discount || 10;
  doc.text('UPI Discount:', 20, y);
  doc.setTextColor(48, 209, 88);
  doc.text(`-Rs.${discount}`, pageWidth - 20, y, { align: 'right' });
  y += 8;

  doc.setTextColor(29, 29, 31);
  const gst = Math.round((booking.cost - discount) * 0.18);
  doc.text('GST (18%):', 20, y);
  doc.text(`Rs.${gst}`, pageWidth - 20, y, { align: 'right' });
  y += 12;

  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  const total = (booking.cost || 0) - discount + gst;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Total Paid:', 20, y);
  doc.setTextColor(0, 113, 227);
  doc.text(`Rs.${total}`, pageWidth - 20, y, { align: 'right' });
  y += 15;

  // Footer
  doc.setTextColor(110, 110, 115);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for choosing Zapspot! Together we drive towards a greener future. 🌱', pageWidth / 2, y + 10, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, pageWidth / 2, y + 18, { align: 'center' });

  doc.save(`Zapspot_Receipt_${booking._id}.pdf`);
}
