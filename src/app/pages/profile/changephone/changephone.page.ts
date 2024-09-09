import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { ServicesService } from 'src/app/services.service';

@Component({
  selector: 'app-changephone',
  templateUrl: './changephone.page.html',
  styleUrls: ['./changephone.page.scss'],
})
export class ChangephonePage implements OnInit {
  droldphn = "";
  drid = 0;
  isAndroid = false;
  constructor(
    private route: Router,
    private activatedroute: ActivatedRoute,
    private alert: AlertController,
    private toast: ToastController,
    private loader: LoadingController,
    private service: ServicesService,
    private platform: Platform,
  ) { }

  async ngOnInit() {
    this.platform.ready().then(async () => {

      if (this.platform.platforms().includes("android")){
        this.isAndroid = true
    }

      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();
        }, false);
      });
      this.activatedroute.params.subscribe(
        async data => {
          this.drid = data.driverid;
          this.droldphn = data.oldphone;
        }
      )
    })
  }

  async applyphone() {
    let newphone = (<HTMLInputElement>document.getElementById('newphn')).value;
    let jd = {
      new_contact: newphone,
      old_contact: this.droldphn,
      driver_id: Number(this.drid)
    }
    let validations = this.validatedata(jd);
    if (validations.success == false) {
      let ar = this.alert.create({
        message: validations.message,
        buttons: ['OK']
      });
      (await ar).present();
    }
    else {
      this.service.ApplyChangePhoneService(jd).subscribe(
        async data => {
          if (!!data && data.success == true) {

            if(data.otp_option == false){
              let ar = this.alert.create({
                message: data.msg
              });
              (await ar).present();
  
              setTimeout(() => {
                this.alert.dismiss();
                this.route.navigate(['/pages/profile']).then(() => {
                  window.location.reload();
                })
              }, 3000)
            }else{
              this.route.navigate(['/pages/profile/changephoneotp/' + data.new_phone + "/" + data.driver_id]);
            }
          }
          else {
            let ar = this.alert.create({
              message: data.msg,
              buttons: ['OK']
            });
            (await ar).present();
          }
        }
      )
    }
  }

  validatedata(jd) {
    if (jd.new_contact == "") {
      let codes = {
        success: false,
        message: 'Please Enter New Phone Number'
      };
      document.getElementById('newphn').style.backgroundColor = '#f9b6ac';
      return codes;
    }
    else {
      if (jd.new_contact.length < 10) {
        let codes = {
          success: false,
          message: 'Please Enter A Valid Phone Number of 10 Digits'
        };
        document.getElementById('newphn').style.backgroundColor = '#f9b6ac';
        return codes;
      }
      else {
        let codes = {
          success: true,
          message: 'All Data Validated'
        };
        return codes;
      }
    }
  }

  closethis() {
    this.route.navigate(['/pages/profile']);
  }

}
