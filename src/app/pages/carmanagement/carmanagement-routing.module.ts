import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CarmanagementPage } from './carmanagement.page';

const routes: Routes = [
  {
    path: '',
    component: CarmanagementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarmanagementPageRoutingModule {}
