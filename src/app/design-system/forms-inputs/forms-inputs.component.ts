import { Component, OnInit } from '@angular/core';
// import { NgProgress } from 'ngx-progressbar';

@Component({
  selector: 'app-forms-inputs',
  templateUrl: './forms-inputs.component.html',
  styleUrls: ['./forms-inputs.component.scss']
})
export class FormsInputsComponent implements OnInit {

  firstInput: string;
  secondInput: string = 'Tony';
  thirdInput: string = '-!"-';
  fileName: string = 'FIlename.doc';
  priceOne: number = 0;
  priceTwo: number = 0;
  priceThree: number = 0;
  priceFour: number = 0;
  priceFive: number = 0;
  priceSix: number = 0;
  multiSelect: any = [];
  
  options = [
    "USD", "EUR", "GBP", "INR", "AUD", "CAD"
  ]

  config_02 = {
    placeholder: "USD",
    search: false,
    noResultsFound: ''
  };
  
  constructor() { }

  ngOnInit() {
    //this.ngProgress.start();
    // setTimeout(function(){
    //   this.ngProgress.done();
    // }, 3000);  
  }
}
