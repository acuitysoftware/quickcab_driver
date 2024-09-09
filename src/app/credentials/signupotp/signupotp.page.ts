import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { ServicesService } from 'src/app/services.service';

@Component({
  selector: 'app-signupotp',
  templateUrl: './signupotp.page.html',
  styleUrls: ['./signupotp.page.scss'],
})
export class SignupotpPage implements OnInit {
  driverid = 0;
  resentactive = 0;
  timer = 60;
  isAndroid = false;
  constructor(
    private route: Router,
    private alert: AlertController,
    private activatedroute: ActivatedRoute,
    private toast: ToastController,
    private loader: LoadingController,
    private platform: Platform,
    private service: ServicesService,
  ) { }

  ngOnInit() {
    this.platform.ready().then(() => {
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
          console.log("id : ", data);
          this.driverid = data.driverid;
        }
      );
      this.resentactive = 1;
      let myintv = setInterval(() => {
        if (this.timer != 0) {
          this.timer -= 1;
        }
        else {
          this.resentactive = 0;
          this.timer = 60;
          clearInterval(myintv);
        }
      }, 1000);
    })
  }
  async submitotp() {
    let ld = this.loader.create({
      message: "Validating ......"
    });
    (await ld).present();
    let otp = (<HTMLInputElement>document.getElementById('siotp')).value;
    let jd = {
      driver_otp: otp,
      driver_id: this.driverid
    }
    let validations = this.validatedata(jd);
    if (validations.success == false) {
      this.loader.dismiss();
      let tm = this.toast.create({
        message: validations.message,
        duration: 2000
      });
      (await tm).present();
    }
    else {
      this.service.DriverSignupOtpService(jd).subscribe(
        async data => {
          if (!!data && data.success == true) {
            this.loader.dismiss();
            let ar = this.alert.create({
              message: data.msg
            });
            (await ar).present();

            setTimeout(() => {
              this.alert.dismiss();
              this.route.navigate(['/credentials/signin/']).then(() => {
                window.location.reload();
              })
            }, 2000);

          }
          else {
            this.loader.dismiss();
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
    if (jd.driver_otp == "") {
      let codes = {
        success: false,
        message: 'Please Enter the OTP'
      }
      return codes;
    }
    else {
      if (jd.driver_otp.length < 4) {
        let codes = {
          success: false,
          message: 'Please Enter a valid OTP of minimum 4 digits.'
        }
        return codes;
      }
      else {
        let codes = {
          success: true,
          message: 'All data validated'
        }
        return codes;
      }
    }
  }

  async resendotp() {
    let ld = this.loader.create({
      message: "Re generating OTP",
      duration: 2000
    });
    (await ld).present();
    let jd = {
      driver_id: this.driverid
    }
    this.service.DriverSignupOtpResendService(jd).subscribe(
      async data => {
        if (!!data && data.success == true) {
          this.resentactive = 1;
          let ar = this.alert.create({
            message: data.msg
          });
          (await ar).present().then(() => {
            let myintv = setInterval(() => {
              if (this.timer != 0) {
                this.timer -= 1;
              }
              else {
                this.resentactive = 0;
                this.timer = 60;
                clearInterval(myintv);
              }
            }, 1000);
          })

        }
        else {
          this.resentactive = 0;
          let ar = this.alert.create({
            message: data.msg,
            buttons: ['OK']
          });
          (await ar).present();
        }
      }
    )

  }

  checkotp() {
    let val = (<HTMLInputElement>document.getElementById('siotp')).value;
    if (val == "" || val.length < 4) {
      document.getElementById('siotp').style.backgroundColor = '#f9b6ac';
    }
    else {
      document.getElementById('siotp').style.backgroundColor = '#ffffff';
    }
  }

  closeotp() {
    this.route.navigate(['/credentials']);
  }

}
