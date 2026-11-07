import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CompanyContext } from '../company.context';

@Injectable()
export class CompanyInterceptor implements NestInterceptor {
  constructor(private readonly companyContext: CompanyContext) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const company = request.company;

    if (company) {
      this.companyContext.setCompanyData(company);
    }

    return next.handle();
  }
}

// NO SE ESTA USANDO, EXPANDIR
