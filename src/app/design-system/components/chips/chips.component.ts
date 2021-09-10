import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chips',
  templateUrl: './chips.component.html',
  styleUrls: ['./chips.component.scss']
})
export class ChipsComponent implements OnInit {
  moreInfo: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  toggleMoreInfo() {
    this.moreInfo = !this.moreInfo;
  }

}
