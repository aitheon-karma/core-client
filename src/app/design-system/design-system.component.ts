import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ai-design-system',
  templateUrl: './design-system.component.html',
  styleUrls: ['./design-system.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DesignSystemComponent implements OnInit {

  isAvtive: boolean;

  constructor() { }

  ngOnInit() {
  }

  toggleSubNav(event) {
    if (event.target.classList.contains('dropDown')) {
      event.target.classList.toggle('rotate');
      event.target.nextSibling.classList.toggle('show');
    }
  }
}
