import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap';
import { Document } from '../../services/document';

export interface ModalData {
  confirmText?: string;
  additionalConfirmText?: string;
  headlineText?: string;
  hideCancelButton?: boolean;
  text: string;
  payload: any;
}

@Component({
  selector: 'ai-generic-modal',
  templateUrl: './generic-modal.component.html',
  styleUrls: ['./generic-modal.component.scss']
})
export class GenericModalComponent implements OnInit {
  @Output() confirm: EventEmitter<Document> = new EventEmitter<Document>();
  @Output() additionalConfirm: EventEmitter<Document> = new EventEmitter<Document>();
  @ViewChild('formModal') formModal: ModalDirective;

  data: ModalData;

  // modalRef: BsModalRef;
  constructor(private modalService: BsModalService) {}

  ngOnInit() { }

  hide() {
    this.formModal.hide();
  }

  onConfirm() {
    this.hide();
    this.confirm.emit(this.data.payload);
  }

  onAdditionalConfirm() {
    this.hide();
    this.additionalConfirm.emit(this.data.payload);
  }

  show(data: ModalData) {
    this.data = data;
    this.formModal.show();
  }

  cancel() {
    this.formModal.hide();
  }

}
