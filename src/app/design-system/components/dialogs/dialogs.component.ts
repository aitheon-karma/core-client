import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dialogs',
  templateUrl: './dialogs.component.html',
  styleUrls: ['./dialogs.component.scss']
})
export class DialogsComponent implements OnInit {

  dropdownOpen: boolean;
  dropdownChoise = false;

  optionsDropdown = [
    "Point 1", "Point 2", "Point 3", "Point 4"
  ]

  config = {
    displayKey: "name", //if objects array passed which key to be displayed defaults to description
    placeholder: '',
    searchPlaceholder: 'SDFGDSFDSFDSFDSF',
    search: false,
    limitTo: 4
  };

  constructor() { }

  ngOnInit() {

  }
  parentClick() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  isDropdownChoise ($event) {
    this.dropdownChoise = !!$event.value;
  }

}
