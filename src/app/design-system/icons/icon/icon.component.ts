import { Component, OnInit, Output, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent implements OnInit {
  @Input() classIcon;

  activeIcon = false;
  itemActive = false;
  tooltipText = 'Copy to Clipboard!';

  iconDynamic = false;
  iconActive =false;
  iconActiveOpen = false;
  sizeIcon = false;

  whiteIcon = false;
  orangeIcon = false;
  redIcon = false;
  greenIcon = false;
  blackIcon = false;
  checkboxDynamic = false;
  checkboxActive = false;
  checkboxActiveOpen = false;
  stateCheckbox = false; // for visibility states checkbox
  stateIcon = false; // for visibility states icon

  constructor() { }

  ngOnInit() {
    
  }

  addClassState(event) {

    let parent = event.target.closest('.list-icons__item');
    let icon = parent.querySelector('.icon');
    let iconClassList = parent.querySelector('.icon').classList;

    let ischeckboxChecked = parent.querySelectorAll('.checkbox__input');

    if (event.target.classList.contains('dynamic')) {
      if (event.target.checked) {
        this.checkboxActiveOpen = true;
        this.iconDynamic = true;
      } else {
        this.iconDynamic = false;
      }
    } else if (event.target.classList.contains('active')) {
      this.checkboxActiveOpen = true;

      if (event.target.checked) {
        this.iconActive = true;
      } else {
        this.iconActive = false;
      }
    } else if (event.target.classList.contains('active-open')) {

      this.checkboxDynamic = true;
      this.checkboxActive = true;

      this.iconDynamic = false;
      this.iconActive = false;

      if (event.target.checked) {
        this.iconActiveOpen = true;
      } else {
        this.iconActiveOpen = false;
        this.checkboxDynamic = false;
        this.checkboxActive = false;
      }
    }

    // if at least one state is selected, the colors are blocked
    for (let i = 0; i < ischeckboxChecked.length - 1; i++) {
      if (ischeckboxChecked[i].checked) {
        this.stateIcon = true;
        break;
      } else {
        this.stateIcon = false;
      }
    }

    if (!ischeckboxChecked[0].checked && !ischeckboxChecked[1].checked) {
      this.checkboxActiveOpen = false;
    }
    setInterval(() => {
      let input = parent.querySelector('.choise-element__content-copy').value = iconClassList;
    }, 0);
  }

  setColor(event) {
    let iconClassList;
    let parent = event.target.closest('.list-icons__item');

    if (event.target.classList.contains('white')) {
      this.whiteIcon = !this.whiteIcon;
      this.orangeIcon = false;
      this.redIcon = false;
      this.greenIcon = false;
      this.blackIcon = false;
    } else if (event.target.classList.contains('orange')) {
      this.whiteIcon = false;
      this.orangeIcon = !this.orangeIcon;
      this.redIcon = false;
      this.greenIcon = false;
      this.blackIcon = false;
    } else if (event.target.classList.contains('red')) {
      this.whiteIcon = false;
      this.orangeIcon = false;
      this.redIcon = !this.redIcon;
      this.greenIcon = false;
      this.blackIcon = false;
    } else if (event.target.classList.contains('green')) {
      this.whiteIcon = false;
      this.orangeIcon = false;
      this.redIcon = false;
      this.greenIcon = !this.greenIcon;
      this.blackIcon = false;
    } else if (event.target.classList.contains('black')) {
      this.whiteIcon = false;
      this.orangeIcon = false;
      this.redIcon = false;
      this.greenIcon = false;
      this.blackIcon = !this.blackIcon;
    }

    if (this.whiteIcon || this.orangeIcon || this.redIcon || this.greenIcon || this.blackIcon) {
      this.stateCheckbox = true;
    } else {
      this.stateCheckbox = false;
    }

    setInterval(() => {
    iconClassList = parent.querySelector('.icon').classList;
      let input = parent.querySelector('.choise-element__content-copy').value = iconClassList;
    }, 0);

  }

  addSizeIcon () {
    this.sizeIcon = !this.sizeIcon;
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