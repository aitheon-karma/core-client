import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TourRoutingModule } from './tour-routing.module';
import { TourDashboardComponent } from './tour-dashboard/tour-dashboard.component';
import { CoreClientModule } from '@aitheon/core-client';

@NgModule({
  declarations: [TourDashboardComponent],
  imports: [
    CommonModule,
    TourRoutingModule,
    CoreClientModule

  ]
})
export class TourModule { }
