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

const mockSupabaseClient: any = {
  from: jest.fn(() => createMockQuery()),
};

jest.mock('../src/config/supabase', () => ({
  supabase: mockSupabaseClient,
}));

export const mockSupabase = mockSupabaseClient;

