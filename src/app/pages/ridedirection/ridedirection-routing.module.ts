import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RidedirectionPage } from './ridedirection.page';

const routes: Routes = [
  {
    path: '',
    component: RidedirectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RidedirectionPageRoutingModule {}
