import { Component, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-elevations',
  templateUrl: './elevations.component.html',
  styleUrls: ['./elevations.component.scss']
})
export class ElevationsComponent implements OnInit {

  tooltipText: string;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    this.tooltipText = 'Copy to Clipboard!';
  }

  copyStyles(copiedText) {
    copiedText.select();
    document.execCommand('copy');
    copiedText.setSelectionRange(0, 0);

    this.tooltipText = 'Copied!';
  }

  resetCopy() {
    this.tooltipText = 'Copy to Clipboard!';
  }

}
