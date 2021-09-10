import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-colors',
  templateUrl: './colors.component.html',
  styleUrls: ['./colors.component.scss']
})
export class ColorsComponent implements OnInit {
  tooltipText = 'Copy to Clipboard!';

  constructor() { }

  ngOnInit() {
  }

  copyValue(event) {
    let inputField = event.target.closest('.icon-copy').nextSibling;
    inputField.focus();
    inputField.select();
    document.execCommand('copy');
    inputField.setSelectionRange(0, -1);
    this.tooltipText = 'Copied!';
  }

  resetCopy() {
    this.tooltipText = 'Copy to Clipboard!';
  }

}
