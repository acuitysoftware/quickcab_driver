import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentmanagementPage } from './documentmanagement.page';

const routes: Routes = [
  {
    path: '',
    component: DocumentmanagementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentmanagementPageRoutingModule {}
