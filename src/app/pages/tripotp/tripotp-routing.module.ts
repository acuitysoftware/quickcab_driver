import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TripotpPage } from './tripotp.page';

const routes: Routes = [
  {
    path: '',
    component: TripotpPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TripotpPageRoutingModule {}
