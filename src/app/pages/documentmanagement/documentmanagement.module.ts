import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DocumentmanagementPageRoutingModule } from './documentmanagement-routing.module';

import { DocumentmanagementPage } from './documentmanagement.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocumentmanagementPageRoutingModule
  ],
  declarations: [DocumentmanagementPage]
})
export class DocumentmanagementPageModule {}
