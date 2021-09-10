import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'ai-payment-required',
  templateUrl: './payment-required.component.html',
  styleUrls: ['./payment-required.component.scss']
})
export class PaymentRequiredComponent implements OnInit {

  constructor() { }

  @ViewChild('paymentRequiredModal') paymentRequiredModal: ModalDirective;

  ngOnInit() {
    console.log('running now');
  }

  public show() {
    this.paymentRequiredModal.show();
  }

  goToBilling() {
    window.location.href = '/billing-manager/dashboard?purchase=true';
  }




}
