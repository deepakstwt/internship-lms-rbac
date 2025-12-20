import PDFDocument from 'pdfkit';

export function generateCertificate(
  studentEmail: string,
  courseTitle: string,
  completionDate: string
): InstanceType<typeof PDFDocument> {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
  });

  doc.rect(50, 50, 495, 695).stroke();

  doc.moveDown(3);
  doc.fontSize(32).font('Helvetica-Bold').text('CERTIFICATE OF COMPLETION', {
    align: 'center',
  });

  doc.moveDown(2);
  doc.fontSize(16).font('Helvetica').text('This is to certify that', {
    align: 'center',
  });

  doc.moveDown(1.5);
  doc.fontSize(24).font('Helvetica-Bold').text(studentEmail, {
    align: 'center',
  });

  doc.moveDown(1.5);
  doc.fontSize(16).font('Helvetica').text('has successfully completed the course', {
    align: 'center',
  });

  doc.moveDown(1);
  doc.fontSize(20).font('Helvetica-Bold').text(courseTitle, {
    align: 'center',
  });

  doc.moveDown(1.5);
  doc.fontSize(14).font('Helvetica').text(`Completed on: ${completionDate}`, {
    align: 'center',
  });

  doc.moveDown(5);
  doc.fontSize(12).font('Helvetica').text('_________________________', {
    align: 'left',
    indent: 50,
  });

  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica').text('Authorized Signature', {
    align: 'left',
    indent: 50,
  });

  return doc;
}

