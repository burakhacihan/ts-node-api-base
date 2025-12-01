import { ApiResponse } from '@/utils/apiResponse';

describe('ApiResponse', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('successful responses', () => {
    it('should create a successful response with data', () => {
      const data = { id: 1, name: 'Test' };
      const response = ApiResponse(data);

      expect(response).toEqual({
        success: true,
        message: 'Success',
        data: { id: 1, name: 'Test' },
        error: null,
        timestamp: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should create a successful response with custom message', () => {
      const data = { id: 1 };
      const response = ApiResponse(data, 'Operation completed');

      expect(response).toEqual({
        success: true,
        message: 'Operation completed',
        data: { id: 1 },
        error: null,
        timestamp: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should handle null data', () => {
      const response = ApiResponse(null);

      expect(response).toEqual({
        success: true,
        message: 'Success',
        data: null,
        error: null,
        timestamp: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should handle array data', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = ApiResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('error responses', () => {
    it('should create an error response', () => {
      const error = { code: 'ERR_001', message: 'Something went wrong' };
      const response = ApiResponse(null, 'Error occurred', false, error);

      expect(response).toEqual({
        success: false,
        message: 'Error occurred',
        data: null,
        error: { code: 'ERR_001', message: 'Something went wrong' },
        timestamp: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should handle string error', () => {
      const response = ApiResponse(null, 'Failed', false, 'Invalid input');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid input');
    });
  });

  describe('timestamp', () => {
    it('should include current timestamp in ISO format', () => {
      const response = ApiResponse({ test: true });

      expect(response.timestamp).toBe('2024-01-01T00:00:00.000Z');
      expect(() => new Date(response.timestamp)).not.toThrow();
    });
  });

  describe('type safety', () => {
    it('should maintain correct types', () => {
      interface UserData {
        id: number;
        email: string;
      }

      const userData: UserData = { id: 1, email: 'test@example.com' };
      const response = ApiResponse<UserData>(userData);

      expect(response.data?.id).toBe(1);
      expect(response.data?.email).toBe('test@example.com');
    });
  });
});
