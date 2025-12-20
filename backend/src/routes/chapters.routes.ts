import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize(['mentor']));

router.post('/:courseId/chapters', async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    const { title, description, image_url, video_url, sequence_order } = req.body;

    if (isNaN(courseId)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid course ID',
      });
      return;
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Title is required and must be a non-empty string',
      });
      return;
    }

    if (sequence_order === undefined || sequence_order === null) {
      res.status(400).json({
        status: 'error',
        message: 'sequence_order is required',
      });
      return;
    }

    const sequenceOrder = parseInt(sequence_order, 10);
    if (isNaN(sequenceOrder) || sequenceOrder < 1) {
      res.status(400).json({
        status: 'error',
        message: 'sequence_order must be a positive integer',
      });
      return;
    }

    const mentorId = req.user?.userId;

    if (!mentorId) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
      return;
    }

    const { data: course, error: findError } = await supabase
      .from('courses')
      .select('id, title, mentor_id')
      .eq('id', courseId)
      .single();

    if (findError || !course) {
      res.status(404).json({
        status: 'error',
        message: 'Course not found',
      });
      return;
    }

    if (course.mentor_id !== mentorId) {
      res.status(403).json({
        status: 'error',
        message: 'You do not have permission to add chapters to this course',
      });
      return;
    }

    const { data: existingChapter, error: checkError } = await supabase
      .from('chapters')
      .select('id, sequence_order')
      .eq('course_id', courseId)
      .eq('sequence_order', sequenceOrder)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      res.status(500).json({
        status: 'error',
        message: 'Error checking sequence order',
      });
      return;
    }

    if (existingChapter) {
      res.status(409).json({
        status: 'error',
        message: `A chapter with sequence_order ${sequenceOrder} already exists for this course`,
      });
      return;
    }

    const { data: newChapter, error: insertError } = await supabase
      .from('chapters')
      .insert({
        course_id: courseId,
        title: title.trim(),
        description: description?.trim() || null,
        image_url: image_url?.trim() || null,
        video_url: video_url?.trim() || null,
        sequence_order: sequenceOrder,
      })
      .select('id, course_id, title, description, image_url, video_url, sequence_order, created_at')
      .single();

    if (insertError) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to create chapter',
      });
      return;
    }

    res.status(201).json({
      status: 'success',
      message: 'Chapter created successfully',
      data: {
        chapter: newChapter,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/courses/:courseId/chapters:', error);
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

    const mentorId = req.user?.userId;

    if (!mentorId) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
      return;
    }

    const { data: course, error: findError } = await supabase
      .from('courses')
      .select('id, title, mentor_id')
      .eq('id', courseId)
      .single();

    if (findError || !course) {
      res.status(404).json({
        status: 'error',
        message: 'Course not found',
      });
      return;
    }

    if (course.mentor_id !== mentorId) {
      res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view chapters of this course',
      });
      return;
    }

    const { data: chapters, error } = await supabase
      .from('chapters')
      .select('id, course_id, title, description, image_url, video_url, sequence_order, created_at')
      .eq('course_id', courseId)
      .order('sequence_order', { ascending: true });

    if (error) {
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
        course: {
          id: course.id,
          title: course.title,
        },
        chapters: chapters || [],
        count: chapters?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/courses/:courseId/chapters:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

export default router;

