import { Directive, Component, OnInit, ElementRef, Pipe, PipeTransform } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';

@Pipe({
  name: 'getFirstLetters'
})
export class GetFirstLettersPipe implements PipeTransform {
  transform(name: string) {
    let matches = name.match(/\b(\w)/g).join('');
    return matches;
  }
}

@Component({
  selector: 'app-inputs',
  templateUrl: './inputs.component.html',
  styleUrls: ['./inputs.component.scss']
})
export class InputsComponent implements OnInit {
  basePath;
  heroForm: FormGroup;

  namesForDropdown = [
    {
      name: 'David Anderson',
      icon: 'icon--hierarchy-tree',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Bob Anderson',
      icon: 'icon--add-sub-task',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Ted Anderson',
      icon: 'icon--subtask',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Anna Anderson',
      icon: 'icon--share',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Sara Anderson',
      icon: 'icon--add-company',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Ted Anderson',
      icon: 'icon--subtask',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Anna Anderson',
      icon: 'icon--share',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Sara Anderson',
      icon: 'icon--add-company',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Ted Anderson',
      icon: 'icon--subtask',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Anna Anderson',
      icon: 'icon--share',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Sara An',
      icon: 'icon--add-company',
      path: '/assets/img/avatar.jpg'
    }
  ];

  labelsForDropdown = [
    {
      name: 'Label name 1',
      color: 'label--purple'
    },
    {
      name: 'Label name 2',
      color: 'label--orange'
    },
    {
      name: 'Label name 3',
      color: 'label--yellow'
    },
    {
      name: 'Label name 4',
      color: 'label--red'
    },
    {
      name: 'Label name 5',
      color: 'label--blue'
    }
  ];

  filledSelect: boolean;
  dropdownOpen: boolean;
  dropdownChoise: boolean = false;
  dropdownLabelUp: boolean = false;
  searchValue: any;
  dateValue: any;
  errorInput: boolean = false;

  maxInputLenght: number = 300;
  currentInputLenght = '';

  options = [
    "USD", "EUR", "GBP", "INR", "AUD", "CAD"
  ]

  optionsDropdown = [
    "Point 1", "Point 2", "Point 3"
  ]

  config = {
    displayKey: "name", //if objects array passed which key to be displayed defaults to description
    placeholder: 'Placeholder',
    searchPlaceholder: 'SDFGDSFDSFDSFDSF',
    search: false,
    limitTo: 3
  };

  config_02 = {
    placeholder: "USD",
    search: false,
    noResultsFound: ''
  };

  selectedName = this.namesForDropdown[0].name; // dropdown with text
  selectedName1 = this.namesForDropdown[0].name; // dropdown with text + icon
  selectedName2 = this.namesForDropdown[0].name; // dropdown with text + avatar
  selectedName3 = this.namesForDropdown[0].name; // dropdown with chips
  selectedName4 = this.namesForDropdown[0].name; // dropdown with chips - avatar + icon
  selectedName5 = this.namesForDropdown[0].name; // dropdown with label
  selectedName6 = this.namesForDropdown[0].name; // dropdown with chips - icon

  constructor(private fb: FormBuilder) {

  }

  ngOnInit() {
    this.basePath = window.location.host.includes('localhost') ? '' : '/ng-select';
        this.heroForm = this.fb.group({
            heroId: 'batman',
            agree: null
        });
  }
  parentClick() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  isDropdownChoise ($event) {
    this.dropdownChoise = !!$event.value;
  }

  clearSerchInput(event: Event) {
    this.searchValue = '';
  }

  clearDateInput(event: Event) {
    this.dateValue = '';
  }

}
