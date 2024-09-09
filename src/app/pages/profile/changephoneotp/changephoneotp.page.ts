import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { ServicesService } from 'src/app/services.service';

@Component({
  selector: 'app-changephoneotp',
  templateUrl: './changephoneotp.page.html',
  styleUrls: ['./changephoneotp.page.scss'],
})
export class ChangephoneotpPage implements OnInit {
  drid = 0;
  drnewphn = "";
  resentactive = 0;
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

  ngOnInit() {
    this.platform.ready().then(() => {

      if (this.platform.platforms().includes("android")){
        this.isAndroid = true
    }


      this.activatedroute.params.subscribe(
        data => {
          this.drnewphn = data.newphone;
          this.drid = data.driverid
        }
      )

      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();
        }, false);
      });

    })
  }

  gotoprofile() {
    this.route.navigate(['/pages/profile']);
  }

  async submitsigninotp() {
    let otpval = (<HTMLInputElement>document.getElementById('reg_otp')).value;
    let jd = {
      otp: otpval,
      new_contact: this.drnewphn,
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
      this.service.UpdatePhoneOtpService(jd).subscribe(
        async data => {
          if (!!data && data.success == true) {
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
    if (jd.otp == "") {
      let codes = {
        success: false,
        message: 'Please Enter OTP'
      };
      document.getElementById('reg_otp').style.backgroundColor = '#f9b6ac';
      return codes;
    }
    else {
      if (jd.otp.length < 4) {
        let codes = {
          success: false,
          message: 'Please Enter a valid OTP of 4 digits.'
        };
        document.getElementById('reg_otp').style.backgroundColor = '#f9b6ac';
        return codes;
      }
      else {
        let codes = {
          success: true,
          message: 'All data validated'
        };

        return codes;
      }
    }
  }

  async resendotp() {
    this.resentactive = 1;
    let jd = {
      driver_id: this.drid
    }
    this.service.ResentPhoneOtpService(jd).subscribe(
      async data => {
        if (!!data && data.success == true) {
          this.resentactive = 0;
          let ar = this.alert.create({
            message: data.msg,
          });
          (await ar).present();

          setTimeout(() => {
            this.alert.dismiss();

          }, 3000);
        }
        else {
          this.resentactive = 0
          let ar = this.alert.create({
            message: data.msg,
          });
          (await ar).present();
        }
      }
    )
  }


}
