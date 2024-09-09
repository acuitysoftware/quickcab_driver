import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TripsummaryPage } from './tripsummary.page';

const routes: Routes = [
  {
    path: '',
    component: TripsummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TripsummaryPageRoutingModule {}
