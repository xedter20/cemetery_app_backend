import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const { method, url } = request;
      const start = Date.now();
  
      // Extract user email if it's available (after successful login)
      const email = request.user?.email || 'anonymous'; // Assuming `user` is set on the request after login
  
      return next
        .handle()
        .pipe(
          tap(() => {
            const duration = Date.now() - start;
            this.logger.log(
              `${method} ${url} - ${email} - ${duration}ms`,
            );
          }),
        );
    }
  }