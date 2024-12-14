import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const start = Date.now();

    let userId = 'anonymous'; 

    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]; 

      try {
        const decodedToken = jwt.decode(token) as any;

        userId = decodedToken?.userId || 'anonymous';
      } catch (error) {
        this.logger.error('Error decoding token:', error.message);
      }
    }

    return next
      .handle()
      .pipe(
        tap(() => {
          const duration = Date.now() - start;
          this.logger.log(
            `${method} ${url} - ${userId} - ${duration}ms`,
          );
        }),
      );
  }
}
