import { Injectable, Optional, Inject } from '@angular/core';
import { RequestOptions, Http, Request, Response, Headers } from '@angular/http';
import { AI_CORE_CLIENT_OPTIONS } from '../core-client.tokens';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Route, Router, NavigationEnd } from '@angular/router';
import { Cookie } from './cookie';
import { ICoreClientOptions } from '../core-client.options';

@Injectable({
  providedIn: 'root'
})
export class HelpCenterService {


  baseApi = '';

  serviceUrl: string;
  url: string;
  isLocalhost: boolean;

  constructor(
    private http: Http,
    private router: Router,
    @Optional()
    @Inject(AI_CORE_CLIENT_OPTIONS) private options: ICoreClientOptions,
  ) {
    if (options) {
      this.baseApi = options.baseApi || '';
    }
    this.isLocalhost = location.hostname === 'localhost';
    this.serviceUrl = this.isLocalhost ? 'localhost' :  location.href.split('/')[3];


  }

  listFAQ(url: string) {
    return this.makeRequest('POST', '/platform-support/api/faq/route', {serviceUrl: this.serviceUrl, url}, false);
  }

  listUserGuide(url: string) {
    return this.makeRequest('POST', '/platform-support/api/user-guide/route', {serviceUrl: this.serviceUrl, url}, false);
  }

  listHelpVideos(url: string) {
    return this.makeRequest('POST', '/platform-support/api/help-videos/route', {serviceUrl: this.serviceUrl, url}, false);
  }

  getHelpRoute(url: string) {
    return this.makeRequest('POST', '/platform-support/api/routes/route', {serviceUrl: this.serviceUrl, url}, false);
  }


  private makeRequest(method: string, url: string, body: any = null, logout = true): Observable<any> {
    url = this.baseApi + url;
    const orgId = Cookie.get('organization-id');
    const headers = new Headers();
    if (orgId) {
      headers.append('organization-id', orgId);
    }
    const options = new RequestOptions({
      method: method,
      url: url,
      headers: headers
    });

    if (body) {
      options.body = JSON.stringify(body);
    }

    options.headers.set('Content-Type', 'application/json');
    const fl_token = Cookie.get('fl_token');
    if (fl_token) {
      options.headers.set('Authorization', `JWT ${ fl_token }`);
    }

    const request = this.http
      .request(new Request(options))
      .pipe(map((res: Response) => {
        // because 204 does not contain body
        if (res.status >= 201 && res.status <= 226) {
         return;
       } {
         return res.json();
       }
      }),
      catchError(logout ? this.handleError : (() => of(false)) ));

    return request;
  }

  /**
  * Handle HTTP error
  */
  private handleError(error: any) {
    // We'd also dig deeper into the error to get a better message
    let errMsg = error.status ? `${ error.status } - ${ error.statusText }` : 'Server error';
    if (error._body) {
      try {
        const json = error.json();
        if (json.message) {
          errMsg = json.message;
        } else {
          errMsg = json;
        }
      } catch (error) {
      }
    }
    return throwError(errMsg);
  }

}
