import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OngoingtripPage } from './ongoingtrip.page';

const routes: Routes = [
  {
    path: '',
    component: OngoingtripPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OngoingtripPageRoutingModule {}
