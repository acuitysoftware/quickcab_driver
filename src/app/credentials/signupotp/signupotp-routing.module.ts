import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignupotpPage } from './signupotp.page';

const routes: Routes = [
  {
    path: '',
    component: SignupotpPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignupotpPageRoutingModule {}
