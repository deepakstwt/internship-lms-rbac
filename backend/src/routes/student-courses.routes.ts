import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize(['student']));

router.get('/my', async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.userId;

    if (!studentId) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
      return;
    }

    const { data: assignments, error: assignmentsError } = await supabase
      .from('course_assignments')
      .select('course_id, assigned_at')
      .eq('student_id', studentId);

    if (assignmentsError) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch course assignments',
      });
      return;
    }

    if (!assignments || assignments.length === 0) {
      res.json({
        status: 'success',
        message: 'No courses assigned',
        data: {
          courses: [],
          count: 0,
        },
      });
      return;
    }

    const courseIds = assignments.map((assignment) => assignment.course_id);

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, description, mentor_id')
      .in('id', courseIds);

    if (coursesError) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch courses',
      });
      return;
    }

    const coursesWithAssignment = (courses || []).map((course) => {
      const assignment = assignments.find((a) => a.course_id === course.id);
      return {
        ...course,
        assigned_at: assignment?.assigned_at,
      };
    });

    res.json({
      status: 'success',
      message: 'Courses fetched successfully',
      data: {
        courses: coursesWithAssignment,
        count: coursesWithAssignment.length,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/courses/my:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

router.get('/:courseId/chapters', async (req: Request, res: Response) => {
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
        message: 'You do not have access to this course',
      });
      return;
    }

    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, title, description, image_url, video_url, sequence_order')
      .eq('course_id', courseId)
      .order('sequence_order', { ascending: true });

    if (chaptersError) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch chapters',
      });
      return;
    }

    res.json({
      status: 'success',
      message: 'Chapters fetched successfully',
      data: {
        chapters: chapters || [],
        count: chapters?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/student/courses/:courseId/chapters:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

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
      .select('course_id, assigned_at')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .single();

    if (assignmentError || !assignment) {
      res.status(403).json({
        status: 'error',
        message: 'You do not have access to this course. Course is not assigned to you.',
      });
      return;
    }

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, description, mentor_id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      res.status(404).json({
        status: 'error',
        message: 'Course not found',
      });
      return;
    }

    res.json({
      status: 'success',
      message: 'Course fetched successfully',
      data: {
        course: {
          ...course,
          assigned_at: assignment.assigned_at,
        },
      },
    });
  } catch (error) {
    console.error('Error in GET /api/courses/:courseId:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

export default router;

