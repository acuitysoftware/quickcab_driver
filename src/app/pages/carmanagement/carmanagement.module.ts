import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CarmanagementPageRoutingModule } from './carmanagement-routing.module';

import { CarmanagementPage } from './carmanagement.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarmanagementPageRoutingModule
  ],
  declarations: [CarmanagementPage]
})
export class CarmanagementPageModule {}
