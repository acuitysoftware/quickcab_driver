import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChangephoneotpPage } from './changephoneotp.page';

const routes: Routes = [
  {
    path: '',
    component: ChangephoneotpPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChangephoneotpPageRoutingModule {}
