import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-termsandconditions',
  templateUrl: './termsandconditions.page.html',
  styleUrls: ['./termsandconditions.page.scss'],
})
export class TermsandconditionsPage implements OnInit {

  constructor(
    private modal: ModalController,
  ) { }

  ngOnInit() {
  }
  closethis() {
    this.modal.dismiss();
  }
}
