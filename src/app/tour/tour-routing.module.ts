import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TourDashboardComponent } from './tour-dashboard/tour-dashboard.component';
import { AuthGuard } from '@aitheon/core-client';

const routes: Routes = [{
  path: '', component: TourDashboardComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TourRoutingModule { }
