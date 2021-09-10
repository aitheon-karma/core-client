import { Component, OnInit, ViewChild, TemplateRef, Optional, Inject } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RequestOptions, Http, Request, Response, Headers } from '@angular/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AI_CORE_CLIENT_OPTIONS } from '../../core-client.tokens';
import { ICoreClientOptions } from '../../core-client.options';
import { AuthService } from '../../services/auth.service';
import { Cookie } from '../../services/cookie';

@Component({
  selector: 'ai-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit {

  loginDialogRef: BsModalRef;
  loginForm: FormGroup;
  error: any;
  submitted = false;
  @ViewChild('loginDialogTmpl') loginDialogTmpl: TemplateRef<any>;

  constructor(
    private http: Http,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private authService: AuthService,
    @Optional()
    @Inject(AI_CORE_CLIENT_OPTIONS) private options: ICoreClientOptions,
  ) { }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    const loginValue = Object.assign({ }, this.loginForm.value);

    this.error = null;
    this.makeRequest('POST', '/auth/api/login', loginValue).subscribe((result: { token: string, user: any }) => {
      this.submitted = false;
      Cookie.set('fl_token', result.token);
      this.authService.init();
      this.loginDialogRef.hide();
      // this.toastr.success('Success');
    }, (err) => {
      this.submitted = false;
      this.toastr.error(err);
    });
  }

  private makeRequest(method: string, url: string, body: any = null): Observable<any> {
    if (this.options && this.options.baseApi) {
      url = this.options.baseApi + url;
    }
    const options = new RequestOptions({
      method: method,
      url: url,
      headers: new Headers()
    });

    if (body) {
      options.body = JSON.stringify(body);
    }

    options.headers.set('Content-Type', 'application/json');

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
      catchError(this.handleError));

    return request;
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
    return throwError(errMsg);
  }

  show() {
    this.loginDialogRef = this.modalService.show(this.loginDialogTmpl, Object.assign({}, { class: 'modal-dialog-centered' }));
  }

}
