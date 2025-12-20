import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';

const router = Router();

router.get('/profile', authenticate, (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Profile accessed successfully',
    data: {
      userId: req.user?.userId,
      role: req.user?.role,
    },
  });
});

router.get('/student-dashboard', authenticate, authorize(['student']), (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Student dashboard accessed successfully',
    data: {
      userId: req.user?.userId,
      role: req.user?.role,
      message: 'Welcome to student dashboard',
    },
  });
});

router.get('/mentor-dashboard', authenticate, authorize(['mentor']), (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Mentor dashboard accessed successfully',
    data: {
      userId: req.user?.userId,
      role: req.user?.role,
      message: 'Welcome to mentor dashboard',
    },
  });
});

router.get('/admin-dashboard', authenticate, authorize(['admin']), (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Admin dashboard accessed successfully',
    data: {
      userId: req.user?.userId,
      role: req.user?.role,
      message: 'Welcome to admin dashboard',
    },
  });
});

router.get('/management', authenticate, authorize(['mentor', 'admin']), (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Management panel accessed successfully',
    data: {
      userId: req.user?.userId,
      role: req.user?.role,
      message: 'Welcome to management panel',
    },
  });
});

router.get('/common', authenticate, authorize(['student', 'mentor', 'admin']), (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Common resource accessed successfully',
    data: {
      userId: req.user?.userId,
      role: req.user?.role,
      message: 'This resource is accessible to all authenticated users',
    },
  });
});

export default router;

