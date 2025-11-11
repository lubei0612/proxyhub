import { AllExceptionsFilter } from '../all-exceptions.filter';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    mockRequest = {
      url: '/api/v1/test',
      method: 'GET',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'test-agent',
      },
    };
    
    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  it('should handle HttpException correctly', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
    
    filter.catch(exception, mockHost);
    
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Test error',
        timestamp: expect.any(String),
        path: '/api/v1/test',
      }),
    );
  });

  it('should handle generic Error', () => {
    const exception = new Error('Generic error');
    
    filter.catch(exception, mockHost);
    
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should sanitize sensitive data in error messages', () => {
    const exception = new HttpException(
      'Error with password: secret123',
      HttpStatus.BAD_REQUEST,
    );
    
    filter.catch(exception, mockHost);
    
    const jsonCall = mockResponse.json.mock.calls[0][0];
    expect(jsonCall.message).toContain('[REDACTED]');
  });
});

