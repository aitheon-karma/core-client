import { Component, OnInit, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'ai-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements OnInit {
  @Input() success: boolean;
  @Input() error: boolean;
  @Input() errorMessage: string;
  @Input() focus: boolean;

  constructor() { }

  ngOnInit() {
  }

}
