import './config/env';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import protectedRoutes from './routes/protected.routes';
import usersRoutes from './routes/users.routes';
import coursesRoutes from './routes/courses.routes';
import chaptersRoutes from './routes/chapters.routes';
import studentCoursesRoutes from './routes/student-courses.routes';
import progressRoutes from './routes/progress.routes';
import certificatesRoutes from './routes/certificates.routes';

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Internship LMS API',
  });
});

app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/protected', protectedRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/courses', chaptersRoutes);
app.use('/api/student/courses', studentCoursesRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/certificates', certificatesRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

