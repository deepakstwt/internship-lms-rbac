import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize(['mentor']));

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Title is required and must be a non-empty string',
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

    const { data: newCourse, error: insertError } = await supabase
      .from('courses')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        mentor_id: mentorId,
      })
      .select('id, title, description, mentor_id, created_at')
      .single();

    if (insertError) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to create course',
      });
      return;
    }

    res.status(201).json({
      status: 'success',
      message: 'Course created successfully',
      data: {
        course: newCourse,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/courses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

router.get('/my', async (req: Request, res: Response) => {
  try {
    const mentorId = req.user?.userId;

    if (!mentorId) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
      return;
    }

    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, title, description, mentor_id, created_at')
      .eq('mentor_id', mentorId)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch courses',
      });
      return;
    }

    res.json({
      status: 'success',
      message: 'Courses fetched successfully',
      data: {
        courses: courses || [],
        count: courses?.length || 0,
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

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const mentorId = req.user?.userId;

    if (!mentorId) {
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

    const { data: course, error: findError } = await supabase
      .from('courses')
      .select('id, title, description, mentor_id, created_at')
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
        message: 'You do not have permission to view this course',
      });
      return;
    }

    res.json({
      status: 'success',
      message: 'Course fetched successfully',
      data: {
        course,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/courses/:id:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const { title, description } = req.body;

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
      .select('id, title, description, mentor_id')
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
        message: 'You do not have permission to update this course',
      });
      return;
    }

    const { data: updatedCourse, error: updateError } = await supabase
      .from('courses')
      .update({
        title: title.trim(),
        description: description?.trim() || null,
      })
      .eq('id', courseId)
      .select('id, title, description, mentor_id, created_at')
      .single();

    if (updateError) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to update course',
      });
      return;
    }

    res.json({
      status: 'success',
      message: 'Course updated successfully',
      data: {
        course: updatedCourse,
      },
    });
  } catch (error) {
    console.error('Error in PUT /api/courses/:id:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id, 10);

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
        message: 'You do not have permission to delete this course',
      });
      return;
    }

    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (deleteError) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete course',
      });
      return;
    }

    res.json({
      status: 'success',
      message: 'Course deleted successfully',
      data: {
        deletedCourse: {
          id: course.id,
          title: course.title,
        },
      },
    });
  } catch (error) {
    console.error('Error in DELETE /api/courses/:id:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

router.post('/:courseId/assign', async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    const { studentIds } = req.body;

    if (isNaN(courseId)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid course ID',
      });
      return;
    }

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'studentIds is required and must be a non-empty array',
      });
      return;
    }

    const validStudentIds = studentIds
      .map((id: any) => {
        const numId = typeof id === 'number' ? id : parseInt(id, 10);
        return isNaN(numId) ? null : numId;
      })
      .filter((id): id is number => id !== null);

    if (validStudentIds.length !== studentIds.length) {
      res.status(400).json({
        status: 'error',
        message: 'All student IDs must be valid numbers',
      });
      return;
    }

    const uniqueStudentIds = [...new Set(validStudentIds)];

    if (uniqueStudentIds.length !== studentIds.length) {
      res.status(400).json({
        status: 'error',
        message: 'Duplicate student IDs found in the request',
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
        message: 'You do not have permission to assign this course',
      });
      return;
    }

    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, email, role')
      .in('id', uniqueStudentIds);

    if (studentsError) {
      res.status(500).json({
        status: 'error',
        message: 'Error validating student IDs',
      });
      return;
    }

    if (!students || students.length !== uniqueStudentIds.length) {
      res.status(404).json({
        status: 'error',
        message: 'One or more student IDs not found',
      });
      return;
    }

    const nonStudents = students.filter((user) => user.role !== 'student');
    if (nonStudents.length > 0) {
      res.status(400).json({
        status: 'error',
        message: `The following users are not students: ${nonStudents.map((u) => u.id).join(', ')}`,
      });
      return;
    }

    const { data: existingAssignments, error: checkError } = await supabase
      .from('course_assignments')
      .select('student_id')
      .eq('course_id', courseId)
      .in('student_id', uniqueStudentIds);

    if (checkError) {
      res.status(500).json({
        status: 'error',
        message: 'Error checking existing assignments',
      });
      return;
    }

    if (existingAssignments && existingAssignments.length > 0) {
      const alreadyAssignedIds = existingAssignments.map((a) => a.student_id);
      res.status(409).json({
        status: 'error',
        message: `The following students are already assigned to this course: ${alreadyAssignedIds.join(', ')}`,
      });
      return;
    }

    const assignments = uniqueStudentIds.map((studentId) => ({
      course_id: courseId,
      student_id: studentId,
      assigned_at: new Date().toISOString(),
    }));

    const { data: newAssignments, error: insertError } = await supabase
      .from('course_assignments')
      .insert(assignments)
      .select('id, course_id, student_id, assigned_at');

    if (insertError) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to assign course to students',
      });
      return;
    }

    res.status(201).json({
      status: 'success',
      message: 'Course assigned to students successfully',
      data: {
        course: {
          id: course.id,
          title: course.title,
        },
        assignments: newAssignments,
        assignedCount: newAssignments?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/courses/:courseId/assign:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

export default router;

