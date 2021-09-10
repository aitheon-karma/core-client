import { RequestOptions, Http, Request, Response, Headers } from '@angular/http';
import { Observable, throwError, of } from 'rxjs';
import { Injectable, Optional, Inject } from '@angular/core';
import { Cookie } from './cookie';
import { map, catchError } from 'rxjs/operators';
import { AI_CORE_CLIENT_OPTIONS } from '../core-client.tokens';
import { ICoreClientOptions } from '../core-client.options';
import { Note } from './note';



@Injectable()
export class NotesService {

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

  list(): Observable<Note[]> {
    return this.makeRequest('GET', `/notes/api/notes`);
  }

  createNote(note: Note): Observable<Note> {
    return this.makeRequest('POST', `/notes/api/notes`, note);
  }

  updateNote(note: Note): Observable<Note> {
    return this.makeRequest('PUT', `/notes/api/notes/${note._id}`, note);
  }

  removeNote(noteId: string): Observable<any> {
    return this.makeRequest('DELETE', `/notes/api/notes/${noteId}`);
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
