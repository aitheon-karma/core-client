import { Component, OnInit, Output, EventEmitter, TemplateRef, ViewChild, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'ai-second-factor-modal',
  templateUrl: './second-factor-modal.component.html',
  styleUrls: ['./second-factor-modal.component.scss']
})
export class SecondFactorModalComponent implements OnInit {

  @Input() modalClass = '';
  @Output() success: EventEmitter<any> = new EventEmitter<any>();
  @Output() afterRequest: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('secondFactorTml') secondFactorTml: TemplateRef<any>;

  secondFactorRef: BsModalRef;
  secondFactorForm: FormGroup;
  error: any;
  submitted = false;
  tempData: any;

  constructor(
    private authService: AuthService,
    private modalService: BsModalService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
  }

  request(data: any, forEmail?: string) {
    this.tempData = data;
    this.authService.requestSecondFactor(forEmail).subscribe((result: { status: string }) => {
      this.afterRequest.emit();
      if (result.status === 'DISABLED') {
        return this.success.emit({ data: this.tempData, otpCode: '' });
      }
      this.buildForm();
      this.show();

    });
  }

  private show() {
    this.secondFactorRef = this.modalService.show(this.secondFactorTml, { class: this.modalClass || '' });
  }

  private buildForm() {
    this.secondFactorForm = this.fb.group({
      code: ['', [Validators.required]]
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.secondFactorForm.invalid) {
      return;
    }
    this.secondFactorRef.hide();
    this.submitted = false;
    this.success.emit({ data: this.tempData, otpCode: this.secondFactorForm.get('code').value });
  }


}
