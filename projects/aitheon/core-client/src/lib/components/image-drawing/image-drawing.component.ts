import { Component, OnInit, ViewChild, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'ai-image-drawing',
  templateUrl: './image-drawing.component.html',
  styleUrls: ['./image-drawing.component.scss']
})
export class ImageDrawingComponent implements OnInit {

  imageDrawRef: BsModalRef;
  mode: string;
  @ViewChild('imageDrawTmpl') imageDrawTmpl: TemplateRef<any>;
  @Input('screenshotImg') screenshotImg: string;
  @Input('mode') screenshotMode: string;
  @Output('onSave') onSave: EventEmitter<any> = new EventEmitter<any>();
  @Output('onCancel') onCancel: EventEmitter<any> = new EventEmitter<any>();

  drawingSizes = {
    small: 1,
    medium: 2,
    large: 4,
  };

  colors = {
    black: '#000',
    white: '#fff',
    yellow: '#f5ba06',
    red: '#e96058',
    blue: '#589be9',
    green: '#67b231',
    purple: '#8c58e9',
  };

  constructor(
    private modalService: BsModalService
  ) { }

  ngOnInit() {
  }

  show() {
    this.imageDrawRef = this.modalService.show(this.imageDrawTmpl, Object.assign({}, {
      class: 'modal-auto',
      ignoreBackdropClick: true
    }));

    (document.querySelector('modal-container') as HTMLElement).style.zIndex = '2147483648';
  }

  cancel() {
    this.imageDrawRef.hide();
    this.onCancel.emit();
  }

  save(imageBlob: any) {
    this.onSave.emit(imageBlob);
    this.imageDrawRef.hide();
  }
}
