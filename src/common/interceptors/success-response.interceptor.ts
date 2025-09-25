import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto';

/**
 * Success Response Interceptor
 * Automatically wraps all successful responses in a standardized format
 */
@Injectable()
export class SuccessResponseInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    return next.handle().pipe(
      map((data) => {
        // If the response is already wrapped in ApiResponseDto, return as is
        if (data && typeof data === 'object' && 'success' in data && 'timestamp' in data) {
          return data;
        }

        // Otherwise, wrap the response
        return ApiResponseDto.success(data, 'Operation successful', path);
      }),
    );
  }
}
