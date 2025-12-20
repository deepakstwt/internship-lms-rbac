import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize(['admin']));

router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, is_approved, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch users',
      });
      return;
    }

    res.json({
      status: 'success',
      message: 'Users fetched successfully',
      data: {
        users: users || [],
        count: users?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

router.put('/:id/approve-mentor', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid user ID',
      });
      return;
    }

    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, role, is_approved')
      .eq('id', userId)
      .single();

    if (findError || !user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    if (user.role !== 'mentor') {
      res.status(400).json({
        status: 'error',
        message: 'User is not a mentor. Only mentors can be approved.',
      });
      return;
    }

    if (user.is_approved) {
      res.status(400).json({
        status: 'error',
        message: 'Mentor is already approved',
      });
      return;
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ is_approved: true })
      .eq('id', userId)
      .select('id, email, role, is_approved')
      .single();

    if (updateError) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to approve mentor',
      });
      return;
    }

    res.json({
      status: 'success',
      message: 'Mentor approved successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error('Error in PUT /api/users/:id/approve-mentor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid user ID',
      });
      return;
    }

    if (req.user && req.user.userId === userId) {
      res.status(400).json({
        status: 'error',
        message: 'You cannot delete your own account',
      });
      return;
    }

    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', userId)
      .single();

    if (findError || !user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete user',
      });
      return;
    }

    res.json({
      status: 'success',
      message: 'User deleted successfully',
      data: {
        deletedUser: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Error in DELETE /api/users/:id:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

export default router;

