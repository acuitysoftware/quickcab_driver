import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ForgotpasswordPage } from './forgotpassword.page';

const routes: Routes = [
  {
    path: '',
    component: ForgotpasswordPage
  },
  {
    path: 'forgotpasswordotp/:driverid',
    loadChildren: () => import('./forgotpasswordotp/forgotpasswordotp.module').then(m => m.ForgotpasswordotpPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ForgotpasswordPageRoutingModule { }
