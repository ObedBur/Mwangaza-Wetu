import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * BenchInterceptor — Mesure et affiche la latence de chaque requête HTTP.
 * Activer/désactiver via la variable d'env : BENCH_INTERCEPTOR=true
 *
 * Exemple de sortie dans le terminal :
 *   [BenchInterceptor] GET /api/membres → 42 ms
 *   [BenchInterceptor] POST /api/auth/admin/login → 213 ms ⚠️
 */
@Injectable()
export class BenchInterceptor implements NestInterceptor {
  private readonly logger = new Logger('BenchInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method: string = req.method;
    const url: string = req.url;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - start;
        const emoji = elapsed > 500 ? '🔴' : elapsed > 200 ? '⚠️ ' : '✅';
        this.logger.log(`${emoji}  ${method} ${url} → ${elapsed} ms`);
      }),
    );
  }
}
