import { Component, OnInit } from '@angular/core';
import { ThemesService } from '@aitheon/core-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private themesService: ThemesService,
  ) {
    this.themesService.themeChanged.subscribe((theme: any) => {
      console.log('theme:', theme);
    });

  }

  ngOnInit(): void {}

}


