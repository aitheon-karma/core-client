import { Component, OnInit } from '@angular/core';
import { Options } from 'ng5-slider';

@Component({
  selector: 'app-sliders',
  templateUrl: './sliders.component.html',
  styleUrls: ['./sliders.component.scss']
})
export class SlidersComponent implements OnInit {
  value: number = 50;
  minValue: number = 50;
  maxValue: number = 200;

  options: Options = {
    floor: 0,
    ceil: 100,
    showSelectionBar: true
  };

  options5: Options = {
    floor: 0,
    ceil: 250
  };

  constructor() { }

  ngOnInit() {
  }

}
