import request from 'supertest';
import app from '../src/server';
import { generateToken } from '../src/utils/jwt';
import { mockSupabase } from './setup';

const createMockQuery = () => {
  const query: any = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
  };
  return query;
};

describe('Sequential Chapter Completion', () => {
  const studentToken = generateToken({
    userId: 1,
    role: 'student',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 when student tries to complete chapter out of sequence', async () => {
    const previousChaptersChain: any = {};
    previousChaptersChain.select = jest.fn().mockReturnValue(previousChaptersChain);
    previousChaptersChain.eq = jest.fn().mockReturnValue(previousChaptersChain);
    previousChaptersChain.lt = jest.fn().mockReturnValue(previousChaptersChain);
    previousChaptersChain.order = jest.fn().mockResolvedValue({
      data: [
        { id: 1, sequence_order: 1 },
        { id: 2, sequence_order: 2 },
      ],
      error: null,
    });

    const completedProgressChain: any = {};
    completedProgressChain.select = jest.fn().mockReturnValue(completedProgressChain);
    completedProgressChain.eq = jest.fn().mockReturnValue(completedProgressChain);
    completedProgressChain.eq.mockResolvedValue({
      data: [],
      error: null,
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'chapters') {
        const chapterChain: any = {};
        chapterChain.select = jest.fn().mockReturnValue(chapterChain);
        chapterChain.eq = jest.fn((field: string, value: any) => {
          if (field === 'id' && value === 3) {
            return {
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 3,
                  course_id: 1,
                  sequence_order: 3,
                  title: 'Chapter 3',
                },
                error: null,
              }),
            };
          }
          if (field === 'course_id' && value === 1) {
            return previousChaptersChain;
          }
          return chapterChain;
        });
        return chapterChain;
      }
      if (table === 'course_assignments') {
        const assignmentChain: any = {};
        assignmentChain.select = jest.fn().mockReturnValue(assignmentChain);
        assignmentChain.eq = jest.fn().mockReturnValue(assignmentChain);
        assignmentChain.single = jest.fn().mockResolvedValue({
          data: { course_id: 1 },
          error: null,
        });
        return assignmentChain;
      }
      if (table === 'progress') {
        const progressChain: any = {};
        progressChain.select = jest.fn().mockReturnValue(progressChain);
        progressChain.eq = jest.fn((field: string, value: any) => {
          if (field === 'chapter_id' && value === 3) {
            return {
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' },
              }),
            };
          }
          if (field === 'student_id' && value === 1) {
            return progressChain;
          }
          if (field === 'course_id' && value === 1) {
            return completedProgressChain;
          }
          return progressChain;
        });
        return progressChain;
      }
      return createMockQuery();
    });

    const response = await request(app)
      .post('/api/progress/3/complete')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(403);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('previous chapters');
  });

  it('should allow completing first chapter (sequence_order = 1)', async () => {
    const insertChain: any = {};
    insertChain.select = jest.fn().mockReturnValue(insertChain);
    insertChain.single = jest.fn().mockResolvedValue({
      data: {
        id: 1,
        student_id: 1,
        course_id: 1,
        chapter_id: 1,
        completed_at: new Date().toISOString(),
      },
      error: null,
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'chapters') {
        const chapterChain: any = {};
        chapterChain.select = jest.fn().mockReturnValue(chapterChain);
        chapterChain.eq = jest.fn().mockReturnValue(chapterChain);
        chapterChain.single = jest.fn().mockResolvedValue({
          data: {
            id: 1,
            course_id: 1,
            sequence_order: 1,
            title: 'Chapter 1',
          },
          error: null,
        });
        return chapterChain;
      }
      if (table === 'course_assignments') {
        const assignmentChain: any = {};
        assignmentChain.select = jest.fn().mockReturnValue(assignmentChain);
        assignmentChain.eq = jest.fn().mockReturnValue(assignmentChain);
        assignmentChain.single = jest.fn().mockResolvedValue({
          data: { course_id: 1 },
          error: null,
        });
        return assignmentChain;
      }
      if (table === 'progress') {
        const progressChain: any = {};
        progressChain.select = jest.fn().mockReturnValue(progressChain);
        progressChain.eq = jest.fn().mockReturnValue(progressChain);
        progressChain.single = jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        });
        progressChain.insert = jest.fn().mockReturnValue(insertChain);
        return progressChain;
      }
      return createMockQuery();
    });

    const response = await request(app)
      .post('/api/progress/1/complete')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.data.progress.chapter_id).toBe(1);
  });
});

