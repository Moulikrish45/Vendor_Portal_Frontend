import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
export const basicAuthInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Create Base64 string from User:Password
  const authData = window.btoa(environment.apiUser + ':' + environment.apiPassword);

  // 2. Clone the request and add the header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Basic ${authData}`,
      // We also add SOAP specific headers here to be safe
      'Content-Type': 'text/xml; charset=utf-8'
    }
  });

  return next(authReq);
};