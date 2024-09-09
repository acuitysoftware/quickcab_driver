import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ForgotpasswordotpPage } from './forgotpasswordotp.page';

const routes: Routes = [
  {
    path: '',
    component: ForgotpasswordotpPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ForgotpasswordotpPageRoutingModule {}
