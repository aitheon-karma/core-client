import { RequestOptions, Http, Request, Response, Headers } from '@angular/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { Injectable, Optional, Inject } from '@angular/core';
import { Cookie } from './cookie';
import { map, catchError } from 'rxjs/operators';
import { AI_CORE_CLIENT_OPTIONS } from '../core-client.tokens';
import { ICoreClientOptions } from '../core-client.options';
import { TourGuideStep } from './tour-guide-step';


@Injectable({
  providedIn: 'root'
})

export class TourGuideService {

  _startTour: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  startTour: Observable<boolean> = this._startTour.asObservable();

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

  list(): Observable<TourGuideStep[]> {
    return this.makeRequest('GET', `/platform-support/api/tutorials/tour-guide`);
  }

  listByParams(params: any): Observable<TourGuideStep[]> {
    return this.makeRequest('GET', `/platform-support/api/tutorials/tour-guide`, params);
  }

  create(tourStep: TourGuideStep): Observable<TourGuideStep> {
    return this.makeRequest('POST', `/platform-support/api/tutorials/tour-guide`, tourStep);
  }

  update(tourStep: TourGuideStep): Observable<TourGuideStep> {
    return this.makeRequest('PUT', `/platform-support/api/tutorials/tour-guide/${tourStep._id}`, tourStep);
  }


  delete(tourStep: TourGuideStep): Observable<TourGuideStep> {
    return this.makeRequest('DELETE', `/platform-support/api/tutorials/tour-guide/${tourStep._id}`);
  }


  listByReferences( references: string[], path: string): Observable<TourGuideStep[]> {
    return this.makeRequest('PUT', `/platform-support/api/tutorials/tour-guide/list/references?path=${path}`, references);
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
    return throwError(errMsg);
  }

}
