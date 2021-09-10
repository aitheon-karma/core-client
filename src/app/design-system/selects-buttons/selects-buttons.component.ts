import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-selects-buttons',
  templateUrl: './selects-buttons.component.html',
  styleUrls: ['./selects-buttons.component.scss']
})
export class SelectsButtonsComponent implements OnInit {

	_currentValues: any;
	dataModel: any;

  constructor() { }

  ngOnInit() {
  }

  onSliderChange(selectedValues: number[]) {
    this._currentValues = selectedValues;
	}

	selectionChanged($event) {

	}

	onOpenDropdown($event) {
	}

	onCloseDropdown($event) {
	}

	changeValue($event: any) {
  }

	singleSelect: any = [];
  multiSelect: any = [];
  stringArray: any = [];
  objectsArray: any = [];
  stringOptions = [
    "Burns Dalton", "Mcintyre Lawson", "Amie Franklin", "Jocelyn Horton", "Fischer Erickson", "Medina Underwood", "Goldie Barber"
  ]
  config = {
    displayKey: "name", //if objects array passed which key to be displayed defaults to description
    placeholder:'hyyyyi',
    searchPlaceholder:'SDFGDSFDSFDSFDSF',
    search: true,
    limitTo: 3,
  };

  config_02 = {
    displayKey: "name", //if objects array passed which key to be displayed defaults to description
    search: false,
    limitTo: 3
  };
  selectedOptions = [{
    "_id": "5a66d6c31d5e4e36c7711b7a",
    "index": 0,
    "balance": "$2,806.37",
    "picture": "http://placehold.it/32x32",
    "name": "Burns Dalton"
  },
  {
    "_id": "5a66d6c3657e60c6073a2d22",
    "index": 1,
    "balance": "$2,984.98",
    "picture": "http://placehold.it/32x32",
    "name": "Mcintyre Lawson"
  }];
  options = [
    {
      "_id": "5a66d6c31d5e4e36c7711b7a",
      "index": 0,
      "balance": "$2,806.37",
      "picture": "http://placehold.it/32x32",
      "name": "Burns Dalton"
    },
    {
      "_id": "5a66d6c3657e60c6073a2d22",
      "index": 1,
      "balance": "$2,984.98",
      "picture": "http://placehold.it/32x32",
      "name": "Mcintyre Lawson"
    },
    {
      "_id": "5a66d6c376be165a5a7fae33",
      "index": 2,
      "balance": "$2,794.16",
      "picture": "http://placehold.it/32x32",
      "name": "Amie Franklin"
    },
    {
      "_id": "5a66d6c3f7854b6b4d96333b",
      "index": 3,
      "balance": "$2,537.14",
      "picture": "http://placehold.it/32x32",
      "name": "Jocelyn Horton"
    },
    {
      "_id": "5a66d6c31f967d4f3e9d84e9",
      "index": 4,
      "balance": "$2,141.42",
      "picture": "http://placehold.it/32x32",
      "name": "Fischer Erickson"
    },
    {
      "_id": "5a66d6c34cfa8cddefb31602",
      "index": 5,
      "balance": "$1,398.60",
      "picture": "http://placehold.it/32x32",
      "name": "Medina Underwood"
    },
    {
      "_id": "5a66d6c3d727c450794226de",
      "index": 6,
      "balance": "$3,915.65",
      "picture": "http://placehold.it/32x32",
      "name": "Goldie Barber"
    }
  ];

}
