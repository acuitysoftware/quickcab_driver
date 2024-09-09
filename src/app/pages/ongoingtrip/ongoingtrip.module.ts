import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OngoingtripPageRoutingModule } from './ongoingtrip-routing.module';

import { OngoingtripPage } from './ongoingtrip.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OngoingtripPageRoutingModule
  ],
  declarations: [OngoingtripPage]
})
export class OngoingtripPageModule {}
