import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { CoreClientModule } from '@aitheon/core-client';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { DesignSystemModule } from './design-system/design-system.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    NgSelectModule,
    FormsModule,
    CKEditorModule,
    TimepickerModule.forRoot(),
    CoreClientModule.forRoot({
      baseApi: environment.baseApi,
      production: environment.production,
      service: 'CORE_CLIENT'
    }),
    DesignSystemModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
