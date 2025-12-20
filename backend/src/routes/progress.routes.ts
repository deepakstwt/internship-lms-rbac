import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize(['student']));

router.post('/:chapterId/complete', async (req: Request, res: Response) => {
  try {
    const chapterId = parseInt(req.params.chapterId, 10);

    if (isNaN(chapterId)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid chapter ID',
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

    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id, course_id, sequence_order, title')
      .eq('id', chapterId)
      .single();

    if (chapterError || !chapter) {
      res.status(404).json({
        status: 'error',
        message: 'Chapter not found',
      });
      return;
    }

    const { data: assignment, error: assignmentError } = await supabase
      .from('course_assignments')
      .select('course_id')
      .eq('course_id', chapter.course_id)
      .eq('student_id', studentId)
      .single();

    if (assignmentError || !assignment) {
      res.status(403).json({
        status: 'error',
        message: 'You are not assigned to this course',
      });
      return;
    }

    const { data: existingProgress, error: checkError } = await supabase
      .from('progress')
      .select('id')
      .eq('student_id', studentId)
      .eq('chapter_id', chapterId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      res.status(500).json({
        status: 'error',
        message: 'Error checking progress',
      });
      return;
    }

    if (existingProgress) {
      res.status(409).json({
        status: 'error',
        message: 'Chapter is already completed',
      });
      return;
    }

    if (chapter.sequence_order > 1) {
      const { data: previousChapters, error: prevChaptersError } = await supabase
        .from('chapters')
        .select('id, sequence_order')
        .eq('course_id', chapter.course_id)
        .lt('sequence_order', chapter.sequence_order)
        .order('sequence_order', { ascending: true });

      if (prevChaptersError) {
        res.status(500).json({
          status: 'error',
          message: 'Error validating sequential completion',
        });
        return;
      }

      if (previousChapters && previousChapters.length > 0) {
        const { data: completedChapters, error: completedError } = await supabase
          .from('progress')
          .select('chapter_id')
          .eq('student_id', studentId)
          .eq('course_id', chapter.course_id);

        if (completedError) {
          res.status(500).json({
            status: 'error',
            message: 'Error validating sequential completion',
          });
          return;
        }

        const completedChapterIds = (completedChapters || []).map((p) => p.chapter_id);

        const incompleteChapters = previousChapters.filter(
          (prevChapter) => !completedChapterIds.includes(prevChapter.id)
        );

        if (incompleteChapters.length > 0) {
          const incompleteSequenceOrders = incompleteChapters
            .map((c) => c.sequence_order)
            .sort((a, b) => a - b);

          res.status(403).json({
            status: 'error',
            message: `You must complete previous chapters first. Missing chapters with sequence_order: ${incompleteSequenceOrders.join(', ')}`,
          });
          return;
        }
      }
    }

    const { data: newProgress, error: insertError } = await supabase
      .from('progress')
      .insert({
        student_id: studentId,
        course_id: chapter.course_id,
        chapter_id: chapterId,
        completed_at: new Date().toISOString(),
      })
      .select('id, student_id, course_id, chapter_id, completed_at')
      .single();

    if (insertError) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to mark chapter as completed',
      });
      return;
    }

    res.status(201).json({
      status: 'success',
      message: 'Chapter marked as completed successfully',
      data: {
        progress: newProgress,
        chapter: {
          id: chapter.id,
          title: chapter.title,
          sequence_order: chapter.sequence_order,
        },
      },
    });
  } catch (error) {
    console.error('Error in POST /api/progress/:chapterId/complete:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

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
          progress: [],
          totalCourses: 0,
        },
      });
      return;
    }

    const courseIds = assignments.map((a) => a.course_id);

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, description')
      .in('id', courseIds);

    if (coursesError) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch courses',
      });
      return;
    }

    const { data: allChapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, course_id, sequence_order')
      .in('course_id', courseIds);

    if (chaptersError) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch chapters',
      });
      return;
    }

    const { data: completedProgress, error: progressError } = await supabase
      .from('progress')
      .select('course_id, chapter_id')
      .eq('student_id', studentId)
      .in('course_id', courseIds);

    if (progressError) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch progress',
      });
      return;
    }

    const completedChapterIds = (completedProgress || []).map((p) => p.chapter_id);

    const courseProgress = (courses || []).map((course) => {
      const courseChapters = (allChapters || []).filter(
        (chapter) => chapter.course_id === course.id
      );
      const totalChapters = courseChapters.length;
      const completedChapters = courseChapters.filter((chapter) =>
        completedChapterIds.includes(chapter.id)
      ).length;
      const completionPercentage =
        totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

      const assignment = assignments.find((a) => a.course_id === course.id);

      return {
        course: {
          id: course.id,
          title: course.title,
          description: course.description,
        },
        assigned_at: assignment?.assigned_at,
        totalChapters,
        completedChapters,
        completionPercentage,
      };
    });

    res.json({
      status: 'success',
      message: 'Progress fetched successfully',
      data: {
        progress: courseProgress,
        totalCourses: courseProgress.length,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/progress/my:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

router.get('/course/:courseId/chapters', async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    const studentId = req.user?.userId;

    if (!studentId) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
      return;
    }

    if (isNaN(courseId)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid course ID',
      });
      return;
    }

    const { data: completedProgress, error } = await supabase
      .from('progress')
      .select('chapter_id')
      .eq('student_id', studentId)
      .eq('course_id', courseId);

    if (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch completed chapters',
      });
      return;
    }

    const completedChapterIds = (completedProgress || []).map((p) => p.chapter_id);

    res.json({
      status: 'success',
      message: 'Completed chapters fetched successfully',
      data: {
        completedChapterIds,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/progress/course/:courseId/chapters:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

export default router;

