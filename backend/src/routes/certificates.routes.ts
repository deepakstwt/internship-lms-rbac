import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { generateCertificate } from '../utils/certificate';

const router = Router();

router.use(authenticate);
router.use(authorize(['student']));

router.get('/:courseId', async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);

    if (isNaN(courseId)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid course ID',
      });
      return;
    }

    const studentId = req.user?.userId;

    if (!studentId) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
      return;
    }

    const { data: assignment, error: assignmentError } = await supabase
      .from('course_assignments')
      .select('course_id')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .single();

    if (assignmentError || !assignment) {
      res.status(403).json({
        status: 'error',
        message: 'You are not assigned to this course',
      });
      return;
    }

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      res.status(404).json({
        status: 'error',
        message: 'Course not found',
      });
      return;
    }

    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      res.status(404).json({
        status: 'error',
        message: 'Student not found',
      });
      return;
    }

    const { data: allChapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id')
      .eq('course_id', courseId);

    if (chaptersError) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch course chapters',
      });
      return;
    }

    const totalChapters = allChapters?.length || 0;

    if (totalChapters === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Course has no chapters. Certificate cannot be generated.',
      });
      return;
    }

    const { data: completedProgress, error: progressError } = await supabase
      .from('progress')
      .select('chapter_id')
      .eq('student_id', studentId)
      .eq('course_id', courseId);

    if (progressError) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch course progress',
      });
      return;
    }

    const completedChapters = completedProgress?.length || 0;
    const completionPercentage =
      totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    if (completionPercentage !== 100) {
      res.status(403).json({
        status: 'error',
        message: `Course completion is ${completionPercentage}%. You must complete 100% of the course to generate a certificate.`,
        data: {
          completedChapters,
          totalChapters,
          completionPercentage,
        },
      });
      return;
    }

    const { data: existingCertificate, error: certCheckError } = await supabase
      .from('certificates')
      .select('id, issued_at')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();

    let certificateRecord;
    if (certCheckError || !existingCertificate) {
      const { data: newCertificate, error: insertError } = await supabase
        .from('certificates')
        .insert({
          student_id: studentId,
          course_id: courseId,
          issued_at: new Date().toISOString(),
        })
        .select('id, student_id, course_id, issued_at')
        .single();

      if (insertError) {
        certificateRecord = {
          issued_at: new Date().toISOString(),
        };
      } else {
        certificateRecord = newCertificate;
      }
    } else {
      certificateRecord = existingCertificate;
    }

    const completionDate = certificateRecord.issued_at
      ? new Date(certificateRecord.issued_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

    const doc = generateCertificate(student.email, course.title, completionDate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificate-${course.title.replace(/\s+/g, '-')}-${studentId}.pdf"`
    );

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error in GET /api/certificates/:courseId:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

export default router;

