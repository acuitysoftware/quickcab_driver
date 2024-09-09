import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TripsummaryPageRoutingModule } from './tripsummary-routing.module';

import { TripsummaryPage } from './tripsummary.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TripsummaryPageRoutingModule
  ],
  declarations: [TripsummaryPage]
})
export class TripsummaryPageModule {}
