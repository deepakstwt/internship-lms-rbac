import request from 'supertest';
import app from '../src/server';
import { generateToken } from '../src/utils/jwt';
import { mockSupabase } from './setup';

const createMockQuery = () => {
  const query: any = {};
  query.select = jest.fn().mockReturnThis();
  query.insert = jest.fn().mockReturnThis();
  query.update = jest.fn().mockReturnThis();
  query.delete = jest.fn().mockReturnThis();
  query.eq = jest.fn().mockReturnThis();
  query.in = jest.fn().mockReturnThis();
  query.lt = jest.fn().mockReturnThis();
  query.single = jest.fn();
  query.order = jest.fn().mockReturnThis();
  return query;
};

describe('Certificate Eligibility', () => {
  const studentToken = generateToken({
    userId: 1,
    role: 'student',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 when course is not 100% completed', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'course_assignments') {
        const query: any = {};
        const afterSelect: any = {};
        query.select = jest.fn().mockReturnValue(afterSelect);
        afterSelect.eq = jest.fn().mockReturnValue(afterSelect);
        afterSelect.single = jest.fn().mockResolvedValue({
          data: { course_id: 1 },
          error: null,
        });
        return query;
      }
      if (table === 'courses') {
        const query: any = {};
        const afterSelect: any = {};
        query.select = jest.fn().mockReturnValue(afterSelect);
        afterSelect.eq = jest.fn().mockReturnValue(afterSelect);
        afterSelect.single = jest.fn().mockResolvedValue({
          data: { id: 1, title: 'Test Course' },
          error: null,
        });
        return query;
      }
      if (table === 'users') {
        const query: any = {};
        const afterSelect: any = {};
        query.select = jest.fn().mockReturnValue(afterSelect);
        afterSelect.eq = jest.fn().mockReturnValue(afterSelect);
        afterSelect.single = jest.fn().mockResolvedValue({
          data: { id: 1, email: 'student@test.com' },
          error: null,
        });
        return query;
      }
      if (table === 'chapters') {
        const query: any = {};
        const afterSelect: any = {};
        query.select = jest.fn().mockReturnValue(afterSelect);
        afterSelect.eq = jest.fn().mockResolvedValue({
          data: [
            { id: 1 },
            { id: 2 },
            { id: 3 },
          ],
          error: null,
        });
        return query;
      }
      if (table === 'progress') {
        const query: any = {};
        const afterSelect: any = {};
        const afterFirstEq: any = {};
        query.select = jest.fn().mockReturnValue(afterSelect);
        afterSelect.eq = jest.fn().mockReturnValue(afterFirstEq);
        afterFirstEq.eq = jest.fn().mockResolvedValue({
          data: [
            { chapter_id: 1 },
            { chapter_id: 2 },
          ],
          error: null,
        });
        return query;
      }
      return createMockQuery();
    });

    const response = await request(app)
      .get('/api/certificates/1')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(403);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('100%');
    expect(response.body.data.completionPercentage).toBeLessThan(100);
  });

  it('should succeed when course is 100% completed', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'course_assignments') {
        const query: any = {};
        const afterSelect: any = {};
        query.select = jest.fn().mockReturnValue(afterSelect);
        afterSelect.eq = jest.fn().mockReturnValue(afterSelect);
        afterSelect.single = jest.fn().mockResolvedValue({
          data: { course_id: 1 },
          error: null,
        });
        return query;
      }
      if (table === 'courses') {
        const query: any = {};
        const afterSelect: any = {};
        query.select = jest.fn().mockReturnValue(afterSelect);
        afterSelect.eq = jest.fn().mockReturnValue(afterSelect);
        afterSelect.single = jest.fn().mockResolvedValue({
          data: { id: 1, title: 'Test Course' },
          error: null,
        });
        return query;
      }
      if (table === 'users') {
        const query: any = {};
        const afterSelect: any = {};
        query.select = jest.fn().mockReturnValue(afterSelect);
        afterSelect.eq = jest.fn().mockReturnValue(afterSelect);
        afterSelect.single = jest.fn().mockResolvedValue({
          data: { id: 1, email: 'student@test.com' },
          error: null,
        });
        return query;
      }
      if (table === 'chapters') {
        const query: any = {};
        const afterSelect: any = {};
        query.select = jest.fn().mockReturnValue(afterSelect);
        afterSelect.eq = jest.fn().mockResolvedValue({
          data: [
            { id: 1 },
            { id: 2 },
          ],
          error: null,
        });
        return query;
      }
      if (table === 'progress') {
        const query: any = {};
        const afterSelect: any = {};
        const afterFirstEq: any = {};
        query.select = jest.fn().mockReturnValue(afterSelect);
        afterSelect.eq = jest.fn().mockReturnValue(afterFirstEq);
        afterFirstEq.eq = jest.fn().mockResolvedValue({
          data: [
            { chapter_id: 1 },
            { chapter_id: 2 },
          ],
          error: null,
        });
        return query;
      }
      if (table === 'certificates') {
        const certQuery: any = {};
        const certAfterSelect: any = {};
        const certAfterFirstEq: any = {};
        const certAfterSecondEq: any = {};
        certQuery.select = jest.fn().mockReturnValue(certAfterSelect);
        certAfterSelect.eq = jest.fn().mockReturnValue(certAfterFirstEq);
        certAfterFirstEq.eq = jest.fn().mockReturnValue(certAfterSecondEq);
        certAfterSecondEq.single = jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        });
        const insertQuery: any = {};
        const insertAfterInsert: any = {};
        const insertAfterSelect: any = {};
        insertQuery.insert = jest.fn().mockReturnValue(insertAfterInsert);
        insertAfterInsert.select = jest.fn().mockReturnValue(insertAfterSelect);
        insertAfterSelect.single = jest.fn().mockResolvedValue({
          data: {
            id: 1,
            student_id: 1,
            course_id: 1,
            issued_at: new Date().toISOString(),
          },
          error: null,
        });
        certQuery.insert = jest.fn().mockReturnValue(insertAfterInsert);
        return certQuery;
      }
      return createMockQuery();
    });

    const response = await request(app)
      .get('/api/certificates/1')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(response.headers['content-type']).toContain('application/pdf');
  });
});

