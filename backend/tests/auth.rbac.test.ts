import request from 'supertest';
import app from '../src/server';
import { generateToken } from '../src/utils/jwt';

describe('Authentication & RBAC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Missing or invalid JWT', () => {
    it('should return 401 when Authorization header is missing', async () => {
      const response = await request(app)
        .get('/api/courses/my')
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Authorization');
    });

    it('should return 401 when JWT token is invalid', async () => {
      const response = await request(app)
        .get('/api/courses/my')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('Student access control', () => {
    it('should return 403 when student tries to access mentor-only route', async () => {
      const studentToken = generateToken({
        userId: 1,
        role: 'student',
      });

      const response = await request(app)
        .get('/api/courses/my')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('mentor');
    });

    it('should return 403 when student tries to create a course', async () => {
      const studentToken = generateToken({
        userId: 1,
        role: 'student',
      });

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Test Course', description: 'Test' })
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });

  describe('Mentor access control', () => {
    it('should return 403 when mentor tries to access admin-only route', async () => {
      const mentorToken = generateToken({
        userId: 2,
        role: 'mentor',
      });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('admin');
    });

    it('should return 403 when mentor tries to approve another mentor', async () => {
      const mentorToken = generateToken({
        userId: 2,
        role: 'mentor',
      });

      const response = await request(app)
        .put('/api/users/3/approve-mentor')
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });
});

