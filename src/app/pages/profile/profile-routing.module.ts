import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfilePage } from './profile.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage
  },
  {
    path: 'changephone/:oldphone/:driverid',
    loadChildren: () => import('./changephone/changephone.module').then(m => m.ChangephonePageModule)
  },
  {
    path: 'changephoneotp/:newphone/:driverid',
    loadChildren: () => import('./changephoneotp/changephoneotp.module').then(m => m.ChangephoneotpPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule { }
