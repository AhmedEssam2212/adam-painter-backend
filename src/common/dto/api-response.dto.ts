/**
 * Standard API Response DTO
 * Provides a unified response structure for all API endpoints
 */
export class ApiResponseDto<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  path: string;

  constructor(success: boolean, message: string, data?: T, path?: string) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.path = path || '';
  }

  static success<T>(data: T, message = 'Operation successful', path?: string): ApiResponseDto<T> {
    return new ApiResponseDto(true, message, data, path);
  }

  static error(message: string, path?: string): ApiResponseDto {
    return new ApiResponseDto(false, message, undefined, path);
  }
}
