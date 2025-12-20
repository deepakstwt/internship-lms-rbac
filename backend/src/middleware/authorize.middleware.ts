import { Request, Response, NextFunction } from 'express';

type UserRole = 'student' | 'mentor' | 'admin';

export function authorize(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: `Access forbidden. Required roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}

