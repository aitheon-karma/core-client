import { Directive, AfterViewInit, ElementRef } from '@angular/core';

@Directive({
  selector: '[aiAutofocus]'
})
export class AutofocusDirective implements AfterViewInit {

  constructor(private el: ElementRef) {
  }

  ngAfterViewInit() {
    this.el.nativeElement.focus();
  }
}
