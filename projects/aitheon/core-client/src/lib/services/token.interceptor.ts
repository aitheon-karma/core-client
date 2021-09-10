import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cookie } from './cookie';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = Cookie.get('fl_token');
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `JWT ${ token }`
        }
      });
    }
    return next.handle(request);
  }
}
