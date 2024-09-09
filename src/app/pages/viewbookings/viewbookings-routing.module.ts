import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewbookingsPage } from './viewbookings.page';

const routes: Routes = [
  {
    path: '',
    component: ViewbookingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewbookingsPageRoutingModule {}
