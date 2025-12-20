import PDFDocument from 'pdfkit';

/**
 * Generate a PDF certificate for course completion
 * @param studentEmail - Student's email
 * @param courseTitle - Course title
 * @param completionDate - Date when course was completed
 * @returns PDFDocument instance
 */
export function generateCertificate(
  studentEmail: string,
  courseTitle: string,
  completionDate: string
): InstanceType<typeof PDFDocument> {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
  });

  // Certificate border
  doc.rect(50, 50, 495, 695).stroke();

  // Title
  doc.moveDown(3);
  doc.fontSize(32).font('Helvetica-Bold').text('CERTIFICATE OF COMPLETION', {
    align: 'center',
  });

  // Subtitle
  doc.moveDown(2);
  doc.fontSize(16).font('Helvetica').text('This is to certify that', {
    align: 'center',
  });

  // Student name/email
  doc.moveDown(1.5);
  doc.fontSize(24).font('Helvetica-Bold').text(studentEmail, {
    align: 'center',
  });

  // Course completion text
  doc.moveDown(1.5);
  doc.fontSize(16).font('Helvetica').text('has successfully completed the course', {
    align: 'center',
  });

  // Course title
  doc.moveDown(1);
  doc.fontSize(20).font('Helvetica-Bold').text(courseTitle, {
    align: 'center',
  });

  // Completion date
  doc.moveDown(1.5);
  doc.fontSize(14).font('Helvetica').text(`Completed on: ${completionDate}`, {
    align: 'center',
  });

  // Signature line
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

