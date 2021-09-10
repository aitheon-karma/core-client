import { RequestOptions, Http, Request, Response, Headers } from '@angular/http';
import { Observable, throwError, of } from 'rxjs';
import { Injectable, Optional, Inject } from '@angular/core';
import { Cookie } from './cookie';
import { Notification } from './notification';
import { map, catchError } from 'rxjs/operators';
import { AI_CORE_CLIENT_OPTIONS } from '../core-client.tokens';
import { ICoreClientOptions } from '../core-client.options';


@Injectable()
export class NotificationsService {

  baseApi = '';

  constructor(
    private http: Http,
    @Optional()
    @Inject(AI_CORE_CLIENT_OPTIONS) private options: ICoreClientOptions,
  ) {
    if (options) {
      this.baseApi = options.baseApi || '';
    }
  }

  list(all: boolean = false): Observable<Notification[]> {
    return this.makeRequest('GET', `/users/api/notifications${ all ? '?all=true' : '' }`);
  }

  getEmployeeByUser(): Observable<any> {
    return this.makeRequest('GET', `/hr/api/employees/me/info`, null, false);
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.makeRequest('PUT', `/users/api/notifications/${ notificationId }`);
  }

  declineOrgInvite(inviteId: string): Observable<any> {
    return this.makeRequest('PUT', `/users/api/users/invites/${ inviteId }/decline`, {});
  }

  acceptOrgInvite(inviteId: string): Observable<any> {
    return this.makeRequest('PUT', `/users/api/users/invites/${ inviteId }/accept`, {});
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
    console.error(errMsg); // log to console instead
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem('current_user');
      let baseHost = Cookie.get('base_host') || window['base_host'];
      Cookie.delete('fl_token', '/', baseHost);
      if (!baseHost) {
        const domains = window.location.hostname.split('.');
        // assume we have 2 level domain always
        if (domains.length >= 2) {
          baseHost = `${ domains[domains.length - 2] }.${ domains[domains.length - 1 ]}`;
        }
      }
      const location = `${ window.location.protocol }//${ baseHost }:${ window.location.port }/login`;
      window.location.href = location;
    }
    return throwError(errMsg);
  }

}
