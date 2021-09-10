import { map, catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { Injectable, Optional, Inject } from '@angular/core';
import {
  Http,
  Request,
  Response,
  RequestMethod,
  RequestOptions,
  BaseRequestOptions,
  URLSearchParams,
  Headers
} from '@angular/http';
import { Cookie } from './cookie';
import { AI_CORE_CLIENT_OPTIONS } from '../core-client.tokens';
import { ICoreClientOptions } from '../core-client.options';

/**
 * This class provides the NameList service with methods to read names and add names.
 */
@Injectable()
export class RestService {

  restOptions: RequestOptions;
  baseApi = '';
  /**
   * Creates a new NameListService with the injected Http.
   */
  constructor(
    private http: Http,
    @Optional()
    @Inject(AI_CORE_CLIENT_OPTIONS) private options: ICoreClientOptions,
  ) {
     this.restOptions = new BaseRequestOptions();
     if (options) {
       this.baseApi = options.baseApi || '';
     }
     this.restOptions.headers.append('Content-Type', 'application/json');
     console.log('RestService constructor');
  }

  /**
   * Returns an Observable for the HTTP GET request for the JSON resource.
   */
  fetch(path: string, search?: Object, absoluteUrl?: boolean): Observable<any> {
    return this.request(path, RequestMethod.Get, undefined, search, absoluteUrl);
  }

  /**
   * Returns an Observable for the HTTP POST request for the JSON resource.
   */
  post(path: string, body: Object, absoluteUrl?: boolean): Observable<any> {
    return this.request(path, RequestMethod.Post, body, undefined, absoluteUrl);
  }

  /**
   * Returns an Observable for the HTTP PUT request for the JSON resource.
   */
  put(path: string, body: Object, absoluteUrl?: boolean): Observable<any> {
    return this.request(path, RequestMethod.Put, body, undefined, absoluteUrl);
  }

  /**
   * Returns an Observable for the HTTP DELETE request for the JSON resource.
   */
  delete(path: string, absoluteUrl?: boolean): Observable<any> {
    return this.request(path, RequestMethod.Delete, undefined, undefined, absoluteUrl);
  }

  /**
   * Serialize search object to params
   */
  serializeSearch(obj: any): URLSearchParams {
    const params = new URLSearchParams();
    for (const p in obj) {
      if (obj.hasOwnProperty(p)) {
        params.set(encodeURIComponent(p), encodeURIComponent(obj[p]));
      }
    }
    return params;
  }

  private stripTrailingSlash = (str) => {
    return str.endsWith('/') ? str.slice(0, -1) : str;
  }

  private getRequestUrl(path: string): string {
    // const host = window.location.protocol + '//' + window.location.host;
    const xBase = (document.getElementsByTagName('base')[0] || { href: '/' }).href;
    // xBase = xBase.replace(new RegExp(host, 'g'), '');
    return this.stripTrailingSlash(xBase) + path;
  }

  /**
   * Actual rest request based on params
   */
  private request(path: string, method: RequestMethod, body?: Object, search?: Object, absoluteUrl?: boolean): Observable<any> {
    const url = absoluteUrl ? path : this.getRequestUrl(path);
    const orgId = Cookie.get('organization-id');
    const headers = new Headers();
    if (orgId) {
      headers.append('organization-id', orgId);
    }
    headers.set('Content-Type', 'application/json');
    const options = new RequestOptions(this.restOptions.merge({
      method: method,
      url: url,
      body: JSON.stringify(body),
      search: this.serializeSearch(search),
      headers: headers
    }));

    const fl_token = Cookie.get('fl_token');
    if (fl_token) {
      options.headers.set('Authorization', `JWT ${ fl_token }`);
    }

    return this.http
      .request(new Request(options))
      .pipe(map((res: Response) => {
        // because 204 does not contain body
        if (res.status >= 201 && res.status <= 226) {
         return;
       } {
         return res.json();
       }
      }),
      catchError(this.handleError));
  }


  /**
  * Handle HTTP error
  */
  private handleError(error: any) {
    // We'd also dig deeper into the error to get a better message
    let errMsg = error.status ? `${error.status} - ${error.statusText}` : 'Server error';
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
      let baseHost = window.location.host;
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
