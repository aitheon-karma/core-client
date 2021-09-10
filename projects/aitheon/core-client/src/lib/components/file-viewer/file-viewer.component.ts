import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit, Input, ElementRef, OnDestroy, Output, EventEmitter, HostListener } from '@angular/core';
import { FileViewerService } from './file-viewer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ai-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  index: number;
  file: any

  constructor(private fileViewerService: FileViewerService,
              public sanitizer: DomSanitizer) { }
  @Input() files: any[];
  @Input() showDocumentViewerForm: boolean;
  @Output() onCloseViewer: EventEmitter<boolean> = new EventEmitter<boolean>();

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.keyCode === 39) {
      this.nextImage();
    }
    if (event.keyCode === 37) {
      this.prevImage();
    }
  }

  ngOnInit() {
    this.subscriptions.push(this.fileViewerService.viewFileModalStatusChanged.subscribe(file => {
      this.index = this.files.indexOf(file);
    }));
  }

  nextImage() {
    if (this.index === this.files.length - 1) {
      this.index = 0;
    } else {
      this.index = this.index + 1;
    }
  }

  prevImage() {
    if (this.index === 0) {
      this.index = this.files.length - 1;  
    } else {
      this.index = this.index - 1;
    }
  }

  close() {
    this.onCloseViewer.emit(true);
    this.showDocumentViewerForm = false;
  }

  ngOnDestroy() {
    if (!this.showDocumentViewerForm) {
      this.subscriptions.forEach(s => s.unsubscribe());
    }
  }
}
