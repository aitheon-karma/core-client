import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-switch-themes',
  templateUrl: './switch-themes.component.html',
  styleUrls: ['./switch-themes.component.scss']
})
export class SwitchThemesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    const isLight = 'light' === this.getTheme();

     if (isLight) {
      document.querySelector('body').classList.add('light');
    }
  }

  switchTheme() {
    document.querySelector('body').classList.toggle('light');
    const isLight = 'light' === this.getTheme();
    localStorage.setItem('theme', isLight ? '':'light');
  }

   getTheme() {
    return localStorage.getItem('theme');
  }
}
