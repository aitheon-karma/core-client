import { Component, OnInit, ViewChild, TemplateRef, Optional, Inject } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { RequestOptions, Http, Request, Response, Headers } from '@angular/http';
import { AI_CORE_CLIENT_OPTIONS } from '../../core-client.tokens';
import { ICoreClientOptions } from '../../core-client.options';

@Component({
  selector: 'ai-bug-report',
  templateUrl: './bug-report.component.html',
  styleUrls: ['./bug-report.component.scss']
})
export class BugReportComponent implements OnInit {

  bugReportRef: BsModalRef;
  bugReportForm: FormGroup;
  error: any;
  submitted = false;
  @ViewChild('bugReportTmpl') bugReportTmpl: TemplateRef<any>;

  constructor(
    private modalService: BsModalService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private http: Http,
    @Optional()
    @Inject(AI_CORE_CLIENT_OPTIONS) private options: ICoreClientOptions,
  ) { }

  ngOnInit() {
  }

  show() {
    this.buildForm();
    this.bugReportRef = this.modalService.show(this.bugReportTmpl);
  }

  buildForm() {
    this.bugReportForm = this.fb.group({
      text: ['', [Validators.required]]
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.bugReportForm.invalid) {
      return;
    }
    const bug = Object.assign({ url: window.location.pathname }, this.bugReportForm.value);

    this.error = null;
    this.makeRequest('POST', '/users/api/bug-reports', bug).subscribe(() => {
      this.submitted = false;
      this.bugReportRef.hide();
      this.toastr.success('Bug reported. Thanks for info!');
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

}
